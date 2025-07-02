import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit,
  addDoc,
  updateDoc
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "./firebase";

// Authentication utilities
export const signInUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const signUpUser = async (email: string, password: string, displayName?: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user profile in Firestore
    if (userCredential.user) {
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: userCredential.user.email,
        displayName: displayName || userCredential.user.email?.split('@')[0],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// User profile utilities
export const getUserProfile = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return { profile: userDoc.data(), error: null };
    }
    return { profile: null, error: "User not found" };
  } catch (error: any) {
    return { profile: null, error: error.message };
  }
};

export const updateUserProfile = async (userId: string, data: any) => {
  try {
    await updateDoc(doc(db, "users", userId), {
      ...data,
      updatedAt: new Date()
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Generation utilities
export const getUserGenerations = async (userId: string, limitCount: number = 10) => {
  try {
    const generationsQuery = query(
      collection(db, "generations"),
      where("user_id", "==", userId),
      orderBy("created_at", "desc"),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(generationsQuery);
    const generations = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { generations, error: null };
  } catch (error: any) {
    return { generations: [], error: error.message };
  }
};

export const getGenerationById = async (generationId: string) => {
  try {
    const generationDoc = await getDoc(doc(db, "generations", generationId));
    if (generationDoc.exists()) {
      return { generation: { id: generationDoc.id, ...generationDoc.data() }, error: null };
    }
    return { generation: null, error: "Generation not found" };
  } catch (error: any) {
    return { generation: null, error: error.message };
  }
};

// File upload utilities
export const uploadFile = async (file: File, path: string) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return { url: downloadURL, error: null };
  } catch (error: any) {
    return { url: null, error: error.message };
  }
};

// Auth state listener
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
}; 