// dashboard.js

import { db } from "./firebase.js";
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

let currentAuction = null;
let teamBalance = 2000;

/* ============================
   AUCTION LISTENER
============================ */
onValue(auctionRef, snap => {
  if (!snap.exists()) return;

  currentAuction = snap.val();

  document.getElementById("itemName").innerText =
    currentAuction.name || "—";

  document.getElementById("highestBid").innerText =
    currentAuction.highestBid || 0;

  document.getElementById("highestBidder").innerText =
  currentAuction.highestBidder || "—";

});

/* ============================
   TEAM DATA LISTENER
============================ */
onValue(teamRef, snap => {
  if (!snap.exists()) {
    alert("Team data missing");
    return;
  }

  const data = snap.val();

  // ✅ HARD VALIDATION
  if (typeof data.balance !== "number") {
    teamBalance = 2000;

    // Optional auto-fix corrupted DB
    update(teamRef, { balance: 2000 });
  } else {
    teamBalance = data.balance;
  }

  document.getElementById("balance").innerText = teamBalance;

  // Purchases
  const purchasesDiv = document.getElementById("purchases");
  purchasesDiv.innerHTML = "";

  if (data.itemsBought) {
    Object.values(data.itemsBought).forEach(item => {
      purchasesDiv.innerHTML +=
        `<p>${item.name} - $${item.price}</p>`;
    });
  }
});

window.logout = async () => {
  try {
    await signOut(auth);
    localStorage.clear();
    window.location.href = "login.html";
  } catch (err) {
    console.error(err);
    alert("Logout failed");
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
    alert("Auction ended");
    return;
  }

  const bid = Number(document.getElementById("bidAmount").value);

  if (!bid || bid <= currentAuction.highestBid) {
    alert("Bid must be higher");
    return;
  }

  if (bid > teamBalance) {
    alert("Insufficient balance");
    return;
  }

  if (currentAuction.highestBidder === teamName) {
    alert("Wait until someone outbids you");
    return;
  }

  await update(auctionRef, {
    highestBid: bid,
    highestBidder: teamName
  });
};

/* ============================
   VIEW TEAM MEMBERS
============================ */
window.viewTeam = () => {
  window.location.href = "team.html";
};
