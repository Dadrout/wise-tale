import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
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
    
    // Skip Firestore operations for now
    console.log('Email Sign Up Success:', userCredential.user);
    return { user: userCredential.user, error: null };
    
    // TODO: Uncomment this after fixing Firestore rules
    /*
    // Create user profile in Firestore
    if (userCredential.user) {
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: userCredential.user.email,
        displayName: displayName || userCredential.user.email?.split('@')[0],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    */
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    // Try popup first, fallback to redirect if it fails
    try {
      const userCredential = await signInWithPopup(auth, provider);
      console.log('Google Sign In Success (popup):', userCredential.user);
      return { user: userCredential.user, error: null };
    } catch (popupError: any) {
      console.log('Popup failed, trying redirect...', popupError);
      
      // If popup fails, use redirect
      await signInWithRedirect(auth, provider);
      // Redirect will happen, so we can't return anything here
      return { user: null, error: 'Redirecting to Google...' };
    }
    
    // TODO: Uncomment this after fixing Firestore rules
    /*
    // Create or update user profile in Firestore
    if (userCredential.user) {
      const userRef = doc(db, "users", userCredential.user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          email: userCredential.user.email,
          displayName: userCredential.user.displayName || userCredential.user.email?.split('@')[0],
          photoURL: userCredential.user.photoURL,
          createdAt: new Date(),
          updatedAt: new Date(),
          provider: 'google'
        });
      } else {
        // Update last login
        await updateDoc(userRef, {
          updatedAt: new Date()
        });
      }
    }
    */
  } catch (error: any) {
    console.error('Google Sign In Error:', error);
    if (error.code === 'auth/popup-closed-by-user') {
      return { user: null, error: 'Sign in was cancelled' };
    }
    if (error.code === 'auth/unauthorized-domain') {
      return { user: null, error: 'Domain not authorized. Please contact support.' };
    }
    if (error.code === 'auth/operation-not-allowed') {
      return { user: null, error: 'Google sign-in is not enabled. Please contact support.' };
    }
    return { user: null, error: `Authentication error: ${error.message} (Code: ${error.code})` };
  }
};

export const checkRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      console.log('Google Sign In Success (redirect):', result.user);
      return { user: result.user, error: null };
    }
    return { user: null, error: null };
  } catch (error: any) {
    console.error('Redirect result error:', error);
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

// Auth state listener
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
}; 