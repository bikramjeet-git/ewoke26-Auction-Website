import { db, auth } from "./firebase.js"; // Added auth import for logout
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"; // Added signOut import
import {
  ref,
  onValue,
  update
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

/* ============================
   BASIC SETUP
============================ */
const teamName = localStorage.getItem("teamName");
const auctionRef = ref(db, "auction/currentItem");
const teamRef = ref(db, `teams/${teamName}`);


document.getElementById("header-text").innerText = "Team " + (teamName?.toLocaleUpperCase() || "-");
let currentAuction = null;
let teamBalance = 2000;

/* ============================
   AUCTION LISTENER (UPDATED)
============================ */
onValue(auctionRef, (snap) => {
  const activeUI = document.getElementById("activeAuctionUI");
  const waitingUI = document.getElementById("waitingUI");

  if (!snap.exists()) {
    // No data at all -> Show waiting
    if(activeUI) activeUI.style.display = "none";
    if(waitingUI) waitingUI.style.display = "block";
    return;
  }

  currentAuction = snap.val();

  // CHECK STATUS
  if (currentAuction.status === "LIVE") {
    // --- SHOW BIDDING INTERFACE ---
    if(waitingUI) waitingUI.style.display = "none";
    if(activeUI) activeUI.style.display = "block";

    // Update Text
    document.getElementById("itemName").innerText = currentAuction.name || "Unknown Item";
    document.getElementById("highestBid").innerText = currentAuction.highestBid || 0;
    document.getElementById("highestBidder").innerText = currentAuction.highestBidder || "—";
    
  } else {
    // --- SHOW WAITING INTERFACE ---
    if(activeUI) activeUI.style.display = "none";
    if(waitingUI) waitingUI.style.display = "block";
  }
});

/* ============================
   TEAM DATA LISTENER
============================ */
onValue(teamRef, (snap) => {
  if (!snap.exists()) {
    // Handle case where team doesn't exist (optional)
    return;
  }

  const data = snap.val();

  // Validation
  if (typeof data.balance !== "number") {
    teamBalance = 2000;
  } else {
    teamBalance = data.balance;
  }

  const balanceEl = document.getElementById("balance");
  if(balanceEl) balanceEl.innerText = teamBalance;

  // Purchases
  const purchasesDiv = document.getElementById("purchases");
  if (purchasesDiv) {
      purchasesDiv.innerHTML = "";
      if (data.itemsBought) {
        Object.values(data.itemsBought).forEach((item) => {
          purchasesDiv.innerHTML += `
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding: 8px 0;">
                <span>${item.name}</span>
                <span style="color: #ffd700;">$${item.price}</span>
            </div>`;
        });
      } else {
          purchasesDiv.innerHTML = '<p style="font-size: 0.8rem; text-align: center; margin-top: 20px; opacity: 0.5;">No purchases yet.</p>';
      }
  }
});

/* ============================
   LOGOUT
============================ */
window.logout = async () => {
  try {
    // If you are using Firebase Auth:
    if(auth) await signOut(auth);
    
    localStorage.clear();
    window.location.href = "login.html";
  } catch (err) {
    console.error(err);
    // Fallback if auth isn't initialized but we want to redirect
    localStorage.clear();
    window.location.href = "login.html";
  }
};

/* ============================
   PLACE BID
============================ */
window.placeBid = async () => {
  if (!currentAuction) return;

  // 🚨 Admin protection
  if (teamName === "admin") {
    alert("Admin cannot bid");
    return;
  }

  if (currentAuction.status !== "LIVE") {
    alert("Auction is not live!");
    return;
  }

  const inputField = document.getElementById("bidAmount");
  const bid = Number(inputField.value);

  if (!bid || bid <= currentAuction.highestBid) {
    alert(`Bid must be higher than $${currentAuction.highestBid}`);
    return;
  }

  if (bid > teamBalance) {
    alert(`Insufficient balance! You only have $${teamBalance}`);
    return;
  }

  if (currentAuction.highestBidder === teamName) {
    alert("You already hold the highest bid!");
    return;
  }

  // Update DB
  await update(auctionRef, {
    highestBid: bid,
    highestBidder: teamName,
  });
  
  // Clear input for better UX
  inputField.value = "";
};

/* ============================
   VIEW TEAM MEMBERS
============================ */
window.viewTeam = () => {
  window.location.href = "team.html";
};