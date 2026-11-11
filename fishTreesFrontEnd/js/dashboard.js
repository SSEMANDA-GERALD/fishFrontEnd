document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("refreshDashboard").addEventListener("click", loadDashboard);
  document.getElementById("signoutButton").addEventListener("click", () => {
    window.location.href = "index.html";
  });
  loadDashboard();
});

function loadDashboard() {
  const status = document.getElementById("dashboardStatus");
  try {
    const orders = window.FishTreesDemo.getOrders();
    document.getElementById("dashboardContent").hidden = false;
    document.getElementById("predictionCount").textContent = orders.filter((order) => order.status === "demo-paid").reduce((sum, order) => sum + order.predictionCount, 0);
    document.getElementById("amountPaid").textContent = `UGX ${orders.filter((order) => order.status === "demo-paid").reduce((sum, order) => sum + order.amount, 0).toLocaleString()} (demo)`;
    document.getElementById("orderCount").textContent = orders.length;
    document.getElementById("bulkLink").hidden = false;
    renderOrders(orders);
    status.textContent = "";
  } catch (error) {
    status.textContent = error.message;
  }
}

function renderOrders(orders) {
  const list = document.getElementById("ordersList");
  list.replaceChildren();
  if (!orders.length) {
    const empty = document.createElement("p");
    empty.className = "account-note";
    empty.textContent = "No payment orders yet.";
    list.append(empty);
    return;
  }
  orders.forEach((order) => {
    const row = document.createElement("article");
    row.className = "order-history-row";
    const details = document.createElement("div");
    const reference = document.createElement("strong");
    reference.textContent = order.reference;
    const description = document.createElement("p");
    description.textContent = `${order.mode === "bulk" ? "Bulk" : "Individual"} · ${order.predictionCount} student${order.predictionCount === 1 ? "" : "s"} · UGX ${Number(order.amount).toLocaleString()} · ${order.status === "demo-paid" ? "demo complete" : "awaiting demo"}`;
    details.append(reference, description);
    const action = document.createElement("a");
    action.className = "order-action";
    if (order.status === "demo-paid") {
      action.href = `results.html?order=${encodeURIComponent(order.id)}`;
      action.textContent = "View demo report";
    } else {
      action.href = `payment.html?order=${encodeURIComponent(order.id)}`;
      action.textContent = "Continue demo";
    }
    row.append(details, action);
    list.append(row);
  });
}
