document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("signinForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = document.getElementById("signinStatus");
    const button = event.currentTarget.querySelector('button[type="submit"]');
    button.disabled = true;
    status.textContent = "Signing in...";
    try {
      const result = await fishTreesApi("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          identifier: document.getElementById("identifier").value.trim(),
          password: document.getElementById("password").value,
          remember: document.getElementById("remember").checked,
        }),
      });
      const requestedPage = new URLSearchParams(window.location.search).get("next");
      const allowedPages = ["recommendations.html", "schools.html"];
      window.location.href = result.account.status === "pending"
        ? "dashboard.html"
        : allowedPages.includes(requestedPage) ? requestedPage : result.redirect;
    } catch (error) {
      status.textContent = error.message;
    } finally {
      button.disabled = false;
    }
  });
});