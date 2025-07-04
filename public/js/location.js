/**
 * This file is updated to use the correct, hardcoded project ID,
 * which will resolve the 404 "Not Found" errors.
 */
async function updateLocationVisuals(address) {
    if (!address || address.trim() === '') {
        console.log("Address is empty, skipping fetch.");
        return;
    }

    console.log(`Fetching location data for: ${address}`);

    try {
        // The placeholder 'your-project-id' has been replaced with your
        // actual Firebase project ID to fix the "Failed to fetch" error.
        const projectId = 'planar-alliance-448817-h0';
        const functionUrl = `https://us-central1-${projectId}.cloudfunctions.net/getMapsData`;

        const response = await fetch(`${functionUrl}?address=${encodeURIComponent(address)}`);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Network response was not ok. Status: ${response.status}. Body: ${errorText}`);
        }

        const data = await response.json();
        console.log("Received data from Cloud Function:", data);

        // Update the UI with the fetched data
        const locationDataElement = document.getElementById('location-data');
        if (locationDataElement) {
            locationDataElement.textContent = `Data for "${data.address}" loaded successfully.`;
        }

    } catch (error) {
        console.error('Location Fetch Error:', error);
        const locationDataElement = document.getElementById('location-data');
        if (locationDataElement) {
            locationDataElement.textContent = `Failed to load location data. Check console for details.`;
        }
    }
}

export { updateLocationVisuals };
