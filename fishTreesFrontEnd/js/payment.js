document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("paymentForm").addEventListener("submit", continueToPaymentMethod);
  loadPaymentOrder();
});

function loadPaymentOrder() {
  const orderId = new URLSearchParams(window.location.search).get("order");
  const form = document.getElementById("paymentForm");
  const status = document.getElementById("paymentStatus");
  let order;
  try {
    order = window.FishTreesDemo.getOrder(orderId);
  } catch (error) {
    form.hidden = true;
    status.textContent = error.message;
    return;
  }
  if (!order) {
    form.hidden = true;
    status.textContent = "No demo order was found. Start with the recommendations form.";
    return;
  }

  document.getElementById("paymentAmount").textContent = Number(order.amount).toLocaleString();
  document.getElementById("paymentQuantity").textContent = `${order.predictionCount} student${order.predictionCount === 1 ? "" : "s"}`;
  const summary = document.getElementById("paymentOrderSummary");
  summary.textContent = `Presentation demo · ${order.predictionCount} recommendation${order.predictionCount === 1 ? "" : "s"}`;
  summary.hidden = false;
  if (order.status === "demo-paid") {
    form.hidden = true;
    status.textContent = "Demo payment complete. View the sample report.";
    const resultsLink = document.getElementById("paymentResultsLink");
    resultsLink.href = `results.html?order=${encodeURIComponent(order.id)}`;
    resultsLink.hidden = false;
    return;
  }
  if (order.paymentMethod) {
    const radio = form.querySelector(`[name="paymentMethod"][value="${order.paymentMethod}"]`);
    if (radio) radio.checked = true;
  }
}

function continueToPaymentMethod(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const orderId = new URLSearchParams(window.location.search).get("order");
  const selected = form.querySelector('[name="paymentMethod"]:checked');
  const status = document.getElementById("paymentStatus");
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  if (!selected || !window.FishTreesDemo.getOrder(orderId)) {
    status.textContent = "Select a demo payment method for an active order.";
    return;
  }

  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    window.FishTreesDemo.setPaymentMethod(orderId, selected.value);
    const destinations = {
      "mobile-money": "mobile.html",
      "bank-transfer": "bank-transfer.html",
      card: "bank-card.html",
    };
    window.location.href = `${destinations[selected.value]}?order=${encodeURIComponent(orderId)}`;
  } catch (error) {
    status.textContent = error.message;
  } finally {
    button.disabled = false;
  }
}