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
  "St. Henry's College Kitovu",
  "St. Mary's College, Rushoroza",
  "Lubiri Secondary School",
  "Kitende Secondary School",
  "Seeta High School",
  "Kawempe Muslim Secondary School",
  "Busoga College Mwiri",
  "Tororo Girls School",
  "Other School"
];

const grades = ["A", "B", "C", "D", "E", "F", "U"];
const sampleGrades = ["A", "B", "A", "B", "A", "B", "B", "A", "A"];

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("schoolOptions").innerHTML = schools
    .map((school) => `<option value="${school}"></option>`)
    .join("");

  renderInterestCards();
  renderGradeFields();

  document.getElementById("recommendationForm").addEventListener("submit", (event) => {
    event.preventDefault();
    saveRecommendationData();
    window.location.href = "payment.html";
  });

  document.getElementById("loadSampleData").addEventListener("click", loadSampleData);

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
    <button class="interest-card" type="button" aria-pressed="false">
      ${interest}
    </button>
  `).join("");

  container.addEventListener("click", (event) => {
    const button = event.target.closest(".interest-card");
    if (!button) return;

    const selected = button.getAttribute("aria-pressed") !== "true";
    button.setAttribute("aria-pressed", String(selected));
  });
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

function loadSampleData() {
  document.getElementById("schoolSearch").value = "Makerere College School";
  document.getElementById("careerAspiration").value = "I would like to explore a career in biomedical engineering.";

  const sampleInterests = ["Medicine and Healthcare", "Engineering and Innovation", "Technology and Computing"];
  document.querySelectorAll(".interest-card").forEach((button) => {
    button.setAttribute("aria-pressed", String(sampleInterests.includes(button.textContent.trim())));
  });

  subjects.forEach((subject, index) => {
    const subjectId = subject.toLowerCase().replaceAll(" ", "-");
    document.getElementById(`oLevelResults-${subjectId}`).value = sampleGrades[index];
    document.getElementById(`mockResults-${subjectId}`).value = sampleGrades[(index + 2) % sampleGrades.length];
  });

  const mockPanel = document.getElementById("mockResultsContainer");
  mockPanel.classList.remove("hidden");
  const mockToggle = document.getElementById("mockResultsToggle");
  mockToggle.textContent = "Hide mock results";
  mockToggle.setAttribute("aria-expanded", "true");
}

function saveRecommendationData() {
  const selectedInterests = Array.from(document.querySelectorAll('.interest-card[aria-pressed="true"]'))
    .map((button) => button.textContent.trim());
  const collectGrades = (section) => Object.fromEntries(subjects.map((subject) => {
    const subjectId = subject.toLowerCase().replaceAll(" ", "-");
    return [subject, document.getElementById(`${section}-${subjectId}`).value];
  }));

  const recommendationData = {
    school: document.getElementById("schoolSearch").value.trim(),
    aspiration: document.getElementById("careerAspiration").value.trim(),
    interests: selectedInterests,
    oLevelResults: collectGrades("oLevelResults"),
    mockResults: collectGrades("mockResults")
  };

  localStorage.setItem("fishTreesRecommendation", JSON.stringify(recommendationData));
}
