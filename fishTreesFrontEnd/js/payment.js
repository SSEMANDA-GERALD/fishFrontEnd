document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("paymentForm").addEventListener("submit", continuePayment);
  loadPaymentOrder();
});

function loadPaymentOrder() {
  const orderId = new URLSearchParams(window.location.search).get("order");
  const form = document.getElementById("paymentForm");
  const status = document.getElementById("paymentStatus");
  let order;
  try {
    if (!window.FishTreesDemo.getAccount()) {
      form.hidden = true;
      status.textContent = "Sign in to continue to your payment simulation.";
      document.getElementById("paymentStartLink").hidden = false;
      return;
    }
    order = window.FishTreesDemo.getOrder(orderId);
  } catch (error) {
    form.hidden = true;
    status.textContent = error.message;
    return;
  }
  if (!order) {
    form.hidden = true;
    status.textContent = "No payment request was found. Start from your account workspace.";
    document.getElementById("paymentStartLink").hidden = false;
    return;
  }

  document.getElementById("paymentAmount").textContent = Number(order.amount).toLocaleString();
  document.getElementById("paymentQuantity").textContent = `${order.predictionCount} student${order.predictionCount === 1 ? "" : "s"}`;
  const summary = document.getElementById("paymentOrderSummary");
  summary.textContent = `${order.reference} · ${order.predictionCount} recommendation${order.predictionCount === 1 ? "" : "s"}`;
  summary.hidden = false;
  if (order.status === "completed") {
    form.hidden = true;
    status.textContent = "Payment simulation complete.";
    const resultsLink = document.getElementById("paymentResultsLink");
    resultsLink.href = `results.html?order=${encodeURIComponent(order.id)}`;
    resultsLink.hidden = false;
  }
}

function continuePayment(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const orderId = new URLSearchParams(window.location.search).get("order");
  const status = document.getElementById("paymentStatus");
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const order = window.FishTreesDemo.completePayment(orderId);
    window.location.href = `results.html?order=${encodeURIComponent(order.id)}`;
  } catch (error) {
    status.textContent = error.message;
    button.disabled = false;
  }
}