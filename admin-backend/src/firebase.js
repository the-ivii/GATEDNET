const admin = require('firebase-admin');

// Get Firebase configuration from environment variables
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
  universe_domain: "googleapis.com"
};

// Validate service account
if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
  throw new Error('Invalid Firebase service account configuration');
}

console.log('Initializing Firebase Admin SDK with config:', {
  projectId: serviceAccount.project_id,
  clientEmail: serviceAccount.client_email,
  hasPrivateKey: !!serviceAccount.private_key
});

let firebaseApp;

try {
  if (!admin.apps.length) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin SDK initialized successfully');
  } else {
    firebaseApp = admin.app();
    console.log('Using existing Firebase Admin SDK instance');
  }
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  throw error;
}

// Verify Firebase connection
const verifyFirebaseConnection = async () => {
  try {
    await admin.auth().listUsers(1);
    console.log('Firebase connection verified successfully');
    return true;
  } catch (error) {
    console.error('Error verifying Firebase connection:', error);
    return false;
  }
};

// Export both admin and verification function
module.exports = {
  admin,
  verifyFirebaseConnection
};