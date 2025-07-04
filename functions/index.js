/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
// Import and configure the cors middleware
const cors = require("cors")({ origin: true });

admin.initializeApp();


// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// The function that was causing CORS errors
exports.getMapsData = onRequest((request, response) => {
  // Use the cors middleware to handle the request
  cors(request, response, () => {
    logger.info("getMapsData function triggered", {structuredData: true});
    const address = request.query.address;

    // In a real application, you would use this address to query
    // the Google Maps API or another service.
    // For this example, we'll just log it and send a success response.
    logger.info(`Received address: ${address}`);

    // Respond with a success message.
    response.status(200).send({
      message: "Request received successfully",
      address: address
    });
  });
});
