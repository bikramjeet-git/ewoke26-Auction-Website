// register.js

import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  ref,
  set
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const membersDiv = document.getElementById("members");



/* =========================================
   1. GENERATE INPUT FIELDS
========================================= */
membersDiv.innerHTML = "";

for (let i = 1; i <= 6; i++) {
  let html = `
    <div style="margin-top: 10px; text-align: left;">
      <h4 style="color: #e0e0e0; font-size: 0.9rem; margin-bottom: 5px;">
        ${i === 1 ? "Team Leader (Member 1)" : `Member ${i}`}
      </h4>
    </div>
  `;

  html += `<input id="name${i}" placeholder="Full Name">`;

  if (i === 1) {
    html += `<input id="enroll${i}" placeholder="Enrollment ID">`;
    html += `<input id="gsuite${i}" placeholder="GSuite ID">`;
  }

  membersDiv.innerHTML += html;
}

/* =========================================
   2. REGISTER TEAM
========================================= */
window.registerTeam = async () => {


  const teamName = document.getElementById("teamName").value
  .replace(/[^\w]/g, "")   // keep only a-z A-Z 0-9 _
  .toLowerCase(); ;

  const password = document.getElementById("password").value;
  const balance = 10000;

  if (!teamName || !password) {
    alert("Please enter Team Name and Password");
    return;
  }

  const email = `${teamName}@ewoke.in`;
  const members = [];

  for (let i = 1; i <= 6; i++) {
    const name = document.getElementById(`name${i}`).value.trim();

    if (i === 1) {
      const enroll = document.getElementById(`enroll${i}`).value.trim();
      const gsuite = document.getElementById(`gsuite${i}`).value.trim();

      if (name && enroll && gsuite) {
        members.push({
          name,
          enroll,
          gsuite: gsuite.toLowerCase(),
          role: "Leader"
        });
      } else if (name || enroll || gsuite) {
        alert("Leader must fill Name, Enrollment ID, and GSuite ID.");
        return;
      }
    } else {
      if (name) {
        members.push({
          name,
          role: "Member"
        });
      }
    }
  }

  if (members.length < 4) {
    alert(`Minimum 4 members required. You entered ${members.length}.`);
    return;
  }

  if (!members.find(m => m.role === "Leader")) {
    alert("Leader details missing.");
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, password);

    await set(ref(db, `teams/${teamName}`), {
      teamName,
      balance,
      members,
      createdAt: Date.now()
    });

    alert("✅ Registration Done! Redirecting to login...");
    window.location.href = "login.html";

  } catch (err) {
    console.error(err);

    if (err.code === "auth/email-already-in-use") {
      alert("This Team Name is already registered.");
    } else if (err.code === "auth/weak-password") {
      alert("Password should be at least 6 characters.");
    } else {
      alert("Error: " + err.message);
    }
  }
};