document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("paymentForm");
  const email = document.getElementById("paymentEmail");
  const status = document.getElementById("paymentStatus");

  email.addEventListener("input", () => {
    status.textContent = "";
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    status.textContent = "Email looks valid. Payment processing is not connected in this demonstration.";
  });
});