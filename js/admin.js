import { initializeFirebase, db, auth } from './firebase.js';
import { notify } from './ui.js';

// List of authorized admin UIDs.
// In a real application, this should be managed in a more secure way,
// for example, by checking a user's custom claims.
const ADMIN_UIDS = [
    'tH25Zo4o5VOoBF3vYprY2weJve83' 
    // You can find your UID in the Firebase Console under Authentication -> Users
];

let currentUser = null;
let contactsUnsubscribe = null; // To detach the Firestore listener

// Initialize Firebase and Auth
initializeFirebase(user => {
    currentUser = user;
    checkAdminAuth();
});

const $ = id => document.getElementById(id);

function checkAdminAuth() {
    const authWall = $('admin-auth-wall');
    const adminContent = $('admin-content');

    if (currentUser && ADMIN_UIDS.includes(currentUser.uid)) {
        authWall.style.display = 'none';
        adminContent.style.display = 'grid';
        loadContacts();
    } else {
        authWall.style.display = 'block';
        adminContent.style.display = 'none';
        if (contactsUnsubscribe) contactsUnsubscribe(); // Stop listening if not admin
    }
}

const contactForm = $('contact-form');
const contactsTableBody = $('contacts-table').querySelector('tbody');
const searchInput = $('search-contacts');

function renderContacts(contacts, filter = '') {
    contactsTableBody.innerHTML = '';
    const lowerFilter = filter.toLowerCase();

    const filteredContacts = contacts.filter(contact => {
        return (contact.name || '').toLowerCase().includes(lowerFilter) ||
               (contact.primaryPhone || '').toLowerCase().includes(lowerFilter) ||
               (contact.department || '').toLowerCase().includes(lowerFilter);
    });

    filteredContacts.forEach(contact => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${contact.name || ''}</td>
            <td>${contact.primaryPhone || ''}</td>
            <td>${contact.extension || ''}</td>
            <td>${contact.department || ''}</td>
            <td class="action-buttons">
                <button class="edit-btn" data-id="${contact.id}">Edit</button>
                <button class="delete-btn" data-id="${contact.id}">Delete</button>
            </td>
        `;
        contactsTableBody.appendChild(row);
    });
}

function loadContacts() {
    const contactsRef = db.collection('phone_log');
    contactsUnsubscribe = contactsRef.onSnapshot(snapshot => {
        const contacts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderContacts(contacts, searchInput.value);
    }, error => {
        console.error("Error fetching contacts:", error);
        notify("❌ Could not load contacts.");
    });

    searchInput.addEventListener('input', () => {
        // We don't need to re-fetch, just re-render with the new filter
        const contactsRef = db.collection('phone_log');
        contactsRef.get().then(snapshot => {
             const contacts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
             renderContacts(contacts, searchInput.value);
        });
    });
}

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = $('contact-id').value;
    const contactData = {
        name: $('contact-name').value,
        primaryPhone: $('contact-primaryPhone').value,
        secondaryPhone: $('contact-secondaryPhone').value,
        extension: $('contact-extension').value,
        email: $('contact-email').value,
        department: $('contact-department').value,
        // Add search tokens for better query performance
        tokens: [
            $('contact-name').value.toLowerCase().split(/\s+/),
            $('contact-department').value.toLowerCase().split(/\s+/)
        ].flat().filter(Boolean)
    };

    try {
        if (id) {
            // Update existing contact
            await db.collection('phone_log').doc(id).set(contactData, { merge: true });
            notify('✅ Contact updated successfully!');
        } else {
            // Add new contact
            await db.collection('phone_log').add(contactData);
            notify('✅ Contact added successfully!');
        }
        contactForm.reset();
        $('contact-id').value = '';
    } catch (error) {
        console.error("Error saving contact:", error);
        notify("❌ Error saving contact.");
    }
});

$('clear-form-btn').addEventListener('click', () => {
    contactForm.reset();
    $('contact-id').value = '';
});

contactsTableBody.addEventListener('click', async (e) => {
    const target = e.target;
    const id = target.dataset.id;

    if (target.classList.contains('edit-btn')) {
        const doc = await db.collection('phone_log').doc(id).get();
        if (doc.exists) {
            const data = doc.data();
            $('contact-id').value = id;
            $('contact-name').value = data.name || '';
            $('contact-primaryPhone').value = data.primaryPhone || '';
            $('contact-secondaryPhone').value = data.secondaryPhone || '';
            $('contact-extension').value = data.extension || '';
            $('contact-email').value = data.email || '';
            $('contact-department').value = data.department || '';
            window.scrollTo(0, 0);
        }
    }

    if (target.classList.contains('delete-btn')) {
        if (confirm(`Are you sure you want to delete this contact?`)) {
            try {
                await db.collection('phone_log').doc(id).delete();
                notify('🗑️ Contact deleted.');
            } catch (error) {
                console.error("Error deleting contact:", error);
                notify("❌ Error deleting contact.");
            }
        }
    }
});
