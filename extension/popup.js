import { generateNote } from "./lib/generator.js";

const STORAGE_KEY = "linkedinNoteGen.settings.v1";

let selectedTone = "Professional";
let selectedFormat = "connection";
let settings = null;

const formatButtons = document.querySelectorAll(".format-btn");
const toneButtons = document.querySelectorAll(".tone-btn:not(.format-btn)");
const generateBtn = document.getElementById("generate");
const resultEl = document.getElementById("result");
const charCountEl = document.getElementById("charCount");
const copyBtn = document.getElementById("copy");
const statusEl = document.getElementById("status");
const subjectRow = document.getElementById("subjectRow");
const subjectEl = document.getElementById("subject");
const copySubjectBtn = document.getElementById("copySubject");
const openSettings = document.getElementById("openSettings");
const openSettingsCta = document.getElementById("openSettingsCta");
const setupCard = document.getElementById("setupCard");
const mainUi = document.getElementById("mainUi");

function openOptions() {
  if (chrome.runtime.openOptionsPage) chrome.runtime.openOptionsPage();
  else window.open(chrome.runtime.getURL("options.html"));
}

openSettings.addEventListener("click", openOptions);
openSettingsCta.addEventListener("click", openOptions);

function updateSubjectVisibility() {
  subjectRow.style.display = selectedFormat === "inmail" ? "block" : "none";
}

formatButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    formatButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedFormat = btn.dataset.format;
    updateCharCount();
    updateSubjectVisibility();
  });
});

updateSubjectVisibility();

toneButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    toneButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedTone = btn.dataset.tone;
  });
});

function updateCharCount() {
  const text = resultEl.value.trim();
  if (selectedFormat === "inmail") {
    const words = text ? text.split(/\s+/).length : 0;
    charCountEl.textContent = `${words} words (target 60-150)`;
    charCountEl.classList.toggle("over", words > 150 || (words > 0 && words < 60));
  } else {
    const chars = text.length;
    charCountEl.textContent = `${chars} / 300 chars`;
    charCountEl.classList.toggle("over", chars > 300);
  }
}

function setStatus(msg, kind = "") {
  statusEl.textContent = msg;
  statusEl.classList.remove("error", "success");
  if (kind === "error") statusEl.classList.add("error");
  if (kind === "success") statusEl.classList.add("success");
}

const btnTextEl = generateBtn.querySelector(".btn-text");
const defaultBtnText = btnTextEl ? btnTextEl.textContent : "Generate Note";

function setLoading(isLoading) {
  generateBtn.disabled = isLoading;
  generateBtn.classList.toggle("loading", isLoading);
  if (btnTextEl) {
    btnTextEl.textContent = isLoading ? "Generating" : defaultBtnText;
  }
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function ensureContentScript(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content.js"],
    });
  } catch (err) {
    throw new Error("Could not inject content script: " + err.message);
  }
}

async function scrapeProfile(tabId) {
  await ensureContentScript(tabId);
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, { action: "scrape" }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      if (!response || !response.success) {
        reject(new Error(response?.error || "Failed to scrape profile"));
        return;
      }
      resolve(response.data);
    });
  });
}

async function loadSettings() {
  const stored = await chrome.storage.sync.get(STORAGE_KEY);
  return stored[STORAGE_KEY] || null;
}

function isConfigured(s) {
  return !!(s && s.fullName && s.aboutYou && s.apiKey && s.apiKey.startsWith("sk-"));
}

async function init() {
  settings = await loadSettings();
  if (isConfigured(settings)) {
    setupCard.style.display = "none";
    mainUi.style.display = "";
  } else {
    setupCard.style.display = "";
    mainUi.style.display = "none";
  }
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes[STORAGE_KEY]) {
    settings = changes[STORAGE_KEY].newValue;
    if (isConfigured(settings)) {
      setupCard.style.display = "none";
      mainUi.style.display = "";
    }
  }
});

generateBtn.addEventListener("click", async () => {
  if (!isConfigured(settings)) {
    setStatus("Open Settings to set up your profile first.", "error");
    return;
  }
  setLoading(true);
  setStatus("Reading profile...");
  resultEl.value = "";
  subjectEl.value = "";
  updateCharCount();

  try {
    const tab = await getActiveTab();
    if (!tab.url || !tab.url.includes("linkedin.com/in/")) {
      throw new Error("Open a LinkedIn profile page first.");
    }

    const profile = await scrapeProfile(tab.id);
    setStatus("Generating note...");

    const data = await generateNote({
      format: selectedFormat,
      tone: selectedTone,
      profile,
      userProfile: {
        fullName: settings.fullName,
        aboutYou: settings.aboutYou,
        seekingRoles: settings.seekingRoles,
      },
      apiKey: settings.apiKey,
      model: settings.model || "gpt-4o-mini",
    });

    resultEl.value = data.note;
    subjectEl.value = data.subject || "";
    updateCharCount();
    setStatus("Ready", "success");
  } catch (err) {
    setStatus(err.message, "error");
  } finally {
    setLoading(false);
  }
});

copySubjectBtn.addEventListener("click", async () => {
  if (!subjectEl.value) return;
  try {
    await navigator.clipboard.writeText(subjectEl.value);
    copySubjectBtn.textContent = "Copied!";
    copySubjectBtn.classList.add("copied");
    setTimeout(() => {
      copySubjectBtn.textContent = "Copy";
      copySubjectBtn.classList.remove("copied");
    }, 1500);
  } catch (err) {
    setStatus("Copy failed: " + err.message, "error");
  }
});

copyBtn.addEventListener("click", async () => {
  if (!resultEl.value) return;
  try {
    await navigator.clipboard.writeText(resultEl.value);
    copyBtn.textContent = "Copied!";
    copyBtn.classList.add("copied");
    setTimeout(() => {
      copyBtn.textContent = "Copy to Clipboard";
      copyBtn.classList.remove("copied");
    }, 1500);
  } catch (err) {
    setStatus("Copy failed: " + err.message, "error");
  }
});

init();
