# FishTrees Pathways

FishTrees Pathways is a presentation-ready, front-end-only demonstration for exploring A-Level subject combinations. It uses HTML, CSS, and browser-side JavaScript; there is no application backend, database, account service, or live payment integration.

## Run the site

Open `fishTreesFrontEnd/index.html` with a static-site preview such as the VS Code Live Server extension. A static local server keeps browser storage consistent as you move between pages. No Python packages, database setup, API keys, or secrets are needed.

Bootstrap, Bootstrap Icons, and the optional Excel spreadsheet library load from CDNs and need an internet connection. If the spreadsheet library is unavailable, the school page still accepts CSV files.

## Demonstration flow

1. Open **Get started**, enter a learner profile, or use **Load sample data**.
2. Select one or more schools and submit the form.
3. Choose a payment method and continue through the clearly labelled simulated checkout.
4. The demo creates illustrative pathway ideas in the browser and opens the results page. Use the account icon to view the local demo dashboard.
5. The school page can import a CSV/XLSX class list, create a simulated batch checkout, and show sample reports for each learner.

Demo orders and feedback are stored in the browser's local storage on the device and browser used for the presentation. They are not sent to FishTrees or shared across devices. Do not enter real student records.

## Important limitations

- Every payment option is simulated. No funds are charged, transferred, received, or verified. Do not enter card details, PINs, or real transaction references.
- Recommendations are simple illustrative browser-side matches based on selected interests and grades. They are not a validated assessment, admissions decision, or guarantee. Confirm school offerings and entry requirements directly with each school.
- Account creation, sign-in, institution review, administration, and feedback export are not available in this frontend-only build. The related pages explain these limitations.
- The contact form does not send or save messages. Use the displayed email link instead.

## Project map

The site is in [fishTreesFrontEnd/](fishTreesFrontEnd/):

- `index.html`, `about.html`, and `contact.html` provide the main site pages.
- `recommendations.html`, `payment.html`, `mobile.html`, `bank-transfer.html`, and `bank-card.html` provide the individual demo flow.
- `schools.html` supports browser-side CSV/Excel import for a demo batch.
- `results.html` displays generated sample recommendations.
- `dashboard.html` and `admin.html` are explicitly non-live previews.
- `css/` and `style.css` contain site styling.
- `js/demo-store.js` stores demo orders locally and generates illustrative recommendations.
- `js/recommendations.js`, `js/payment.js`, `js/payment-method.js`, `js/results.js`, `js/schools.js`, `js/dashboard.js`, and `js/admin.js` implement browser-side interactions.

## Before presenting

- Start the site in the browser you will use for the presentation and keep using that same browser profile so local demo data persists.
- Use **Load sample data** to prepare a repeatable individual flow.
- Test one simulated payment and confirm it opens the results page.
- If you want a clean run, clear this site's local storage from browser developer tools before the presentation.
- Check the responsive navigation and pages at desktop and mobile widths.
