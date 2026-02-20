// File: src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: GANTI DENGAN CONFIG FIREBASE PROYEK BARUMU!
const firebaseConfig = {
    apiKey: "AIzaSyCKrRxxwtrgZnM6VC15OAt93bzEE_oTtzI",
    authDomain: "test-storage-d1556.firebaseapp.com",
    projectId: "test-storage-d1556",
    storageBucket: "test-storage-d1556.firebasestorage.app",
    messagingSenderId: "902403519882",
    appId: "1:902403519882:web:32469a4dbcbb0fe4524473"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);