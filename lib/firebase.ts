import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAimmium7-UoKgYWck5mkDT5s7WhMvuaaQ",
  authDomain: "nrmm-46813.firebaseapp.com",
  projectId: "nrmm-46813",
  storageBucket: "nrmm-46813.firebasestorage.app",
  messagingSenderId: "611162062306",
  appId: "1:611162062306:web:df6ddb48be2573fe1c8dbb",
  measurementId: "G-ZB4ZFE4NL4"
};

// Initialize Firebase (Prevents duplicate initialization during hot reloads in development)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };