import { initializeFirebase, db, auth } from './firebase.js';

let currentUser = null;
const $ = id => document.getElementById(id);
const startBtn = $('start-migration-btn');
const statusEl = $('migration-status');

// Disable the button by default until we know the user's status
startBtn.disabled = true;

initializeFirebase(user => {
    currentUser = user;
    if (user) {
        logStatus('Firebase ready. You are logged in.');
        startBtn.disabled = false; // Enable button now that we know user is logged in
    } else {
        logStatus('Please log in to the main application first, then refresh this page.');
        startBtn.disabled = true;
    }
});

function logStatus(message) {
    console.log(message);
    statusEl.textContent += `\n> ${message}`;
    statusEl.scrollTop = statusEl.scrollHeight;
}

function parseCSV(csvText) {
    const rows = [];
    const lines = csvText.split(/\r\n|\n/);
    lines.forEach(line => {
        if (line.trim() === '') return;
        const row = [];
        let currentField = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                row.push(currentField.trim().replace(/^"|"$/g, ''));
                currentField = '';
            } else {
                currentField += char;
            }
        }
        row.push(currentField.trim().replace(/^"|"$/g, ''));
        rows.push(row);
    });
    return rows;
}

function parseEmployees(text) {
    const data = [];
    const rows = parseCSV(text);
    let currentDepartment = 'General';
    const header = rows[0].map(h => h.replace(/\s*#\s*/, '').trim());
    
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.every(field => field === '')) continue;
        if (row.length === 1 && row[0] !== '') {
            currentDepartment = row[0];
            continue;
        }
        let entry = {};
        header.forEach((col, index) => {
            entry[col] = row[index] || '';
        });
        if (entry.EMPLOYEE) {
            data.push({
                name: entry.EMPLOYEE,
                primaryPhone: entry.WORK || entry.Home,
                secondaryPhone: entry.Home && entry.WORK ? entry.Home : '',
                extension: entry['Office Ext.'],
                email: entry.EMAIL,
                department: entry.DEPARTMENT || currentDepartment,
            });
        }
    }
    return data;
}

async function startMigration() {
    if (!currentUser) {
        logStatus('ERROR: You must be logged in to perform the migration.');
        return;
    }
    startBtn.disabled = true;
    logStatus('Starting migration...');

    try {
        const response = await fetch('./EMPLOYEE PHONE LOG - EMPLOYEES.csv');
        if (!response.ok) {
            throw new Error('Could not fetch the main employee CSV file.');
        }
        const text = await response.text();
        const contacts = parseEmployees(text);
        logStatus(`Parsed ${contacts.length} contacts from CSV.`);

        const phoneLogRef = db.collection('phone_log');
        const batch = db.batch();
        let migratedCount = 0;

        for (const contact of contacts) {
            // To prevent duplicates, we check if a contact with the same name already exists.
            const querySnapshot = await phoneLogRef.where('name', '==', contact.name).get();
            if (querySnapshot.empty) {
                const docRef = phoneLogRef.doc(); // Firestore will generate an ID
                const contactData = {
                    ...contact,
                    tokens: [
                        (contact.name || '').toLowerCase().split(/\s+/),
                        (contact.department || '').toLowerCase().split(/\s+/)
                    ].flat().filter(Boolean)
                };
                batch.set(docRef, contactData);
                migratedCount++;
            } else {
                logStatus(`Skipping duplicate: ${contact.name}`);
            }
        }

        if (migratedCount > 0) {
            await batch.commit();
            logStatus(`SUCCESS: Successfully migrated ${migratedCount} new contacts to Firestore.`);
        } else {
            logStatus('No new contacts to migrate.');
        }

    } catch (error) {
        console.error('Migration failed:', error);
        logStatus(`ERROR: ${error.message}`);
    } finally {
        // Re-enable the button unless there was a login error initially
        if(currentUser) {
            startBtn.disabled = false;
        }
    }
}

startBtn.addEventListener('click', startMigration);
