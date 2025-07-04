// public/js/ui.js

import { signOutUser } from './firebase.js';

/**
 * Updates the authentication UI based on the user's login status.
 * @param {object|null} user - The current user object, or null if logged out.
 */
export function updateAuthUI(user) {
    const gsiContainer = document.getElementById('gsi-button-container');
    const signOutBtn = document.getElementById('sign-out');
    const userWelcome = document.getElementById('user-welcome');

    if (user) {
        // User is signed in
        if (gsiContainer) gsiContainer.style.display = 'none';
        if (signOutBtn) signOutBtn.style.display = 'block';
        if (userWelcome) {
            userWelcome.textContent = `Welcome, ${user.displayName || user.email}`;
            userWelcome.style.display = 'inline';
        }
    } else {
        // User is signed out
        if (gsiContainer) gsiContainer.style.display = 'block';
        if (signOutBtn) signOutBtn.style.display = 'none';
        if (userWelcome) userWelcome.style.display = 'none';
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
            if (sectionId) {
                showSectionCallback(sectionId);
            }
            // Also close hamburger menu on mobile after clicking a link
            const nav = document.querySelector('nav');
            if (nav.classList.contains('active')) {
                nav.classList.remove('active');
            }
        });
    });
}

/**
 * Sets up the hamburger menu for mobile navigation.
 */
export function setupHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('nav');
    const authContainer = document.getElementById('auth-container');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            nav.classList.toggle('active');
            // Also toggle the auth container for mobile view
            if (authContainer) {
                authContainer.classList.toggle('active');
            }
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
