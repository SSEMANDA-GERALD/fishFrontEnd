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

1. Anyone can open **Recommendations** and create a single illustrative prediction without an account. A school account also has a workspace for request history and bulk predictions.
2. The administrator opens a read-only dashboard with request totals and recent activity. Administrators cannot create or continue school requests.
3. Enter a learner profile or use **Load sample data**. Bulk predictions accept a CSV/XLSX class list and require a school account.
4. Submit the profile to open the payment step, then press **Continue without payment** to view the illustrative results.

There is no payment integration or fee configured. No money is charged, transferred, received, or verified. No card details, PINs, or transaction references are requested. Orders, sign-in state, and feedback stay in this browser and are not shared across devices. Anonymous requests are associated with the current browser tab session. Do not enter real student records.

## Important limitations

- Presentation sign-in is a client-side role switch and does not provide real authentication or security. The prototype restricts school request workflows to the school role and the activity dashboard to the administrator role; these browser-side checks are not a substitute for server-side authorization.
- Recommendations are simple illustrative browser-side matches based on selected interests and grades. They are not a validated assessment, admissions decision, or guarantee. Confirm school offerings and entry requirements directly with each school.
- Account registration, institution review, and feedback export are not connected to a service.
- The contact form does not send or save messages. Use the displayed email link instead.

## Project map

The site is in [fishTreesFrontEnd/](fishTreesFrontEnd/):

- `index.html`, `about.html`, and `contact.html` provide the main site pages.
- `signin.html` offers administrator and school presentation sign-in.
- `recommendations.html` and `payment.html` provide the public single-prediction flow; visitors do not need an account.
- `schools.html` supports browser-side CSV/Excel import for bulk predictions.
- `results.html` displays generated sample recommendations.
- `dashboard.html` is the school workspace; `admin.html` is the administrator dashboard.
- `css/` and `style.css` contain site styling.
- `js/demo-store.js` stores local sign-in and prediction data, scopes school requests to their creating account, and generates illustrative recommendations. Version 2 uses a fresh browser-storage key so earlier presentation orders are not shown.
- `js/recommendations.js`, `js/payment.js`, `js/results.js`, `js/schools.js`, `js/dashboard.js`, and `js/admin.js` implement browser-side interactions.

## Before presenting

- Start the site in the browser you will use for the presentation and keep using that same browser profile so local demo data persists.
- Use **Load sample data** to prepare a repeatable individual flow.
- Test one no-charge request and confirm it opens the results page.
- If you want a clean run, clear this site's local storage from browser developer tools before the presentation.
- Check the responsive navigation and pages at desktop and mobile widths.
