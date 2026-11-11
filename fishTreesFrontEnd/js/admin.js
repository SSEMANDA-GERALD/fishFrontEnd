document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("refreshAdmin").addEventListener("click", loadAdmin);
  document.getElementById("adminSignout").addEventListener("click", () => {
    window.location.href = "index.html";
  });
  document.getElementById("trainingExport").addEventListener("click", (event) => {
    event.preventDefault();
    document.getElementById("adminStatus").textContent = "Account review and feedback export need a backend and are disabled in this presentation build.";
  });
  loadAdmin();
});

function loadAdmin() {
  try {
    const orders = window.FishTreesDemo.getOrders();
    const demoOrders = orders.filter((order) => order.status === "demo-paid");
    const predictionCount = demoOrders.reduce((sum, order) => sum + order.predictionCount, 0);
    document.getElementById("adminStats").hidden = false;
    document.getElementById("statPredictions").textContent = predictionCount;
    document.getElementById("statRevenue").textContent = `UGX ${demoOrders.reduce((sum, order) => sum + order.amount, 0).toLocaleString()} (demo)`;
    document.getElementById("statPayments").textContent = orders.filter((order) => order.status === "awaiting-demo").length;
    ["statInstitutions", "statSchools", "statOtherInstitutions", "statAccounts", "statFeedback", "statTraining"].forEach((id) => {
      document.getElementById(id).textContent = "—";
    });
    showEmpty(document.getElementById("pendingAccounts"), "Account review is unavailable in this frontend-only demo.");
    showEmpty(document.getElementById("pendingPayments"), "No real transactions are collected or verified in this demo.");
    document.getElementById("adminStatus").textContent = "";
  } catch (error) {
    document.getElementById("adminStatus").textContent = error.message;
  }
}

function showEmpty(container, message) {
  const empty = document.createElement("p");
  empty.className = "account-note";
  empty.textContent = message;
  container.append(empty);
}