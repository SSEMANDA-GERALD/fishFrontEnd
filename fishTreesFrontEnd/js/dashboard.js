document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("refreshDashboard").addEventListener("click", loadDashboard);
  document.getElementById("signoutButton").addEventListener("click", signOut);
  loadDashboard();
});

function loadDashboard() {
  const status = document.getElementById("dashboardStatus");
  try {
    const account = window.FishTreesDemo.getAccount();
    if (!account) {
      window.location.replace("signin.html");
      return;
    }
    if (account.role === "admin") {
      window.location.replace("admin.html");
      return;
    }
    if (account.role !== "school") {
      window.location.replace("signin.html");
      return;
    }
    document.getElementById("dashboardTitle").textContent = `${account.displayName} dashboard`;
    const orders = window.FishTreesDemo.getOrders();
    document.getElementById("dashboardContent").hidden = false;
    document.getElementById("predictionCount").textContent = orders.filter((order) => order.status === "completed").reduce((sum, order) => sum + order.predictionCount, 0);
    document.getElementById("completedOrderCount").textContent = orders.filter((order) => order.status === "completed").length;
    document.getElementById("orderCount").textContent = orders.length;
    document.getElementById("bulkLink").hidden = false;
    renderOrders(orders);
    status.textContent = "";
  } catch (error) {
    status.textContent = error.message;
  }
}

function signOut() {
  try {
    window.FishTreesDemo.signOut();
    window.location.href = "signin.html";
  } catch (error) {
    document.getElementById("dashboardStatus").textContent = error.message;
  }
}

function renderOrders(orders) {
  const list = document.getElementById("ordersList");
  list.replaceChildren();
  if (!orders.length) {
    const empty = document.createElement("p");
    empty.className = "account-note";
    empty.textContent = "No recommendation requests yet.";
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
    description.textContent = `${order.mode === "bulk" ? "Bulk" : "Single"} · ${order.predictionCount} student${order.predictionCount === 1 ? "" : "s"} · ${order.status === "completed" ? "preview complete" : "ready to continue"}`;
    details.append(reference, description);
    const action = document.createElement("a");
    action.className = "order-action";
    action.href = `results.html?order=${encodeURIComponent(order.id)}`;
    action.textContent = "View report";
    if (order.status !== "completed") {
      action.addEventListener("click", () => {
        try {
          window.FishTreesDemo.completeRequest(order.id);
        } catch (_) {}
      });
    }
    row.append(details, action);
    list.append(row);
  });
}
