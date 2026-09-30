// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIRABASE_API_KEY,
  authDomain: "cortexai-a53f5.firebaseapp.com",
  projectId: "cortexai-a53f5",
  storageBucket: "cortexai-a53f5.firebasestorage.app",
  messagingSenderId: "287144243761",
  appId: "1:287144243761:web:0dfe1fdcff8b679b445b10",
  measurementId: "G-PYWMLTVGSR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const googleProvider=new GoogleAuthProvider()