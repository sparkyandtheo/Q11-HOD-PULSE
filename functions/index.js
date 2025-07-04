const functions = require("firebase-functions");
const axios = require("axios");
const cors = require("cors")({origin: true});

// It is STRONGLY recommended to store your API key in an environment variable.
// To do this, run this command in your terminal before deploying:
// firebase functions:config:set maps.key="YOUR_Maps_API_KEY"

const Maps_API_KEY = functions.config().maps.key;

exports.getMapsData = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        const address = req.query.address;

        if (!address) {
            res.status(400).send("Missing address parameter.");
            return;
        }

        if (!Maps_API_KEY) {
            res.status(500).send("API key is not configured on the server.");
            return;
        }

        const encodedAddress = encodeURIComponent(address);

        // Construct the URLs on the server
        const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${Maps_API_KEY}&q=${encodedAddress}`;
        const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${encodedAddress}&key=${Maps_API_KEY}`;

        try {
            // We can pre-check if street view metadata exists to avoid showing a broken image
            const streetViewMetaResponse = await axios.get(`https://maps.googleapis.com/maps/api/streetview/metadata?location=${encodedAddress}&key=${Maps_API_KEY}`);

            const hasStreetView = streetViewMetaResponse.data.status === "OK";

            res.status(200).json({
                mapUrl: mapUrl,
                streetViewUrl: streetViewUrl,
                hasStreetView: hasStreetView
            });

        } catch (error) {
            console.error("Error fetching from Google Maps API:", error);
            res.status(500).send("Failed to fetch data from Google Maps API.");
        }
    });
});