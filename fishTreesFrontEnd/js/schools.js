const subjects = [
  "Mathematics", "English", "Physics", "Chemistry", "Biology",
  "Geography", "History", "Economics", "Computer Studies"
];

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("bulkForm");
  const status = document.getElementById("uploadStatus");
  let account;
  try {
    account = window.FishTreesDemo.getAccount();
  } catch (error) {
    form.hidden = true;
    status.textContent = error.message;
    return;
  }
  if (!account) {
    window.location.replace("signin.html");
    return;
  }
  if (!["school", "admin"].includes(account.role)) {
    form.hidden = true;
    status.textContent = "Sign in with a school or administrator account to use bulk predictions.";
    return;
  }

  document.getElementById("bulkForm").addEventListener("submit", importResults);
  document.getElementById("downloadTemplate").addEventListener("click", downloadTemplate);
  document.getElementById("activeSchoolName").textContent = account.displayName;
});

async function importResults(event) {
  event.preventDefault();
  const file = document.getElementById("studentFile").files[0];
  const status = document.getElementById("uploadStatus");
  const submitButton = document.getElementById("generateReports");

  if (!file) return;
  status.classList.remove("success");
  status.textContent = "Reading student results...";
  submitButton.disabled = true;

  try {
    const rows = await readStudentRows(file);
    const parsedRows = rows.map((row, index) => ({ student: toStudent(row), rowNumber: index + 2 }))
      .filter(({ student }) => student.name || Object.keys(student.oLevelResults).length || student.interests.length);
    if (!parsedRows.length) throw new Error("No student rows found. Check the first worksheet and its column headings.");
    const invalidRow = parsedRows.find(({ student }) => !student.name || !Object.keys(student.oLevelResults).length);
    if (invalidRow) throw new Error(`Row ${invalidRow.rowNumber} needs a student name and at least one final grade.`);
    const allowedGrades = new Set(["A", "B", "C", "D", "E", "F", "U"]);
    const invalidGradeRow = parsedRows.find(({ student }) => [...Object.values(student.oLevelResults), ...Object.values(student.mockResults)]
      .some((grade) => !allowedGrades.has(grade)));
    if (invalidGradeRow) throw new Error(`Row ${invalidGradeRow.rowNumber} contains an invalid grade. Use A, B, C, D, E, F, or U.`);
    const students = parsedRows.map(({ student }) => student);

    const school = document.getElementById("schoolName").value.trim() || "School cohort";
    const order = window.FishTreesDemo.createBulkOrder(school, students);
    window.location.href = `payment.html?order=${encodeURIComponent(order.id)}`;
  } catch (error) {
    status.textContent = error.message || "Could not read the file. Check that it is a valid CSV or Excel workbook.";
  } finally {
    submitButton.disabled = false;
  }
}

async function readStudentRows(file) {
  if (typeof XLSX !== "undefined") {
    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(worksheet, { defval: "", raw: false });
  }
  if (!file.name.toLowerCase().endsWith(".csv")) {
    throw new Error("Excel import needs an internet connection to load the spreadsheet library. Use a CSV file instead.");
  }
  return parseCsv(await file.text());
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"' && field === "") {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n" || character === "\r") {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(field);
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }
  if (quoted) throw new Error("The CSV has an unclosed quoted field.");
  row.push(field);
  if (row.some((cell) => cell.trim())) rows.push(row);
  if (rows.length < 2) throw new Error("The CSV needs a header row and at least one student row.");

  const headers = rows[0].map((header) => String(header).replace(/^\uFEFF/, "").trim());
  return rows.slice(1).map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] || ""])));
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

function downloadTemplate() {
  const headers = ["student_name", "interests", ...subjects.map((subject) => `final_${normalizeHeader(subject)}`), ...subjects.map((subject) => `mock_${normalizeHeader(subject)}`)];
  const example = ["Sample Student", "Technology and Computing; Engineering and Innovation", "A", "B", "A", "B", "C", "B", "C", "B", "A", "A", "B", "B", "C", "", "", "", "", ""];
  const csv = [headers, example].map((row) => row.map(escapeCsv).join(",")).join("\r\n");
  downloadFile("fishtrees-student-template.csv", "text/csv;charset=utf-8", csv);
}

function escapeCsv(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function downloadFile(filename, type, content) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([content], { type }));
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}