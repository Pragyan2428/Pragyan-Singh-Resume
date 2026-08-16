
initThemeToggle();

// ---------------- Contact form ----------------
const contactForm = document.getElementById("contact-form");
const contactStatus = document.getElementById("contact-status");

function showStatus(el, message, ok) {
    el.textContent = message;
    el.classList.remove("ok", "err");
    el.classList.add("show", ok ? "ok" : "err");
}

contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();
    if (!name || !email || !message) {
        showStatus(contactStatus, "Please fill in every field.", false);
        return;
    }
    const entry = { name, email, message, timestamp: new Date().toISOString() };
    try {
        await DB.add(entry);
        showStatus(contactStatus, "Message sent — thank you! I'll get back to you soon.", true);
        contactForm.reset();
    } catch (err) {
        showStatus(contactStatus, "Something went wrong sending your message. Please try again.", false);
    }
});
