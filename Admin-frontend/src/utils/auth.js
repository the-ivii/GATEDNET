import { signInWithCustomToken } from "firebase/auth";
import { auth } from "./firebase"; // your firebase config

export async function getIdTokenFromCustomToken(token) {
  if (!token) {
    console.error("No token provided to getIdTokenFromCustomToken");
    throw new Error("Invalid token: No token provided");
  }

  try {
    console.log("Attempting to sign in with custom token...");
    
    // Ensure the token is properly formatted
    const formattedToken = token.trim();
    if (!formattedToken) {
      throw new Error("Invalid token format");
    }
    
    const userCredential = await signInWithCustomToken(auth, formattedToken);
    console.log("Successfully signed in with custom token");
    
    // Force token refresh to ensure we have the latest token
    await userCredential.user.getIdToken(true);
    const idToken = await userCredential.user.getIdToken();
    console.log("Successfully obtained ID token");
    
    return idToken;
  } catch (error) {
    console.error("Firebase authentication error:", {
      code: error.code,
      message: error.message,
      fullError: error
    });
    
    // Provide more specific error messages based on the error code
    switch (error.code) {
      case 'auth/invalid-custom-token':
        throw new Error("Invalid authentication token. Please try logging in again.");
      case 'auth/custom-token-mismatch':
        throw new Error("Authentication token mismatch. Please try logging in again.");
      case 'auth/network-request-failed':
        throw new Error("Network error. Please check your internet connection.");
      case 'auth/user-disabled':
        throw new Error("This account has been disabled. Please contact support.");
      case 'auth/user-not-found':
        throw new Error("Invalid email or password.");
      default:
        throw new Error(`Authentication failed: ${error.message}`);
    }
  }
}