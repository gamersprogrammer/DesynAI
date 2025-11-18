// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBpmRR6yLeQMVpCn9TEtyipG5NQVAdCS_U",
  authDomain: "desyn-app.firebaseapp.com",
  projectId: "desyn-app",
  storageBucket: "desyn-app.firebasestorage.app",
  messagingSenderId: "229147076245",
  appId: "1:229147076245:web:2b00bd76f176f131d0dd9c",
  measurementId: "G-SFXBHYPQHZ"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize services
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null; // only in browser
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();
