/**
 * This file is updated to correctly handle CORS for a v2 Cloud Function.
 */
const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

admin.initializeApp();

/**
 * For v2 onRequest functions, CORS is enabled by passing a configuration
 * object as the first argument. Setting { cors: true } allows requests
 * from any origin, which is suitable for this public-facing app.
 */
exports.getMapsData = onRequest(
  { cors: true }, // This is the correct way to enable CORS on a v2 function.
  (request, response) => {
    logger.info("getMapsData function triggered", {structuredData: true});
    const address = request.query.address;

    if (!address) {
      logger.warn("Request received without an address.");
      response.status(400).send({ error: "Address query parameter is required." });
      return;
    }

    logger.info(`Received address: ${address}`);

    // In a real app, you would process the address. Here, we just confirm receipt.
    response.status(200).send({
      message: "Request received successfully by v2 function",
      address: address
    });
  }
);
