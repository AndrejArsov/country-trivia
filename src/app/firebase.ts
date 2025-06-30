import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDuGRux4dWqKV8r38gzW1Kp0gXWKqdmGzg",
  authDomain: "country-trivia-ae5d2.firebaseapp.com",
  projectId: "country-trivia-ae5d2",
  storageBucket: "country-trivia-ae5d2.firebasestorage.app",
  messagingSenderId: "424976519112",
  appId: "1:424976519112:web:38d32b0ea3fca32ed17afd",
  measurementId: "G-GXS9HBLD7F"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);


// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyDuGRux4dWqKV8r38gzW1Kp0gXWKqdmGzg",
//   authDomain: "country-trivia-ae5d2.firebaseapp.com",
//   projectId: "country-trivia-ae5d2",
//   storageBucket: "country-trivia-ae5d2.firebasestorage.app",
//   messagingSenderId: "424976519112",
//   appId: "1:424976519112:web:38d32b0ea3fca32ed17afd",
//   measurementId: "G-GXS9HBLD7F"
// };

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
