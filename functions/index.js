//const functions = require("firebase-functions");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

export function initializeFirebaseTesting() {
  if (!processInitialized) {
    // Initialize test database
    process.env.GCLOUD_PROJECT = TEST_PROJECT_ID;
    process.env.FIREBASE_DATABASE_EMULATOR_HOST="127.0.0.1:9000"
    FirebaseUtils.initializeFirebase({
        projectId : TEST_PROJECT_ID,
        databaseURL: `http://127.0.0.1:9000/?ns=${TEST_PROJECT_ID}-default-rtdb`,
        storageBucket: `${TEST_PROJECT_ID}.appspot.com`,
    });
    processInitialized = true;
  }
}

if (process.env.SPSBTN_FIREBASE_TESTING === "1") {
  initializeFirebaseTesting();
} else {
  initializeFirebase();
}
