// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBymLn4TJOvF4MBwhwznmWpNR1EZJUiaJA",
  authDomain: "geneseon.firebaseapp.com",
  projectId: "geneseon",
  storageBucket: "geneseon.firebasestorage.app",
  messagingSenderId: "227045312550",
  appId: "1:227045312550:web:c1b1faec8a1fa8ef667ee7"
};

// Initialize Firebase app
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
// Request the user's email, profile, and openid scopes
googleProvider.addScope("email");
googleProvider.addScope("profile");