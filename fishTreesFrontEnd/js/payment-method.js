document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("paymentReferenceForm").addEventListener("submit", submitPaymentReference);
  loadPaymentMethodOrder();
});

async function loadPaymentMethodOrder() {
  const orderId = new URLSearchParams(window.location.search).get("order");
  const form = document.getElementById("paymentReferenceForm");
  const status = document.getElementById("methodPaymentStatus");
  if (!orderId) {
    form.hidden = true;
    status.textContent = "No payment order was provided. Return to the recommendation form to start an order.";
    return;
  }
  try {
    const { order } = await fishTreesApi(`/api/payment-orders/${encodeURIComponent(orderId)}`);
    document.getElementById("methodReturn").href = `payment.html?order=${encodeURIComponent(orderId)}`;
    document.getElementById("methodAmount").textContent = Number(order.amount).toLocaleString();
    document.getElementById("methodOrderSummary").textContent = `Order ${order.reference} · ${order.predictionCount} student${order.predictionCount === 1 ? "" : "s"} · ${order.status.toUpperCase()}`;
    if (order.status !== "pending") {
      form.hidden = true;
      status.textContent = order.status === "paid" ? "Payment verified. Your report is ready." : "This order is no longer pending.";
    }
  } catch (error) {
    form.hidden = true;
    status.textContent = error.message;
  }
}

async function submitPaymentReference(event) {
  event.preventDefault();
  const orderId = new URLSearchParams(window.location.search).get("order");
  const method = document.body.dataset.paymentMethod;
  const status = document.getElementById("methodPaymentStatus");
  const button = event.currentTarget.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const result = await fishTreesApi(`/api/payment-orders/${encodeURIComponent(orderId)}/reference`, {
      method: "POST",
      body: JSON.stringify({
        paymentMethod: method,
        paymentReference: document.getElementById("paymentReference").value.trim(),
      }),
    });
    status.textContent = result.message;
    window.location.href = `payment.html?order=${encodeURIComponent(orderId)}&submitted=1`;
  } catch (error) {
    status.textContent = error.message;
  } finally {
    button.disabled = false;
  }
}