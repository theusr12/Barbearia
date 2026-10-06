// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  getDocFromServer,
} from "firebase/firestore";
import firebaseAppletConfig from "../../firebase-applet-config.json";

// Web app's provisioned Firebase configuration
const firebaseConfig = {
  apiKey: firebaseAppletConfig.apiKey || "AIzaSyAWCQgCLMwEEDqsNqRYHMcOojf2YrYeDz4",
  authDomain: firebaseAppletConfig.authDomain || "ardent-field-7hl8x.firebaseapp.com",
  projectId: firebaseAppletConfig.projectId || "ardent-field-7hl8x",
  storageBucket: firebaseAppletConfig.storageBucket || "ardent-field-7hl8x.firebasestorage.app",
  messagingSenderId: firebaseAppletConfig.messagingSenderId || "882418500493",
  appId: firebaseAppletConfig.appId || "1:882418500493:web:f0d227482106921163f3c4",
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = firebaseAppletConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseAppletConfig.firestoreDatabaseId)
  : getFirestore(app);

// Test connection on boot as recommended by Firebase skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firebase client is currently offline or initial connection pending.");
    }
  }
}
testConnection();

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type FirebaseUser,
  firebaseConfig,
};

export default app;
