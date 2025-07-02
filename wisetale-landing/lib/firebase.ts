import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAaYnmkiIR01-kuFYQRR7RGK8HWVs7duLg",
  authDomain: "time-capsule-d5a66.firebaseapp.com",
  projectId: "time-capsule-d5a66",
  storageBucket: "time-capsule-d5a66.appspot.com",
  messagingSenderId: "218071541143",
  appId: "1:218071541143:web:c3eadd2c64274082ff50d2",
  measurementId: "G-YWMXJ6FHD3"
};

// Prevent re-initialization in Next.js hot reload
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app; 