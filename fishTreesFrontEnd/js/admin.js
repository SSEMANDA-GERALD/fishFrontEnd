document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("refreshAdmin").addEventListener("click", loadAdmin);
  document.getElementById("adminSignout").addEventListener("click", signOut);
  loadAdmin();
});

function loadAdmin() {
  try {
    const account = window.FishTreesDemo.getAccount();
    if (!account) {
      window.location.replace("signin.html");
      return;
    }
    if (account.role !== "admin") {
      window.location.replace("dashboard.html");
      return;
    }
    document.getElementById("adminTitle").textContent = `${account.displayName} dashboard`;
    const orders = window.FishTreesDemo.getOrders();
    const completedOrders = orders.filter((order) => order.status === "completed");
    const predictionCount = completedOrders.reduce((sum, order) => sum + order.predictionCount, 0);
    document.getElementById("adminStats").hidden = false;
    document.getElementById("statPredictions").textContent = predictionCount;
    document.getElementById("statRevenue").textContent = `UGX ${completedOrders.reduce((sum, order) => sum + order.amount, 0).toLocaleString()}`;
    document.getElementById("statPayments").textContent = orders.filter((order) => order.status === "pending").length;
    renderOrders(orders);
    document.getElementById("adminStatus").textContent = "";
  } catch (error) {
    document.getElementById("adminStatus").textContent = error.message;
  }
}

function renderOrders(orders) {
  const list = document.getElementById("adminOrders");
  list.replaceChildren();
  if (!orders.length) {
    showEmpty(list, "No prediction requests yet.");
    return;
  }
  orders.forEach((order) => {
    const row = document.createElement("article");
    row.className = "admin-row";
    const details = document.createElement("div");
    const reference = document.createElement("strong");
    reference.textContent = order.reference;
    const summary = document.createElement("p");
    const role = order.createdByRole === "school" ? "School" : "Administrator";
    const kind = order.mode === "bulk" ? "Bulk" : "Single";
    const status = order.status === "completed" ? "Complete (simulated payment)" : "Waiting for Continue";
    summary.textContent = `${role} · ${kind} · ${order.predictionCount} learner${order.predictionCount === 1 ? "" : "s"} · UGX ${Number(order.amount).toLocaleString()} · ${status}`;
    details.append(reference, summary);

    const action = document.createElement("a");
    action.className = "order-action";
    action.href = order.status === "completed"
      ? `results.html?order=${encodeURIComponent(order.id)}`
      : `payment.html?order=${encodeURIComponent(order.id)}`;
    action.textContent = order.status === "completed" ? "View report" : "Continue";
    row.append(details, action);
    list.append(row);
  });
}

function signOut() {
  try {
    window.FishTreesDemo.signOut();
    window.location.href = "signin.html";
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