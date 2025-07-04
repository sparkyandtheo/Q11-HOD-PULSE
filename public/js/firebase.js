    // public/js/firebase.js

    import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
    import { getDatabase } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
    import { getAuth, GoogleAuthProvider, signInWithCredential, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
    import { firebaseConfig, GOOGLE_CLIENT_ID } from './config.js';

    // Removed direct import from ui.js to break the circular dependency.

    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);
    const auth = getAuth(app);

    /**
     * Handles the response from Google Sign-In.
     * @param {object} response - The credential response from Google.
     */
    function handleCredentialResponse(response) {
        console.log("Google Sign-In response received.");
        const id_token = response.credential;
        const credential = GoogleAuthProvider.credential(id_token);
        signInWithCredential(auth, credential)
            .catch((error) => {
                console.error("Google Sign-In Error", error);
            });
    }

    /**
     * Sets up Google Sign-In and listens for authentication state changes.
     * @param {function} updateAuthUICallback - The function to call to update the UI on auth state change.
     */
    export function setupAuthentication(updateAuthUICallback) {
        try {
            google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleCredentialResponse
            });
            google.accounts.id.renderButton(
                document.getElementById("gsi-button-container"),
                { theme: "outline", size: "large" }
            );
        } catch (e) {
            console.error("Google Sign-In initialization error. Make sure the Google Identity Services library is loaded.", e);
        }
        
        onAuthStateChanged(auth, user => {
            if (user) {
                console.log('User is signed in:', user.displayName);
            } else {
                console.log('User is signed out.');
            }
            // Use the callback to update the UI, avoiding a direct import.
            updateAuthUICallback(user);
        });
    }

    /**
     * Signs the current user out.
     */
    export function signOutUser() {
        signOut(auth).catch(error => console.error("Sign Out Error", error));
    }

    export { db, auth };
