// Import necessary functions from other modules
import { initializePhoneLogListener } from './phoneLog.js';
import { updateAuthUI } from './ui.js';
import { GOOGLE_CLIENT_ID, firebaseConfig } from './config.js';

// State variables
let db, auth;
let isFirebaseInitialized = false;
let authStateDetermined = false;
let initialUser = null;
let onAuthStateChangeCallback = null;

/**
 * Handles the response from Google Sign-In.
 * @param {object} response - The credential response object from Google.
 */
async function handleCredentialResponse(response) {
    console.log("handleCredentialResponse called");
    const idToken = response.credential;
    const credential = firebase.auth.GoogleAuthProvider.credential(idToken);

    try {
        await auth.signInWithCredential(credential);
        console.log("Successfully signed in with Google.");
    } catch (error) {
        console.error("Error signing in with Google credential:", error);
    }
}

/**
 * Initializes the entire application after all scripts have loaded.
 * This function is attached to the window object to be globally accessible.
 */
window.onGoogleLibraryLoad = () => {
    console.log("onGoogleLibraryLoad called");
    // 1. Initialize Firebase
    if (window.firebase && !isFirebaseInitialized) {
        try {
            firebase.initializeApp(firebaseConfig);
            auth = firebase.auth();
            db = firebase.firestore();
            isFirebaseInitialized = true;
            console.log("Firebase initialized.");
        } catch (error) {
            console.error("Error initializing Firebase:", error);
            return;
        }
    } else if (!window.firebase) {
        console.error("Firebase library not loaded!");
        return;
    }

    // 2. Initialize Google Sign-In
    if (window.google && window.google.accounts) {
        try {
            google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleCredentialResponse
            });
            console.log("Google Sign-In initialized.");
        } catch (error) {
            console.error("Error initializing Google Sign-In:", error);
        }
    } else {
        console.error("Google GSI library not loaded.");
    }

    // 3. Set up the Firebase Auth state listener
    if (auth) {
        auth.onAuthStateChanged((user) => {
            console.log("Auth state changed. User:", user ? user.uid : "null");
            initialUser = user;
            authStateDetermined = true;
            updateAuthUI(user);

            // If a user is logged in, initialize other parts of the app
            if (user) {
                initializePhoneLogListener();
            }

            // If a callback was set before auth state was determined, call it now.
            if (onAuthStateChangeCallback) {
                onAuthStateChangeCallback(user);
            }
        });
    } else {
        console.error("Auth is not initialized. Cannot set onAuthStateChanged listener.");
    }
};

/**
 * A function to allow other modules to listen for the auth state.
 * @param {function} callback - The function to call when the auth state changes.
 */
function setOnAuthStateChanged(callback) {
    if (authStateDetermained) {
        callback(initialUser);
    } else {
        onAuthStateChangeCallback = callback;
    }
}

/**
 * Signs the user out.
 */
function signOutUser() {
    if (auth.currentUser) {
        auth.signOut().then(() => {
            console.log("User signed out.");
        }).catch((error) => {
            console.error("Sign out error:", error);
        });
    }
}

// Export the functions and variables that other modules will need.
export {
    db,
    auth,
    setOnAuthStateChanged,
    signOutUser,
    isFirebaseInitialized,
    authStateDetermined,
    initialUser
};
