import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD6rK6x8cWeRxzF3jH-LCymDGkZL0gIdy4",
    authDomain: "dot-collector-56485.firebaseapp.com",
    projectId: "dot-collector-56485",
    storageBucket: "dot-collector-56485.firebasestorage.app",
    messagingSenderId: "615952901250",
    appId: "1:615952901250:web:b527a88948f8476713c09b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Auth
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
