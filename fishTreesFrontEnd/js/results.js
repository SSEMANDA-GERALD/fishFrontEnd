document.addEventListener("DOMContentLoaded", () => {
  const emptyResults = document.getElementById("emptyResults");
  const resultsContent = document.getElementById("resultsContent");
  let profile;

  try {
    profile = JSON.parse(localStorage.getItem("fishTreesRecommendation"));
  } catch {
    profile = null;
  }

  if (!profile || !Array.isArray(profile.reports) || !profile.reports.length) {
    emptyResults.hidden = false;
    return;
  }

  resultsContent.hidden = false;
  document.getElementById("resultSchool").textContent = (profile.schools || [profile.school]).filter(Boolean).join(", ") || "Not provided";
  document.getElementById("resultAspiration").textContent = profile.aspiration || "Not provided";
  document.getElementById("resultInterests").textContent = profile.interests?.join(", ") || "None selected";
  renderSchoolReports(profile.reports);
  renderGrades("oLevelSummary", profile.oLevelResults || {});
  renderGrades("mockSummary", profile.mockResults || {});
  document.getElementById("exportResults").addEventListener("click", () => {
    document.querySelectorAll(".grades-details").forEach((details) => { details.open = true; });
    window.print();
  });
});

function renderSchoolReports(reports) {
  const container = document.getElementById("schoolReports");
  reports.forEach((report) => {
    const section = document.createElement("section");
    section.className = "school-report";
    const header = document.createElement("div");
    header.className = "school-report-heading";
    const title = document.createElement("h2");
    title.textContent = report.school;
    const availability = document.createElement("p");
    availability.textContent = report.availabilityNote;
    header.append(title, availability);

    const heading = document.createElement("h3");
    heading.className = "report-subheading";
    heading.textContent = "Ranked recommendations";
    const list = document.createElement("div");
    list.className = "pathway-list";
    report.recommendations.forEach((pathway) => list.append(createPathway(pathway)));
    section.append(header, heading, list);

    if (report.cautions.length) {
      const cautions = document.createElement("section");
      cautions.className = "caution-section";
      const cautionHeading = document.createElement("h3");
      cautionHeading.textContent = "Lower-priority options to review carefully";
      cautions.append(cautionHeading);
      report.cautions.forEach((item) => {
        const note = document.createElement("p");
        note.textContent = `${item.code} (${item.subjects.join(", ")}): ${item.reason}`;
        cautions.append(note);
      });
      section.append(cautions);
    }
    container.append(section);
  });
}

function createPathway(pathway) {
  const item = document.createElement("article");
  item.className = "pathway-item";
  const rank = document.createElement("span");
  rank.className = "pathway-rank";
  rank.textContent = `#${pathway.rank}`;
  const details = document.createElement("div");
  details.className = "pathway-details";
  const title = document.createElement("h4");
  title.textContent = pathway.code;
  const subjects = document.createElement("p");
  subjects.className = "subject-list";
  subjects.textContent = pathway.subjects.join(", ");
  const careerLabel = document.createElement("strong");
  careerLabel.textContent = "What you could become";
  const career = document.createElement("p");
  career.textContent = pathway.career;
  const reasonLabel = document.createElement("strong");
  reasonLabel.textContent = "Why this was recommended";
  const reason = document.createElement("p");
  reason.textContent = pathway.reason;
  details.append(title, subjects, careerLabel, career, reasonLabel, reason);

  const score = document.createElement("span");
  score.className = "pathway-score";
  score.textContent = `${pathway.score}% fit`;
  item.append(rank, details, score);
  return item;
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