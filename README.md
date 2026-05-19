# ConnectNote AI

Chrome extension that drafts short, personalized connection notes and longer outreach messages for the professional profile you have open. Uses your own OpenAI API key.

## What it does

- Reads the profile in your active tab (About, headline, current role, prior experience, original posts).
- Sends that, plus your bio and the roles you are seeking, to OpenAI.
- Returns either a Connection Note (under 300 characters) or a longer outreach message (250 to 290 words, with a subject line).
- Always includes a clear, polite ask about openings, tied to the target's company by name.
- Filters out reposted content so the message reflects what the target themselves wrote.

## Install

### From source (current)

1. Clone or download this repository.
2. Open `chrome://extensions` and turn on Developer mode.
3. Click "Load unpacked" and pick the `extension/` folder.
4. Click the extension icon. Complete the one-time setup: your bio, the roles you are seeking, and your OpenAI API key.

### From the Chrome Web Store

Coming soon.

## How your data is handled

- Your name, bio, role preferences, and OpenAI API key are stored only on your device via `chrome.storage.sync`.
- The only network call the extension makes is directly from your browser to `api.openai.com`, using your key.
- No analytics, no tracking, no remote logging.

Full details: [PRIVACY.md](./PRIVACY.md).

## Not affiliated with LinkedIn

This is an independent project. "LinkedIn" is a trademark of LinkedIn Corporation. Please use the extension in accordance with the terms of service of the sites you visit.

## License

Personal project. Contact the author for any reuse questions.

(c) 2026 @maneshreddy
