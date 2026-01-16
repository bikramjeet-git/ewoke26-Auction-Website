import { db } from "./firebase.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// 1. Select DOM elements
const teamDiv = document.getElementById("teamData");
const loader = document.getElementById("loadingMsg");
const teamName = localStorage.getItem("teamName");

async function loadTeamData() {
  // Safety check: Ensure user is logged in
  if (!teamName) {
    if (loader) loader.style.display = "none";
    teamDiv.innerHTML = "<p style='text-align:center;'>No team found. Please login again.</p>";
    return;
  }

  try {
    // 2. Fetch the data from Firebase
    const snapshot = await get(ref(db, "teams/" + teamName));

    // 3. HIDE LOADER (This makes the 'Loading...' text vanish)
    if (loader) {
      loader.style.display = "none";
    }

    // 4. Process and Display Data
    if (snapshot.exists()) {
      const data = snapshot.val();

      // Check if members exist and iterate
      if (data.members && Array.isArray(data.members)) {
        
        teamDiv.innerHTML = ""; // Clear container

        data.members.forEach((m) => {
          // I added inline styles here so these cards look beautiful immediately
          teamDiv.innerHTML += `
            <div style="
                background: rgba(255, 255, 255, 0.05);
                padding: 15px 20px;
                margin-bottom: 15px;
                border-radius: 12px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                transition: transform 0.2s;
            " onmouseover="this.style.background='rgba(255,255,255,0.1)'" 
               onmouseout="this.style.background='rgba(255,255,255,0.05)'">
              
              <h3 style="margin: 0 0 5px 0; font-size: 1.1rem; color: #fff;">
                <i class="fas fa-user-circle" style="margin-right:8px;"></i>${m.name}
              </h3>
              
              <p style="margin: 0; font-size: 0.9rem; color: #ccc;">
                Enrollment ID: <span style="color: #adafb1;">${m.enroll}</span>
              </p>
            </div>
          `;
        });
      } else {
        teamDiv.innerHTML = "<p style='text-align:center;'>No members found in this team.</p>";
      }
    } else {
      teamDiv.innerHTML = "<p style='text-align:center;'>Team data does not exist.</p>";
    }

  } catch (error) {
    console.error("Error fetching team data:", error);
    if (loader) loader.style.display = "none";
    teamDiv.innerHTML = "<p style='text-align:center; color: #ff6b6b;'>Error loading data. Please try again.</p>";
  }
}

// Execute function
loadTeamData();