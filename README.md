# ConnectNote AI

A Chrome extension that writes a personalized LinkedIn connection note or outreach message for the profile you have open. Uses your own OpenAI API key.

## Install

1. Download this repo: click the green **Code** button above, then **Download ZIP**, and extract it.
2. Open `chrome://extensions` in Chrome.
3. Turn on **Developer mode** (top-right toggle).
4. Click **Load unpacked** and select the **`extension`** folder inside the unzipped folder.
5. The ConnectNote AI icon appears in your toolbar. Click the puzzle icon to pin it.

Works on Chrome, Edge, Brave, and Arc. Not Safari or Firefox.

## First-time setup

Click the icon. A two-step wizard opens:

1. **About you** - your name, the roles you are seeking, and a short bio.
2. **OpenAI key** - paste your own API key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys).

Everything is stored only on your device.

## How to use

1. Open any LinkedIn profile (`linkedin.com/in/...`).
2. Click the ConnectNote AI icon.
3. Pick a **format**: Connection note (short, under 300 characters) or InMail (longer, with a subject line).
4. Pick a **tone**: Professional or Casual.
5. **Messaging a recruiter** toggle:
   - **On** - a direct intro about you (your role, experience, and the roles you want).
   - **Off** - a message personalized to the person you are contacting.
6. Click **Generate Note**, then **Copy to Clipboard**.
7. Optional: add a line in **Add context** and generate again to refine the result.

## Privacy

No analytics, no tracking, no servers. The extension talks only to LinkedIn (the page you have open) and `api.openai.com` (using your key). Full policy: [PRIVACY.md](./PRIVACY.md).

## Not affiliated with LinkedIn

Independent project. "LinkedIn" is a trademark of LinkedIn Corporation. Use the extension in line with the terms of service of the sites you visit.

(c) 2026 @maneshreddy
