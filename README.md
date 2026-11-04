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

## Recommendation page structure for beginners

The recommendation page is located in [`fishTreesFrontEnd/recommendations.html`](fishTreesFrontEnd/recommendations.html).

### 1. HTML file: page structure
The HTML file is the skeleton of the page. It contains:

- the top navigation bar
- the main title and welcome message
- school input
- future career input
- interest selection buttons
- O-Level subject grade selectors
- optional mock results section
- the sample-data button
- a status message telling the presenter that the recommendation engine is not active yet

This file is like the building plan. It tells the browser where everything should be placed on the page.

### 2. CSS file: page styling
The styling file is in [`fishTreesFrontEnd/css/recommendations.css`](fishTreesFrontEnd/css/recommendations.css).

Its purpose is to make the page look clean and professional. It controls:

- colors used by FishTrees Pathways
- spacing between sections
- the layout of the form
- card styles for the interest choices
- button styles
- responsive design for mobile and tablet screens
- a simple, smart visual identity without unnecessary decoration

In beginner terms: CSS is what makes the page look good. It decides where things sit, how big they are, what colors they use, and how the page behaves on smaller screens.

### 3. JavaScript file: interactions
The JavaScript file is in [`fishTreesFrontEnd/js/recommendations.js`](fishTreesFrontEnd/js/recommendations.js).

This file is responsible for the dynamic part of the page. It does things such as:

- populate the school list
- create the interest buttons
- create the subject and grade selectors
- allow the user to click interests and select them
- fill the form with sample data when the user clicks the sample button
- keep the page and data organised in a simple JavaScript object

Why JavaScript matters:
JavaScript helps the page react to user actions. A static HTML page cannot do this by itself. JavaScript lets the page feel alive, even though this semester is only focused on front-end design.

### 4. Why the code is simple
This page is intentionally simple because:

- the project is front-end only
- the recommendation engine is not connected yet
- the goal is to present the design clearly
- beginner students should be able to understand the code

The code is written in a straightforward way so it is easy to explain during a presentation. The names of the variables and functions are written in plain English, which makes it easier to follow.

### 5. Why the recommendation engine is inactive
The project is only required to present the front-end. That means we do not connect to a real backend or AI system. Instead, we keep the interface ready and clean so a future team can plug in the real recommendation feature later.

This is why the page shows a simple message saying that the recommendation engine is currently inactive.

### 6. Why letter grades are used instead of marks
The form uses only a letter grade input for each subject, such as A, B, C, D, E, F, or U. This keeps the page cleaner and easier for a beginner to understand.

It also matches the presentation requirement: the student does not have to enter both marks and grade in the same section.

### 7. Sample data button
The sample button helps when the team is testing the page. It loads a realistic example student profile so the form looks complete and easy to demonstrate during a presentation.

This is useful because it makes the page look finished even before the live recommendation system is connected.

### 8. Beginner summary
Think of the page like this:

- HTML = structure
- CSS = design
- JavaScript = interactions

That is the basic idea behind the project. The design is simple because the goal is to present a polished, understandable front-end without overcomplicating the code.

If you want to keep improving this project later, the easiest next step is to add a second page that looks like the same FishTrees brand and continue building the same clean design style.
