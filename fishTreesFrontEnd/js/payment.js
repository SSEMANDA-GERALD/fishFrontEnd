document.addEventListener("DOMContentLoaded", () => {
  const account = window.FishTreesDemo.getAccount();
  const orderId = new URLSearchParams(window.location.search).get("order");

  // 1. School accounts and administrators never pay
  if (account && (account.role === "school" || account.role === "admin")) {
    if (orderId) {
      try {
        window.FishTreesDemo.completeRequest(orderId);
        window.location.replace(`results.html?order=${encodeURIComponent(orderId)}`);
        return;
      } catch (_) {
        window.location.replace(account.role === "admin" ? "admin.html" : "dashboard.html");
        return;
      }
    } else {
      window.location.replace(account.role === "admin" ? "admin.html" : "dashboard.html");
      return;
    }
  }

  // 2. Setup payment form continue button
  const paymentForm = document.getElementById("paymentForm");
  const paymentStatus = document.getElementById("paymentStatus");

  if (paymentForm) {
    paymentForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const submitBtn = paymentForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      try {
        let currentOrderId = new URLSearchParams(window.location.search).get("order");
        let completedOrder;

        if (currentOrderId) {
          try {
            completedOrder = window.FishTreesDemo.completeRequest(currentOrderId);
          } catch (_) {
            completedOrder = createFallbackPresentationOrder();
          }
        } else {
          completedOrder = createFallbackPresentationOrder();
        }

        if (paymentStatus) {
          paymentStatus.textContent = "Continuing to recommendations...";
        }

        window.location.href = `results.html?order=${encodeURIComponent(completedOrder.id)}`;
      } catch (err) {
        if (paymentStatus) paymentStatus.textContent = err.message || "An error occurred.";
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // 3. Setup school login form on the right card
  const schoolForm = document.getElementById("schoolLoginForm");
  const schoolStatus = document.getElementById("schoolLoginStatus");
  if (schoolForm) {
    schoolForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const usernameInput = document.getElementById("schoolUsername");
      const passwordInput = document.getElementById("schoolPassword");
      const username = (usernameInput ? usernameInput.value : "").trim().toLowerCase();
      const password = passwordInput ? passwordInput.value : "";

      try {
        const loginUser = (username === "school" || username.includes("school") || username.includes("@")) ? "school" : username;
        window.FishTreesDemo.signIn("school", loginUser, password);

        let currentOrderId = new URLSearchParams(window.location.search).get("order");
        if (currentOrderId) {
          try {
            window.FishTreesDemo.completeRequest(currentOrderId);
            window.location.replace(`results.html?order=${encodeURIComponent(currentOrderId)}`);
            return;
          } catch (_) {}
        }
        window.location.replace("dashboard.html");
      } catch (err) {
        if (schoolStatus) {
          schoolStatus.textContent = "Use username 'school' and password 'school123' for the demo.";
        }
      }
    });
  }
});

function createFallbackPresentationOrder() {
  const sampleOrder = window.FishTreesDemo.createIndividualOrder({
    school: "Makerere College School",
    schools: ["Makerere College School"],
    aspiration: "Biomedical engineering",
    interests: ["Medicine and Healthcare", "Technology and Computing", "Engineering and Innovation"],
    oLevelResults: { Mathematics: "A", Physics: "A", Chemistry: "B", Biology: "A", English: "B" },
    mockResults: { Mathematics: "A", Physics: "B", Chemistry: "A", Biology: "A", English: "A" }
  });
  return window.FishTreesDemo.completeRequest(sampleOrder.id);
}
