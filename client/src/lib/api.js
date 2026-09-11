const API = import.meta.env.VITE_API_URL || "https://hospital-information-system-vv7p.onrender.com";
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