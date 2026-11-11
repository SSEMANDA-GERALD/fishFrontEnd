let exportRows = [];

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("exportResults").addEventListener("click", () => window.print());
  document.getElementById("exportResultsExcel").addEventListener("click", exportExcel);
  document.getElementById("feedbackForms").addEventListener("submit", submitFeedback);
  loadDemoOrder();
});

function loadDemoOrder() {
  const empty = document.getElementById("emptyResults");
  const message = document.getElementById("resultsEmptyMessage");
  const orderId = new URLSearchParams(window.location.search).get("order");
  try {
    const order = window.FishTreesDemo.getOrder(orderId);
    if (!order) {
      empty.hidden = false;
      return;
    }
    if (order.status !== "demo-paid") {
      message.textContent = "Complete the simulated payment to view this sample report.";
      empty.hidden = false;
      return;
    }
    empty.hidden = true;
    document.getElementById("resultsContent").hidden = false;
    exportRows = [];
    if (order.mode === "individual") renderIndividualReport(order);
    else renderBulkReport(order);
    document.getElementById("resultsStatus").textContent = "Presentation demo: recommendations are illustrative and stored only in this browser.";
  } catch (error) {
    message.textContent = error.message;
    empty.hidden = false;
  }
}

function renderIndividualReport(order) {
  const profile = order.profile || {};
  document.getElementById("resultSchool").textContent = (profile.schools || []).join(", ") || "Not provided";
  document.getElementById("resultAspiration").textContent = profile.aspiration || "Not provided";
  document.getElementById("resultInterests").textContent = (profile.interests || []).join(", ") || "None selected";
  renderGrades("oLevelSummary", profile.oLevelResults || {});
  renderGrades("mockSummary", profile.mockResults || {});
  order.reports.forEach((report) => renderSchoolReport(report, document.getElementById("schoolReports"), "Individual report"));
  if (order.predictionId) document.getElementById("feedbackForms").append(createFeedbackForm(order.predictionId));
}

function renderBulkReport(order) {
  document.querySelector(".profile-strip").hidden = true;
  document.querySelector(".grades-details").hidden = true;
  const container = document.getElementById("schoolReports");
  order.students.forEach((student) => {
    const section = document.createElement("section");
    section.className = "bulk-student-report";
    const title = document.createElement("h2");
    title.textContent = student.name;
    section.append(title);
    student.reports.forEach((report) => renderSchoolReport(report, section, student.name));
    section.append(renderGradeDetails(student.profile));
    container.append(section);
    document.getElementById("feedbackForms").append(createFeedbackForm(student.id));
  });
}

function renderSchoolReport(report, container, studentName) {
  const section = document.createElement("section");
  section.className = "school-report";
  const heading = document.createElement("div");
  heading.className = "school-report-heading";
  const title = document.createElement("h2");
  title.textContent = report.school;
  const availability = document.createElement("p");
  availability.textContent = report.availabilityNote;
  heading.append(title, availability);
  const subheading = document.createElement("h3");
  subheading.className = "report-subheading";
  subheading.textContent = "Ranked recommendations";
  const list = document.createElement("div");
  list.className = "pathway-list";

  report.recommendations.forEach((pathway) => {
    list.append(createPathway(pathway));
    exportRows.push({
      Student: studentName, School: report.school, Rank: pathway.rank, Combination: pathway.code,
      Subjects: pathway.subjects.join(", "), "Fit score": pathway.score, "Career directions": pathway.career, Reason: pathway.reason,
    });
  });
  section.append(heading, subheading, list);

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
      exportRows.push({
        Student: studentName, School: report.school, Rank: "Review", Combination: item.code,
        Subjects: item.subjects.join(", "), "Fit score": "", "Career directions": "", Reason: item.reason,
      });
    });
    section.append(cautions);
  }
  container.append(section);
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

function createFeedbackForm(predictionId) {
  const form = document.createElement("form");
  form.className = "feedback-form";
  form.dataset.predictionId = predictionId;
  const heading = document.createElement("h3");
  heading.textContent = "How satisfied are you with these recommendations?";
  const ratingLabel = document.createElement("label");
  ratingLabel.textContent = "Satisfaction rating";
  const rating = document.createElement("select");
  rating.name = "rating";
  rating.required = true;
  rating.innerHTML = '<option value="">Choose 1 to 5</option><option value="1">1 - Not satisfied</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5 - Very satisfied</option>';
  ratingLabel.append(rating);
  const helpfulLabel = document.createElement("label");
  helpfulLabel.className = "feedback-check";
  helpfulLabel.innerHTML = '<input name="helpful" type="checkbox"> These recommendations are useful to me';
  const commentLabel = document.createElement("label");
  commentLabel.textContent = "What should we improve? (optional)";
  const comment = document.createElement("textarea");
  comment.name = "comment";
  comment.maxLength = 1200;
  comment.rows = 3;
  commentLabel.append(comment);
  const consentLabel = document.createElement("label");
  consentLabel.className = "feedback-check";
  consentLabel.innerHTML = '<input name="keepInBrowser" type="checkbox"> I agree to keep this feedback in this browser';
  const submit = document.createElement("button");
  submit.className = "account-primary";
  submit.type = "submit";
  submit.textContent = "Send feedback";
  const status = document.createElement("p");
  status.className = "feedback-status";
  status.setAttribute("role", "status");
  form.append(heading, ratingLabel, helpfulLabel, commentLabel, consentLabel, submit, status);
  return form;
}

function submitFeedback(event) {
  if (!event.target.matches(".feedback-form")) return;
  event.preventDefault();
  const form = event.target;
  const data = new FormData(form);
  const status = form.querySelector(".feedback-status");
  try {
    window.FishTreesDemo.saveFeedback(form.dataset.predictionId, {
      rating: Number(data.get("rating")),
      helpful: data.has("helpful"),
      comment: String(data.get("comment") || ""),
      keepInBrowser: data.has("keepInBrowser"),
    });
    status.textContent = "Thank you. This feedback is saved only in this browser and is not sent to FishTrees.";
    form.querySelector('button[type="submit"]').disabled = true;
  } catch (error) {
    status.textContent = error.message;
  }
}

function renderGradeDetails(profile) {
  const details = document.createElement("details");
  details.className = "grades-details";
  const summary = document.createElement("summary");
  summary.textContent = "Entered grades";
  const tables = document.createElement("div");
  tables.className = "grades-tables";
  tables.append(createGradeTable("Final examinations", profile.oLevelResults || {}));
  tables.append(createGradeTable("Mock examinations", profile.mockResults || {}));
  details.append(summary, tables);
  return details;
}

function createGradeTable(title, gradeData) {
  const section = document.createElement("div");
  const heading = document.createElement("h3");
  heading.textContent = title;
  const list = document.createElement("dl");
  appendGrades(list, gradeData);
  section.append(heading, list);
  return section;
}

function renderGrades(elementId, gradeData) {
  appendGrades(document.getElementById(elementId), gradeData);
}

function appendGrades(list, gradeData) {
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

function exportExcel() {
  if (!exportRows.length) return;
  if (typeof XLSX === "undefined") {
    document.getElementById("resultsStatus").textContent = "Excel export needs an internet connection to load the spreadsheet library. Use Export as PDF / Print instead.";
    return;
  }
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(exportRows), "Recommendations");
  XLSX.writeFile(workbook, "fishtrees-recommendations.xlsx");
}