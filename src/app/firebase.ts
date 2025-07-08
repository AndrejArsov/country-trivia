import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { environment } from "../enviroments/enviroment";

const apiKey = environment.apiKey

const firebaseConfig = {
  apiKey: apiKey,
  authDomain: "country-trivia-ae5d2.firebaseapp.com",
  projectId: "country-trivia-ae5d2",
  storageBucket: "country-trivia-ae5d2.firebasestorage.app",
  messagingSenderId: "424976519112",
  appId: "1:424976519112:web:38d32b0ea3fca32ed17afd",
  measurementId: "G-GXS9HBLD7F"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);


