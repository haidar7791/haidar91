/* src/firebase.js */
import { initializeApp } from "firebase/app";
import {
    getAuth,
    signInAnonymously,
    signInWithCustomToken,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile
} from "firebase/auth";

import { getFirestore } from "firebase/firestore";

// قراءة الإعداد
let firebaseConfig = null;

try {
    if (typeof __firebase_config !== "undefined") {
        firebaseConfig = JSON.parse(__firebase_config);
    }
} catch (err) {
    console.warn("Invalid config:", err);
}

// تهيئة التطبيق
let app = null;
let auth = null;
let db = null;

if (firebaseConfig) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
} else {
    console.warn("Firebase config missing!");
}

export {
    app,
    auth,
    db,
    getAuth,
    signInAnonymously,
    signInWithCustomToken,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile
};
