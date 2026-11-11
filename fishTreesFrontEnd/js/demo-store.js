(function () {
  const storageKey = "fishTreesWorkflowV2";
  const stateVersion = 2;
  const gradeValues = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0, U: 0 };
  const accounts = {
    admin: { username: "admin", password: "admin123", role: "admin", displayName: "Presentation Administrator" },
    school: { username: "school", password: "school123", role: "school", displayName: "Presentation School" },
  };
  const pathways = [
    { code: "PCM", subjects: ["Physics", "Chemistry", "Mathematics"], interests: ["Technology and Computing", "Engineering and Innovation"], careers: "engineering, physical sciences, and technology", reason: "A science combination commonly considered for engineering, physical sciences, and technology." },
    { code: "PEM", subjects: ["Physics", "Economics", "Mathematics"], interests: ["Engineering and Innovation", "Business and Entrepreneurship"], careers: "engineering, economics, and quantitative business", reason: "Combines mathematical and physical sciences with economics." },
    { code: "PCB", subjects: ["Physics", "Chemistry", "Biology"], interests: ["Medicine and Healthcare"], careers: "health sciences, biological sciences, and related studies", reason: "A science combination commonly considered for biological and health-related studies." },
    { code: "BCM", subjects: ["Biology", "Chemistry", "Mathematics"], interests: ["Medicine and Healthcare", "Agriculture and Environmental Sciences", "Education and Research"], careers: "biological sciences, agriculture, and research", reason: "Combines biological and chemical sciences with mathematical study." },
    { code: "MEG", subjects: ["Mathematics", "Economics", "Geography"], interests: ["Business and Entrepreneurship", "Agriculture and Environmental Sciences"], careers: "business, economics, and geography-related studies", reason: "Connects quantitative study and economics with geography." },
    { code: "HEG", subjects: ["History", "Economics", "Geography"], interests: ["Law and Governance", "Education and Research", "Arts and Humanities"], careers: "law, governance, education, and social sciences", reason: "A humanities and social-sciences combination focused on societies, economies, and place." },
    { code: "HEL", subjects: ["History", "Economics", "English"], interests: ["Law and Governance", "Arts and Humanities", "Media and Communication"], careers: "law, humanities, communication, and social sciences", reason: "Combines humanities and social sciences with advanced literary study." },
  ];

  function readState() {
    let raw;
    try {
      raw = localStorage.getItem(storageKey);
    } catch (error) {
      throw new Error("Browser storage is unavailable. Open the site in a browser that allows local storage and try again.");
    }
    if (!raw) return { version: stateVersion, orders: [], feedback: [], account: null };
    try {
      const state = JSON.parse(raw);
      if (state.version !== stateVersion || !Array.isArray(state.orders) || !Array.isArray(state.feedback)) throw new Error();
      if (!Object.prototype.hasOwnProperty.call(state, "account")) state.account = null;
      return state;
    } catch (error) {
      throw new Error("Saved presentation data could not be read. Clear this site's browser data and reload.");
    }
  }

  function writeState(state) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      throw new Error("Could not save your request in this browser. Check available storage and try again.");
    }
  }

  function createId() {
    return `demo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function createIndividualOrder(profile) {
    requireSchoolAccount();
    return saveOrder({
      id: createId(),
      createdAt: new Date().toISOString(),
      mode: "individual",
      status: "pending",
      predictionCount: 1,
      profile,
      reports: [],
    });
  }

  function createBulkOrder(school, students) {
    requireSchoolAccount();
    return saveOrder({
      id: createId(),
      createdAt: new Date().toISOString(),
      mode: "bulk",
      status: "pending",
      predictionCount: students.length,
      school,
      students: students.map((student) => ({
        id: createId(),
        name: student.name,
        profile: { ...student, school, schools: [school] },
        reports: [],
      })),
    });
  }

  function saveOrder(order) {
    const state = readState();
    const account = requireSchoolAccount(state);
    order.reference = `FT-${createId().slice(-6).toUpperCase()}`;
    order.createdByRole = account.role;
    order.createdByUsername = account.username;
    state.orders.unshift(order);
    writeState(state);
    return order;
  }

  function getOrder(id) {
    if (!id) return null;
    const state = readState();
    const account = requireSchoolAccount(state);
    return state.orders.find((order) => order.id === id && ownsOrder(order, account)) || null;
  }

  function getOrders() {
    const state = readState();
    const account = state.account;
    if (!account || !["school", "admin"].includes(account.role)) {
      throw new Error("Sign in with an administrator or school account to view requests.");
    }
    return account.role === "admin"
      ? state.orders
      : state.orders.filter((order) => ownsOrder(order, account));
  }

  function completeRequest(id) {
    const state = readState();
    const account = requireSchoolAccount(state);
    const order = state.orders.find((item) => item.id === id && ownsOrder(item, account));
    if (!order) throw new Error("This request could not be found. Start again from your account workspace.");
    if (order.status === "pending") {
      order.status = "completed";
      if (order.mode === "individual") {
        order.predictionId = createId();
        order.reports = createReports(order.profile);
      } else {
        order.students.forEach((student) => {
          student.reports = createReports(student.profile);
        });
      }
      writeState(state);
    }
    return order;
  }

  function signIn(role, username, password) {
    const account = accounts[role];
    if (!account || account.username !== username.trim().toLowerCase() || account.password !== password) {
      throw new Error("The username or password does not match this account.");
    }
    const state = readState();
    state.account = { role: account.role, displayName: account.displayName, username: account.username };
    writeState(state);
    return state.account;
  }

  function getAccount() {
    return readState().account || null;
  }

  function requireSchoolAccount(state) {
    const account = (state || readState()).account;
    if (!account || account.role !== "school") {
      throw new Error("Sign in with a school account to manage recommendation requests.");
    }
    return account;
  }

  function ownsOrder(order, account) {
    return order.createdByRole === account.role && order.createdByUsername === account.username;
  }

  function signOut() {
    const state = readState();
    state.account = null;
    writeState(state);
  }

  function saveFeedback(predictionId, feedback) {
    const state = readState();
    requireSchoolAccount(state);
    state.feedback.push({ predictionId, ...feedback, createdAt: new Date().toISOString() });
    writeState(state);
  }

  function createReports(profile) {
    const selectedInterests = Array.isArray(profile.interests) ? profile.interests : [];
    const grades = { ...(profile.oLevelResults || {}) };
    Object.entries(profile.mockResults || {}).forEach(([subject, grade]) => {
      if (grade && !grades[subject]) grades[subject] = grade;
    });
    const reports = (Array.isArray(profile.schools) && profile.schools.length ? profile.schools : [profile.school || "Your school"])
      .map((school) => {
        const ranked = pathways.map((pathway, index) => {
          const subjectGrades = pathway.subjects.map((subject) => gradeValues[grades[subject]]).filter((value) => value !== undefined);
          const gradeFit = subjectGrades.length ? subjectGrades.reduce((sum, value) => sum + value, 0) / subjectGrades.length / 5 : 0.6;
          const matchedInterests = selectedInterests.filter((interest) => pathway.interests.includes(interest)).length;
          const interestFit = selectedInterests.length ? matchedInterests / selectedInterests.length : 0.5;
          return {
            pathway,
            index,
            score: Math.max(60, Math.min(98, Math.round(58 + gradeFit * 23 + interestFit * 18))),
            matchedInterests,
            gradeCount: subjectGrades.length,
          };
        }).sort((left, right) => right.score - left.score || right.matchedInterests - left.matchedInterests || left.index - right.index);
        return {
          school,
          availabilityNote: `Common combinations to discuss with ${school}. Confirm which combinations the school currently offers.`,
          recommendations: ranked.slice(0, 3).map(({ pathway, score, matchedInterests, gradeCount }, index) => ({
            rank: index + 1,
            code: pathway.code,
            subjects: pathway.subjects,
            score,
            career: `Possible study directions include ${pathway.careers}.`,
            reason: matchedInterests
              ? `${pathway.reason} It also matches ${matchedInterests} of your selected interest area${matchedInterests === 1 ? "" : "s"}.`
              : gradeCount
                ? `${pathway.reason} Your entered grades were considered in this illustrative match.`
                : pathway.reason,
          })),
          cautions: [],
        };
      });
    return reports;
  }

  window.FishTreesDemo = {
    createIndividualOrder,
    createBulkOrder,
    getOrder,
    getOrders,
    signIn,
    getAccount,
    signOut,
    completeRequest,
    saveFeedback,
  };
})();
