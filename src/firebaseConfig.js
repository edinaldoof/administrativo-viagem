// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration provided by the user.
const firebaseConfig = {
  apiKey: "AIzaSyDIHmjJhip1LnNErDwArCdSmi6bi4dqSZo",
  authDomain: "fadex-viagens-ia.firebaseapp.com",
  projectId: "fadex-viagens-ia",
  storageBucket: "fadex-viagens-ia.appspot.com",
  messagingSenderId: "937561556447",
  appId: "1:937561556447:web:88f7844f32d4a46d3e706a",
  measurementId: "G-4G7KHYJV6J"
};

// Initialize Firebase with the provided configuration.
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service.
const db = getFirestore(app);

export { db };
