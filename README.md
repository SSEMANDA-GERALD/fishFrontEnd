# FishTrees Pathways

FishTrees Pathways is a front-end-only presentation site for exploring A-Level subject combinations. It uses HTML, CSS, and browser-side JavaScript; there is no application backend, database, or live payment integration.

## Run the site

Open `fishTreesFrontEnd/index.html` with a static-site preview such as the VS Code Live Server extension. A static local server keeps browser storage consistent as you move between pages. No Python packages, database setup, API keys, or secrets are needed.

Bootstrap, Bootstrap Icons, and the optional Excel spreadsheet library load from CDNs and need an internet connection. If the spreadsheet library is unavailable, the school page still accepts CSV files.

## Sign in and make predictions

Use either of the built-in presentation accounts on the sign-in page:

- Administrator: username `admin`, password `admin123`
- School: username `school`, password `school123`

The credentials are public frontend examples, not secure accounts. Sign-in is stored in this browser only.

After signing in:

1. A school account opens its workspace, where it can choose **Single prediction** or **Bulk predictions**.
2. The administrator opens a dashboard with prediction totals, recent requests, and links to create single or bulk predictions.
3. Enter a learner profile or use **Load sample data**. Bulk predictions accept a CSV/XLSX class list.
4. On the payment page, press **Continue** to complete the payment simulation and view the generated report.

The payment is simulated; no money is charged, transferred, received, or verified. No card details, PINs, or transaction references are requested. Orders, sign-in state, and feedback stay in this browser and are not shared across devices. Do not enter real student records.

## Important limitations

- Presentation sign-in is a client-side role switch and does not provide real authentication or security.
- Recommendations are simple illustrative browser-side matches based on selected interests and grades. They are not a validated assessment, admissions decision, or guarantee. Confirm school offerings and entry requirements directly with each school.
- Account registration, institution review, and feedback export are not connected to a service.
- The contact form does not send or save messages. Use the displayed email link instead.

## Project map

The site is in [fishTreesFrontEnd/](fishTreesFrontEnd/):

- `index.html`, `about.html`, and `contact.html` provide the main site pages.
- `signin.html` offers administrator and school presentation sign-in.
- `recommendations.html` and `payment.html` provide the single prediction flow.
- `schools.html` supports browser-side CSV/Excel import for bulk predictions.
- `results.html` displays generated sample recommendations.
- `dashboard.html` is the school workspace; `admin.html` is the administrator dashboard.
- `css/` and `style.css` contain site styling.
- `js/demo-store.js` stores local sign-in and prediction data, and generates illustrative recommendations.
- `js/recommendations.js`, `js/payment.js`, `js/results.js`, `js/schools.js`, `js/dashboard.js`, and `js/admin.js` implement browser-side interactions.

## Before presenting

- Start the site in the browser you will use for the presentation and keep using that same browser profile so local demo data persists.
- Use **Load sample data** to prepare a repeatable individual flow.
- Test one simulated payment and confirm it opens the results page.
- If you want a clean run, clear this site's local storage from browser developer tools before the presentation.
- Check the responsive navigation and pages at desktop and mobile widths.
