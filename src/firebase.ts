import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBdRaaW0Z7ko_nbgLzpTZwJfCNqljUtnn8",
  authDomain: "dice-poker-7b615.firebaseapp.com",
  projectId: "dice-poker-7b615",
  storageBucket: "dice-poker-7b615.firebasestorage.app",
  messagingSenderId: "375270993987",
  appId: "1:375270993987:web:85841988c71c514a1864f6",
  measurementId: "G-MBM9MGPMJ5",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
