const STORAGE_KEY = "linkedinNoteGen.settings.v1";

const DEFAULTS = {
  fullName: "",
  aboutYou: "",
  seekingRoles: "",
  apiKey: "",
  model: "gpt-4o-mini",
  setupCompletedAt: 0,
};

const fields = {
  fullName: document.getElementById("fullName"),
  aboutYou: document.getElementById("aboutYou"),
  seekingRoles: document.getElementById("seekingRoles"),
  apiKey: document.getElementById("apiKey"),
  model: document.getElementById("model"),
};

const panels = {
  1: document.querySelector('[data-panel="1"]'),
  2: document.querySelector('[data-panel="2"]'),
  done: document.querySelector('[data-panel="done"]'),
};
const stepBadges = {
  1: document.querySelector('.step[data-step="1"]'),
  2: document.querySelector('.step[data-step="2"]'),
};

const continueBtn = document.getElementById("continueStep1");
const finishBtn = document.getElementById("finish");
const backBtn = document.getElementById("backToStep1");
const editAgainBtn = document.getElementById("editAgain");
const toggleKey = document.getElementById("toggleKey");
const copyPromptBtn = document.getElementById("copyPrompt");
const copyPromptStatus = document.getElementById("copyPromptStatus");
const bioPromptEl = document.getElementById("bioPrompt");
const step1Status = document.getElementById("step1Status");
const step2Status = document.getElementById("step2Status");

let current = { ...DEFAULTS };

function setStatusEl(el, msg, kind = "") {
  el.textContent = msg;
  el.classList.remove("success", "error");
  if (kind) el.classList.add(kind);
}

function setLoading(btn, isLoading, normalLabel) {
  btn.disabled = isLoading;
  btn.classList.toggle("loading", isLoading);
  const label = btn.querySelector(".btn-label");
  if (label) label.textContent = isLoading ? "Working" : normalLabel;
}

function showPanel(which) {
  Object.entries(panels).forEach(([k, el]) => {
    el.style.display = k === which ? "" : "none";
  });
  if (which === "1") {
    stepBadges[1].classList.add("active");
    stepBadges[1].classList.remove("done");
    stepBadges[2].classList.remove("active", "done");
  } else if (which === "2") {
    stepBadges[1].classList.remove("active");
    stepBadges[1].classList.add("done");
    stepBadges[2].classList.add("active");
    stepBadges[2].classList.remove("done");
  } else if (which === "done") {
    stepBadges[1].classList.remove("active");
    stepBadges[1].classList.add("done");
    stepBadges[2].classList.remove("active");
    stepBadges[2].classList.add("done");
  }
}

async function loadSettings() {
  const stored = await chrome.storage.sync.get(STORAGE_KEY);
  const raw = stored[STORAGE_KEY] || {};
  const known = {};
  for (const key of Object.keys(DEFAULTS)) {
    if (raw[key] !== undefined) known[key] = raw[key];
  }
  const hadObsolete = Object.keys(raw).some((k) => !(k in DEFAULTS));
  if (hadObsolete) {
    await chrome.storage.sync.set({ [STORAGE_KEY]: { ...DEFAULTS, ...known } });
  }
  return { ...DEFAULTS, ...known };
}

async function saveSettings(patch) {
  current = { ...current, ...patch };
  await chrome.storage.sync.set({ [STORAGE_KEY]: current });
  return current;
}

function applyToFields(s) {
  for (const [key, el] of Object.entries(fields)) {
    if (s[key] !== undefined) el.value = s[key];
  }
}

function readStep1() {
  return {
    fullName: fields.fullName.value.trim(),
    seekingRoles: fields.seekingRoles.value.trim(),
    aboutYou: fields.aboutYou.value.trim(),
  };
}

function readStep2() {
  return {
    apiKey: fields.apiKey.value.trim(),
    model: fields.model.value,
  };
}

function validateStep1(data) {
  if (!data.fullName) return "Please enter your full name.";
  if (!data.seekingRoles) return "Please list at least one role you're seeking.";
  if (!data.aboutYou || data.aboutYou.length < 60) {
    return "About you is too short. Aim for 1 or 2 paragraphs (60+ characters).";
  }
  return null;
}

function validateStep2(data) {
  if (!data.apiKey) return "Please paste your OpenAI API key.";
  if (!data.apiKey.startsWith("sk-")) return "OpenAI keys start with 'sk-'.";
  return null;
}

continueBtn.addEventListener("click", async () => {
  setStatusEl(step1Status, "");
  const data = readStep1();
  const err = validateStep1(data);
  if (err) {
    setStatusEl(step1Status, err, "error");
    return;
  }

  setLoading(continueBtn, true, "Continue to API key →");
  try {
    await saveSettings(data);
    setStatusEl(step1Status, "Saved.", "success");
    setTimeout(() => {
      setStatusEl(step1Status, "");
      showPanel("2");
    }, 250);
  } catch (e) {
    setStatusEl(step1Status, "Could not save: " + e.message, "error");
  } finally {
    setLoading(continueBtn, false, "Continue to API key →");
  }
});

backBtn.addEventListener("click", () => {
  setStatusEl(step2Status, "");
  showPanel("1");
});

finishBtn.addEventListener("click", async () => {
  setStatusEl(step2Status, "");
  const data = readStep2();
  const err = validateStep2(data);
  if (err) {
    setStatusEl(step2Status, err, "error");
    return;
  }

  setLoading(finishBtn, true, "Save & finish");
  try {
    await saveSettings({ ...data, setupCompletedAt: Date.now() });
    setStatusEl(step2Status, "Saved.", "success");
    setTimeout(() => showPanel("done"), 350);
  } catch (e) {
    setStatusEl(step2Status, "Could not save: " + e.message, "error");
  } finally {
    setLoading(finishBtn, false, "Save & finish");
  }
});

editAgainBtn.addEventListener("click", () => {
  showPanel("1");
});

toggleKey.addEventListener("click", () => {
  const isPwd = fields.apiKey.type === "password";
  fields.apiKey.type = isPwd ? "text" : "password";
  toggleKey.textContent = isPwd ? "Hide" : "Show";
});

copyPromptBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(bioPromptEl.textContent.trim());
    copyPromptBtn.textContent = "Copied!";
    copyPromptBtn.classList.add("copied");
    setStatusEl(copyPromptStatus, "Paste this into ChatGPT.");
    setTimeout(() => {
      copyPromptBtn.textContent = "Copy prompt";
      copyPromptBtn.classList.remove("copied");
      setStatusEl(copyPromptStatus, "");
    }, 2500);
  } catch (e) {
    setStatusEl(copyPromptStatus, "Copy failed: " + e.message, "error");
  }
});

(async function init() {
  current = await loadSettings();
  applyToFields(current);

  const hasStep1 = current.fullName && current.aboutYou && current.seekingRoles;
  const hasStep2 = current.apiKey && current.apiKey.startsWith("sk-") && current.setupCompletedAt;

  if (hasStep1 && hasStep2) {
    showPanel("done");
  } else if (hasStep1) {
    showPanel("2");
  } else {
    showPanel("1");
  }
})();
