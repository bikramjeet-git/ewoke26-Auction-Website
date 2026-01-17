import { auth } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* ============================
   🔒 AUTH GUARD (UNAUTHORIZED CHECK)
   ============================ */
// Check if authentication data exists in LocalStorage
const authData = JSON.parse(localStorage.getItem("auth"));
const teamName = localStorage.getItem("teamName");

// If missing auth flag or team name, redirect immediately
if (!authData || !authData.isAuth || !teamName) {
  // Optional: You can comment out the alert if you want a silent redirect
  alert("Access Denied. Please login first.");
  window.location.href = "login.html";
//   alert("Unauthorized")
  window.location.href = "login.html";

  
  // Stop further execution
  throw new Error("Unauthorized");
}

/* ============================
   LOGOUT FUNCTION
   ============================ */
window.logout = async () => {
  try {
    // Attempt Firebase SignOut
    if (auth) {
        await signOut(auth);
    }
    
    // Clear Local Storage
    localStorage.clear();
    
    // Redirect
    window.location.href = "login.html";
  } catch (err) {
    console.error("Logout error:", err);
    
    // Fallback: Force clear and redirect even if Firebase fails
    localStorage.clear();
    window.location.href = "login.html";
  }
};