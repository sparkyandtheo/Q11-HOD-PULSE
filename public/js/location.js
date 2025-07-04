// public/js/location.js

import { db } from './firebase.js';
import { ref, onValue, push, set } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { toggleSpinner } from './ui.js';

/**
 * Sets up the form for adding new locations.
 */
export function setupLocationForm() {
    const locationForm = document.getElementById('add-location-form');
    if (locationForm) {
        locationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const locationName = locationForm['location-name'].value;
            const locationNotes = locationForm['location-notes'].value;
            addLocation(locationName, locationNotes);
            locationForm.reset();
        });
    }
}

/**
 * Adds a new location to the database.
 * @param {string} name - The name of the location.
 * @param {string} notes - Any notes about the location.
 */
function addLocation(name, notes) {
    const locationsRef = ref(db, 'locations');
    const newLocationRef = push(locationsRef);
    set(newLocationRef, {
        name: name,
        notes: notes,
        timestamp: Date.now()
    }).catch(error => console.error("Error adding location: ", error));
}

/**
 * Displays the list of locations from the database.
 */
export function displayLocations() {
    toggleSpinner(true);
    const locationsRef = ref(db, 'locations');
    const locationsTableBody = document.getElementById('locations-table-body');

    onValue(locationsRef, (snapshot) => {
        if (locationsTableBody) {
            locationsTableBody.innerHTML = '';
            snapshot.forEach((childSnapshot) => {
                const location = childSnapshot.val();
                const row = locationsTableBody.insertRow();
                row.innerHTML = `
                    <td>${location.name}</td>
                    <td>${location.notes}</td>
                `;
            });
        }
        toggleSpinner(false);
    }, (error) => {
        console.error("Error fetching locations: ", error);
        toggleSpinner(false);
    });
}
