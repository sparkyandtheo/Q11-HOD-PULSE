// public/js/ui.js

import { signOutUser } from './firebase.js';
import { showSection } from './main.js';

/**
 * Sets up the navigation links to show the corresponding sections.
 */
export function setupNavigation() {
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const sectionId = event.target.getAttribute('data-section');
            showSection(sectionId);
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
