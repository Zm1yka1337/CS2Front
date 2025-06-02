// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBkfpt0ODAC86n0Y-Qk7JpWwEqtkDr2Oa4",
  authDomain: "cs2granata.firebaseapp.com",
  projectId: "cs2granata",
  storageBucket: "cs2granata.firebasestorage.app",
  messagingSenderId: "580315210290",
  appId: "1:580315210290:web:f414b565448f4182ad522b",
  measurementId: "G-0BG2C0DKFH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default app;