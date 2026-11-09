# FishTrees Pathways

This is a student project for helping learners explore A-Level study options. The current website is a front-end prototype made with HTML, CSS, JavaScript, and Bootstrap. It has no server, database, recommendation engine, login system, or live payment processing.

The detailed team responsibilities are in [TEAM_ROLES.md](TEAM_ROLES.md).

## Project Map

The website pages are in [fishTreesFrontEnd/](fishTreesFrontEnd/):

| File | Purpose |
| --- | --- |
| `index.html` | Home page |
| `recommendations.html` | Learner details and grades form |
| `payment.html` | Payment options page; currently front-end only |
| `about.html` | Project introduction |
| `contact.html` | Contact information |
| `style.css` | Shared site styling, including the navbar and brand styles |
| `css/recommendations.css` | Recommendations-page layout and form styling |
| `css/payment-bootstrap.css` | Extra payment-page styling |
| `js/navbar.js` | Builds the shared navbar on each page |
| `js/recommendations.js` | Populates and controls the recommendations form |

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

The order matters on the recommendations page:

1. `navbar.js` replaces the empty header placeholder with the navbar HTML.
2. Bootstrap's bundle adds behavior to Bootstrap components, including the responsive navbar toggle.
3. `recommendations.js` adds the school, interest, and grade UI and the mock-results toggle.

Only `recommendations.html` needs `recommendations.js`. All five pages load `navbar.js` and the Bootstrap bundle. No build or install step is needed; open a page in a browser or use a local static web server.

## Shared Navbar

Each page has one small placeholder instead of repeating all of the navbar markup. The `data-page` value identifies which link is active:

```html
<header data-page="recommendations"></header>
```

The valid values are `home`, `about`, `recommendations`, `payment`, and `contact`. `js/navbar.js` reads this value, creates the logo, links, and “Get started” link, then adds `active` and `aria-current="page"` to the matching link. The “Get started” link always points to `recommendations.html`.

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

### Current Front-End Behavior

- The `schools` array in `recommendations.js` supplies options to the school `<datalist>`.
- The `interests` array supplies nine visible, disabled interest buttons. They are display-only and cannot be selected.
- The `subjects` and `grades` arrays generate the O-Level and mock grade selectors.
- “Enter mock results” shows or hides the mock grade grid and updates its text and `aria-expanded` value.
- “Load sample data” is an inert button. It has no click handler and does not fill the form.
- “Get recommendations” is a normal link to `payment.html`. It does not generate a recommendation or verify payment.

There is no backend behavior: the page does not save form entries, send them anywhere, calculate recommendations, or process payment.

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

The sample button intentionally has no behavior. The recommendations link intentionally leads to the payment page; do not describe either as a completed service.

## Styling And Bootstrap

### Shared Styling: `style.css`

`style.css` is linked by all five pages. It contains the shared brand colors and styles for the navbar, logo, navigation links, common FishTrees buttons, footer, and home-page sections. Change shared navbar or brand styling here so the update remains consistent across pages.

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

The page files are regular HTML and can be opened directly. Since Bootstrap is loaded from a CDN, its styles and navbar behavior need an internet connection.

## Quick Test Checklist

After changing the navbar, form, or styles:

1. Open all five pages and check that each has the right active nav item.
2. Check the navbar at desktop width and use its toggle at mobile width.
3. On recommendations, confirm school suggestions and grade fields appear, interest buttons remain display-only, and mock results open and close.
4. Confirm “Load sample data” remains inert and “Get recommendations” links to `payment.html` unless the team's requirements have changed.
5. Check the page at desktop and phone widths for overflow, overlap, and readable labels.
