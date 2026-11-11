# FishTrees Pathways

This student project helps learners explore A-Level study options. The site uses HTML, CSS, and vanilla JavaScript; a small Flask service provides explainable recommendations. It has no database, login system, or live payment processing.

The detailed team responsibilities are in [TEAM_ROLES.md](TEAM_ROLES.md).

## Project Map

The website pages are in [fishTreesFrontEnd/](fishTreesFrontEnd/):

| File | Purpose |
| --- | --- |
| `index.html` | Home page |
| `recommendations.html` | Learner details and grades form |
| `schools.html` | School bulk import and batch reports |
| `payment.html` | Payment options page; currently front-end only |
| `results.html` | Ranked individual pathway reports |
| `css/schools.css` | School import and report styling |
| `about.html` | Project introduction |
| `contact.html` | Contact information |
| `style.css` | Shared site styling, including the navbar and brand styles |
| `css/recommendations.css` | Recommendations-page layout and form styling |
| `css/payment-bootstrap.css` | Extra payment-page styling |
| `css/results.css` | Results-page layout and styling |
| `js/navbar.js` | Builds the shared navbar on each page |
| `js/recommendations.js` | Populates and controls the recommendations form |
| `js/payment.js` | Validates the individual payment email field |
| `js/results.js` | Renders saved profile data and ranked pathway reports |
| `js/schools.js` | Reads CSV/Excel files and exports school reports |
| `app.py` | Local Flask API and nearest-neighbor recommendation model |
| `datasets/training_profiles.csv` | Synthetic labeled profiles used by the model |

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

Each page loads `navbar.js` and the Bootstrap bundle. The recommendations and batch import pages also load SheetJS from jsDelivr to read or create spreadsheets. The recommendation pages require the Flask service below; opening the HTML files directly will not provide API access.

## Run Locally

From the repository root, install the dependency and start the service:

```powershell
python -m pip install -r requirements.txt
python app.py
```

Open `http://127.0.0.1:5000/`. There is no frontend build step. Bootstrap and SheetJS load from CDNs and require an internet connection. The API is bound to localhost and has no authentication; do not expose it publicly or upload real student records without adding appropriate access controls, consent, and data protection. Bulk data is processed in memory and is not stored by the service. Individual profiles are kept in browser local storage.

Payment remains a front-end demonstration. The Contact form depends on FormSubmit; verify its configured recipient and activation before relying on live submissions.

## Shared Navbar

Each page has one small placeholder instead of repeating all of the navbar markup. The `data-page` value identifies which link is active:

```html
<header data-page="recommendations"></header>
```

The valid values are `home`, `about`, `recommendations`, `schools`, `payment`, and `contact`. `js/navbar.js` reads this value, creates the logo, links, and “Get started” link, then adds `active` and `aria-current="page"` to the matching link. The “Get started” link always points to `recommendations.html`.

To change the navbar:

- Change labels, destinations, or order in the `pages` array in `js/navbar.js`.
- Keep each array item's third value in sync with that page's `data-page` value.
- Keep the Bootstrap classes and `mainNavbar` ID/target paired. The ID on the collapsible menu must match the toggler's `data-bs-target` and `aria-controls`.
- Change its colors, logo sizing, sticky position, and other visual details in `style.css` under the navbar and button rules.
- When adding a new page, add its link to the `pages` array, put the matching `data-page` on its header, and include `js/navbar.js` and the Bootstrap bundle before `</body>`.

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
- Students can select up to three schools. “Get recommendations” calls the local API and opens a separate report for each selected school.
- The report ranks pathway combinations and shows their subjects, possible career directions, rationale, and lower-priority cautions. “Export as PDF” opens the browser print dialog; choose Save as PDF.
- The payment email field uses browser email validation. Payment processing is not connected.
- The school workspace accepts CSV, XLSX, and XLS files, generates batch reports, and exports an Excel workbook or a printable PDF report.

The local Python service uses a transparent nearest-neighbor model loaded from 21 synthetic labeled profiles, combined with pathway interest overlap and relevant subject grades. It is a demonstration model, not independently validated guidance. Scores are estimates, not admissions probabilities. The current project has no verified school subject-offering catalog; confirm offerings and entry requirements with each school. The Contact form uses the external FormSubmit service.

### School Import Format

Use the Download CSV template button or provide a workbook whose first sheet contains one student per row. `student_name` and at least one final grade are required. Use `final_mathematics`, `final_english`, and equivalent `final_<subject>` columns for grades; mock grades use `mock_<subject>`. `interests` accepts multiple values separated by commas, semicolons, or vertical bars. Grades use A, B, C, D, E, F, or U. The report combines final and mock grades when both are supplied.

The bulk page reads the file in the browser and sends the student name, grades, and interests to the local API. The service does not retain those records. The API has no authentication and is intended for local demonstration only.

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

The saved profile is shared between pages through the `fishTreesRecommendation` browser storage key. Clear that key in browser storage to reset the demonstration data.

## Styling And Bootstrap

### Shared Styling: `style.css`

`style.css` is linked by all seven pages. It contains the shared brand colors and styles for the navbar, logo, navigation links, common FishTrees buttons, footer, and home-page sections. Change shared navbar or brand styling here so the update remains consistent across pages.

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
- `schools.html` uses `css/schools.css` and `js/schools.js` for batch import, reports, and exports.
- `results.html` uses the shared navbar and `css/results.css` for ranked pathways and the submitted grade summary.

The page files are regular HTML and can be opened directly. Since Bootstrap is loaded from a CDN, its styles and navbar behavior need an internet connection.

## Quick Test Checklist

After changing the navbar, form, or styles:

1. Start the Flask service, then open the seven site pages and check that each has the right active nav item.
2. Check the navbar at desktop width and use its toggle at mobile width.
3. On recommendations, select one to three schools, load sample data, request recommendations, and inspect each school's report.
4. On schools, import a template CSV, verify row validation, expand reports, and export Excel and PDF.
5. On results, confirm rankings, outcomes, rationale, cautions, and grades; test Export as PDF.
6. Check the pages at desktop and phone widths for overflow, overlap, and readable labels.
