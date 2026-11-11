document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("refreshDashboard").addEventListener("click", loadDashboard);
  document.getElementById("signoutButton").addEventListener("click", signout);
  loadDashboard();
});

async function loadDashboard() {
  const status = document.getElementById("dashboardStatus");
  try {
    const { account } = await fishTreesApi("/api/auth/me");
    if (!account) {
      window.location.replace("signin.html");
      return;
    }
    if (["admin", "superadmin"].includes(account.role)) {
      window.location.replace("admin.html");
      return;
    }
    document.getElementById("dashboardTitle").textContent = account.organizationName || account.displayName;
    document.getElementById("accountDescriptor").textContent = `${account.role === "student" ? "Student" : account.institutionType || "Institution"} account`;
    if (account.status !== "approved") {
      document.getElementById("approvalNotice").hidden = false;
      document.getElementById("approvalNotice").textContent = account.status === "pending"
        ? "Your institution account is waiting for administrator approval. Reports and bulk tools will unlock after approval."
        : "This account is not active. Contact a FishTrees administrator.";
      return;
    }

    const data = await fishTreesApi("/api/dashboard");
    document.getElementById("dashboardContent").hidden = false;
    document.getElementById("predictionCount").textContent = data.predictionCount;
    document.getElementById("amountPaid").textContent = `UGX ${Number(data.amountPaid).toLocaleString()}`;
    document.getElementById("orderCount").textContent = data.orders.length;
    document.getElementById("bulkLink").hidden = !["school", "institution"].includes(account.role);
    renderOrders(data.orders);
    status.textContent = "";
  } catch (error) {
    status.textContent = error.message;
    if (error.status === 401) window.location.replace("signin.html");
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
    description.textContent = `${order.mode === "bulk" ? "Bulk" : "Individual"} · ${order.predictionCount} student${order.predictionCount === 1 ? "" : "s"} · UGX ${Number(order.amount).toLocaleString()}`;
    details.append(reference, description);
    const action = document.createElement("a");
    action.className = "order-action";
    if (order.status === "paid") {
      action.href = `results.html?order=${encodeURIComponent(order.id)}`;
      action.textContent = "View report";
    } else {
      action.href = `payment.html?order=${encodeURIComponent(order.id)}`;
      action.textContent = order.status === "pending" ? "Payment status" : order.status;
    }
    row.append(details, action);
    list.append(row);
  });
}

async function signout() {
  try {
    await fishTreesApi("/api/auth/logout", { method: "POST", body: "{}" });
  } finally {
    window.location.replace("signin.html");
  }
}