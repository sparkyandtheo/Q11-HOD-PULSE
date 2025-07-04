import { notify } from './ui.js';

const $ = id => document.getElementById(id);

let debounceTimeout;

/**
 * Sets up event listeners for the location-related UI elements.
 */
export function setupLocation() {
    const locationTabs = document.querySelector('.location-tabs');

    // Switch between Map and Street View
    if (locationTabs) {
        locationTabs.addEventListener('click', (e) => {
            const button = e.target.closest('.location-tab-btn');
            if (button) {
                const view = button.dataset.view;
                switchLocationView(view);
            }
        });
    }
}

/**
 * Updates the map and street view visuals by calling the secure Firebase Function.
 * @param {string} address - The jobsite address.
 */
export async function updateLocationVisuals(address) {
    const container = $('location-visuals-container');
    const mapView = $('mapView');
    const streetViewImg = $('streetViewImg');

    if (!address) {
        if (container) container.style.display = 'none';
        return;
    }

    if (container) container.style.display = 'block';
    
    // Show a loading state
    showLocationMessage('loading', 'Loading location...');

    try {
        // IMPORTANT: Replace 'your-project-id' with your actual Firebase project ID.
        // You can also get this URL from the Firebase console after deploying the function.
        const functionUrl = `https://us-central1-your-project-id.cloudfunctions.net/getMapsData`;
        
        const response = await fetch(`${functionUrl}?address=${encodeURIComponent(address)}`);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to fetch location data.');
        }

        const data = await response.json();

        mapView.src = data.mapUrl;

        if (data.hasStreetView) {
            streetViewImg.src = data.streetViewUrl;
            streetViewImg.style.display = 'block';
            const streetViewTab = document.querySelector('.location-tab-btn[data-view="streetview"]');
            if (streetViewTab) streetViewTab.style.display = 'inline-flex';
        } else {
            streetViewImg.src = '';
            streetViewImg.style.display = 'none';
            const streetViewTab = document.querySelector('.location-tab-btn[data-view="streetview"]');
            if (streetViewTab) streetViewTab.style.display = 'none';
        }

        // Default to map view
        switchLocationView('map');

    } catch (error) {
        console.error('Location Fetch Error:', error);
        showLocationMessage('error', 'Could not load location.', 'Please check the address or try again later.');
    }
}

/**
 * Switches the visible location panel between the map and street view.
 * @param {string} view - The view to show ('map' or 'streetview').
 */
function switchLocationView(view) {
    const mapView = $('mapView');
    const streetViewImg = $('streetViewImg');
    const mapTab = document.querySelector('.location-tab-btn[data-view="map"]');
    const streetViewTab = document.querySelector('.location-tab-btn[data-view="streetview"]');
    const locationContent = document.querySelector('.location-content');

    // Clear any previous messages
    const existingMessage = locationContent.querySelector('.location-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    if (view === 'map') {
        mapView.style.display = 'block';
        streetViewImg.style.display = 'none';
        if(mapTab) mapTab.classList.add('active');
        if(streetViewTab) streetViewTab.classList.remove('active');
    } else { // streetview
        mapView.style.display = 'none';
        streetViewImg.style.display = 'block';
        if(mapTab) mapTab.classList.remove('active');
        if(streetViewTab) streetViewTab.classList.add('active');
    }
}

/**
 * Displays a message (loading, error, etc.) inside the location content area.
 * @param {string} type - 'loading' or 'error'.
 * @param {string} title - The title of the message.
 * @param {string} message - The detailed message.
 */
function showLocationMessage(type, title, message = '') {
    const locationContent = document.querySelector('.location-content');
    if (!locationContent) return;

    // Hide the map and image elements
    if ($('mapView')) $('mapView').style.display = 'none';
    if ($('streetViewImg')) $('streetViewImg').style.display = 'none';

    // Clear any previous message
    const existingMessage = locationContent.querySelector('.location-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create and show the new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `location-message location-${type}`;
    messageDiv.innerHTML = `<strong>${title}</strong><p>${message}</p>`;
    locationContent.appendChild(messageDiv);
}