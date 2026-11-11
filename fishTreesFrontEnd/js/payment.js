document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("paymentForm").addEventListener("submit", continueToPaymentMethod);
  loadPaymentOrder();
});

async function loadPaymentOrder() {
  const orderId = new URLSearchParams(window.location.search).get("order");
  const form = document.getElementById("paymentForm");
  const status = document.getElementById("paymentStatus");
  if (!orderId) {
    form.hidden = true;
    status.textContent = "Create a recommendation request first; its order will appear here.";
    return;
  }

  try {
    const { order } = await fishTreesApi(`/api/payment-orders/${encodeURIComponent(orderId)}`);
    document.getElementById("paymentAmount").textContent = Number(order.amount).toLocaleString();
    document.getElementById("paymentQuantity").textContent = `${order.predictionCount} student${order.predictionCount === 1 ? "" : "s"}`;
    const summary = document.getElementById("paymentOrderSummary");
    summary.textContent = `Order ${order.reference} · ${order.status.toUpperCase()}`;
    summary.hidden = false;
    if (order.status !== "pending") {
      form.hidden = true;
      status.textContent = order.status === "paid"
        ? "Payment is verified. View your report from the account dashboard."
        : "This order is no longer pending. Contact an administrator for help.";
      return;
    }
    if (order.paymentMethod) {
      const radio = form.querySelector(`[name="paymentMethod"][value="${order.paymentMethod}"]`);
      if (radio) radio.checked = true;
    }
    const { account } = await fishTreesApi("/api/auth/me");
    if (account && !document.getElementById("paymentEmail").value) {
      document.getElementById("paymentEmail").value = account.email;
    }
    const query = new URLSearchParams(window.location.search);
    if (query.get("submitted") === "1") {
      status.textContent = "Your payment reference was submitted. Reports unlock after an administrator verifies the payment.";
    }
  } catch (error) {
    form.hidden = true;
    status.textContent = error.message;
    if (error.status === 401) {
      const next = `payment.html?order=${encodeURIComponent(orderId)}`;
      window.location.href = `signin.html?next=${encodeURIComponent(next)}`;
    }
  }
}

async function continueToPaymentMethod(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const orderId = new URLSearchParams(window.location.search).get("order");
  const selected = form.querySelector('[name="paymentMethod"]:checked');
  const status = document.getElementById("paymentStatus");
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  if (!selected || !orderId) {
    status.textContent = "Select a payment method for an active order.";
    return;
  }

  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    await fishTreesApi(`/api/payment-orders/${encodeURIComponent(orderId)}/method`, {
      method: "POST",
      body: JSON.stringify({ paymentMethod: selected.value }),
    });
    const destinations = {
      "mobile-money": "mobile.html",
      "bank-transfer": "bank-transfer.html",
      card: "bank-card.html",
    };
    window.location.href = `${destinations[selected.value]}?order=${encodeURIComponent(orderId)}`;
  } catch (error) {
    status.textContent = error.message;
    if (error.status === 401) window.location.href = "signin.html";
  } finally {
    button.disabled = false;
  }
}