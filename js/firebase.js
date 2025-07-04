import { notify } from './ui.js';

// --- IMPORTANT ---
// Replace these placeholders with your actual Firebase and Google Cloud credentials.
const firebaseConfig = {
  apiKey: "AIzaSyCREu38c0msQ5VYGnRYZ8fkCEEudZmRbXE", // Get this from your Firebase project settings
  authDomain: "planar-alliance-448817-h0.firebaseapp.com",
  projectId: "planar-alliance-448817-h0",
  storageBucket: "planar-alliance-448817-h0.appspot.com",
  messagingSenderId: "1049899901887",
  appId: "1:1049899901887:web:0c3e74f7fa5fc338afb70a",
  measurementId: "G-6RR7R4ZKVY"
};

const GOOGLE_CLIENT_ID = '1049899901887-08ctjqqf0q3sqbhsdpoc52tl1lkv5s7u.apps.googleusercontent.com'; // Get this from Google Cloud Console APIs & Services -> Credentials

let auth, db;
let onAuthStateChangeCallback;
let isFirebaseInitialized = false;
let initialUser = null; // Variable to hold the user state
let authStateDetermined = false; // Flag to see if onAuthStateChanged has fired at least once

// This function is called by the Google Identity Services library after a user signs in.
function handleCredentialResponse(response) {
    if (!auth) {
        console.error("Firebase Auth is not initialized. Cannot handle credential response.");
        return;
    }
    const id_token = response.credential;
    const credential = firebase.auth.GoogleAuthProvider.credential(id_token);
    auth.signInWithCredential(credential).catch((error) => {
        console.error("Firebase credential sign-in error:", error);
        notify(`❌ Google Sign-in failed: ${error.message}`);
    });
}

// Updates the UI to show either the Sign-In or Sign-Out button.
function updateAuthUI(user) {
    const gsiContainer = document.getElementById('gsi-button-container');
    const signOutBtn = document.getElementById('signOutBtn');
    const mainControls = document.querySelectorAll('.controls-main button'); 

    if (user) {
        // User is signed in
        if (gsiContainer) gsiContainer.style.display = 'none';
        if (signOutBtn) {
            signOutBtn.style.display = 'block';
            signOutBtn.textContent = `Sign Out (${user.displayName || user.email})`;
        }
        if (mainControls && mainControls.length > 0) {
            mainControls.forEach(btn => btn.disabled = false);
        }
    } else {
        // User is signed out
        if (gsiContainer) {
            gsiContainer.style.display = 'block';
            if (window.google && window.google.accounts) {
                google.accounts.id.renderButton(
                    gsiContainer,
                    { theme: "outline", size: "large", type: "standard" }
                );
            }
        }
        if (signOutBtn) signOutBtn.style.display = 'none';
        if (mainControls && mainControls.length > 0) {
            mainControls.forEach(btn => btn.disabled = true);
        }
    }
}

// This function is now attached to the window and called by the Google script's onload callback.
window.onGoogleLibraryLoad = () => {
    // 1. Initialize Firebase first.
    if (window.firebase && !isFirebaseInitialized) {
        firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
        isFirebaseInitialized = true;
    } else if (!window.firebase) {
        console.error("Firebase library not loaded! Cannot initialize.");
        return;
    }
    
    // 2. Now that Firebase is ready, initialize Google Sign-In.
    if (window.google && window.google.accounts) {
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse
        });
    } else {
        console.error("Google GSI library not loaded.");
        return;
    }
    
    // 3. Finally, set up the auth listener.
    if (auth) {
        auth.onAuthStateChanged((user) => {
            initialUser = user; // Store the user state
            authStateDetermined = true;
            updateAuthUI(user);
            // If the main script's callback is ready, call it.
            if (onAuthStateChangeCallback) {
                onAuthStateChangeCallback(user);
            }
        });
    } else {
        console.error("Auth is not initialized. Cannot set onAuthStateChanged listener.");
    }
};


// The initializeFirebase function now just sets the page-specific callback.
export function initializeFirebase(callback) {
  onAuthStateChangeCallback = callback;
  // If the auth state has already been determined when this function is called,
  // immediately trigger the callback with the stored user state to prevent race conditions.
  if (authStateDetermined) {
      callback(initialUser);
  }
}

export function signOut() {
  if (auth) {
    auth.signOut().catch((error) => {
        console.error("Sign Out Error:", error);
    });
  }
}

export { auth, db };
