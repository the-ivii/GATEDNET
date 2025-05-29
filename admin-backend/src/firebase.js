// const admin = require('firebase-admin'); // Removed Firebase admin import

// *** Removed Firebase initialization and connection verification ***
// Read Firebase credentials from environment variables
// const serviceAccount = {
//   projectId: process.env.FIREBASE_PROJECT_ID,
//   clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//   privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
// };

// console.log('FIREBASE_PRIVATE_KEY from env:', process.env.FIREBASE_PRIVATE_KEY ? 'Set' : 'Not Set');
// console.log('Length of private key:', process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.length : 'N/A');
// console.log('First 50 chars of private key:', process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.substring(0, 50) : 'N/A');

// Validate service account
// if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
//   throw new Error('Invalid Firebase service account configuration');
// }

// console.log('Initializing Firebase Admin SDK with config:', {
//   projectId: serviceAccount.projectId,
//   clientEmail: serviceAccount.clientEmail,
//   hasPrivateKey: !!serviceAccount.privateKey
// });

// let firebaseApp;

// try {
//   if (!admin.apps.length) {
//     firebaseApp = admin.initializeApp({
//       credential: admin.credential.cert(serviceAccount)
//     });
//     console.log('Firebase Admin SDK initialized successfully');
//   } else {
//     firebaseApp = admin.app();
//     console.log('Using existing Firebase Admin SDK instance');
//   }
// } catch (error) {
//   console.error('Error initializing Firebase Admin SDK:', error);
//   throw error;
// }

// Verify Firebase connection
// const verifyFirebaseConnection = async () => {
//   try {
//     await admin.auth().listUsers(1);
//     console.log('Firebase connection verified successfully');
//     return true;
//   } catch (error) {
//     console.error('Error verifying Firebase connection:', error);
//     return false;
//   }
// };

// Export null or empty objects since Firebase is removed
module.exports = {
  // admin: admin, // Removed admin export
  // verifyFirebaseConnection: verifyFirebaseConnection // Removed verification export
};