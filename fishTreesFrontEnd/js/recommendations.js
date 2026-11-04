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
  { key: "Technology and Computing", icon: "💻" },
  { key: "Medicine and Healthcare", icon: "🩺" },
  { key: "Engineering and Innovation", icon: "⚙️" },
  { key: "Business and Entrepreneurship", icon: "📊" },
  { key: "Agriculture and Environmental Sciences", icon: "🌱" },
  { key: "Law and Governance", icon: "⚖️" },
  { key: "Education and Research", icon: "📚" },
  { key: "Arts and Humanities", icon: "🎨" },
  { key: "Media and Communication", icon: "📡" }
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

const DEMO_MODE = true;

// Configure verified UNEB grade thresholds here when an official scale is approved.
// The demo intentionally keeps this disabled to avoid inventing grading rules.
const UNEB_GRADE_SCALE = {
  enabled: false,
  order: [],
  thresholds: []
};

const studentProfile = {
  school: "",
  interests: [],
  careerAspiration: "",
  oLevelResults: {},
  mockResults: {},
  includeMockResults: false
};

const SAMPLE_COMBINATIONS = [
  {
    label: "PCM pathway",
    subjects: ["Physics", "Chemistry", "Mathematics"],
    interests: ["Technology and Computing", "Engineering and Innovation", "Medicine and Healthcare"],
    careerPathways: ["Engineer", "Medical researcher", "Science lecturer"],
    strengths: ["Analytical thinking", "Numerical reasoning", "Scientific problem solving"],
    improvement: ["Communication", "Real-world application", "Presentation skills"],
    keywords: ["engineer", "doctor", "scientist", "research", "technology"]
  },
  {
    label: "PCB pathway",
    subjects: ["Physics", "Chemistry", "Biology"],
    interests: ["Medicine and Healthcare", "Agriculture and Environmental Sciences", "Technology and Computing"],
    careerPathways: ["Doctor", "Pharmacist", "Veterinary professional"],
    strengths: ["Biological understanding", "Scientific observation", "Attention to detail"],
    improvement: ["Quantitative analysis", "Research communication"],
    keywords: ["doctor", "health", "medicine", "biomedical", "healthcare"]
  },
  {
    label: "HEG pathway",
    subjects: ["History", "Economics", "Geography"],
    interests: ["Law and Governance", "Business and Entrepreneurship", "Media and Communication"],
    careerPathways: ["Policy analyst", "Entrepreneur", "Development specialist"],
    strengths: ["Critical thinking", "Understanding society", "Decision-making"],
    improvement: ["Quantitative modelling", "Business planning"],
    keywords: ["law", "business", "economics", "policy", "governance"]
  },
  {
    label: "EAC pathway",
    subjects: ["Economics", "Accounting", "Commerce"],
    interests: ["Business and Entrepreneurship", "Law and Governance", "Media and Communication"],
    careerPathways: ["Accountant", "Business owner", "Financial planner"],
    strengths: ["Planning", "Commercial awareness", "Organised thinking"],
    improvement: ["Scientific analysis", "Technical reporting"],
    keywords: ["accountant", "business", "finance", "commerce", "entrepreneur"]
  },
  {
    label: "BCM pathway",
    subjects: ["Biology", "Chemistry", "Mathematics"],
    interests: ["Medicine and Healthcare", "Agriculture and Environmental Sciences", "Technology and Computing"],
    careerPathways: ["Medical laboratory professional", "Agricultural scientist", "Public health officer"],
    strengths: ["Scientific literacy", "Reasoning", "Problem solving"],
    improvement: ["Hands-on practical work", "Research presentation"],
    keywords: ["health", "medicine", "agriculture", "science", "research"]
  },
  {
    label: "MEC pathway",
    subjects: ["Mathematics", "Economics", "Computer Studies"],
    interests: ["Technology and Computing", "Business and Entrepreneurship", "Engineering and Innovation"],
    careerPathways: ["Data analyst", "Product manager", "Business technologist"],
    strengths: ["Logical reasoning", "Technology fluency", "Analytical thinking"],
    improvement: ["Creative communication", "Project leadership"],
    keywords: ["technology", "business", "data", "digital", "analyst"]
  },
  {
    label: "AEG pathway",
    subjects: ["Agriculture", "Economics", "Geography"],
    interests: ["Agriculture and Environmental Sciences", "Business and Entrepreneurship", "Law and Governance"],
    careerPathways: ["Agribusiness specialist", "Environmental planner", "Rural development officer"],
    strengths: ["Systems thinking", "Sustainability awareness", "Planning"],
    improvement: ["Numerical precision", "Technical communication"],
    keywords: ["agriculture", "environment", "policy", "rural", "sustainability"]
  }
];

const resultState = {
  isLoading: false,
  data: []
};

document.addEventListener("DOMContentLoaded", () => {
  populateSchoolOptions();
  renderInterestCards();
  renderSubjectFields();
  bindFormEvents();
  updateProgressStep(1);
  showResultState("empty", "Choose your school, interests and academics to generate your first recommendations.");
});

function populateSchoolOptions() {
  const datalist = document.getElementById("schoolOptions");
  datalist.innerHTML = SCHOOL_OPTIONS.map((school) => `<option value="${school}"></option>`).join("");
}

function renderInterestCards() {
  const container = document.getElementById("interestGrid");
  container.innerHTML = INTERESTS.map((interest) => `
    <button class="interest-card" type="button" data-interest="${interest.key}" aria-pressed="false">
      <div class="interest-icon">${interest.icon}</div>
      <div>
        <span>${interest.key}</span>
      </div>
    </button>
  `).join("");

  container.querySelectorAll(".interest-card").forEach((button) => {
    button.addEventListener("click", () => {
      const selectedInterest = button.dataset.interest;
      const index = studentProfile.interests.indexOf(selectedInterest);

      if (index >= 0) {
        studentProfile.interests.splice(index, 1);
        button.classList.remove("selected");
        button.setAttribute("aria-pressed", "false");
      } else {
        studentProfile.interests.push(selectedInterest);
        button.classList.add("selected");
        button.setAttribute("aria-pressed", "true");
      }
    });
  });
}

function renderSubjectFields() {
  const oLevelContainer = document.getElementById("oLevelResultsContainer");
  const mockContainer = document.getElementById("mockResultsContainer");

  oLevelContainer.innerHTML = SUBJECTS.map((subject) => createSubjectFieldMarkup(subject, "oLevelResults")).join("");
  mockContainer.innerHTML = SUBJECTS.map((subject) => createSubjectFieldMarkup(subject, "mockResults")).join("");

  attachSubjectListeners("oLevelResults");
  attachSubjectListeners("mockResults");
}

function createSubjectFieldMarkup(subject, resultsKey) {
  const resultKey = resultsKey === "oLevelResults" ? "Final result" : "Mock result";
  return `
    <div class="subject-row" data-subject="${subject.key}" data-results-key="${resultsKey}">
      <div>
        <label class="mini-label">${resultKey}</label>
        <label for="${resultsKey}-${subject.key}">${subject.label}</label>
      </div>
      <div>
        <label class="mini-label" for="${resultsKey}-${subject.key}-marks">Marks</label>
        <input id="${resultsKey}-${subject.key}-marks" type="number" min="0" max="100" step="1" data-subject="${subject.key}" data-results-key="${resultsKey}" data-role="marks" placeholder="0-100" />
      </div>
      <div>
        <label class="mini-label" for="${resultsKey}-${subject.key}-grade">Grade</label>
        <input id="${resultsKey}-${subject.key}-grade" type="text" data-subject="${subject.key}" data-results-key="${resultsKey}" data-role="grade" placeholder="Official grade" />
      </div>
    </div>
  `;
}

function attachSubjectListeners(resultsKey) {
  const inputs = document.querySelectorAll(`[data-results-key="${resultsKey}"][data-role="marks"]`);

  inputs.forEach((input) => {
    input.addEventListener("input", (event) => {
      const { subject } = event.target.dataset;
      const marksValue = event.target.value.trim();
      const gradeInput = document.querySelector(`[data-results-key="${resultsKey}"][data-role="grade"][data-subject="${subject}"]`);

      if (marksValue === "") {
        input.classList.remove("invalid");
        if (gradeInput) {
          gradeInput.value = "";
        }
        return;
      }

      const marks = Number(marksValue);

      if (Number.isNaN(marks) || marks < 0 || marks > 100) {
        input.classList.add("invalid");
        showValidationMessage("Marks must be between 0 and 100.", true);
        return;
      }

      input.classList.remove("invalid");
      if (UNEB_GRADE_SCALE.enabled) {
        const autoGrade = calculateGradeFromMarks(marks);
        if (autoGrade && gradeInput) {
          gradeInput.value = autoGrade;
        }
      }
    });
  });

  const gradeInputs = document.querySelectorAll(`[data-results-key="${resultsKey}"][data-role="grade"]`);
  gradeInputs.forEach((input) => {
    input.addEventListener("blur", () => {
      const marksInput = document.querySelector(`[data-results-key="${resultsKey}"][data-role="marks"][data-subject="${input.dataset.subject}"]`);
      const gradeValue = input.value.trim();
      const marksValue = marksInput && marksInput.value.trim() !== "" ? Number(marksInput.value) : null;

      if (gradeValue && marksValue !== null && UNEB_GRADE_SCALE.enabled) {
        const expected = calculateGradeFromMarks(marksValue);
        if (expected && gradeValue.toUpperCase() !== expected.toUpperCase()) {
          showValidationMessage(`Please review the grade for ${getSubjectLabel(input.dataset.subject)}. The entered grade does not match the configured mark scale.`, true);
        }
      }
    });
  });
}

function bindFormEvents() {
  document.getElementById("schoolSearch").addEventListener("input", (event) => {
    studentProfile.school = event.target.value.trim();
  });

  document.getElementById("careerAspiration").addEventListener("input", (event) => {
    studentProfile.careerAspiration = event.target.value.trim();
  });

  document.getElementById("mockResultsToggle").addEventListener("click", () => {
    const panel = document.getElementById("mockResultsPanel");
    const isOpen = panel.classList.toggle("visible");
    studentProfile.includeMockResults = isOpen;
    document.getElementById("mockResultsToggleText").textContent = isOpen ? "Hide mock examination results" : "Add Mock Examination Results (Optional)";
  });

  document.getElementById("generateRecommendationsBtn").addEventListener("click", async () => {
    const profile = collectStudentProfile();
    const validation = validateStudentProfile(profile);

    if (!validation.valid) {
      showValidationMessage(validation.message, true);
      return;
    }

    setLoadingState(true);
    updateProgressStep(2);

    try {
      const recommendations = await getRecommendations(profile);
      renderRecommendations(recommendations);
      renderReport(profile, recommendations);
      updateProgressStep(3);
      document.getElementById("reportDownloadBtn").style.display = "inline-flex";
      document.getElementById("resultsSection").scrollIntoView({ behavior: "smooth", block: "start" });
      showValidationMessage("Recommendations generated successfully.", false);
    } catch (error) {
      showResultState("error", error.message || "Unable to generate recommendations at the moment.");
      showValidationMessage(error.message || "Recommendation generation failed.", true);
    } finally {
      setLoadingState(false);
    }
  });

  document.getElementById("reportDownloadBtn").addEventListener("click", () => {
    window.print();
  });
}

function collectStudentProfile() {
  const profile = {
    school: document.getElementById("schoolSearch").value.trim(),
    interests: [...studentProfile.interests],
    careerAspiration: document.getElementById("careerAspiration").value.trim(),
    oLevelResults: {},
    mockResults: {},
    includeMockResults: studentProfile.includeMockResults
  };

  SUBJECTS.forEach((subject) => {
    profile.oLevelResults[subject.key] = {
      marks: readMarksValue("oLevelResults", subject.key),
      grade: readGradeValue("oLevelResults", subject.key)
    };

    if (profile.includeMockResults) {
      profile.mockResults[subject.key] = {
        marks: readMarksValue("mockResults", subject.key),
        grade: readGradeValue("mockResults", subject.key)
      };
    }
  });

  return profile;
}

function readMarksValue(resultsKey, subjectKey) {
  const input = document.querySelector(`[data-results-key="${resultsKey}"][data-role="marks"][data-subject="${subjectKey}"]`);
  if (!input || !input.value.trim()) {
    return null;
  }

  const value = Number(input.value);
  if (Number.isNaN(value) || value < 0 || value > 100) {
    return null;
  }

  return value;
}

function readGradeValue(resultsKey, subjectKey) {
  const input = document.querySelector(`[data-results-key="${resultsKey}"][data-role="grade"][data-subject="${subjectKey}"]`);
  return input ? input.value.trim() : "";
}

function validateStudentProfile(profile) {
  if (!profile.school) {
    return { valid: false, message: "Please select or enter the student school." };
  }

  if (!profile.interests.length) {
    return { valid: false, message: "Please select at least one interest cluster." };
  }

  const hasAcademicEntry = SUBJECTS.some((subject) => {
    const result = profile.oLevelResults[subject.key];
    return result && (result.marks !== null || result.grade);
  });

  if (!hasAcademicEntry) {
    return { valid: false, message: "Please enter at least one O-Level subject mark or grade before generating recommendations." };
  }

  return { valid: true };
}

function setLoadingState(isLoading) {
  const button = document.getElementById("generateRecommendationsBtn");
  const loadingText = document.getElementById("loadingText");

  resultState.isLoading = isLoading;
  button.disabled = isLoading;
  loadingText.style.display = isLoading ? "inline-flex" : "none";
  button.innerHTML = isLoading
    ? '<span class="loading-spinner"></span> Exploring your academic pathways...'
    : "Generate My Recommendations";
}

function updateProgressStep(stepNumber) {
  const steps = document.querySelectorAll(".progress-step");

  steps.forEach((step, index) => {
    if (index + 1 < stepNumber) {
      step.classList.add("complete");
      step.classList.remove("active");
    } else if (index + 1 === stepNumber) {
      step.classList.add("active");
      step.classList.remove("complete");
    } else {
      step.classList.remove("active", "complete");
    }
  });
}

function showValidationMessage(message, isError) {
  const box = document.getElementById("validationBox");
  if (!box) {
    return;
  }

  box.className = `validation-box ${isError ? "error" : "success"}`;
  box.textContent = message;
}

async function getRecommendations(studentProfileData) {
  if (!studentProfileData || !studentProfileData.school) {
    throw new Error("Student school details are required before generating recommendations.");
  }

  await new Promise((resolve) => setTimeout(resolve, 900));

  const recommendations = generateRecommendations(studentProfileData);

  if (!recommendations.length) {
    throw new Error("No suitable recommendation could be generated from the current student information.");
  }

  return recommendations;
}

function generateRecommendations(studentProfileData) {
  const profile = studentProfileData || {};
  const selectedInterests = profile.interests || [];
  const careerAspiration = (profile.careerAspiration || "").toLowerCase();
  const results = profile.oLevelResults || {};

  const rankedCombinations = SAMPLE_COMBINATIONS.map((combination) => {
    let score = 0;
    let interestMatches = [];

    selectedInterests.forEach((interest) => {
      if (combination.interests.includes(interest)) {
        interestMatches.push(interest);
        score += 2.2;
      }
    });

    const relevantAcademicMarks = combination.subjects
      .map((name) => {
        const normalized = name.toLowerCase().replace(/\s+/g, "");
        const key = Object.keys(results).find((resultKey) => {
          const label = getSubjectLabel(resultKey).toLowerCase().replace(/\s+/g, "");
          return label === normalized || normalized.includes(label) || label.includes(normalized);
        });

        if (!key) {
          return null;
        }

        const subjectResult = results[key];
        return subjectResult && subjectResult.marks !== null ? subjectResult.marks : null;
      })
      .filter((value) => value !== null);

    if (relevantAcademicMarks.length) {
      const avgMarks = relevantAcademicMarks.reduce((total, value) => total + value, 0) / relevantAcademicMarks.length;
      score += avgMarks / 18;
    }

    const matchedCareerKeywords = combination.keywords.filter((keyword) => careerAspiration.includes(keyword));
    if (matchedCareerKeywords.length) {
      score += matchedCareerKeywords.length * 1.4;
    }

    const safeScore = Math.min(9.9, Number((score + 3).toFixed(1)));

    const explanation = buildExplanation(combination, interestMatches, matchedCareerKeywords, results);

    return {
      id: combination.label,
      name: combination.label,
      subjects: combination.subjects,
      score: safeScore,
      explanation,
      careerPathways: combination.careerPathways,
      strengths: combination.strengths,
      improvement: combination.improvement
    };
  });

  return rankedCombinations.sort((a, b) => b.score - a.score).slice(0, 4);
}

function buildExplanation(combination, interestMatches, matchedCareerKeywords, results) {
  const interestText = interestMatches.length
    ? `This matches your selected interests in ${interestMatches.slice(0, 2).join(" and ")}.`
    : "This pathway reflects a broad academic fit for your profile.";

  const aspirationText = matchedCareerKeywords.length
    ? ` It also supports your interest in ${matchedCareerKeywords.join(", ")}.`
    : " It is useful for exploring future options while your ambitions are still developing.";

  const strongestResult = combination.subjects
    .map((subjectName) => {
      const resultKey = Object.keys(results).find((key) => getSubjectLabel(key).toLowerCase() === subjectName.toLowerCase());
      const entry = resultKey ? results[resultKey] : null;
      return entry && entry.marks !== null ? { subject: subjectName, marks: entry.marks } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.marks - a.marks)[0];

  const academicText = strongestResult
    ? ` Your strongest available result is ${strongestResult.subject} with ${strongestResult.marks} marks.`
    : " Your current academic profile still needs a few more results for a firmer comparison.";

  return `${interestText}${aspirationText}${academicText}`;
}

function renderRecommendations(recommendations) {
  const container = document.getElementById("recommendationsContainer");

  if (!recommendations || !recommendations.length) {
    showResultState("error", "No recommendations were generated for this profile.");
    return;
  }

  container.innerHTML = recommendations.map((recommendation, index) => `
    <article class="recommendation-card ${index === 0 ? "featured" : ""}">
      <div class="card-top">
        <div class="rank-chip">#${index + 1}</div>
        <div>
          <h4>${recommendation.name}</h4>
          <p class="combo-subjects">${recommendation.subjects.join(" • ")}</p>
        </div>
        <span class="score-pill">Sample suitability score: ${recommendation.score.toFixed(1)}/10</span>
      </div>

      <p>${recommendation.explanation}</p>

      <div class="meta-grid">
        <div class="meta-box">
          <h5>Career pathways</h5>
          <p>${recommendation.careerPathways.join(", ")}</p>
        </div>
        <div class="meta-box">
          <h5>Academic strengths</h5>
          <p>${recommendation.strengths.join(", ")}</p>
        </div>
        <div class="meta-box">
          <h5>Potential focus</h5>
          <p>${recommendation.improvement.join(", ")}</p>
        </div>
      </div>

      <button class="expand-btn" type="button" aria-expanded="false">Expand details</button>
      <div class="recommendation-details" hidden>
        <p><strong>Why this fits:</strong> ${recommendation.explanation}</p>
        <p><strong>Suggested future paths:</strong> ${recommendation.careerPathways.join(", ")}</p>
      </div>
    </article>
  `).join("");

  container.querySelectorAll(".expand-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const details = button.parentElement.querySelector(".recommendation-details");
      const isExpanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!isExpanded));
      details.hidden = isExpanded;
      button.textContent = isExpanded ? "Expand details" : "Hide details";
    });
  });
}

function renderReport(profile, recommendations) {
  const reportCard = document.getElementById("reportCard");
  const reportDate = new Date().toLocaleDateString("en-UG", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const subjectSummary = SUBJECTS.map((subject) => {
    const result = profile.oLevelResults[subject.key];
    const mock = profile.mockResults && profile.mockResults[subject.key];
    const finalText = result && (result.marks !== null || result.grade)
      ? `${result.marks !== null ? result.marks + " marks" : "N/A"} • ${result.grade || "No grade recorded"}`
      : "Not provided";
    const mockText = profile.includeMockResults && mock && (mock.marks !== null || mock.grade)
      ? `${mock.marks !== null ? mock.marks + " marks" : "N/A"} • ${mock.grade || "No grade recorded"}`
      : "Not provided";

    return `
      <div class="report-item">
        <span class="label">${subject.label}</span>
        <span class="value">Final: ${finalText} | Mock: ${mockText}</span>
      </div>
    `;
  }).join("");

  const recommendationSummary = recommendations.map((item) => `
    <div class="report-item">
      <span class="label">${item.name}</span>
      <span class="value">${item.subjects.join(" • ")} • ${item.careerPathways.join(", ")}</span>
    </div>
  `).join("");

  reportCard.innerHTML = `
    <div class="report-header">
      <h3>FishTrees Pathways Career Guidance Report</h3>
      <span>Date generated: ${reportDate}</span>
    </div>

    <div class="report-grid">
      <div class="report-item">
        <span class="label">School</span>
        <span class="value">${profile.school || "Not provided"}</span>
      </div>
      <div class="report-item">
        <span class="label">Career aspiration</span>
        <span class="value">${profile.careerAspiration || "Not provided"}</span>
      </div>
      <div class="report-item">
        <span class="label">Interest clusters</span>
        <span class="value">${profile.interests.length ? profile.interests.join(", ") : "Not selected"}</span>
      </div>
      <div class="report-item">
        <span class="label">Development mode</span>
        <span class="value">${DEMO_MODE ? "Frontend demonstration logic" : "Live backend mode"}</span>
      </div>
    </div>

    <div class="report-item" style="margin-bottom: 1rem;">
      <span class="label">Academic summary</span>
      <span class="value">${subjectSummary}</span>
    </div>

    <div class="report-item">
      <span class="label">Recommended pathways</span>
      <span class="value">${recommendationSummary}</span>
    </div>
  `;

  reportCard.classList.remove("hidden");
}

function showResultState(type, message) {
  const container = document.getElementById("recommendationsContainer");
  if (!container) {
    return;
  }

  if (type === "empty") {
    container.innerHTML = `<div class="empty-state">${message}</div>`;
    return;
  }

  if (type === "error") {
    container.innerHTML = `<div class="error-state"><strong>Unable to continue.</strong> ${message}</div>`;
    return;
  }

  container.innerHTML = `<div class="success-state">${message}</div>`;
}

function calculateGradeFromMarks(marks) {
  if (!UNEB_GRADE_SCALE.enabled) {
    return "";
  }

  const thresholds = UNEB_GRADE_SCALE.thresholds || [];
  if (!thresholds.length) {
    return "";
  }

  let matchedGrade = "";
  thresholds.forEach((entry) => {
    if (marks >= entry.min && marks <= entry.max) {
      matchedGrade = entry.grade;
    }
  });

  return matchedGrade;
}

function getSubjectLabel(subjectKey) {
  const found = SUBJECTS.find((subject) => subject.key === subjectKey);
  return found ? found.label : subjectKey;
}

window.getRecommendations = getRecommendations;
window.generateRecommendations = generateRecommendations;
