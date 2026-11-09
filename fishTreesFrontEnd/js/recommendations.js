const subjects = [
  "Mathematics",
  "English",
  "Physics",
  "Chemistry",
  "Biology",
  "Geography",
  "History",
  "Economics",
  "Computer Studies"
];

const interests = [
  "Technology and Computing",
  "Medicine and Healthcare",
  "Engineering and Innovation",
  "Business and Entrepreneurship",
  "Agriculture and Environmental Sciences",
  "Law and Governance",
  "Education and Research",
  "Arts and Humanities",
  "Media and Communication"
];

const schools = [
  "Makerere College School",
  "King's College Budo",
  "St. Mary's College Kisubi",
  "Ntare School",
  "Gayaza High School",
  "Nabisunsa Girls School",
  "Mengo Senior School",
  "Mbarara High School",
  "Ggaba Secondary School",
  "Kololo Senior Secondary School",
  "Other School"
];

const grades = ["A", "B", "C", "D", "E", "F", "U"];

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("schoolOptions").innerHTML = schools
    .map((school) => `<option value="${school}"></option>`)
    .join("");

  renderInterestCards();
  renderGradeFields();

  document.getElementById("mockResultsToggle").addEventListener("click", (event) => {
    const button = event.currentTarget;
    const panel = document.getElementById("mockResultsContainer");
    const isOpen = panel.classList.toggle("hidden");

    button.textContent = isOpen ? "Show mock results" : "Hide mock results";
    button.setAttribute("aria-expanded", String(!isOpen));
  });
});

function renderInterestCards() {
  const container = document.getElementById("interestGrid");
  container.innerHTML = interests.map((interest) => `
    <button class="interest-card" type="button" disabled>
      ${interest}
    </button>
  `).join("");
}

function renderGradeFields() {
  document.getElementById("oLevelResultsContainer").innerHTML = createGradeRows("oLevelResults");
  document.getElementById("mockResultsContainer").innerHTML = createGradeRows("mockResults");
}

function createGradeRows(section) {
  return subjects.map((subject) => {
    const id = `${section}-${subject.toLowerCase().replaceAll(" ", "-")}`;

    return `
      <div class="subject-row">
        <label for="${id}">${subject}</label>
        <select id="${id}" aria-label="${subject} grade">
          <option value="">Select grade</option>
          ${grades.map((grade) => `<option value="${grade}">${grade}</option>`).join("")}
        </select>
      </div>
    `;
  }).join("");
}
