import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const tbody = document.querySelector("#resultsTable tbody");

/* ============================
   FETCH AND RENDER DATA
============================ */
onValue(ref(db, "teams"), snap => {
  if (!snap.exists()) return;
  
  const teamsData = snap.val();
  tbody.innerHTML = "";

  // Convert object to array for easier processing
  const teamsArray = Object.keys(teamsData).map(key => {
      const team = teamsData[key];
      
      // 1. Format Companies List: "Google ($500), Meta ($300)"
      let companiesList = [];
      let totalTrueValue = 0;

      if (team.itemsBought) {
          Object.values(team.itemsBought).forEach(item => {
              companiesList.push(`${item.name} ($${item.price})`);
              
              // Sum True Value (ensure it's a number)
              totalTrueValue += Number(item.actualValue || 0);
          });
      }

      const companiesString = companiesList.length > 0 
          ? companiesList.join("<br>") 
          : "<span style='opacity:0.5'>No purchases</span>";

      return {
          name: team.teamName || key,
          companies: companiesString,
          balance: Number(team.balance || 0),
          totalTrueValue: totalTrueValue
      };
  });

  // Render to Table
  teamsArray.forEach(t => {
      tbody.innerHTML += `
        <tr>
          <td>${t.name}</td>
          <td>${t.companies}</td>
          <td style="color: #00e676; font-weight: bold;">$${t.balance}</td>
          <td style="color: #ff9966; font-weight: bold;">$${t.totalTrueValue}</td>
        </tr>
      `;
  });
});

/* ============================
   SORT LOGIC
============================ */
window.sortResults = (col) => {
  const rows = Array.from(tbody.rows);
  const asc = tbody.getAttribute("data-sort") !== "asc";
  tbody.setAttribute("data-sort", asc ? "asc" : "desc");

  rows.sort((a, b) => {
    // Get text content
    let x = a.cells[col].innerText;
    let y = b.cells[col].innerText;

    // Clean currency symbols for numeric sort
    const xNum = parseFloat(x.replace(/[^0-9.-]+/g,""));
    const yNum = parseFloat(y.replace(/[^0-9.-]+/g,""));

    // Check if both are valid numbers (for columns 2 and 3)
    if (!isNaN(xNum) && !isNaN(yNum)) {
        return asc ? xNum - yNum : yNum - xNum;
    }

    // Default String Sort
    return asc ? x.localeCompare(y, undefined, { numeric: true })
               : y.localeCompare(x, undefined, { numeric: true });
  });

  rows.forEach(r => tbody.appendChild(r));
};

/* ============================
   FILTER LOGIC
============================ */
window.filterResults = () => {
  const val = document.getElementById("filterInput").value.toLowerCase();
  Array.from(tbody.rows).forEach(row => {
    row.style.display =
      row.cells[0].innerText.toLowerCase().includes(val)
        ? ""
        : "none";
  });
};