/**
 * This function uses the v2 API. The key to fixing the CORS error for
 * v2 functions is to pass a `{ cors: true }` option to `onRequest`.
 * This automatically allows cross-origin requests from any domain.
 */
const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

admin.initializeApp();

/**
 * This is the getMapsData function.
 * By adding { cors: true }, we instruct Firebase to handle the CORS
 * preflight requests and add the necessary 'Access-Control-Allow-Origin'
 * header to the response.
 */
exports.getMapsData = onRequest(
  { cors: true }, // This is the critical fix for the CORS issue.
  (request, response) => {
    logger.info("getMapsData function triggered", {structuredData: true});
    const address = request.query.address;

    // Check if the address parameter was provided
    if (!address) {
      logger.warn("Request is missing address parameter.");
      response.status(400).send({ error: "The 'address' query parameter is required." });
      return;
    }

    logger.info(`Successfully received address: ${address}`);

    // In a real-world application, you would now use this address to
    // query a service like the Google Maps Geocoding API.
    // For now, we'll just send a success response.
    response.status(200).send({
      message: "Request received successfully by the function",
      address: address
    });
  }
);
