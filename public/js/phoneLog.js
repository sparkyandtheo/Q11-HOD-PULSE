// This module loads, caches, and searches data from the Firestore 'phone_log' collection.
import { db } from './firebase.js';

let phoneLogData = [];
let isDataLoaded = false;
let unsubscribe = null; // To detach the real-time listener

/**
 * Sets up a real-time listener to the 'phone_log' collection in Firestore.
 * This keeps a local cache of the data for fast searching.
 */
function initializePhoneLogListener() {
    if (unsubscribe) {
        unsubscribe(); // Detach any existing listener
    }

    const phoneLogRef = db.collection('phone_log');
    
    unsubscribe = phoneLogRef.onSnapshot(snapshot => {
        phoneLogData = snapshot.docs.map(doc => ({
            type: 'phone', // Add type for search result rendering
            id: doc.id,
            ...doc.data()
        }));
        isDataLoaded = true;
        console.log(`Phone log cache updated. ${phoneLogData.length} entries.`);
    }, error => {
        console.error("Error listening to phone log collection:", error);
        isDataLoaded = false;
        phoneLogData = [];
    });
}

/**
 * Searches the local cache of the phone log data.
 * @param {string} query - The search term.
 * @returns {Array<object>} An array of matching contact objects.
 */
export function searchPhoneLog(query) {
    if (!isDataLoaded || query.length < 2) {
        return [];
    }
    const lowerQuery = query.toLowerCase();
    
    return phoneLogData.filter(entry => {
        const name = (entry.name || '').toLowerCase();
        const primaryPhone = (entry.primaryPhone || '').toLowerCase();
        const email = (entry.email || '').toLowerCase();
        const department = (entry.department || '').toLowerCase();
        const extension = (entry.extension || '').toLowerCase();

        return name.includes(lowerQuery) ||
               primaryPhone.includes(lowerQuery) ||
               email.includes(lowerQuery) ||
               department.includes(lowerQuery) ||
               extension.includes(lowerQuery);
    }).slice(0, 10); // Limit results for performance
}

// Initialize the listener as soon as the module is imported.
// Note: This requires 'db' to be initialized first.
// We will ensure this order by how we import modules.
try {
    initializePhoneLogListener();
} catch (e) {
    console.error("Firestore might not be initialized yet. Listener will start after auth.");
    // The listener will also be re-initialized in firebase.js after user logs in.
}
