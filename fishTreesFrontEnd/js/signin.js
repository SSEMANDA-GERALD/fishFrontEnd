document.addEventListener("DOMContentLoaded", () => {
  const status = document.getElementById("signinStatus");
  try {
    const account = window.FishTreesDemo.getAccount();
    if (account) {
      redirectForAccount(account);
      return;
    }
  } catch (error) {
    status.textContent = error.message;
  }

  document.querySelectorAll("form[data-role]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      try {
        const account = window.FishTreesDemo.signIn(
          form.dataset.role,
          String(data.get("username") || ""),
          String(data.get("password") || ""),
        );
        redirectForAccount(account);
      } catch (error) {
        status.textContent = error.message;
      }
    });
  });
});

function redirectForAccount(account) {
  window.location.replace(account.role === "admin" ? "admin.html" : "dashboard.html");
}
