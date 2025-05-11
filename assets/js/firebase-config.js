import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAvEEFE59ySkVUMr6QcM2RsPej1YuknDCc",
  authDomain: "portfolio-website-bdf21.firebaseapp.com",
  projectId: "portfolio-website-bdf21",
  storageBucket: "portfolio-website-bdf21.firebasestorage.app",
  messagingSenderId: "355963456143",
  appId: "1:355963456143:web:3eb8e7ff837d6a4eb37efa",
  measurementId: "G-DJQECD6HHS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };