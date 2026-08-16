// ============================================================
// Shared config + data layer + theme logic, used by both
// index.html (public site) and admin.html (admin dashboard).
//
// Leave APPS_SCRIPT_URL empty to run on localStorage as a mock
// database (works immediately, including on GitHub Pages).
// Paste your deployed Google Apps Script Web App URL below to
// switch both pages over to a Google Sheets backend.
// See Code.gs + README.md for the backend setup.
// ============================================================
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwRSS609PVlQOr_sHagURrOemnI5Z1RWo6NWBbTkk4WF_fRS8HNnh3pXM8CwC2wPYEo/exec";

const STORAGE_KEY = "portfolio_messages";
const THEME_KEY = "portfolio_theme";
const ADMIN_SESSION_KEY = "portfolio_admin_session";

// Only used when APPS_SCRIPT_URL is empty (local demo mode).
// Client-side password checks are NOT secure — anyone can read this
// in view-source. Once APPS_SCRIPT_URL is set, the password check
// happens server-side in Code.gs instead.
const DEMO_ADMIN_PASSWORD = "admin123";

// ---------------- Data layer ----------------
const DB = {
    async list() {
        if (APPS_SCRIPT_URL) {
            const res = await fetch(`${APPS_SCRIPT_URL}?action=list`);
            const data = await res.json();
            return data.messages || [];
        }
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    },
    async add(entry) {
        if (APPS_SCRIPT_URL) {
            await fetch(APPS_SCRIPT_URL, {
                method: "POST",
                // text/plain avoids a CORS preflight that Apps Script can't answer
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({ action: "add", ...entry }),
            });
            return;
        }
        const messages = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        messages.push(entry);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    },
    async login(password) {
        if (APPS_SCRIPT_URL) {
            const res = await fetch(`${APPS_SCRIPT_URL}?action=login&password=${encodeURIComponent(password)}`);
            const data = await res.json();
            return !!data.success;
        }
        return password === DEMO_ADMIN_PASSWORD;
    }
};

// ---------------- Theme (shared across both pages) ----------------
function applyTheme(theme, { animate = false } = {}) {
    const root = document.documentElement;
    const themeLabel = document.getElementById("theme-label");
    const scanOverlay = document.getElementById("scan-overlay");
    root.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
    if (themeLabel) themeLabel.textContent = theme === "dark" ? "Dark" : "Light";
    if (animate && scanOverlay) {
        scanOverlay.classList.remove("run");
        void scanOverlay.offsetWidth; // restart animation
        scanOverlay.classList.add("run");
    }
}

function initThemeToggle() {
    const savedTheme = localStorage.getItem(THEME_KEY) ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    applyTheme(savedTheme);

    const themeBtn = document.getElementById("toggle-theme");
    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
            applyTheme(next, { animate: true });
        });
    }
}

// ---------------- Small helpers ----------------
function formatTimestamp(ts) {
    const d = new Date(ts);
    return isNaN(d) ? String(ts) : d.toLocaleString();
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : str;
    return div.innerHTML;
}