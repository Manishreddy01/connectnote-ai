# Chrome Web Store Listing Copy

Paste these into the matching fields when you submit at https://chrome.google.com/webstore/devconsole.

---

## Extension name (max 75 chars)

```
ConnectNote AI
```

---

## Short description (max 132 chars)

```
Personalized connection notes and outreach messages for any professional profile, powered by your own OpenAI API key.
```

(117 characters.)

---

## Detailed description

```
ConnectNote AI helps you write short, personalized connection notes and longer outreach messages for the professional profile you have open in your browser. No more generic "I'd love to connect" templates.

How it works
1. Open a professional profile in your browser.
2. Click the ConnectNote AI icon.
3. Pick a format (300-character connection note, or a longer outreach message with subject line) and a tone (Professional or Casual).
4. Click Generate. The note appears in seconds.
5. Copy and send.

What makes the notes feel real
- Anchors on the target's About section, headline, current role, prior roles, and education, not on generic phrases.
- Detects and ignores reposted content, so the note reflects what the target themselves wrote.
- Always includes a clear, polite ask about openings for the roles you are seeking, tied to the target's company by name.
- Avoids the usual AI tells: no em-dashes, no "I hope this finds you well", no "your work in AI".
- Connection notes stay under LinkedIn's 300-character hard limit. Outreach messages run 250 to 290 words with a subject line.

Bring Your Own Key
You provide your own OpenAI API key in the one-time setup. Your key and your bio are stored only on your device, in Chrome's encrypted sync storage. They are never sent to any server operated by us. The only network call the extension makes is directly from your browser to OpenAI, using your key.

Privacy
No analytics. No tracking. No remote logging. The extension talks to two domains: the professional networking site you have open, and api.openai.com. That is it. Full privacy policy linked below.

Not affiliated with LinkedIn
ConnectNote AI is an independent tool and is not affiliated with, endorsed by, or sponsored by LinkedIn Corporation. Please use the extension in accordance with the terms of service of the websites you visit.
```

---

## Category

Productivity

---

## Permission justifications

When the reviewer asks you to justify each permission, paste these:

### activeTab
```
Used to read the profile content from the tab that is active when the user clicks Generate. The extension only accesses the active tab, only when invoked by the user clicking the toolbar icon. No background tab access.
```

### scripting
```
Used to inject the content script into the active tab so it can extract the visible profile data (About, headline, experience). Injection happens only when the user clicks Generate.
```

### clipboardWrite
```
Used to copy the generated note to the user's clipboard when they click the Copy button. Standard quality-of-life feature so users don't have to manually select and copy the text.
```

### storage
```
Used to save the user's name, short bio, roles they are seeking, OpenAI API key, and model preference in chrome.storage.sync so they don't have to re-enter them every session. Data stays on the user's device.
```

### Host permission: https://www.linkedin.com/*
```
Required so the content script can read the profile content from the professional networking page the user has open. The extension only activates on profile pages (/in/* paths).
```

### Host permission: https://api.openai.com/*
```
Required to send the generation request directly from the user's browser to OpenAI's API using the user's own API key (Bring Your Own Key model). No proxy server.
```

---

## Single purpose statement

```
ConnectNote AI has one purpose: generating a personalized outreach note for the professional profile the user has open in their browser, using the user's own OpenAI API key.
```

---

## Data usage disclosures (the questionnaire)

You will be asked which types of user data you collect. Answer:

- Personally identifiable information: **Yes** (the user's name and any personal info they paste into "About you")
- Health information: **No**
- Financial and payment info: **No**
- Authentication information: **Yes** (the user's OpenAI API key)
- Personal communications: **No**
- Location: **No**
- Web history: **No**
- User activity: **No**
- Website content: **Yes** (content of the active profile page is read at the moment of generation, but not stored)

Then check all three certifications:
- I do not sell or transfer user data to third parties, apart from the approved use cases (the user's own OpenAI API call is the approved use case).
- I do not use or transfer user data for purposes unrelated to my item's single purpose.
- I do not use or transfer user data to determine creditworthiness or for lending purposes.

---

## Privacy policy URL

You need a public URL hosting PRIVACY.md. Easiest path: push this repo to GitHub, enable GitHub Pages on the main branch, then your policy is at:

```
https://<your-github-username>.github.io/<repo-name>/PRIVACY
```

Paste that URL into the "Privacy policy" field in the listing.

---

## Submission checklist

- [ ] Pay $5 Chrome Web Store one-time developer fee
- [ ] Zip the `extension/` folder (not the parent folder, just the contents of `extension/`)
- [ ] Delete `backend/` before zipping, or zip `extension/` directly
- [ ] Take 1 to 5 screenshots at 1280x800 of the popup in use
- [ ] Create a 440x280 small promo tile (extension icon + name on solid background works)
- [ ] Host PRIVACY.md at a public URL
- [ ] Fill all fields above in the developer console
- [ ] Submit for review (typically 1 to 3 business days)
