document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("refreshAdmin").addEventListener("click", loadAdmin);
  document.getElementById("adminSignout").addEventListener("click", async () => {
    try { await fishTreesApi("/api/auth/logout", { method: "POST", body: "{}" }); } finally { window.location.replace("signin.html"); }
  });
  document.getElementById("pendingAccounts").addEventListener("click", handleAdminAction);
  document.getElementById("pendingPayments").addEventListener("click", handleAdminAction);
  loadAdmin();
});

async function loadAdmin() {
  const status = document.getElementById("adminStatus");
  try {
    const { account } = await fishTreesApi("/api/auth/me");
    if (!account) {
      window.location.replace("signin.html");
      return;
    }
    if (!account || !["admin", "superadmin"].includes(account.role)) {
      window.location.replace(account ? "dashboard.html" : "signin.html");
      return;
    }
    const data = await fishTreesApi("/api/admin/overview");
    document.getElementById("adminStats").hidden = false;
    document.getElementById("statPredictions").textContent = data.predictions;
    document.getElementById("statRevenue").textContent = `UGX ${Number(data.amountCollected).toLocaleString()}`;
    document.getElementById("statPayments").textContent = data.pendingOrders;
    document.getElementById("statInstitutions").textContent = data.accounts.pending;
    document.getElementById("statSchools").textContent = data.accounts.schools;
    document.getElementById("statOtherInstitutions").textContent = data.accounts.institutions;
    document.getElementById("statAccounts").textContent = data.accounts.total;
    document.getElementById("statFeedback").textContent = data.feedbackCount;
    document.getElementById("statTraining").textContent = data.trainingFeedbackCount;
    renderAccounts(data.pendingAccounts);
    renderPayments(data.pendingOrdersList);
    status.textContent = "";
  } catch (error) {
    status.textContent = error.message;
    if (error.status === 401) window.location.replace("signin.html");
  }
}

function renderAccounts(accounts) {
  const list = document.getElementById("pendingAccounts");
  list.replaceChildren();
  if (!accounts.length) return showEmpty(list, "No institution requests waiting for review.");
  accounts.forEach((account) => {
    const row = document.createElement("article");
    row.className = "admin-row";
    const info = document.createElement("div");
    const name = document.createElement("strong");
    name.textContent = account.organizationName || account.displayName;
    const detail = document.createElement("p");
    detail.textContent = `${account.role} · ${account.institutionType || ""} · ${account.email}`;
    info.append(name, detail);
    const actions = document.createElement("div");
    actions.className = "admin-row-actions";
    actions.append(actionButton("Approve", "account-status", account.id, "approved"), actionButton("Reject", "account-status", account.id, "rejected"));
    row.append(info, actions);
    list.append(row);
  });
}

function renderPayments(orders) {
  const list = document.getElementById("pendingPayments");
  list.replaceChildren();
  if (!orders.length) return showEmpty(list, "No payments waiting for verification.");
  orders.forEach((order) => {
    const row = document.createElement("article");
    row.className = "admin-row";
    const info = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = `${order.reference} · UGX ${Number(order.amount).toLocaleString()}`;
    const detail = document.createElement("p");
    detail.textContent = `${order.account.organizationName || order.account.displayName} · ${order.mode} · ${order.predictionCount} student${order.predictionCount === 1 ? "" : "s"} · ${order.paymentMethod || "method missing"} · transaction: ${order.paymentReference || "not submitted"}`;
    info.append(title, detail);
    const actions = document.createElement("div");
    actions.className = "admin-row-actions";
    actions.append(actionButton("Verify paid", "payment-verify", order.id, "paid", !order.paymentReference), actionButton("Reject", "payment-verify", order.id, "rejected"));
    row.append(info, actions);
    list.append(row);
  });
}

function actionButton(label, action, id, value, disabled = false) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "admin-action-button";
  button.dataset.action = action;
  button.dataset.id = id;
  button.dataset.value = value;
  button.textContent = label;
  button.disabled = disabled;
  return button;
}

async function handleAdminAction(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const status = document.getElementById("adminStatus");
  const accountAction = button.dataset.action === "account-status";
  const endpoint = accountAction
    ? `/api/admin/accounts/${button.dataset.id}/status`
    : `/api/admin/payment-orders/${button.dataset.id}/verify`;
  button.disabled = true;
  try {
    await fishTreesApi(endpoint, {
      method: "POST",
      body: JSON.stringify(accountAction ? { status: button.dataset.value } : { action: button.dataset.value }),
    });
    status.textContent = accountAction ? "Institution status updated." : "Payment review recorded.";
    await loadAdmin();
  } catch (error) {
    status.textContent = error.message;
    button.disabled = false;
  }
}

function showEmpty(container, message) {
  const empty = document.createElement("p");
  empty.className = "account-note";
  empty.textContent = message;
  container.append(empty);
}