import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your Firebase web config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyD6yWgl_QtPM8q_bGiuN7EdpdIRCRt6W1o",
  authDomain: "gatenet-a1199.firebaseapp.com",
  projectId: "gatenet-a1199",
  storageBucket: "gatenet-a1199.appspot.com",
  messagingSenderId: "332058420990",
  appId: "1:332058420990:web:9c1168efd2058ed828e7af",
  measurementId: "G-M8S320Q8DN"
};

// Validate Firebase config
const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingFields = requiredFields.filter(field => !firebaseConfig[field]);

if (missingFields.length > 0) {
  console.error('Missing required Firebase configuration fields:', missingFields);
  throw new Error('Invalid Firebase configuration');
}

let auth;

try {
  console.log('Initializing Firebase with config:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain
  });
  
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw new Error('Failed to initialize Firebase');
}

export { auth };