import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAaYnmkiIR01-kuFYQRR7RGK8HWVs7duLg",
  authDomain: "time-capsule-d5a66.firebaseapp.com",
  projectId: "time-capsule-d5a66",
  storageBucket: "time-capsule-d5a66.firebasestorage.app",
  messagingSenderId: "218071541143",
  appId: "1:218071541143:web:c3eadd2c64274082ff50d2",
  measurementId: "G-YWMXJ6FHD3"
};

// Initialize Firebase app
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics only on client side
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
