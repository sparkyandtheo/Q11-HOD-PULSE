// public/js/equipment.js

import { db } from './firebase.js';
import { ref, onValue, push, set } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { toggleSpinner } from './ui.js';

/**
 * Sets up the forms for adding and managing equipment.
 */
export function setupEquipmentForms() {
    const addEquipmentForm = document.getElementById('add-equipment-form');
    if (addEquipmentForm) {
        addEquipmentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const equipmentName = addEquipmentForm['equipment-name'].value;
            const equipmentUser = addEquipmentForm['equipment-user'].value;
            const equipmentNotes = addEquipmentForm['equipment-notes'].value;
            addEquipment(equipmentName, equipmentUser, equipmentNotes);
            addEquipmentForm.reset();
        });
    }
}

/**
 * Adds a new piece of equipment to the database.
 * @param {string} name - The name of the equipment.
 * @param {string} user - The user of the equipment.
 * @param {string} notes - Any notes about the equipment.
 */
function addEquipment(name, user, notes) {
    const equipmentRef = ref(db, 'equipment');
    const newEquipmentRef = push(equipmentRef);
    set(newEquipmentRef, {
        name: name,
        user: user,
        notes: notes,
        timestamp: Date.now()
    }).catch(error => console.error("Error adding equipment: ", error));
}

/**
 * Displays the list of equipment from the database.
 */
export function displayEquipment() {
    toggleSpinner(true);
    const equipmentRef = ref(db, 'equipment');
    const equipmentTableBody = document.getElementById('equipment-table-body');

    onValue(equipmentRef, (snapshot) => {
        if (equipmentTableBody) {
            equipmentTableBody.innerHTML = '';
            snapshot.forEach((childSnapshot) => {
                const equipment = childSnapshot.val();
                const row = equipmentTableBody.insertRow();
                row.innerHTML = `
                    <td>${equipment.name}</td>
                    <td>${equipment.user}</td>
                    <td>${equipment.notes}</td>
                `;
            });
        }
        toggleSpinner(false);
    }, (error) => {
        console.error("Error fetching equipment: ", error);
        toggleSpinner(false);
    });
}
