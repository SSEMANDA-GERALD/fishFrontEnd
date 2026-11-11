# FishTrees Pathways

FishTrees Pathways helps learners explore A-Level subject combinations. The frontend is HTML, CSS, and vanilla JavaScript; the backend is Flask with MySQL persistence, session accounts, approval workflows, payment orders, reports, analytics, and opt-in recommendation feedback.

The detailed team responsibilities are in [TEAM_ROLES.md](TEAM_ROLES.md).

## Project Map

The website pages are in [fishTreesFrontEnd/](fishTreesFrontEnd/):

| File | Purpose |
| --- | --- |
| `index.html` | Home page |
| `recommendations.html` | Learner details and grades form |
| `schools.html` | School bulk import and batch reports |
| `payment.html` | Payment order and reference verification |
| `results.html` | Ranked individual pathway reports |
| `signin.html` | Student and institution sign-in |
| `signup.html` | Student signup and institution access requests |
| `dashboard.html` | Account orders and reports |
| `admin.html` | Institution review, payment verification, and analytics |
| `css/schools.css` | School import and report styling |
| `css/accounts.css` | Account, checkout, dashboard, and admin styling |
| `about.html` | Project introduction |
| `contact.html` | Contact information |
| `style.css` | Shared site styling, including the navbar and brand styles |
| `css/recommendations.css` | Recommendations-page layout and form styling |
| `css/payment-bootstrap.css` | Extra payment-page styling |
| `css/results.css` | Results-page layout and styling |
| `js/navbar.js` | Builds the shared navbar on each page |
| `js/recommendations.js` | Populates and controls the recommendations form |
| `js/payment.js` | Loads order status and submits payment references |
| `js/results.js` | Loads paid reports and records satisfaction feedback |
| `js/schools.js` | Reads CSV/Excel files and creates bulk payment orders |
| `js/auth.js` | Same-origin API helper with CSRF tokens |
| `js/signin.js` | Authenticates users and routes them to their workspace |
| `js/signup.js` | Handles student and institution account requests |
| `js/dashboard.js` | Shows account orders and paid reports |
| `js/admin.js` | Handles account review, payment verification, and analytics |
| `models.py` | Account, payment, prediction, and feedback tables |
| `app.py` | Flask API, access controls, analytics, and recommendation model |
| `datasets/training_profiles.csv` | Synthetic labeled profiles used by the model |
| `setup_database.py` | Creates tables and interactively seeds initial accounts |
| `database/create_database.sql` | Creates the MySQL database |
| `tests/test_platform.py` | Tests account, payment, consent, and analytics workflows |

## How The Pages Load

Each page links to Bootstrap 5.3.0 CSS from jsDelivr in its `<head>`. It then loads the project's CSS. For example, `recommendations.html` loads the styles in this order:

```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="style.css">
<link rel="stylesheet" href="css/recommendations.css">
```

Bootstrap provides common layout and component styles. The project's CSS follows it to add the FishTrees look and page-specific layout. The CDN requires an internet connection.

The JavaScript files are placed near the end of the page, after the page content:

```html
<script src="js/navbar.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
<script src="js/recommendations.js"></script>
```

The order matters on pages that use the shared navigation:

1. `navbar.js` replaces the empty header placeholder with the navbar HTML.
2. Bootstrap's bundle adds behavior to Bootstrap components, including the responsive navbar toggle.
3. The page script adds its form, report, or import behavior.

Each page loads `navbar.js` and the Bootstrap bundle. The recommendations, school import, and report pages also load SheetJS from jsDelivr. All account, payment, and recommendation pages require the Flask service; opening HTML files directly does not provide API access.

## MySQL Setup

Install MySQL 8+, create the database, and create a restricted application user. For example, in the MySQL client:

```sql
CREATE DATABASE fishtrees CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'fishtrees_app'@'127.0.0.1' IDENTIFIED BY 'use-a-unique-database-password';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES ON fishtrees.* TO 'fishtrees_app'@'127.0.0.1';
```

From the repository root, install dependencies and configure environment variables in PowerShell. Use unique secrets and do not commit them:

```powershell
python -m pip install -r requirements.txt
$env:FISHTREES_DB_HOST = "127.0.0.1"
$env:FISHTREES_DB_NAME = "fishtrees"
$env:FISHTREES_DB_USER = "fishtrees_app"
$env:FISHTREES_DB_PASSWORD = "your-local-database-password"
$env:FISHTREES_SECRET_KEY = "a-long-random-session-secret"
python setup_database.py
python app.py
```

`setup_database.py` creates the tables and prompts without echoing for a strong password for the super-admin and sample school accounts. The super-admin email is `ssemandagerald7@gmail.com`; the approved sample school username is `1031highs`. Use a new unique passphrase of at least 12 characters for each account; setup intentionally does not store passwords supplied in chat or source files. If an account already exists, setup leaves its password unchanged. Open `http://127.0.0.1:5000/` after setup. The included SQLAlchemy schema supports MySQL; SQLite was used only for isolated development tests.

The current checkout has no MySQL server/client installed, so MySQL provisioning and live database connectivity still need to be done on a machine with MySQL. Keep this app bound to localhost until deployed behind HTTPS with managed secrets and operational security controls.

## Accounts And Payments

Students can create approved student accounts. School and other institution applications start as `pending`; an admin must approve them before report tools unlock. Public signup cannot create administrator roles. The account icon links to sign-in or the current user's workspace.

Individual reports cost UGX 500 per student, and the same per-student amount is used for bulk orders. The user submits an external transaction reference; an admin must verify the payment before the backend generates and stores predictions. The current build does not integrate MTN MoMo, Airtel Money, card processing, or a bank API. A submitted reference is not proof of settlement by itself. Configure and verify a payment-provider webhook before automating this step.

The admin dashboard reports prediction totals, verified collections, accounts, pending institution applications, pending payments, and feedback. Admins can approve/reject institution applications and verify/reject orders. Admin recommendation tools still create payment orders; admin status does not bypass the payment gate.

## Feedback And Training

Paid reports ask for an optional 1-5 satisfaction rating, usefulness signal, and improvement comment. A separate checkbox is required before feedback enters the admin training CSV. The export excludes student names, account IDs, school names, and aspirations, but free-text comments may still identify a learner; review and redact it before training. Feedback is collected for future model evaluation and is not automatically used to retrain the live model. The current recommender remains an unvalidated demonstration based on synthetic labeled profiles plus grades/interests; fit scores are not admissions probabilities.

MySQL stores institution names, account email, student names from bulk imports, grades, interests, and generated outputs so accounts can retrieve paid reports. Establish a retention/deletion policy, guardian/student consent process, access auditing, backups, and encryption requirements before using real student records. The Contact form still depends on FormSubmit; verify its configured recipient and activation before relying on live submissions.

## Shared Navbar

Each page has one small placeholder instead of repeating all of the navbar markup. The `data-page` value identifies which link is active:

```html
<header data-page="recommendations"></header>
```

The valid values are `home`, `about`, `recommendations`, `schools`, `payment`, `contact`, and `account`. `js/navbar.js` reads this value, creates the logo, navigation, and account icon, then adds `active` and `aria-current="page"` to the matching link. The “Get started” link points to `recommendations.html`.

To change the navbar:

- Change labels, destinations, or order in the `pages` array in `js/navbar.js`.
- Keep each array item's third value in sync with that page's `data-page` value.
- Keep the Bootstrap classes and `mainNavbar` ID/target paired. The ID on the collapsible menu must match the toggler's `data-bs-target` and `aria-controls`.
- Change its colors, logo sizing, sticky position, and other visual details in `style.css` under the navbar and button rules.
- When adding a new navigation page, add its link to `pages`, use the matching `data-page`, and include `js/navbar.js` and the Bootstrap bundle before `</body>`.

The image and page links are relative to the `fishTreesFrontEnd/` directory. If a page is moved into another folder, update its relative paths.

## Recommendations Page

The page is split across three files:

- [recommendations.html](fishTreesFrontEnd/recommendations.html) contains the form structure and element IDs.
- [recommendations.js](fishTreesFrontEnd/js/recommendations.js) fills in repeated options and handles the mock-results toggle.
- [recommendations.css](fishTreesFrontEnd/css/recommendations.css) controls the form layout, colors, panels, fields, buttons, and smaller-screen layout.

### Current Behavior

- The `schools` array in `recommendations.js` supplies searchable school suggestions to the `<datalist>`.
- The `interests` array supplies nine selectable buttons. Multiple interests can stay selected at once.
- The `subjects` and `grades` arrays generate the O-Level and mock grade selectors.
- “Enter mock results” shows or hides the mock grade grid and updates its text and `aria-expanded` value.
- “Load sample data” fills the profile and both grade sets, and opens the mock results.
- Students can select up to three schools. Submitting creates a pending payment order; no recommendation is generated until an admin verifies payment.
- A paid report ranks pathways and shows subjects, possible career directions, rationale, caution notes, and optional feedback. PDF export uses the browser print dialog; Excel export uses SheetJS.
- The school workspace requires an approved school/institution account and accepts CSV, XLSX, and XLS. It creates a bulk payment order; each student's report is generated after payment verification.

The Python service uses a transparent nearest-neighbor model loaded from 21 synthetic profiles, combined with pathway-interest overlap and subject grades. It is not independently validated. The project has no verified school subject-offering catalog; confirm offerings and entry requirements with each school.

### School Import Format

Use the Download CSV template button or provide a workbook whose first sheet contains one student per row. `student_name` and at least one final grade are required. Use `final_mathematics`, `final_english`, and equivalent `final_<subject>` columns for grades; mock grades use `mock_<subject>`. `interests` accepts multiple values separated by commas, semicolons, or vertical bars. Grades use A, B, C, D, E, F, or U. The report combines final and mock grades when both are supplied.

The bulk page reads the file in the browser and creates an order containing student name, grades, and interests. Those inputs and paid reports are stored in MySQL and available to the owning institution account.

### Changing Form Content Or Behavior

To add or remove a subject, edit the `subjects` array in `recommendations.js`. To change grade choices, edit `grades`. To change school suggestions or visible interest clusters, edit `schools` or `interests`.

`createGradeRows()` creates one labelled `<select>` per subject. It generates an element ID from the group name and subject name, and uses that ID in the label's `for` attribute. Keep those paired if you change the generated markup.

The HTML IDs connect the HTML and JavaScript. If you rename one, update the matching `getElementById()` call in `recommendations.js` as well:

| HTML ID | Used for |
| --- | --- |
| `schoolOptions` | School suggestions populated from `schools` |
| `interestGrid` | Interest buttons populated from `interests` |
| `oLevelResultsContainer` | O-Level grade fields |
| `mockResultsContainer` | Mock grade fields and show/hide target |
| `mockResultsToggle` | Button that shows and hides mock results |

Authenticated order and prediction data is stored in MySQL. Payment references remain pending until an administrator verifies them.

## Styling And Bootstrap

### Shared Styling: `style.css`

`style.css` is linked by all eleven pages. It contains shared brand colors and styles for the navbar, logo, navigation links, common FishTrees buttons, footer, and home-page sections.

### Recommendations Styling: `css/recommendations.css`

This file is loaded only by `recommendations.html`. Its `:root` block defines local colors and a panel shadow. The remaining rules style the page shell, hero area, form panels, two-column inputs, interest grid, grade grid, subject rows, mock-results button, and action buttons.

Responsive rules are at the bottom of the file:

- At `820px` and below, the two-column inputs, grade fields, and interest grid become one column.
- At `560px` and below, subject rows and the mock-results header stack vertically.

If you change a class in the HTML or generated JavaScript, check whether its matching CSS selector needs to change too.

### Where Bootstrap Is Used

Bootstrap is a CSS and JavaScript toolkit, not a backend. On these pages it is used for:

- The shared responsive navbar: `navbar`, `navbar-expand-lg`, `navbar-toggler`, `collapse`, `navbar-collapse`, `navbar-nav`, and related classes.
- Common widths, rows, columns, and spacing, such as `container`, `row`, `col-*`, `py-5`, `g-4`, and `mb-*`.
- The school field's `form-control` styling and a few standard button, card, and text utility classes.
- The navbar's mobile expand/collapse behavior, provided by `bootstrap.bundle.min.js`.

Most of the recommendations form's layout and visual design is custom CSS, not Bootstrap. Bootstrap classes and custom CSS can be used together: Bootstrap handles common responsive structure while the local styles control the FishTrees appearance.

## Other Pages

- `index.html` uses the shared navbar and `style.css`; the home page sections are styled in `style.css`.
- `about.html` and `contact.html` use the shared navbar and Bootstrap layout/spacing utilities, with shared styles from `style.css`.
- `payment.html` uses the shared navbar, Bootstrap layout and card/form styles, `style.css`, and the additional `css/payment-bootstrap.css` rules.
- `signin.html` and `signup.html` use `css/accounts.css` with `js/auth.js` and their account scripts.
- `dashboard.html` and `admin.html` use `css/accounts.css` for orders, analytics, account approval, and payment verification.
- `schools.html` uses `css/schools.css` and `js/schools.js` for institution-gated batch import.
- `results.html` uses `css/results.css` for paid reports, feedback, and export actions.

Bootstrap, Bootstrap Icons, and SheetJS load from CDNs and need an internet connection.

## Quick Test Checklist

After changing the navbar, form, or styles:

1. Configure MySQL, run `setup_database.py`, start Flask, then open the eleven site pages.
2. Check the navbar at desktop width and use its toggle at mobile width.
3. Sign up as an institution and confirm it cannot use reports until approved.
4. Create an individual or bulk order, confirm it remains pending, submit a reference, then verify it as an admin.
5. Confirm that only the verified order creates a report and updates prediction/revenue analytics.
6. Submit feedback with and without training consent; verify only opted-in feedback appears in the admin export.
7. Check Excel/PDF export and desktop/mobile layout.
