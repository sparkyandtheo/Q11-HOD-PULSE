// This function will fetch data from our Cloud Function
async function updateLocationVisuals(address) {
    if (!address) {
        console.log("Address is empty, skipping fetch.");
        return;
    }

    console.log(`Fetching location data for: ${address}`);

    try {
        // Use the correct project ID in the URL.
        const projectId = 'planar-alliance-448817-h0';
        const functionUrl = `https://us-central1-${projectId}.cloudfunctions.net/getMapsData`;

        const response = await fetch(`${functionUrl}?address=${encodeURIComponent(address)}`);

        if (!response.ok) {
            // Throw an error with the response status to be caught by the catch block
            throw new Error(`Network response was not ok. Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Received data from Cloud Function:", data);

        // Here you would typically update the UI with the location data.
        // For example, updating a map or displaying formatted address info.
        const locationDataElement = document.getElementById('location-data');
        if (locationDataElement) {
            locationDataElement.textContent = `Data for "${data.address}" loaded.`;
        }

    } catch (error) {
        console.error('Location Fetch Error:', error);
        const locationDataElement = document.getElementById('location-data');
        if (locationDataElement) {
            locationDataElement.textContent = `Failed to load location data. See console for details.`;
        }
    }
}

export { updateLocationVisuals };
