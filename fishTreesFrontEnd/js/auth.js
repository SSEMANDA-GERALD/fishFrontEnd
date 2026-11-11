async function fishTreesApi(url, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const headers = new Headers(options.headers || {});
  if (method !== "GET" && method !== "HEAD") {
    const tokenResponse = await fetch("/api/csrf-token", { credentials: "same-origin" });
    if (!tokenResponse.ok) throw new Error("Could not start a secure request. Reload and try again.");
    const { csrfToken } = await tokenResponse.json();
    headers.set("X-CSRFToken", csrfToken);
  }
  if (options.body && !(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
  const response = await fetch(url, { ...options, method, headers, credentials: "same-origin" });
  const contentType = response.headers.get("content-type") || "";
  const result = contentType.includes("application/json") ? await response.json() : null;
  if (!response.ok) {
    const error = new Error(result?.error || `Request failed (${response.status}).`);
    error.status = response.status;
    error.result = result;
    throw error;
  }
  return result;
}

window.fishTreesApi = fishTreesApi;