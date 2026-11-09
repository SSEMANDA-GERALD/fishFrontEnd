const pathwayOptions = {
  "General starting point": {
    subjects: "Mathematics, Physics, Chemistry",
    reason: "A broad science combination to consider while you explore which subjects and careers interest you."
  },
  "Technology and Computing": {
    subjects: "Mathematics, Physics, Computer Studies",
    reason: "This combination explores logical problem-solving, physical systems, and computing foundations."
  },
  "Medicine and Healthcare": {
    subjects: "Biology, Chemistry, Mathematics",
    reason: "These subjects provide a science-focused starting point for exploring health-related study."
  },
  "Engineering and Innovation": {
    subjects: "Mathematics, Physics, Chemistry",
    reason: "This combination builds a foundation in quantitative reasoning and the physical sciences."
  },
  "Business and Entrepreneurship": {
    subjects: "Economics, Mathematics, Entrepreneurship",
    reason: "These areas introduce markets, quantitative thinking, and the development of business ideas."
  },
  "Agriculture and Environmental Sciences": {
    subjects: "Biology, Chemistry, Agriculture",
    reason: "This combination connects living systems and chemistry with practical agricultural study."
  },
  "Law and Governance": {
    subjects: "History, Literature in English, Economics",
    reason: "These subjects encourage evidence-based reading, argument, and understanding of societies."
  },
  "Education and Research": {
    subjects: "Biology, History, Literature in English",
    reason: "A broad subject mix can support exploration of teaching and research across disciplines."
  },
  "Arts and Humanities": {
    subjects: "Literature in English, History, Fine Art",
    reason: "These subjects offer ways to study ideas, culture, communication, and creative practice."
  },
  "Media and Communication": {
    subjects: "Literature in English, History, Fine Art",
    reason: "This combination supports written communication, cultural context, and visual storytelling."
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
  document.getElementById("testingNotice").hidden = new URLSearchParams(window.location.search).get("testing") !== "1";

  renderPathways(profile.interests || []);
  renderGrades("oLevelSummary", profile.oLevelResults || {});
  renderGrades("mockSummary", profile.mockResults || {});
});

function renderPathways(selectedInterests) {
  const list = document.getElementById("recommendationsList");
  const interests = selectedInterests.length ? selectedInterests : ["General starting point"];

  interests.forEach((interest) => {
    const option = pathwayOptions[interest];
    if (!option) return;

    const item = document.createElement("article");
    item.className = "pathway-item";

    const details = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = interest;
    const reason = document.createElement("p");
    reason.textContent = option.reason;
    details.append(title, reason);

    const subjects = document.createElement("p");
    subjects.className = "subject-list";
    subjects.textContent = option.subjects;
    item.append(details, subjects);
    list.append(item);
  });

  if (!list.childElementCount) {
    list.textContent = "No pathway matches were available. Return to your profile and select an interest to explore options.";
  }
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