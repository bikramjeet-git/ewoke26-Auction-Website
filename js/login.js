import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

window.login = async () => {
  const teamName = document.getElementById("teamName")
  .value
  .normalize("NFKD")       // remove unicode variants
  .replace(/[^\w]/g, "")   // keep only a-z A-Z 0-9 _
  .toLowerCase(); 

  console.log(teamName)
  const password = document.getElementById("password").value;

  const email = teamName + "@ewoke.in";

  try {
    await signInWithEmailAndPassword(auth, email, password);

    let role = "user";
    if (teamName.toLowerCase() === "admin") {
      role = "admin";
    }

    localStorage.setItem(
      "auth",
      JSON.stringify({
        isAuth: true,
        role: role,
        teamName: teamName
      })
    );

    localStorage.setItem(
        "teamName",
        teamName
    )

    if (role === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "dashboard-home.html";
    }

  } catch (err) {
    alert("Login failed");
    console.error(err);
  }
};
