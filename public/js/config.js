// public/js/config.js

// IMPORTANT: Replace these placeholder values with your actual
// Firebase project configuration. You can find this in your
// Firebase project settings under "General".

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBTYnujGKp9ok9zY9oRywkZ-LR-PT20VZY",
  authDomain: "planar-alliance-448817-h0.firebaseapp.com",
  projectId: "planar-alliance-448817-h0",
  storageBucket: "planar-alliance-448817-h0.firebasestorage.app",
  messagingSenderId: "1049899901887",
  appId: "1:1049899901887:web:0c3e74f7fa5fc338afb70a",
  measurementId: "G-6RR7R4ZKVY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// IMPORTANT: Replace this with your actual Google Client ID for Web applications
// You can find this in the Google Cloud Console under APIs & Services > Credentials.
export const GOOGLE_CLIENT_ID = "1049899901887-08ctjqqf0q3sqbhsdpoc52tl1lkv5s7u.apps.googleusercontent.com";
