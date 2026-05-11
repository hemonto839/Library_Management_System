// ─── API Helper ───────────────────────────────────────────────────────────────
// All requests go through api.request() which automatically attaches the JWT
// token from localStorage and throws a unified error object on failure.

const api = {
    async request(method, url, body = null) {
        const headers = { "Content-Type": "application/json" };
        const token = localStorage.getItem("lms_token");
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const opts = { method, headers };
        if (body) opts.body = JSON.stringify(body);

        const res = await fetch(url, opts);
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            const err = new Error(data.message || "Request failed");
            err.status = res.status;
            throw err;
        }
        return data;
    },

    get:    (url)       => api.request("GET",    url),
    post:   (url, body) => api.request("POST",   url, body),
    put:    (url, body) => api.request("PUT",    url, body),
    delete: (url)       => api.request("DELETE", url),
};

// ─── JWT decoder (no library needed) ──────────────────────────────────────────
function parseJWT(token) {
    try {
        const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        return JSON.parse(atob(b64));
    } catch { return null; }
}

// ─── Auth helpers ──────────────────────────────────────────────────────────────
function getToken()   { return localStorage.getItem("lms_token"); }
function getUser()    { const t = getToken(); return t ? parseJWT(t) : null; }
function saveAuth(token) { localStorage.setItem("lms_token", token); }
function clearAuth() { localStorage.removeItem("lms_token"); }

function requireAuth(allowedRoles = []) {
    const user = getUser();
    if (!user) { location.href = "/index.html"; return null; }
    if (allowedRoles.length && !allowedRoles.includes(user.role)) {
        location.href = "/index.html"; return null;
    }
    return user;
}

// ─── Toast notifications ───────────────────────────────────────────────────────
function showToast(msg, type = "info", duration = 3500) {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.className = "toast-container";
        document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    const icons = { success: "✅", error: "❌", info: "ℹ️" };
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${icons[type] || "ℹ️"}</span><span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add("leaving");
        setTimeout(() => toast.remove(), 300);
    }, duration);
}
