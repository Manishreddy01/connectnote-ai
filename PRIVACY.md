# Privacy Policy for ConnectNote AI

**Effective date:** May 18, 2026

ConnectNote AI ("the extension") is a Chrome extension that helps you draft personalized connection notes and outreach messages for professional profiles, using your own OpenAI API key. This policy explains exactly what data is involved and where it goes.

## Short version

The extension is fully client-side. It does not send your information to any server operated by the developer. Your OpenAI API key, your profile bio, and any profile data scraped from the page you have open are sent only to OpenAI's API, and only when you click "Generate". Nothing is collected, logged, or shared for analytics or marketing.

## What the extension stores

The following information is stored on your device using Chrome's `chrome.storage.sync` API:

- Your full name
- A short bio about you ("About you")
- The roles you are seeking
- Your OpenAI API key
- The OpenAI model you selected

`chrome.storage.sync` is part of Chrome itself. If you are signed in to Chrome and have sync enabled, this data may also be synced by Google between Chrome browsers you sign in to. We do not control or have access to that sync data.

## What the extension transmits

When you click "Generate" on a professional profile page, the extension:

1. Reads the visible content of that profile page from your active browser tab.
2. Sends that content, along with your "About you" bio, the roles you are seeking, your name, and your OpenAI API key, directly to `https://api.openai.com/v1/chat/completions`.
3. Receives the generated note from OpenAI and displays it in the extension popup.

That request goes only to OpenAI. It does not pass through any server operated by the developer. OpenAI's handling of your data is governed by OpenAI's own privacy policy and terms.

The extension does not contact any other server. It does not send analytics, crash reports, telemetry, or usage data anywhere.

## What the extension does not do

- Does not collect data for advertising or marketing.
- Does not sell or share data with third parties.
- Does not include any third-party analytics, trackers, or remote scripts.
- Does not access your email, browser history, downloads, or any tab other than the one currently active when you click "Generate".
- Does not store profile data scraped from pages you visit. Scraped content is held only in memory long enough to make the OpenAI API call.

## Permissions

The extension requests these Chrome permissions:

- **activeTab** — Read content from the tab that is active when you click the extension icon, so the extension can extract the profile you have open.
- **scripting** — Inject the content script into the active tab to read the profile. Runs only when you click "Generate".
- **clipboardWrite** — Copy the generated note to your clipboard with one click.
- **storage** — Save your name, bio, role preferences, API key, and model choice on your device.

The extension is restricted (via `host_permissions`) to communicating only with `linkedin.com` (to scrape the profile you have open) and `api.openai.com` (to call the model).

## Children

The extension is not intended for users under 13.

## Changes to this policy

If this policy changes, the new version will be published at the same URL with an updated effective date.

## Contact

Questions about this policy can be sent to: `shanuma8@asu.edu`

## Not affiliated with LinkedIn

ConnectNote AI is an independent tool and is not affiliated with, endorsed by, or sponsored by LinkedIn Corporation. "LinkedIn" is a trademark of LinkedIn Corporation.
