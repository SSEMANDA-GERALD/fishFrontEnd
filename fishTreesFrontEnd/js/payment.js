document.addEventListener("DOMContentLoaded", () => {
  const orderId = new URLSearchParams(window.location.search).get("order");
  const form = document.getElementById("paymentReferenceForm");
  document.getElementById("refreshPayment").addEventListener("click", loadOrder);
  form.addEventListener("submit", submitReference);
  if (!orderId) {
    document.getElementById("paymentGateMessage").textContent = "Create a recommendation request first. Its payment order will appear here.";
    return;
  }
  loadOrder();
});

async function loadOrder() {
  const orderId = new URLSearchParams(window.location.search).get("order");
  const gate = document.getElementById("paymentGateMessage");
  try {
    const { order } = await fishTreesApi(`/api/payment-orders/${encodeURIComponent(orderId)}`);
    renderOrder(order);
    gate.textContent = "";
  } catch (error) {
    gate.textContent = error.status === 401 ? "Sign in to view this payment order." : error.message;
    if (error.status === 401) {
      const link = document.createElement("a");
      link.href = "signin.html";
      link.textContent = " Sign in";
      gate.append(link);
    }
  }
}

function renderOrder(order) {
  document.getElementById("paymentPanel").hidden = false;
  document.getElementById("orderReference").textContent = order.reference;
  document.getElementById("orderQuantity").textContent = `${order.predictionCount} student${order.predictionCount === 1 ? "" : "s"}`;
  document.getElementById("orderAmount").textContent = `${order.currency} ${Number(order.amount).toLocaleString()}`;
  document.getElementById("orderStatus").textContent = order.status.toUpperCase();
  document.getElementById("selectedPaymentMethod").textContent = formatMethod(order.paymentMethod);
  document.getElementById("paymentMethod").value = order.paymentMethod || "mobile-money";
  document.getElementById("paymentReference").value = order.paymentReference || "";

  const isPending = order.status === "pending";
  document.getElementById("paymentInstructions").hidden = !isPending;
  document.getElementById("paymentStatusMessage").textContent = isPending
    ? order.paymentReference ? "Your payment reference is awaiting administrator verification." : "Order created. Submit your transaction reference after paying."
    : order.status === "paid" ? "Payment verified. Your report is ready."
      : "This payment order was rejected. Contact an administrator before creating another order.";
  const reportLink = document.getElementById("viewReport");
  reportLink.hidden = order.status !== "paid";
  reportLink.href = `results.html?order=${encodeURIComponent(order.id)}`;
}

async function submitReference(event) {
  event.preventDefault();
  const orderId = new URLSearchParams(window.location.search).get("order");
  const status = document.getElementById("paymentStatusMessage");
  const button = event.currentTarget.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const result = await fishTreesApi(`/api/payment-orders/${encodeURIComponent(orderId)}/reference`, {
      method: "POST",
      body: JSON.stringify({
        paymentMethod: document.getElementById("paymentMethod").value,
        paymentReference: document.getElementById("paymentReference").value.trim(),
      }),
    });
    status.textContent = result.message;
    renderOrder(result.order);
  } catch (error) {
    status.textContent = error.message;
  } finally {
    button.disabled = false;
  }
}

function formatMethod(method) {
  return ({
    "mobile-money": "Mobile money",
    "bank-transfer": "Bank transfer",
    card: "Bank card",
  })[method] || "Not selected";
}