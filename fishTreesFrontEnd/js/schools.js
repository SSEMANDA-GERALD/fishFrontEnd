const subjects = [
  "Mathematics", "English", "Physics", "Chemistry", "Biology",
  "Geography", "History", "Economics", "Computer Studies"
];

let lastBatch = null;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("bulkForm").addEventListener("submit", importResults);
  document.getElementById("downloadTemplate").addEventListener("click", downloadTemplate);
  document.getElementById("exportExcel").addEventListener("click", exportExcel);
  document.getElementById("exportPdf").addEventListener("click", exportPdf);
});

async function importResults(event) {
  event.preventDefault();
  const file = document.getElementById("studentFile").files[0];
  const school = document.getElementById("schoolName").value.trim();
  const status = document.getElementById("uploadStatus");
  const submitButton = document.getElementById("generateReports");

  if (!file || !school) return;
  lastBatch = null;
  document.getElementById("batchSection").hidden = true;
  document.getElementById("batchResults").replaceChildren();
  status.classList.remove("success");
  status.textContent = "Reading student results...";
  submitButton.disabled = true;

  try {
    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "", raw: false });
    const parsedRows = rows.map((row, index) => ({ student: toStudent(row), rowNumber: index + 2 }))
      .filter(({ student }) => student.name || Object.keys(student.oLevelResults).length || student.interests.length);
    if (!parsedRows.length) throw new Error("No student rows found. Check the first worksheet and its column headings.");
    const invalidRow = parsedRows.find(({ student }) => !student.name || !Object.keys(student.oLevelResults).length);
    if (invalidRow) throw new Error(`Row ${invalidRow.rowNumber} needs a student name and at least one final grade.`);
    const students = parsedRows.map(({ student }) => student);

    status.textContent = `Generating reports for ${students.length} students...`;
    const response = await fetch("/api/recommendations/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ school, students })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "The recommendation service could not process this file.");

    lastBatch = result;
    renderBatch(result);
    status.textContent = `${result.students.length} student reports are ready.`;
    status.classList.add("success");
  } catch (error) {
    status.textContent = error.message || "Could not read the file. Check that it is a valid CSV or Excel workbook.";
  } finally {
    submitButton.disabled = false;
  }
}

function toStudent(row) {
  const normalized = new Map(Object.entries(row).map(([key, value]) => [normalizeHeader(key), value]));
  const name = findValue(normalized, ["studentname", "name", "fullname", "learnername"]);
  const interests = String(findValue(normalized, ["interests", "interest", "interestclusters"]) || "")
    .split(/[,;|]/).map((value) => value.trim()).filter(Boolean);
  const oLevelResults = {};
  const mockResults = {};

  subjects.forEach((subject) => {
    const key = normalizeHeader(subject);
    const aliases = subject === "Mathematics" ? [key, "math", "maths"]
      : subject === "English" ? [key, "englishlanguage", "literatureinenglish"]
        : subject === "Computer Studies" ? [key, "computerstudies", "computing"] : [key];
    const finalValue = findValue(normalized, aliases.flatMap((alias) => [alias, `final${alias}`, `finalexam${alias}`]));
    const mockValue = findValue(normalized, aliases.flatMap((alias) => [`mock${alias}`, `mockexam${alias}`]));
    if (finalValue !== "" && finalValue != null) oLevelResults[subject] = String(finalValue).trim().toUpperCase();
    if (mockValue !== "" && mockValue != null) mockResults[subject] = String(mockValue).trim().toUpperCase();
  });

  return { name: String(name || "").trim(), interests, oLevelResults, mockResults };
}

function normalizeHeader(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findValue(values, keys) {
  for (const key of keys) {
    if (values.has(key) && values.get(key) !== "") return values.get(key);
  }
  return "";
}

function renderBatch(batch) {
  const section = document.getElementById("batchSection");
  const list = document.getElementById("batchResults");
  document.getElementById("batchTitle").textContent = batch.school;
  document.getElementById("batchCount").textContent = `${batch.students.length} student reports`;
  list.replaceChildren();

  batch.students.forEach((student) => {
    const report = document.createElement("details");
    report.className = "student-report";
    const summary = document.createElement("summary");
    const name = document.createElement("span");
    name.className = "student-name";
    name.textContent = student.name;
    const topFit = document.createElement("span");
    topFit.className = "student-top-fit";
    const schoolReport = student.reports[0];
    const top = schoolReport.recommendations[0];
    topFit.textContent = top ? `Top fit: ${top.code} (${top.score}%)` : "No pathway ranked";
    summary.append(name, topFit);

    const body = document.createElement("div");
    body.className = "student-report-body";
    schoolReport.recommendations.forEach((pathway) => body.append(createPathway(pathway)));
    if (schoolReport.cautions.length) {
      const caution = document.createElement("section");
      caution.className = "student-pathway";
      const title = document.createElement("h3");
      title.textContent = "Lower-priority options to review";
      caution.append(title);
      schoolReport.cautions.forEach((item) => {
        const note = document.createElement("p");
        note.textContent = `${item.code} (${item.subjects.join(", ")}): ${item.reason}`;
        caution.append(note);
      });
      body.append(caution);
    }
    report.append(summary, body);
    list.append(report);
  });
  section.hidden = false;
  section.scrollIntoView({ behavior: "smooth", block: "start" });
}

function createPathway(pathway) {
  const item = document.createElement("section");
  item.className = "student-pathway";
  const title = document.createElement("h3");
  title.textContent = `#${pathway.rank} ${pathway.code} - ${pathway.score}% fit`;
  const subjectsText = document.createElement("p");
  subjectsText.textContent = `Study: ${pathway.subjects.join(", ")}`;
  const career = document.createElement("p");
  career.textContent = `Could lead toward: ${pathway.career}`;
  const reason = document.createElement("p");
  reason.textContent = `Why: ${pathway.reason}`;
  item.append(title, subjectsText, career, reason);
  return item;
}

function downloadTemplate() {
  const headers = ["student_name", "interests", ...subjects.map((subject) => `final_${normalizeHeader(subject)}`), ...subjects.map((subject) => `mock_${normalizeHeader(subject)}`)];
  const example = ["Sample Student", "Technology and Computing; Engineering and Innovation", "A", "B", "A", "B", "C", "B", "C", "B", "A", "A", "B", "B", "C", "", "", "", "", ""];
  const csv = [headers, example].map((row) => row.map(escapeCsv).join(",")).join("\r\n");
  downloadFile("fishtrees-student-template.csv", "text/csv;charset=utf-8", csv);
}

function escapeCsv(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function exportExcel() {
  if (!lastBatch) return;
  const rows = [];
  lastBatch.students.forEach((student) => {
    const report = student.reports[0];
    report.recommendations.forEach((pathway) => rows.push({
      Student: student.name, School: report.school, Rank: pathway.rank, Combination: pathway.code,
      Subjects: pathway.subjects.join(", "), "Fit score": pathway.score, "Career directions": pathway.career, Reason: pathway.reason
    }));
    report.cautions.forEach((item) => rows.push({
      Student: student.name, School: report.school, Rank: "Review", Combination: item.code,
      Subjects: item.subjects.join(", "), "Fit score": "", "Career directions": "", Reason: item.reason
    }));
  });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), "Recommendations");
  XLSX.writeFile(workbook, "fishtrees-school-reports.xlsx");
}

function exportPdf() {
  if (!lastBatch) return;
  document.querySelectorAll(".student-report").forEach((report) => { report.open = true; });
  window.print();
}

function downloadFile(filename, type, content) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([content], { type }));
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}