# FishTrees Pathways: Team Roles and Working Guide

**From Gerald, Team Leader**

Hi team,

This guide explains what each of us is responsible for and how our pages fit together. Our project helps learners explore A-Level subject combinations. For this semester, we are building only the front end: the pages and browser-side interactions. We are not building a real recommendation engine, database, or payment service.

We are all beginners, so keep the work manageable: understand the task, build one part at a time, ask questions early, and make sure you can explain what you have made. Please write your own code and page content. Do not use AI to generate your assigned work or submit work that you cannot explain. Use our class materials, official documentation, and one another when you need help.

## Shared page structure

Each page should feel like part of FishTrees Pathways. Agree on a shared layout before polishing individual pages:

- A consistent header with the FishTrees Pathways name and links to Home, Recommendations, Payment, About, and Contact.
- A clear main area with one page title and content focused on that page's purpose.
- A consistent footer with suitable project or contact information.
- A layout that remains readable on mobile and desktop screens.
- Clear labels, readable contrast, and controls that can be used with a keyboard.

The current multi-page site is in `fishTreesFrontEnd/`. The page files are `index.html`, `recommendations.html`, `payment.html`, `about.html`, and `contact.html`, with shared styles in `style.css`. The workspace also has a separate `home_page.html` at its root. Stefan and the team should agree which home page version is the one to continue before making parallel changes.

Use only HTML, CSS, JavaScript, and Bootstrap. Keep the work front-end-only; do not add another framework, a backend, or live payment integration.

## Gerald: Recommendations page and coordination

**Main file:** `fishTreesFrontEnd/recommendations.html`, with shared styling coordinated through `style.css`.

This is the main decision-making page for learners, parents, and school counselors. Design a simple journey that helps a user provide information and understand the guidance shown.

Suggested page parts:

- A short introduction explaining who can use the page and what it is for.
- A clearly labelled form for learner details and relevant examination subjects and grades or marks.
- Any additional attributes the team has agreed are relevant, such as interests, preferred subjects, or future career areas. Keep the questions focused and explain why they are requested.
- A visible action to request or view guidance.
- A result area that can show a clearly identified sample recommendation, a brief explanation, and possible next steps.
- A link to Anabel's payment page at `payment.html`.

Beginner steps:

1. Agree with the team what information a recommendation form should ask for. Do not invent official eligibility rules.
2. Sketch the page sections and the order in which the user will complete them.
3. Build the page structure and labels, then match the shared site styling.
4. Add only simple browser-side behavior that you understand, such as checking required fields or displaying a clearly marked example result.
5. Test the form on a phone-sized and desktop-sized screen, and check its navigation and labels.

Any sample recommendation is for demonstrating the interface only. Do not describe it as an official or guaranteed recommendation. Coordinate changes to the shared header, footer, and stylesheet with the rest of the team.

## Anabel: Payment experience

**Main file:** `fishTreesFrontEnd/payment.html`, with shared styles in `style.css`.

The prices are **UGX 500 per individual recommendation** and **UGX 500,000 per school per year**. The school subscription is annual because schools have one main intake each year. Confirm with the team how to explain what the subscription covers; do not promise unbuilt services.

Suggested page parts:

- A clear comparison of the individual recommendation option and school annual subscription option.
- A visible price for each option: UGX 500 per individual recommendation and UGX 500,000 per school per year.
- A simple explanation of what happens next in this front-end demonstration.
- A clearly labelled demo or confirmation state, rather than a claim that money was actually received.
- A way for a school to ask about subscription details, coordinated with Grace's contact information.

Beginner steps:

1. Confirm the payment flow and page location with Gerald.
2. Confirm with the team what the annual school subscription covers.
3. Sketch the two options so users can understand the difference quickly.
4. Build and style `payment.html` using the shared site layout.
5. Test links and the demo state, and make sure no screen falsely confirms a real transaction.

There is no backend or live payment processing in this project. Do not collect or store mobile-money PINs, card numbers, passwords, or other payment credentials. Any payment interaction shown is only a front-end mock-up.

## Stefan: Home page

**Main file:** `fishTreesFrontEnd/index.html` and the shared `style.css`. First agree with the team that this is the home page version to continue, since another home-page draft exists in the workspace root.

Suggested page parts:

- The FishTrees Pathways name and a clear statement that the project guides learners exploring A-Level combinations.
- A short introduction for learners, parents, and counselors.
- One prominent link to the Recommendations page.
- Brief links or summaries that help visitors find About and Contact.
- The agreed shared header and footer.

Beginner steps:

1. Confirm the correct home page file and shared visual style with the team.
2. Decide what a first-time visitor needs to understand immediately.
3. Keep the page focused and guide visitors toward the recommendation journey.
4. Check every navigation link and test the layout on mobile and desktop.

## Grace: Contact page

**Main file:** `fishTreesFrontEnd/contact.html`, with shared styles in `style.css`.

Suggested page parts:

- A clear way to contact the project team, using contact details the team has approved.
- A short contact form only if the team wants one and can explain that it is a front-end demonstration.
- A note directing schools to ask about annual subscription details, coordinated with Anabel.
- The shared header, navigation, and footer.

Beginner steps:

1. Ask the team which contact details can be shown publicly. Do not publish personal details without permission.
2. Sketch the simplest layout that makes the contact options easy to find.
3. If you include a form, label every field and make clear that it will not send or store a message without a backend.
4. Check links, spelling, mobile layout, and keyboard use.

## Shalom: About page

**Main file:** `fishTreesFrontEnd/about.html`, with shared styles in `style.css`.

Suggested page parts:

- The purpose of FishTrees Pathways and the problem it aims to help with.
- Who the project is for: learners, parents, and school counselors.
- A simple description of the intended steps from entering learner information to viewing guidance.
- An honest note that this semester's version is a front-end prototype and that recommendations shown are examples, not official decisions.
- The shared header, navigation, and footer.

Beginner steps:

1. Agree on a short, accurate project description with the team.
2. Organize it into a few easy-to-scan sections rather than one long block of text.
3. Use plain language and avoid promising features the current prototype does not have.
4. Check that the page matches the shared layout and is readable on mobile and desktop.

## GitHub and team habits

- Make your own contribution regularly and make your progress visible through genuine, understandable work.
- Commit related changes with a short message that says what changed. Do not make empty or artificial commits to increase activity.
- If using branches and pull requests, keep each contribution focused and ask a teammate to review it before merging.
- Coordinate edits to `style.css` and shared navigation to reduce conflicts. Tell the team before changing shared layout decisions.
- Check the pages together before presenting: navigation, links, spelling, responsive layout, and any demo interactions.
- Be ready to describe your own decisions and demonstrate your work. GitHub activity should reflect real collaboration and contribution.

## A note from Gerald

Each of us has an important part to play, and the quality of the final project depends on all of our effort. I believe in this team and I know we can do excellent work if we communicate, stay consistent, and take responsibility for our contributions. Please reach out to me whenever you are stuck or need help. Let's build this together and make sure every person's work is understood and represented.