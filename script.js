// ================= SAFE ELEMENT GETTER =================

document.documentElement.classList.add("js");

function safe(el) {
  return el !== null && el !== undefined;
}

// ================= DOM =================
const burgerBtn = document.getElementById("burgerBtn");
const navLinks = document.getElementById("navLinks");
const navOverlay = document.getElementById("navOverlay");
const navbar = document.getElementById("navbar");
const tabBtns = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");
const rsvpSubmit = document.getElementById("rsvpSubmitBtn");
const msgSubmit = document.getElementById("msgSubmitBtn");
const toast = document.getElementById("toast");
const toastMsg = document.getElementById("toastMsg");

// ================= TOAST =================
let toastTimer;

function showToast(message, type = "success") {
  if (!safe(toast) || !safe(toastMsg)) return;

  clearTimeout(toastTimer);
  toastMsg.textContent = message;

  toast.classList.remove("error");
  if (type === "error") toast.classList.add("error");

  toast.classList.add("visible");
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 4000);
}

// ================= SCROLL REVEAL =================
const reveals = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15
  });

  reveals.forEach(el => observer.observe(el));
} else {
  // Fallback (older browsers)
  reveals.forEach(el => el.classList.add("visible"));
}

// ================= TABS =================
if (tabBtns.length && tabPanels.length) {
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;

      tabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      tabPanels.forEach(panel => panel.classList.remove("active"));

      const targetPanel = document.getElementById(`tab-${target}`);
      if (safe(targetPanel)) targetPanel.classList.add("active");
    });
  });
}

// ================= RSVP =================
const rsvpForm = document.getElementById("rsvpForm");

if (safe(rsvpForm)) {
  rsvpForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const attendance = document.querySelector('input[name="attendance"]:checked');
    const declineMessageEl = document.getElementById("decline-message");
    const declineMessage = declineMessageEl ? declineMessageEl.value : "";

    if (!attendance) {
      showToast("Please select attendance", "error");
      return;
    }

    if (attendance.value === "not-attending" && declineMessage.trim() === "") {
      showToast("Please leave a message if declining", "error");
      return;
    }

    const formData = new FormData(rsvpForm);

    if (safe(rsvpSubmit)) {
      rsvpSubmit.disabled = true;
      rsvpSubmit.querySelector("span").textContent = "Sending...";
    }

    try {
      const res = await fetch(rsvpForm.action, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" }
      });

      if (res.ok) {
        showToast("RSVP sent 🎉");
        rsvpForm.reset();
      } else {
        showToast("Submission failed", "error");
      }
    } catch {
      showToast("Network error", "error");
    }

    if (safe(rsvpSubmit)) {
      rsvpSubmit.disabled = false;
      rsvpSubmit.querySelector("span").textContent = "Send RSVP";
    }
  });
}

// ================= MESSAGE =================
const msgForm = document.getElementById("msgForm");

if (safe(msgForm)) {
  msgForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(msgForm);

    if (safe(msgSubmit)) {
      msgSubmit.disabled = true;
      msgSubmit.querySelector("span").textContent = "Sending...";
    }

    try {
      const res = await fetch(msgForm.action, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" }
      });

      if (res.ok) {
        showToast("Message sent 💛");
        msgForm.reset();
      } else {
        showToast("Submission failed", "error");
      }
    } catch {
      showToast("Network error", "error");
    }

    if (safe(msgSubmit)) {
      msgSubmit.disabled = false;
      msgSubmit.querySelector("span").textContent = "Send Message";
    }
  });
}

// ================= DECLINE TOGGLE =================
const attendanceRadios = document.querySelectorAll('input[name="attendance"]');
const declineGroup = document.getElementById("decline-message-group");

if (attendanceRadios.length && safe(declineGroup)) {
  attendanceRadios.forEach(radio => {
    radio.addEventListener("change", () => {
      declineGroup.style.display =
        radio.value === "not-attending" && radio.checked
          ? "block"
          : "none";
    });
  });
}