// admin.js

import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  ref,
  set,
  update,
  onValue,
  get,
  push
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

/* ============================
   ADMIN AUTH
============================ */
const ADMIN_EMAILS = ["admin@ewoke.in"];

onAuthStateChanged(auth, user => {
  if (!user || !ADMIN_EMAILS.includes(user.email)) {
    alert("Unauthorized");
    window.location.href = "login.html";
  }
});

/* ============================
   LOGOUT
============================ */
window.logout = async () => {
  await signOut(auth);
  window.location.href = "login.html";
};

/* ============================
   START AUCTION
============================ */
window.startAuction = async () => {
  const name = itemName.value.trim();
  const base = Number(basePrice.value);
  const actualValue = Number(document.getElementById("actualValue").value);

  if (!name || !base || !actualValue) {
    alert("Fill all fields");
    return;
  }

  await set(ref(db, "auction/currentItem"), {
    itemId: Date.now(),
    name,
    basePrice: base,
    actualValue,
    highestBid: base,
    highestBidder: "",
    status: "LIVE",
    endTime: Date.now() + 60000
  });

  alert("Auction started");
};

/* ============================
   LIVE BID VIEW
============================ */
onValue(ref(db, "auction/currentItem"), snap => {
  if (!snap.exists()) return;
  const d = snap.val();
  highestBid.innerText = d.highestBid;
  highestBidder.innerText = d.highestBidder || "None";
});

/* ============================
   END AUCTION
============================ */
window.endAuction = async () => {
  const auctionSnap = await get(ref(db, "auction/currentItem"));
  if (!auctionSnap.exists()) return;

  const a = auctionSnap.val();

  if (!a.highestBidder || a.highestBidder === "admin") {
    alert("Invalid winner");
    return;
  }

  const teamRef = ref(db, `teams/${a.highestBidder}`);
  const teamSnap = await get(teamRef);
  const team = teamSnap.val();

  const newBalance = team.balance - a.highestBid;

  await update(teamRef, { balance: newBalance });

  await set(
    ref(db, `teams/${a.highestBidder}/itemsBought/${a.itemId}`),
    {
      name: a.name,
      price: a.highestBid
    }
  );

  // 🔥 STORE RESULT
  await push(ref(db, "auctionHistory"), {
    teamName: a.highestBidder,
    companyName: a.name,
    baseValue: a.basePrice,
    finalBid: a.highestBid,
    actualValue: a.actualValue,
    time: Date.now()
  });

  await update(ref(db, "auction/currentItem"), { status: "ENDED" });

  alert("Auction ended");
};

/* ============================
   LOAD TABLE
============================ */
const tbody = document.querySelector("#resultTable tbody");

onValue(ref(db, "auctionHistory"), snap => {
  tbody.innerHTML = "";
  snap.forEach(s => {
    const d = s.val();
    tbody.innerHTML += `
      <tr>
        <td>${d.teamName}</td>
        <td>${d.companyName}</td>
        <td>${d.baseValue}</td>
        <td>${d.finalBid}</td>
        <td>${d.actualValue}</td>
      </tr>
    `;
  });
});

/* ============================
   SORT TABLE
============================ */
window.sortTable = col => {
  const rows = Array.from(tbody.rows);
  const asc = tbody.getAttribute("data-sort") !== "asc";
  tbody.setAttribute("data-sort", asc ? "asc" : "desc");

  rows.sort((a, b) => {
    const x = a.cells[col].innerText;
    const y = b.cells[col].innerText;
    return asc ? x.localeCompare(y, undefined, { numeric: true })
               : y.localeCompare(x, undefined, { numeric: true });
  });

  rows.forEach(r => tbody.appendChild(r));
};

/* ============================
   FILTER TABLE
============================ */
window.filterTable = () => {
  const val = filterTeam.value.toLowerCase();
  Array.from(tbody.rows).forEach(row => {
    row.style.display =
      row.cells[0].innerText.toLowerCase().includes(val)
        ? ""
        : "none";
  });
};
