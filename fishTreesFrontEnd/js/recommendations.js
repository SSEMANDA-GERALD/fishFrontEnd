const SUBJECTS = [
  { key: "mathematics", label: "Mathematics" },
  { key: "english", label: "English" },
  { key: "physics", label: "Physics" },
  { key: "chemistry", label: "Chemistry" },
  { key: "biology", label: "Biology" },
  { key: "geography", label: "Geography" },
  { key: "history", label: "History" },
  { key: "economics", label: "Economics" },
  { key: "computerStudies", label: "Computer Studies" }
];

const INTERESTS = [
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

const SCHOOL_OPTIONS = [
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

const GRADE_OPTIONS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "U"
];

const studentProfile = {
  school: "",
  interests: [],
  careerAspiration: "",
  oLevelResults: {},
  mockResults: {},
  includeMockResults: false
};

const sampleStudent = {
  school: "Makerere College School",
  interests: [
    "Technology and Computing",
    "Engineering and Innovation"
  ],
  careerAspiration: "Engineer",
  oLevelResults: {
    mathematics: "A",
    english: "B",
    physics: "A",
    chemistry: "B",
    biology: "C",
    geography: "B",
    history: "C",
    economics: "B",
    computerStudies: "A"
  },
  mockResults: {
    mathematics: "A",
    english: "B",
    physics: "A",
    chemistry: "B",
    biology: "C",
    geography: "B",
    history: "C",
    economics: "B",
    computerStudies: "A"
  },
  includeMockResults: false
};

document.addEventListener("DOMContentLoaded", () => {
  populateSchoolOptions();
  renderInterestCards();
  renderGradeFields();
  bindEvents();
  setStatusMessage("Sample data is ready for demonstration and review.");
});

function populateSchoolOptions() {
  const datalist = document.getElementById("schoolOptions");
  datalist.innerHTML = SCHOOL_OPTIONS.map((school) => `<option value="${school}"></option>`).join("");
}

function renderInterestCards() {
  const container = document.getElementById("interestGrid");
  container.innerHTML = INTERESTS.map((interest) => `
    <button class="interest-card" type="button" data-interest="${interest}">
      ${interest}
    </button>
  `).join("");

  container.querySelectorAll(".interest-card").forEach((button) => {
    button.addEventListener("click", () => {
      const value = button.dataset.interest;
      const index = studentProfile.interests.indexOf(value);

      if (index >= 0) {
        studentProfile.interests.splice(index, 1);
        button.classList.remove("selected");
      } else {
        studentProfile.interests.push(value);
        button.classList.add("selected");
      }
    });
  });
}

function renderGradeFields() {
  const finalContainer = document.getElementById("oLevelResultsContainer");
  const mockContainer = document.getElementById("mockResultsContainer");

  finalContainer.innerHTML = SUBJECTS.map((subject) => createGradeRow(subject, "oLevelResults")).join("");
  mockContainer.innerHTML = SUBJECTS.map((subject) => createGradeRow(subject, "mockResults")).join("");
}

function createGradeRow(subject, sectionName) {
  return `
    <div class="subject-row">
      <label for="${sectionName}-${subject.key}">${subject.label}</label>
      <select id="${sectionName}-${subject.key}" data-section="${sectionName}" data-subject="${subject.key}" aria-label="${subject.label} grade">
        <option value="">Select grade</option>
        ${GRADE_OPTIONS.map((grade) => `<option value="${grade}">${grade}</option>`).join("")}
      </select>
    </div>
  `;
}

function bindEvents() {
  document.getElementById("schoolSearch").addEventListener("input", (event) => {
    studentProfile.school = event.target.value.trim();
  });

  document.getElementById("careerAspiration").addEventListener("input", (event) => {
    studentProfile.careerAspiration = event.target.value.trim();
  });

  document.getElementById("mockResultsToggle").addEventListener("click", () => {
    const panel = document.getElementById("mockResultsContainer");
    const button = document.getElementById("mockResultsToggle");
    const isOpen = panel.classList.toggle("hidden");
    studentProfile.includeMockResults = !isOpen;
    button.textContent = isOpen ? "Show mock results" : "Hide mock results";
    button.setAttribute("aria-expanded", String(!isOpen));
  });

  document.getElementById("loadSampleDataBtn").addEventListener("click", () => {
    fillSampleData();
  });

  document.getElementById("generateRecommendationsBtn").addEventListener("click", () => {
    window.location.href = "payment.html";
  });
}

function fillSampleData() {
  document.getElementById("schoolSearch").value = sampleStudent.school;
  studentProfile.school = sampleStudent.school;

  document.getElementById("careerAspiration").value = sampleStudent.careerAspiration;
  studentProfile.careerAspiration = sampleStudent.careerAspiration;

  studentProfile.interests = [...sampleStudent.interests];
  document.querySelectorAll(".interest-card").forEach((button) => {
    const isSelected = sampleStudent.interests.includes(button.dataset.interest);
    button.classList.toggle("selected", isSelected);
  });

  SUBJECTS.forEach((subject) => {
    const grade = sampleStudent.oLevelResults[subject.key];
    const select = document.querySelector(`#oLevelResults-${subject.key}`);
    if (select) {
      select.value = grade || "";
    }
  });

  setStatusMessage("Sample data loaded. You can review the form before presenting the page.");
}

function setStatusMessage(message) {
  const statusBox = document.getElementById("statusBox");
  statusBox.textContent = message;
}

window.studentProfile = studentProfile;
window.sampleStudent = sampleStudent;
