const siteHeader = document.querySelector("header[data-page]");
const pages = [
  ["Home", "index.html", "home"],
  ["About", "about.html", "about"],
  ["Recommendations", "recommendations.html", "recommendations"],
  ["For schools", "schools.html", "schools"],
  ["Payment", "payment.html", "payment"],
  ["Contact", "contact.html", "contact"]
];

if (!document.querySelector('link[data-account-icons]')) {
  const iconStyles = document.createElement("link");
  iconStyles.rel = "stylesheet";
  iconStyles.href = "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css";
  iconStyles.dataset.accountIcons = "true";
  document.head.append(iconStyles);
}

if (siteHeader) {
  const links = pages.map(([label, href, page]) => {
    const active = siteHeader.dataset.page === page;
    return `
      <li class="nav-item">
        <a class="nav-link${active ? " active" : ""}" href="${href}"${active ? ' aria-current="page"' : ""}>${label}</a>
      </li>
    `;
  }).join("");

  siteHeader.innerHTML = `
    <nav class="navbar navbar-expand-lg home-navbar">
      <div class="container">
        <a class="navbar-brand" href="index.html" aria-label="FishTrees Pathways home">
          <img class="site-logo" src="images/FishTrees Pathways Logo.png" alt="FishTrees Pathways">
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar" aria-controls="mainNavbar" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="mainNavbar">
          <ul class="navbar-nav ms-auto align-items-lg-center">
            ${links}
            <li class="nav-item ms-lg-3 mt-2 mt-lg-0">
              <a class="btn btn-fishtrees nav-cta" href="recommendations.html">Get started</a>
            </li>
            <li class="nav-item ms-lg-3 mt-2 mt-lg-0">
              <a id="accountLink" class="nav-link account-icon-link" href="signin.html" aria-label="Sign in or open your account" title="Account">
                <i class="bi bi-person-circle" aria-hidden="true"></i>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `;

  fetch("/api/auth/me").then(async (response) => {
    if (!response.ok) return;
    const { account } = await response.json();
    if (!account) return;
    const accountLink = document.getElementById("accountLink");
    accountLink.href = ["admin", "superadmin"].includes(account.role) ? "admin.html" : "dashboard.html";
    accountLink.title = account.displayName;
    accountLink.setAttribute("aria-label", `Account: ${account.displayName}`);
  }).catch(() => {});
}