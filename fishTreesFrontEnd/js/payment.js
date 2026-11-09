document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("paymentForm");
  const email = document.getElementById("paymentEmail");
  const status = document.getElementById("paymentStatus");
  const testingButton = document.getElementById("testingButton");
  const schoolLoginForm = document.getElementById("schoolLoginForm");
  const schoolLoginStatus = document.getElementById("schoolLoginStatus");

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

  testingButton.addEventListener("click", () => {
    if (!localStorage.getItem("fishTreesRecommendation")) {
      status.textContent = "No saved profile found. Return to recommendations and enter your details first.";
      return;
    }

    window.location.href = "results.html?testing=1";
  });

  schoolLoginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    schoolLoginStatus.textContent = "School account sign-in is not available in this demonstration.";
  });
});