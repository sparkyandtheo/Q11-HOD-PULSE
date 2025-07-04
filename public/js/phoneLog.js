import { db, auth, authStateDetermined, initialUser } from './firebase.js';

let phoneLogListener = null;

function initializePhoneLogListener() {
    // Ensure this only runs once and only if a user is logged in.
    if (phoneLogListener) {
        console.log("Phone log listener already initialized.");
        return;
    }

    const setupListener = (user) => {
        if (user) {
            const userId = user.uid;
            const phoneLogRef = db.collection('users').doc(userId).collection('phoneLog');

            phoneLogListener = phoneLogRef.onSnapshot(snapshot => {
                console.log("Received phone log update.");
                const phoneLogList = document.getElementById('phone-log-list');
                if (phoneLogList) {
                    phoneLogList.innerHTML = ''; // Clear previous entries
                    snapshot.forEach(doc => {
                        const entry = doc.data();
                        const li = document.createElement('li');
                        li.textContent = `Call to ${entry.number} at ${new Date(entry.timestamp.seconds * 1000).toLocaleString()}`;
                        phoneLogList.appendChild(li);
                    });
                }
            }, error => {
                console.error("Error with phone log listener:", error);
            });
        } else {
            console.log("No user logged in, cannot set up phone log listener.");
        }
    };

    // Check if auth state is already known
    if (authStateDetermined) {
        setupListener(initialUser);
    } else {
        // This is a fallback, but the primary initialization now happens in firebase.js
        console.warn("Firestore might not be initialized yet. Listener will start after auth.");
        // The setOnAuthStateChanged in main.js will handle this scenario.
    }
}

export { initializePhoneLogListener };
