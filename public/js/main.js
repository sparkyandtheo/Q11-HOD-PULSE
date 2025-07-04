// public/js/main.js

import { setupAuthentication } from './firebase.js';
import { setupNavigation, setupHamburgerMenu } from './ui.js';
import { setupEquipmentForms, displayEquipment } from './equipment.js';
import { setupLocationForm, displayLocations } from './location.js';
import { setupPhoneLogForm, displayPhoneLog } from './phoneLog.js';

document.addEventListener('DOMContentLoaded', () => {
    setupAuthentication();
    // Pass the showSection function as a callback to break the circular dependency
    setupNavigation(showSection);
    setupHamburgerMenu();
    setupEquipmentForms();
    setupLocationForm();
    setupPhoneLogForm();
});

export function showSection(sectionId) {
    const sections = document.querySelectorAll('main section');
    sections.forEach(section => {
        section.style.display = 'none';
    });

    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.style.display = 'block';
        if (sectionId === 'equipment') {
            displayEquipment();
        } else if (sectionId === 'locations') {
            displayLocations();
        } else if (sectionId === 'phone-log') {
            displayPhoneLog();
        }
    }
}
