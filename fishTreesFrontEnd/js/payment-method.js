document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("demoPaymentForm").addEventListener("submit", simulateDemoPayment);
  loadPaymentMethodOrder();
});

function loadPaymentMethodOrder() {
  const orderId = new URLSearchParams(window.location.search).get("order");
  const form = document.getElementById("demoPaymentForm");
  const status = document.getElementById("demoPaymentStatus");
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
    status.textContent = "No demo order was found. Return to the recommendation form to start again.";
    return;
  }
  document.getElementById("methodReturn").href = `payment.html?order=${encodeURIComponent(orderId)}`;
  document.getElementById("methodAmount").textContent = Number(order.amount).toLocaleString();
  document.getElementById("methodOrderSummary").textContent = `Presentation demo · ${order.predictionCount} student${order.predictionCount === 1 ? "" : "s"}`;
  if (order.status === "demo-paid") {
    form.hidden = true;
    window.location.replace(`results.html?order=${encodeURIComponent(order.id)}`);
  }
}

function simulateDemoPayment(event) {
  event.preventDefault();
  const orderId = new URLSearchParams(window.location.search).get("order");
  const method = document.body.dataset.paymentMethod;
  const status = document.getElementById("demoPaymentStatus");
  const button = event.currentTarget.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const network = document.querySelector('[name="network"]:checked');
    window.FishTreesDemo.setPaymentMethod(orderId, network ? `${method}:${network.value}` : method);
    const order = window.FishTreesDemo.completePayment(orderId);
    status.textContent = "Demo complete. No money was charged or transferred.";
    window.location.href = `results.html?order=${encodeURIComponent(order.id)}`;
  } catch (error) {
    status.textContent = error.message;
    button.disabled = false;
  }
}