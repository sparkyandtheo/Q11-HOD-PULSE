// public/js/phoneLog.js

import { db } from './firebase.js';
import { ref, onValue, push, set } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { toggleSpinner } from './ui.js';

/**
 * Sets up the form for adding new phone log entries.
 */
export function setupPhoneLogForm() {
    const phoneLogForm = document.getElementById('add-phone-log-form');
    if (phoneLogForm) {
        phoneLogForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const phoneLogName = phoneLogForm['phone-log-name'].value;
            const phoneLogNumber = phoneLogForm['phone-log-number'].value;
            const phoneLogNotes = phoneLogForm['phone-log-notes'].value;
            addPhoneLog(phoneLogName, phoneLogNumber, phoneLogNotes);
            phoneLogForm.reset();
        });
    }
}

/**
 * Adds a new phone log entry to the database.
 * @param {string} name - The name for the log entry.
 * @param {string} number - The phone number.
 * @param {string} notes - Any notes for the log entry.
 */
function addPhoneLog(name, number, notes) {
    const phoneLogRef = ref(db, 'phoneLog');
    const newPhoneLogRef = push(phoneLogRef);
    set(newPhoneLogRef, {
        name: name,
        number: number,
        notes: notes,
        timestamp: Date.now()
    }).catch(error => console.error("Error adding phone log: ", error));
}

/**
 * Displays the phone log from the database.
 */
export function displayPhoneLog() {
    toggleSpinner(true);
    const phoneLogRef = ref(db, 'phoneLog');
    const phoneLogTableBody = document.getElementById('phone-log-table-body');

    onValue(phoneLogRef, (snapshot) => {
        if (phoneLogTableBody) {
            phoneLogTableBody.innerHTML = '';
            snapshot.forEach((childSnapshot) => {
                const log = childSnapshot.val();
                const row = phoneLogTableBody.insertRow();
                row.innerHTML = `
                    <td>${log.name}</td>
                    <td>${log.number}</td>
                    <td>${log.notes}</td>
                `;
            });
        }
        toggleSpinner(false);
    }, (error) => {
        console.error("Error fetching phone log: ", error);
        toggleSpinner(false);
    });
}
