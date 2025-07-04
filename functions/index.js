const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

admin.initializeApp();

// This is just an example function name, 
// replace 'getMapsData' if your function is named differently.
exports.getMapsData = functions.https.onRequest((req, res) => {
  // This cors() handler is the critical part.
  cors(req, res, () => {
    // Your original function logic would go here.
    // For now, let's just send a success message.
    const address = req.query.address;
    console.log("Received address:", address);

    // In a real app, you would use the address to fetch data.
    // For now, we'll just acknowledge the request.
    res.status(200).send({ message: `Successfully received address: ${address}` });
  });
});