function getText(selector, root = document) {
  const el = root.querySelector(selector);
  return el ? el.innerText.trim() : "";
}

function getAllText(selector, root = document, limit = Infinity) {
  return Array.from(root.querySelectorAll(selector))
    .slice(0, limit)
    .map((el) => el.innerText.trim())
    .filter(Boolean);
}

function scrapeAboutSection() {
  const sections = document.querySelectorAll("section");
  for (const section of sections) {
    const header = section.querySelector("h2");
    if (header && /about/i.test(header.innerText)) {
      const content = section.querySelector(".display-flex.full-width span[aria-hidden='true'], .inline-show-more-text");
      if (content) return content.innerText.trim();
    }
  }
  return "";
}

function findSectionByHeader(regex) {
  const sections = document.querySelectorAll("section");
  for (const section of sections) {
    const header = section.querySelector("h2");
    if (header && regex.test(header.innerText)) return section;
  }
  return null;
}

function scrapeCurrentRole() {
  const section = findSectionByHeader(/experience/i);
  if (!section) return "";
  const firstItem = section.querySelector("li");
  if (!firstItem) return "";
  const role = firstItem.querySelector("span[aria-hidden='true']");
  return role ? role.innerText.trim() : "";
}

function scrapeExperience() {
  const section = findSectionByHeader(/experience/i);
  if (!section) return [];
  const items = section.querySelectorAll(":scope > div ul > li, :scope ul > li");
  const seen = new Set();
  const entries = [];
  for (const item of items) {
    const text = (item.innerText || "")
      .replace(/\n{2,}/g, "\n")
      .trim()
      .split("\n")
      .filter((line) => line && !/^helped me get this job$/i.test(line))
      .slice(0, 6)
      .join(" | ");
    if (text && !seen.has(text)) {
      seen.add(text);
      entries.push(text);
    }
    if (entries.length >= 5) break;
  }
  return entries;
}

function scrapeEducation() {
  const section = findSectionByHeader(/education/i);
  if (!section) return [];
  const items = section.querySelectorAll("li");
  const entries = [];
  for (const item of items) {
    const text = (item.innerText || "")
      .replace(/\n{2,}/g, "\n")
      .trim()
      .split("\n")
      .slice(0, 4)
      .join(" | ");
    if (text) entries.push(text);
    if (entries.length >= 3) break;
  }
  return entries;
}

function scrapeSkills() {
  const skills = [];
  const sections = document.querySelectorAll("section");
  for (const section of sections) {
    const header = section.querySelector("h2");
    if (header && /skills/i.test(header.innerText)) {
      const items = section.querySelectorAll("span[aria-hidden='true']");
      for (const item of items) {
        const text = item.innerText.trim();
        if (text && !skills.includes(text) && skills.length < 10) {
          skills.push(text);
        }
      }
      break;
    }
  }
  return skills;
}

function scrapeRawText() {
  const main = document.querySelector("main") || document.body;
  if (!main) return "";

  const clone = main.cloneNode(true);
  const sections = clone.querySelectorAll("section");
  for (const section of sections) {
    const header = section.querySelector("h2");
    if (header && /\b(activity|posts|featured|interests|people you may know|recommended for you|people also viewed)\b/i.test(header.innerText)) {
      section.remove();
    }
  }

  const text = clone.innerText || "";
  return text.replace(/\n{3,}/g, "\n\n").trim().slice(0, 6000);
}

function normalizeName(n) {
  return (n || "").toLowerCase().replace(/[^a-z0-9]+/g, "").trim();
}

function scrapePosts(ownerName) {
  const ownerKey = normalizeName(ownerName);
  const containers = document.querySelectorAll(
    ".feed-shared-update-v2, .occludable-update, .profile-creator-shared-feed-update__container, .pv-recent-activity-detail__feed-item"
  );
  const seen = new Set();
  const posts = [];

  for (const container of containers) {
    if (posts.length >= 8) break;

    const fullText = (container.innerText || "").trim();
    if (!fullText) continue;

    const head = fullText.slice(0, 300).toLowerCase();
    const isReposted =
      /reposted this/.test(head) ||
      /shared this/.test(head) ||
      /liked this/.test(head) ||
      /commented on this/.test(head);

    const authorEl = container.querySelector(
      ".update-components-actor__title span[aria-hidden='true'], " +
      ".update-components-actor__name, " +
      ".feed-shared-actor__name, " +
      ".update-components-actor__meta-link span[aria-hidden='true']"
    );
    const author = authorEl ? authorEl.innerText.trim().split("\n")[0].trim() : "";
    const authorKey = normalizeName(author);

    const authorMatches = ownerKey && authorKey && (authorKey === ownerKey || authorKey.includes(ownerKey) || ownerKey.includes(authorKey));
    const isOriginal = !isReposted && (authorMatches || (!authorKey && !isReposted));

    const textEl = container.querySelector(
      ".feed-shared-update-v2__description span[dir='ltr'], " +
      ".update-components-text span[dir='ltr'], " +
      ".feed-shared-text"
    );
    let text = textEl ? textEl.innerText.trim() : "";
    if (!text) {
      const lines = fullText.split("\n").map((l) => l.trim()).filter(Boolean);
      text = lines.slice(2, 10).join(" ").trim();
    }
    text = text.replace(/\s+/g, " ").slice(0, 600);

    const dedupKey = text.slice(0, 80);
    if (!text || text.length < 25 || seen.has(dedupKey)) continue;
    seen.add(dedupKey);

    posts.push({
      text,
      author: author || "(unknown)",
      isOriginal,
    });
  }

  return posts;
}

function scrapeProfile() {
  const name = getText("h1.text-heading-xlarge") || getText("h1");
  return {
    name,
    headline: getText(".text-body-medium.break-words"),
    about: scrapeAboutSection(),
    currentRole: scrapeCurrentRole(),
    experience: scrapeExperience(),
    education: scrapeEducation(),
    skills: scrapeSkills(),
    posts: scrapePosts(name),
    rawText: scrapeRawText(),
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isInViewport(el) {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}

function expandSeeMores() {
  const buttons = document.querySelectorAll(
    "button.inline-show-more-text__button, " +
    "button.feed-shared-inline-show-more-text__see-more-less-toggle, " +
    "button[aria-expanded='false']"
  );
  let clicked = 0;
  for (const btn of buttons) {
    if (clicked >= 25) break;
    const text = (btn.innerText || btn.textContent || "").trim().toLowerCase();
    const aria = (btn.getAttribute("aria-label") || "").toLowerCase();
    const looksLikeMore =
      text === "…more" ||
      text === "...more" ||
      text === "more" ||
      text === "see more" ||
      text.endsWith("…more") ||
      text.endsWith("...more") ||
      aria.includes("see more") ||
      aria.includes("show more");
    if (looksLikeMore) {
      try {
        btn.click();
        clicked++;
      } catch (_) {}
    }
  }
  return clicked;
}

async function loadSections() {
  const originalY = window.scrollY;

  for (const regex of [/about/i, /experience/i, /activity|posts/i]) {
    const section = findSectionByHeader(regex);
    if (!section || isInViewport(section)) continue;
    section.scrollIntoView({ behavior: "auto", block: "center" });
    await sleep(220);
  }

  expandSeeMores();
  await sleep(120);
  expandSeeMores();

  window.scrollTo({ top: originalY, behavior: "auto" });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scrape") {
    (async () => {
      try {
        await loadSections();
        sendResponse({ success: true, data: scrapeProfile() });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true;
  }
});
