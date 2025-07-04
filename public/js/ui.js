// public/js/ui.js

import { signOutUser } from './firebase.js';

/**
 * Updates the authentication UI based on the user's login status.
 * @param {object|null} user - The current user object, or null if logged out.
 */
export function updateAuthUI(user) {
    const authContainer = document.getElementById('auth-container');
    const signOutBtn = document.getElementById('sign-out');

    if (user) {
        // User is signed in
        authContainer.innerHTML = `<span>Welcome, ${user.displayName || user.email}</span>`;
        if (signOutBtn) {
            signOutBtn.style.display = 'block';
            signOutBtn.onclick = () => signOutUser();
        }
    } else {
        // User is signed out
        // The Google Sign-In button will be rendered by the GSI library
        // into the 'gsi-button-container' div which should be inside 'auth-container'.
        if (signOutBtn) {
            signOutBtn.style.display = 'none';
        }
    }
}


/**
 * Sets up the navigation links to show the corresponding sections.
 * @param {function(string): void} showSectionCallback - Callback to show a section.
 */
export function setupNavigation(showSectionCallback) {
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const sectionId = event.target.getAttribute('data-section');
            showSectionCallback(sectionId);
        });
    });
}

/**
 * Sets up the hamburger menu for mobile navigation.
 */
export function setupHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('nav');
    const signOutBtn = document.getElementById('signOutBtn');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }

    // Function to close the navigation menu
    const closeNav = () => {
        if (nav.classList.contains('active')) {
            nav.classList.remove('active');
        }
    };

    // Add event listeners to nav links to close the menu on click
    const navLinks = nav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', closeNav);
    });

    // Add event listener for the sign-out button
    if (signOutBtn) {
        signOutBtn.addEventListener('click', () => {
            signOutUser();
            closeNav();
        });
    }
}

/**
 * Toggles the visibility of the loading spinner.
 * @param {boolean} show - Whether to show or hide the spinner.
 */
export function toggleSpinner(show) {
    const spinner = document.getElementById('spinner');
    if (spinner) {
        spinner.style.display = show ? 'block' : 'none';
    }
}
