/* ============================================================
   CONFIGURATION
   ============================================================ */
const FORMSPREE_URL = "https://formspree.io/f/mbdqveyz";

/* ============================================================
   DOM REFERENCES
   ============================================================ */
const navbar              = document.getElementById("navbar");
const burgerBtn           = document.getElementById("burgerBtn");
const navLinks            = document.getElementById("navLinks");
const navOverlay          = document.getElementById("navOverlay");
const tabBtns             = document.querySelectorAll(".tab-btn");
const tabPanels           = document.querySelectorAll(".tab-panel");
const toast               = document.getElementById("toast");
const toastMsg            = document.getElementById("toastMsg");

// RSVP elements
const rsvpSubmitBtn       = document.getElementById("rsvpSubmitBtn");
const guestsInput         = document.getElementById("rsvp-guests");
const guestNamesGroup     = document.getElementById("guest-names-group");
const guestNamesContainer = document.getElementById("guest-names-container");
const attendanceRadios    = document.querySelectorAll('input[name="attendance"]');
const declineGroup        = document.getElementById("decline-group");

// Birthday message elements
const msgSubmitBtn        = document.getElementById("msgSubmitBtn");

/* ============================================================
   BURGER MENU
   ============================================================ */
function openMenu() {
  burgerBtn.classList.add("open");
  navLinks.classList.add("open");
  navOverlay.classList.add("visible");
  burgerBtn.setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";
}

function closeMenu() {
  burgerBtn.classList.remove("open");
  navLinks.classList.remove("open");
  navOverlay.classList.remove("visible");
  burgerBtn.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
}

burgerBtn.addEventListener("click", function () {
  navLinks.classList.contains("open") ? closeMenu() : openMenu();
});

navOverlay.addEventListener("click", closeMenu);

document.querySelectorAll("[data-close]").forEach(function (link) {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && navLinks.classList.contains("open")) closeMenu();
});

/* ============================================================
   NAVBAR SCROLL EFFECT
   ============================================================ */
window.addEventListener("scroll", function () {
  navbar.classList.toggle("scrolled", window.scrollY > 50);
}, { passive: true });

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
var revealObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      var siblings = Array.from(entry.target.parentElement.querySelectorAll(".reveal:not(.visible)"));
      var delay = siblings.indexOf(entry.target) * 80;
      setTimeout(function () {
        entry.target.classList.add("visible");
      }, delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

document.querySelectorAll(".reveal").forEach(function (el) {
  revealObserver.observe(el);
});

/* ============================================================
   TAB SWITCHER
   ============================================================ */
tabBtns.forEach(function (btn) {
  btn.addEventListener("click", function () {
    tabBtns.forEach(function (b) { b.classList.remove("active"); });
    btn.classList.add("active");
    tabPanels.forEach(function (panel) { panel.classList.remove("active"); });
    document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
    hideToast();
  });
});

/* ============================================================
   TOAST NOTIFICATIONS
   ============================================================ */
var toastTimer = null;

function showToast(message, type) {
  type = type || "success";
  clearTimeout(toastTimer);
  toastMsg.textContent = message;
  toast.classList.remove("error");
  if (type === "error") toast.classList.add("error");
  toast.querySelector(".toast-icon").textContent = type === "success" ? "✓" : "✕";
  toast.classList.add("visible");
  toastTimer = setTimeout(hideToast, 5000);
}

function hideToast() {
  toast.classList.remove("visible");
}

/* ============================================================
   EMAIL VALIDATION
   ============================================================ */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/* ============================================================
   DYNAMIC GUEST NAME FIELDS
   Guest 1 = the person submitting; fields appear for guests 2+
   ============================================================ */
function renderGuestNameFields(count) {
  guestNamesContainer.innerHTML = "";

  if (count <= 1) {
    guestNamesGroup.classList.remove("visible");
    return;
  }

  guestNamesGroup.classList.add("visible");

  for (var i = 2; i <= count; i++) {
    var wrap  = document.createElement("div");
    wrap.className = "guest-name-field";

    var lbl   = document.createElement("span");
    lbl.className   = "guest-name-label";
    lbl.textContent = "Guest " + i;

    var input = document.createElement("input");
    input.type        = "text";
    input.className   = "form-input";
    input.id          = "guest-name-" + i;
    input.placeholder = "Full name of guest " + i;

    wrap.appendChild(lbl);
    wrap.appendChild(input);
    guestNamesContainer.appendChild(wrap);
  }
}

guestsInput.addEventListener("input", function () {
  var val = parseInt(guestsInput.value, 10);
  renderGuestNameFields(isNaN(val) ? 0 : val);
});

/* ============================================================
   DECLINE MESSAGE TOGGLE
   ============================================================ */
attendanceRadios.forEach(function (radio) {
  radio.addEventListener("change", function () {
    declineGroup.classList.toggle("visible", radio.value === "not-attending");
  });
});

/* ============================================================
   RSVP SUBMISSION
   ============================================================ */
rsvpSubmitBtn.addEventListener("click", function () {
  var name       = document.getElementById("rsvp-name").value.trim();
  var email      = document.getElementById("rsvp-email").value.trim();
  var guests     = document.getElementById("rsvp-guests").value.trim();
  var attendance = document.querySelector('input[name="attendance"]:checked');
  var declineMsg = document.getElementById("decline-message").value.trim();

  // Validation
  if (!name) {
    showToast("Please fill in your Full Name.", "error");
    return;
  }
  if (!email || !isValidEmail(email)) {
    showToast("Please enter a valid email address.", "error");
    return;
  }
  if (!guests || parseInt(guests, 10) < 1) {
    showToast("Please enter the number of guests.", "error");
    return;
  }
  if (!attendance) {
    showToast("Please select your attendance.", "error");
    return;
  }

  // Build payload object (Formspree accepts JSON)
  var guestCount = parseInt(guests, 10);
  var payload = {
    form_type:  "RSVP",
    name:       name,
    email:      email,
    guests:     guestCount,
    attendance: attendance.value === "attending" ? "Attending" : "Not Attending"
  };

  if (declineMsg) {
    payload.decline_message = declineMsg;
  }

  // Collect additional guest names
  for (var i = 2; i <= guestCount; i++) {
    var field = document.getElementById("guest-name-" + i);
    if (field && field.value.trim()) {
      payload["guest_" + i + "_name"] = field.value.trim();
    }
  }

  // Disable button while sending
  rsvpSubmitBtn.disabled = true;
  rsvpSubmitBtn.querySelector("span").textContent = "Sending…";

  fetch(FORMSPREE_URL, {
    method:  "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept":       "application/json"
    },
    body: JSON.stringify(payload)
  })
  .then(function (response) {
    return response.json().then(function (data) {
      return { ok: response.ok, data: data };
    });
  })
  .then(function (result) {
    if (result.ok) {
      showToast("Your RSVP has been received! See you there 🎉");
      // Clear fields
      document.getElementById("rsvp-name").value     = "";
      document.getElementById("rsvp-email").value    = "";
      document.getElementById("rsvp-guests").value   = "";
      document.getElementById("decline-message").value = "";
      attendanceRadios.forEach(function (r) { r.checked = false; });
      guestNamesContainer.innerHTML = "";
      guestNamesGroup.classList.remove("visible");
      declineGroup.classList.remove("visible");
    } else {
      var errMsg = (result.data.errors || []).map(function (e) { return e.message; }).join(", ") || "Something went wrong. Please try again.";
      showToast(errMsg, "error");
    }
  })
  .catch(function () {
    showToast("Network error. Please check your connection and try again.", "error");
  })
  .finally(function () {
    rsvpSubmitBtn.disabled = false;
    rsvpSubmitBtn.querySelector("span").textContent = "Send RSVP";
  });
});

/* ============================================================
   BIRTHDAY MESSAGE SUBMISSION
   ============================================================ */
msgSubmitBtn.addEventListener("click", function () {
  var name    = document.getElementById("msg-name").value.trim();
  var email   = document.getElementById("msg-email").value.trim();
  var message = document.getElementById("msg-text").value.trim();

  // Validation
  if (!name) {
    showToast("Please fill in your Name.", "error");
    return;
  }
  if (!email || !isValidEmail(email)) {
    showToast("Please enter a valid email address.", "error");
    return;
  }
  if (!message) {
    showToast("Please write your birthday message.", "error");
    return;
  }

  var payload = {
    form_type: "Birthday Message",
    name:      name,
    email:     email,
    message:   message
  };

  // Disable button while sending
  msgSubmitBtn.disabled = true;
  msgSubmitBtn.querySelector("span").textContent = "Sending…";

  fetch(FORMSPREE_URL, {
    method:  "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept":       "application/json"
    },
    body: JSON.stringify(payload)
  })
  .then(function (response) {
    return response.json().then(function (data) {
      return { ok: response.ok, data: data };
    });
  })
  .then(function (result) {
    if (result.ok) {
      showToast("Your message has been sent! 💛");
      document.getElementById("msg-name").value  = "";
      document.getElementById("msg-email").value = "";
      document.getElementById("msg-text").value  = "";
    } else {
      var errMsg = (result.data.errors || []).map(function (e) { return e.message; }).join(", ") || "Something went wrong. Please try again.";
      showToast(errMsg, "error");
    }
  })
  .catch(function () {
    showToast("Network error. Please check your connection and try again.", "error");
  })
  .finally(function () {
    msgSubmitBtn.disabled = false;
    msgSubmitBtn.querySelector("span").textContent = "Send Message";
  });
});
