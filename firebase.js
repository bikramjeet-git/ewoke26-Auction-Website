
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

export const firebaseConfig = {
  apiKey: "AIzaSyChgsLdjdN3H1S0F5xQ3_0buduRzVUcsTE",
  authDomain: "ewoke26.firebaseapp.com",
  databaseURL: "https://ewoke26-default-rtdb.firebaseio.com",
  projectId: "ewoke26",
  storageBucket: "ewoke26.firebasestorage.app",
  messagingSenderId: "228493463230",
  appId: "1:228493463230:web:e7867f4f5d90dac85f58ef",
  measurementId: "G-R89B2NW4HR"
};


export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
