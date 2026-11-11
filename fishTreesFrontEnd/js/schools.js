const subjects = [
  "Mathematics", "English", "Physics", "Chemistry", "Biology",
  "Geography", "History", "Economics", "Computer Studies"
];

document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("bulkForm").addEventListener("submit", importResults);
  document.getElementById("downloadTemplate").addEventListener("click", downloadTemplate);
  await checkInstitutionAccount();
});

async function checkInstitutionAccount() {
  const form = document.getElementById("bulkForm");
  const message = document.getElementById("schoolGateMessage");
  try {
    const { account } = await fishTreesApi("/api/auth/me");
    if (!account) throw Object.assign(new Error("Sign in with an approved school or institution account to upload a batch."), { status: 401 });
    document.getElementById("activeSchoolName").textContent = account.organizationName || account.displayName;
    if (["admin", "superadmin"].includes(account.role)) {
      document.getElementById("adminSchoolField").hidden = false;
      document.getElementById("adminSchoolName").required = true;
    }
    if (account.status !== "approved") {
      form.hidden = true;
      message.textContent = "This institution account is awaiting administrator approval.";
    } else if (!["school", "institution", "admin", "superadmin"].includes(account.role)) {
      form.hidden = true;
      message.textContent = "Bulk recommendations are available to approved institution accounts.";
    }
  } catch (error) {
    form.hidden = true;
    message.textContent = error.status === 401
      ? "Sign in with an approved school or institution account to upload a batch."
      : error.message;
    const signIn = document.createElement("a");
    signIn.href = "signin.html?next=schools.html";
    signIn.textContent = "Sign in";
    message.append(" ", signIn);
  }
}

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
    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "", raw: false });
    const parsedRows = rows.map((row, index) => ({ student: toStudent(row), rowNumber: index + 2 }))
      .filter(({ student }) => student.name || Object.keys(student.oLevelResults).length || student.interests.length);
    if (!parsedRows.length) throw new Error("No student rows found. Check the first worksheet and its column headings.");
    const invalidRow = parsedRows.find(({ student }) => !student.name || !Object.keys(student.oLevelResults).length);
    if (invalidRow) throw new Error(`Row ${invalidRow.rowNumber} needs a student name and at least one final grade.`);
    const students = parsedRows.map(({ student }) => student);

    status.textContent = `Creating a payment order for ${students.length} students...`;
    const result = await fishTreesApi("/api/payment-orders", {
      method: "POST",
      body: JSON.stringify({
        mode: "bulk",
        paymentMethod: "mobile-money",
        school: document.getElementById("adminSchoolName").value.trim(),
        students,
      })
    });
    window.location.href = `payment.html?order=${encodeURIComponent(result.order.id)}`;
  } catch (error) {
    if (error.status === 401) {
      window.location.href = "signin.html?next=schools.html";
      return;
    }
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