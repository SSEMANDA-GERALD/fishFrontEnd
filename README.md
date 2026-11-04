# FishTrees Pathways

FishTrees Pathways is a student project for helping learners explore suitable A-Level subject combinations. A learner will provide exam grades and other relevant details, then receive guidance about combinations to consider.

## Semester scope

This semester, our work is limited to the **front end**. We are building the pages and browser-side interactions that a user can see and use. We are not building a server, database, recommendation engine, account system, or live payment processing as part of this semester's scope.

Use only:

- HTML for page structure
- CSS for styling and responsive layouts
- JavaScript for browser-side interactions
- Bootstrap for front-end layout and components

Do not add other frameworks, languages, or backend services unless the team agrees to a change in scope.

## Project files

The current multi-page site is in [`fishTreesFrontEnd/`](fishTreesFrontEnd/):

- `index.html` - home page
- `recommendations.html` - recommendation page
- `payment.html` - payment options page
- `about.html` - about page
- `contact.html` - contact page
- `style.css` - shared styles for the pages

There are also `home_page.html` and `home_page_style.css` in the workspace root. Before developing another version of the home page, agree as a team which version is the one to continue and present. Avoid maintaining two competing versions by accident.

## Pages and team roles

Each team member owns a main contribution:

- Stefan - Home page
- Gerald - Recommendations page and team coordination
- Anabel - Payment page
- Grace - Contact page
- Shalom - About page

The detailed page responsibilities, suggested content, beginner workflow, and teamwork expectations are in [`TEAM_ROLES.md`](TEAM_ROLES.md).

## Shared expectations

- Make pages feel like one product: use consistent navigation, typography, spacing, colors, buttons, and footer where appropriate.
- Make the pages usable on phones and desktop screens. Use clear labels, readable contrast, and keyboard-friendly controls.
- Keep the experience straightforward. Prioritize the main task on each page over extra features.
- Use sample or clearly identified demonstration data for front-end behavior. Do not present a mock recommendation or payment as a real result or completed transaction.
- Coordinate changes to shared files such as `style.css` and navigation so one page does not break another.
- Each member should understand and be able to explain their own contribution.

## Working together

Work in small, understandable steps. Before starting, check the current files and agree on the page boundaries. Share progress regularly, use GitHub branches and pull requests if that is the workflow your team has agreed on, and make commits that clearly describe your own work. Review changes and check links and layouts across the pages before presenting.

The project is intentionally front-end-only for this semester. Any recommendation rules, user records, school subscriptions, or payment verification would require a backend and must not be claimed as implemented by these pages.
