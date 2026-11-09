const siteHeader = document.querySelector("header[data-page]");
const pages = [
  ["Home", "index.html", "home"],
  ["About", "about.html", "about"],
  ["Recommendations", "recommendations.html", "recommendations"],
  ["Payment", "payment.html", "payment"],
  ["Contact", "contact.html", "contact"]
];

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
          </ul>
        </div>
      </div>
    </nav>
  `;
}