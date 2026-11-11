document.addEventListener("DOMContentLoaded", () => {
  const role = document.getElementById("role");
  const organizationField = document.getElementById("organizationField");
  const typeField = document.getElementById("institutionTypeField");
  const organizationName = document.getElementById("organizationName");
  const institutionType = document.getElementById("institutionType");
  const updateFields = () => {
    const institution = role.value !== "student";
    organizationField.hidden = !institution;
    typeField.hidden = !institution;
    organizationName.required = institution;
    institutionType.required = institution;
  };
  role.addEventListener("change", updateFields);
  updateFields();

  document.getElementById("signupForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const status = document.getElementById("signupStatus");
    try {
      const result = await fishTreesApi("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          role: role.value,
          organizationName: organizationName.value.trim(),
          institutionType: institutionType.value,
          displayName: document.getElementById("displayName").value.trim(),
          username: document.getElementById("username").value.trim(),
          email: document.getElementById("email").value.trim(),
          password: document.getElementById("password").value,
        }),
      });
      status.textContent = result.message;
      form.reset();
      updateFields();
    } catch (error) {
      status.textContent = error.message;
    }
  });
});