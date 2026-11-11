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
let selectedSchools = [];

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("schoolOptions").innerHTML = schools
    .map((school) => `<option value="${school}"></option>`)
    .join("");

  renderInterestCards();
  renderGradeFields();
  renderSelectedSchools();
  restorePendingProfile();

  document.getElementById("recommendationForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!selectedSchools.length) {
      document.getElementById("schoolSelectionStatus").textContent = "Add at least one school to continue.";
      return;
    }

    const submitButton = event.currentTarget.querySelector('[type="submit"]');
    const status = document.getElementById("recommendationStatus");
    submitButton.disabled = true;
    status.textContent = "Preparing your recommendations...";
    try {
      const recommendationData = saveRecommendationData();
      const result = await fishTreesApi("/api/payment-orders", {
        method: "POST",
        body: JSON.stringify({
          mode: "individual",
          paymentMethod: "mobile-money",
          profile: recommendationData,
        })
      });
      window.location.href = `payment.html?order=${encodeURIComponent(result.order.id)}`;
    } catch (error) {
      if (error.status === 401) {
        sessionStorage.setItem("fishTreesPendingProfile", JSON.stringify(recommendationData));
        window.location.href = "signin.html?next=recommendations.html";
        return;
      }
      status.textContent = error.message || "Could not reach the recommendation service. Start it with python app.py and try again.";
    } finally {
      submitButton.disabled = false;
    }
  });

  document.getElementById("loadSampleData").addEventListener("click", loadSampleData);
  document.getElementById("addSchool").addEventListener("click", addSchoolSelection);
  document.getElementById("schoolSearch").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addSchoolSelection();
    }
  });
  document.getElementById("selectedSchools").addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove-school]");
    if (!removeButton) return;
    selectedSchools.splice(Number(removeButton.dataset.removeSchool), 1);
    renderSelectedSchools();
  });

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
  selectedSchools = ["Makerere College School"];
  renderSelectedSchools();
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

function addSchoolSelection() {
  const input = document.getElementById("schoolSearch");
  const school = input.value.trim();
  const status = document.getElementById("schoolSelectionStatus");
  if (!school) {
    status.textContent = "Enter or select a school first.";
    return;
  }
  if (selectedSchools.some((item) => item.toLowerCase() === school.toLowerCase())) {
    status.textContent = "That school is already selected.";
    return;
  }
  if (selectedSchools.length === 3) {
    status.textContent = "Choose up to three schools.";
    return;
  }
  selectedSchools.push(school);
  input.value = "";
  renderSelectedSchools();
}

function renderSelectedSchools() {
  const container = document.getElementById("selectedSchools");
  container.replaceChildren();
  selectedSchools.forEach((school, index) => {
    const chip = document.createElement("span");
    chip.className = "school-chip";
    const name = document.createElement("span");
    name.textContent = school;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.dataset.removeSchool = String(index);
    remove.setAttribute("aria-label", `Remove ${school}`);
    remove.title = `Remove ${school}`;
    remove.textContent = "×";
    chip.append(name, remove);
    container.append(chip);
  });
  const status = document.getElementById("schoolSelectionStatus");
  status.textContent = selectedSchools.length ? `${selectedSchools.length} of 3 schools selected.` : "Choose at least one school.";
}

function restorePendingProfile() {
  const savedProfile = sessionStorage.getItem("fishTreesPendingProfile");
  if (!savedProfile) return;
  sessionStorage.removeItem("fishTreesPendingProfile");
  try {
    const profile = JSON.parse(savedProfile);
    selectedSchools = Array.isArray(profile.schools) ? profile.schools.slice(0, 3) : [];
    renderSelectedSchools();
    document.getElementById("careerAspiration").value = profile.aspiration || "";
    document.querySelectorAll(".interest-card").forEach((button) => {
      button.setAttribute("aria-pressed", String((profile.interests || []).includes(button.textContent.trim())));
    });
    subjects.forEach((subject) => {
      const subjectId = subject.toLowerCase().replaceAll(" ", "-");
      document.getElementById(`oLevelResults-${subjectId}`).value = profile.oLevelResults?.[subject] || "";
      document.getElementById(`mockResults-${subjectId}`).value = profile.mockResults?.[subject] || "";
    });
  } catch {
    sessionStorage.removeItem("fishTreesPendingProfile");
  }
}

function saveRecommendationData() {
  const selectedInterests = Array.from(document.querySelectorAll('.interest-card[aria-pressed="true"]'))
    .map((button) => button.textContent.trim());
  const collectGrades = (section) => Object.fromEntries(subjects.map((subject) => {
    const subjectId = subject.toLowerCase().replaceAll(" ", "-");
    return [subject, document.getElementById(`${section}-${subjectId}`).value];
  }));

  const recommendationData = {
    school: selectedSchools[0] || "",
    schools: [...selectedSchools],
    aspiration: document.getElementById("careerAspiration").value.trim(),
    interests: selectedInterests,
    oLevelResults: collectGrades("oLevelResults"),
    mockResults: collectGrades("mockResults")
  };

  return recommendationData;
}
