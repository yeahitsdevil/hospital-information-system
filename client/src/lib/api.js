const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
async function api(path, opts = {}) {
  const token = localStorage.getItem("his_token");
  const r = await fetch(API + path, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
      ...(token ? { Authorization: "Bearer " + token } : {}),
    },
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw Error(d.message || "Request failed");
  return d;
}


export { api, API };