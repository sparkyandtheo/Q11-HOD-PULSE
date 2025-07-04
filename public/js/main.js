// public/js/main.js

import { setupAuthentication } from './firebase.js';
// Import updateAuthUI here to pass it as a callback
import { setupNavigation, setupHamburgerMenu, updateAuthUI } from './ui.js';
import { setupEquipmentForms, displayEquipment } from './equipment.js';
import { setupLocationForm, displayLocations } from './location.js';
import { setupPhoneLogForm, displayPhoneLog } from './phoneLog.js';

document.addEventListener('DOMContentLoaded', () => {
    // Pass updateAuthUI as a callback to setupAuthentication to break the circular dependency
    setupAuthentication(updateAuthUI);
    
    // Pass showSection as a callback to setupNavigation
    setupNavigation(showSection);

    setupHamburgerMenu();
    setupEquipmentForms();
    setupLocationForm();
    setupPhoneLogForm();
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
