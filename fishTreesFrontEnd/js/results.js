const combinations = {
  PCM: {
    subjects: "Physics, Chemistry, Mathematics",
    interests: ["Technology and Computing", "Engineering and Innovation"],
    reason: "A science combination commonly considered for engineering, physical sciences, and technology."
  },
  PEM: {
    subjects: "Physics, Economics, Mathematics",
    interests: ["Engineering and Innovation", "Business and Entrepreneurship"],
    reason: "Combines mathematical and physical sciences with economics."
  },
  PCB: {
    subjects: "Physics, Chemistry, Biology",
    interests: ["Medicine and Healthcare"],
    reason: "A science combination commonly considered for biological and health-related studies."
  },
  BCM: {
    subjects: "Biology, Chemistry, Mathematics",
    interests: ["Medicine and Healthcare", "Agriculture and Environmental Sciences", "Education and Research"],
    reason: "Combines biological and chemical sciences with mathematical study."
  },
  MEG: {
    subjects: "Mathematics, Economics, Geography",
    interests: ["Business and Entrepreneurship", "Agriculture and Environmental Sciences"],
    reason: "Connects quantitative study and economics with geography."
  },
  HEG: {
    subjects: "History, Economics, Geography",
    interests: ["Law and Governance", "Education and Research", "Arts and Humanities"],
    reason: "A humanities and social-sciences combination focused on societies, economies, and place."
  },
  HEL: {
    subjects: "History, Economics, Literature in English",
    interests: ["Law and Governance", "Arts and Humanities", "Media and Communication"],
    reason: "Combines humanities and social sciences with advanced literary study."
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const emptyResults = document.getElementById("emptyResults");
  const resultsContent = document.getElementById("resultsContent");
  let profile;

  try {
    profile = JSON.parse(localStorage.getItem("fishTreesRecommendation"));
  } catch {
    profile = null;
  }

  if (!profile) {
    emptyResults.hidden = false;
    return;
  }

  resultsContent.hidden = false;
  document.getElementById("resultSchool").textContent = profile.school || "Not provided";
  document.getElementById("resultAspiration").textContent = profile.aspiration || "Not provided";
  document.getElementById("resultInterests").textContent = profile.interests?.join(", ") || "None selected";
  document.getElementById("schoolAvailability").textContent = profile.school
    ? `Common combinations to discuss with ${profile.school}. Confirm which combinations the school currently offers.`
    : "These are common combinations to explore. Confirm availability with your school.";
  document.getElementById("testingNotice").hidden = new URLSearchParams(window.location.search).get("testing") !== "1";

  renderPathways(profile.interests || []);
  renderGrades("oLevelSummary", profile.oLevelResults || {});
  renderGrades("mockSummary", profile.mockResults || {});
  document.getElementById("exportResults").addEventListener("click", () => {
    document.querySelectorAll(".grades-details").forEach((details) => {
      details.open = true;
    });
    window.print();
  });
});

function renderPathways(selectedInterests) {
  const list = document.getElementById("recommendationsList");
  const recommendedCodes = new Set();

  selectedInterests.forEach((interest) => {
    Object.entries(combinations).forEach(([code, combination]) => {
      if (combination.interests.includes(interest)) recommendedCodes.add(code);
    });
  });

  if (!recommendedCodes.size) {
    ["PCM", "HEG"].forEach((code) => recommendedCodes.add(code));
  }

  recommendedCodes.forEach((code) => {
    const combination = combinations[code];

    const item = document.createElement("article");
    item.className = "pathway-item";

    const details = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = code;
    const reason = document.createElement("p");
    reason.textContent = combination.reason;
    details.append(title, reason);

    const subjects = document.createElement("p");
    subjects.className = "subject-list";
    subjects.textContent = combination.subjects;
    item.append(details, subjects);
    list.append(item);
  });
}

function renderGrades(elementId, gradeData) {
  const list = document.getElementById(elementId);
  const entries = Object.entries(gradeData).filter(([, grade]) => grade);

  if (!entries.length) {
    const empty = document.createElement("dd");
    empty.textContent = "No grades entered";
    list.append(empty);
    return;
  }

  entries.forEach(([subject, grade]) => {
    const name = document.createElement("dt");
    const value = document.createElement("dd");
    name.textContent = subject;
    value.textContent = grade;
    list.append(name, value);
  });
}