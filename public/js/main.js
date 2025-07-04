// public/js/main.js

import { setupAuthentication } from './firebase.js';
import { setupNavigation, setupHamburgerMenu, updateAuthUI } from './ui.js';
import { setupEquipmentForms, displayEquipment } from './equipment.js';
import { setupLocationForm, displayLocations } from './location.js';
import { setupPhoneLogForm, displayPhoneLog } from './phoneLog.js';

/**
 * This function initializes the main application logic.
 * It's called after the DOM and Google library are ready.
 */
function initializeApp() {
    console.log("App initializing.");

    // Pass updateAuthUI as a callback to setupAuthentication to avoid circular dependencies.
    setupAuthentication(updateAuthUI);
    
    // Pass showSection as a callback to setupNavigation.
    setupNavigation(showSection);

    setupHamburgerMenu();
    setupEquipmentForms();
    setupLocationForm();
    setupPhoneLogForm();

    // Show the equipment section by default to make the app visible on load.
    showSection('equipment');
}

// Wait for the DOM to be fully loaded before trying to initialize the app.
document.addEventListener('DOMContentLoaded', () => {
    // The Google Identity Services library loads asynchronously.
    // We need to wait for the global `google` object to be available.
    const checkGoogle = setInterval(() => {
        if (typeof google !== 'undefined' && google.accounts) {
            console.log("Google library is loaded.");
            clearInterval(checkGoogle);
            initializeApp();
        } else {
            console.log("Waiting for Google library to load...");
        }
    }, 100); // Check every 100ms.
});


/**
 * Shows the specified section and hides others. Also triggers data loading for the section.
 * @param {string} sectionId - The ID of the section to show.
 */
export function showSection(sectionId) {
    const sections = document.querySelectorAll('main section');
    sections.forEach(section => {
        section.style.display = 'none';
    });

    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.style.display = 'block';
        
        // Load data for the active section
        if (sectionId === 'equipment') {
            displayEquipment();
        } else if (sectionId === 'locations') {
            displayLocations();
        } else if (sectionId === 'phone-log') {
            displayPhoneLog();
        }
    }
}
