import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { ref, set } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const membersDiv = document.getElementById("members");

// Create 4–6 member fields using loop
for (let i = 1; i <= 6; i++) {
  membersDiv.innerHTML += `
    <h4>Member ${i}</h4>
    <input id="name${i}" placeholder="Name">
    <input id="enroll${i}" placeholder="Enrollment ID">
    <input id="gsuite${i}" placeholder="Gsuite ID">
  `;
}

window.registerTeam = async () => {
  const teamName = document.getElementById("teamName").value;
  const password = document.getElementById("password").value;

  const email = teamName + "@ewoke.in";

  const members = [];

  for (let i = 1; i <= 6; i++) {
    const name = document.getElementById(`name${i}`).value;
    const enroll = document.getElementById(`enroll${i}`).value;
    const gsuite = document.getElementById(`gsuite${i}`).value;

    if (name && enroll && gsuite) {
      members.push({ name, enroll, gsuite });
    }
  }

  if (members.length < 4) {
    alert("Minimum 4 members required");
    return;
  }

  try {
    const user = await createUserWithEmailAndPassword(auth, email, password);

    await set(ref(db, "teams/" + teamName), {
      teamName,
      members
    });

    alert("✅ Registration Done!");
    window.location.href = "login.html";
  } catch (err) {
    alert(err.message);
  }
};
