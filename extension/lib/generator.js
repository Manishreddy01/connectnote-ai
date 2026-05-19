const CONNECTION_MAX_CHARS = 300;
const INMAIL_MIN_WORDS = 250;
const INMAIL_MAX_WORDS = 290;

function buildSharedRules(userProfile) {
  const userBlock = formatUserProfile(userProfile);
  return `${userBlock}

Shared rules:
- Anchor on signals that reflect the target's own work and thinking. Allowed anchors, in order of preference: (1) About section, (2) headline, (3) current role/company, (4) prior roles or education, (5) Original posts (only if listed under "Original posts" in the input AND only if the post makes a specific, substantive claim or shares a concrete project/result, not generic life updates or congrats). NEVER anchor on reposts or shared content.
- If the input lists Original posts, evaluate each one for relevance: does it reveal something specific about how they think or what they're building? If yes, you may use it. If it's a generic life update, congrats, or vague motivational content, IGNORE it and anchor on About/Experience instead.
- Reference at least one specific, concrete detail: a named company, a named product or project, a specific job function, a tenure, a school, a niche skill, or a specific claim from an original post.
- NEVER use generic phrases like "your work in AI", "your expertise in [broad field]", "production systems", "your background in tech"; those are bans.
- Mirror the target's own wording where relevant rather than imposing your own.
- Sound like a real human wrote it. Avoid templated phrasing, buzzwords, and AI tells. Banned words/phrases: "compelling", "insights", "keen", "I'd love to connect and learn more", "exchange insights", "explore potential collaborations", "I hope this finds you well", "I came across your profile and was impressed".
- NEVER use em-dashes (—) or en-dashes (–) anywhere in the message. Em-dashes are an AI tell. Use commas, periods, parentheses, or colons instead. A hyphen (-) is fine.
- The user IS actively job-searching. Every message must include a clear, polite ask about openings or referrals at the target's company (for the roles listed in the user's "Seeking" field). The ask should feel earned, not desperate: anchor it to something specific about their work or company first, THEN ask. If the target's company is unclear, ask if they know of relevant openings in their network.
- Do not be vague ("interested in opportunities"); be specific: ask about openings at their named company, or whether they'd be open to a quick chat about it.
- Do not oversell the user. State their situation in one short line at most, based on the "About you" block.
- Write in first person as the user.
- Open with a short greeting using the target's first name (e.g. "Hi Illia,"). If no name is available, open with "Hi,".

Tone guidance:
- Professional: warm but polished, focused on shared technical interests or work.
- Casual: friendly and conversational, like messaging a peer.

Output: ONLY the note text. No quotes, no preamble, no explanation, no length count.`;
}

function buildConnectionPrompt(userProfile) {
  return `You write personalized LinkedIn connection request notes on behalf of the user.

${buildSharedRules(userProfile)}

Connection-note specific rules:
- HARD LIMIT: under ${CONNECTION_MAX_CHARS} characters total (LinkedIn rejects anything longer). This includes the greeting, all spaces, and punctuation. Count characters, not words. Aim for 250 to 290 characters to leave safety margin.
- Single short paragraph. No signoff, no "Best,", no name at the end. Just the note body after the greeting.
- One specific reference is enough; don't try to cram in two.
- Keep sentences tight. If you're approaching ${CONNECTION_MAX_CHARS} chars, cut the ask short (e.g. "Hiring AI engineers at <Company>?") rather than going over.
- Structure: greeting, one sentence anchoring on the strongest specific signal (About / Headline / current role / current company, or a substantive Original post if available), one short sentence with the hiring ask. That's it.`;
}

function buildInmailPrompt(userProfile) {
  return `You write personalized LinkedIn InMail / DM messages on behalf of the user (long-form, NOT the 300-char connection request).

${buildSharedRules(userProfile)}

InMail-specific rules:
- Length (BODY ONLY, excluding subject line): between ${INMAIL_MIN_WORDS} and ${INMAIL_MAX_WORDS} words. Count carefully. Do NOT go over ${INMAIL_MAX_WORDS} or under ${INMAIL_MIN_WORDS}.
- Output format: FIRST line must be the subject line, prefixed exactly with "Subject: ". Then a blank line. Then the body. Example:
  Subject: AI engineer roles at American Compute

  Hi Illia,

  ...body paragraphs...
- Subject line rules:
  - Max 60 characters.
  - Specific and concrete, referencing a real detail from their About / Headline / current company / Experience / a substantive Original post. NO generic subjects like "Quick question" or "Connecting". Never reference reposts.
  - Lowercase or sentence case is fine, whichever feels more human. No clickbait, no exclamation marks.
  - Do NOT mention "InMail", "introduction", or "outreach". Make it feel like a real human email subject.
- Body structure:
  1. Greeting.
  2. Paragraph 1 (2 to 4 sentences): anchor on the strongest specific signal: About / headline / current role / current company, OR a substantive Original post if one is listed and relevant. Mirror their wording. Never anchor on reposts.
  3. Paragraph 2 (2 to 4 sentences): bring in a second concrete detail from a different source (Experience, Education, or a different Original post) and tie it to a relevant overlap with the user's own work/stack (from the "About you" block).
  4. Paragraph 3 (2 to 3 sentences): one short line on the user's situation (from "About you"), then the ask: directly ask if their company is hiring for the user's target roles, or if they'd be open to a quick chat about openings on their team. Be specific to their named company.
  5. Optional one-line close.
- End body with "Thanks," on its own line, then the user's first name on the next line.`;
}

function formatUserProfile(u) {
  const name = (u.fullName || "the user").trim();
  const bio = (u.aboutYou || "").trim();
  const seeking = (u.seekingRoles || "").trim();
  const parts = [`About the user (${name}):`];
  if (bio) parts.push(bio);
  if (seeking) parts.push(`Currently looking for: ${seeking}`);
  return parts.join("\n");
}

function formatTargetProfile(p) {
  const parts = [
    `Name: ${p.name || "(unknown)"}`,
    `Headline: ${p.headline || "(none)"}`,
    `Current role: ${p.currentRole || "(none)"}`,
    `About: ${p.about || "(none)"}`,
  ];
  if (p.experience && p.experience.length) {
    parts.push("Experience:\n" + p.experience.map((e) => `- ${e}`).join("\n"));
  }
  if (p.education && p.education.length) {
    parts.push("Education:\n" + p.education.map((e) => `- ${e}`).join("\n"));
  }
  if (p.skills && p.skills.length) {
    parts.push("Skills: " + p.skills.join(", "));
  }
  const posts = (p.posts || []).filter((post) => post.text && post.text.trim());
  const originals = posts.filter((post) => post.isOriginal);
  const reposts = posts.filter((post) => !post.isOriginal);
  if (originals.length) {
    parts.push(
      "Original posts (written by the target themselves; OK to anchor on if substantive and specific):\n" +
        originals
          .slice(0, 5)
          .map((post) => `- ${(post.text || "").slice(0, 500)}`)
          .join("\n")
    );
  }
  if (reposts.length) {
    parts.push(
      `Note: ${reposts.length} reposted/shared item(s) were detected and excluded. ` +
        "Do NOT anchor on reposts since they don't reflect the target's own thinking."
    );
  }
  if (p.rawText) {
    parts.push(
      "Raw profile page text (Activity section excluded). " +
        "Use this to find anchors in About, Experience, current company, or projects:\n" +
        p.rawText
    );
  }
  return parts.join("\n");
}

function smartTruncate(text, limit) {
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  for (const punct of [". ", "? ", "! "]) {
    const idx = cut.lastIndexOf(punct);
    if (idx >= Math.floor(limit * 0.6)) return cut.slice(0, idx + 1).trimEnd();
  }
  const idx = cut.lastIndexOf(" ");
  if (idx > 0) return cut.slice(0, idx).trimEnd();
  return cut.trimEnd();
}

function stripDashes(text) {
  return text.replace(/—/g, ", ").replace(/–/g, ", ");
}

async function callOpenAI({ apiKey, model, systemPrompt, userMessage, maxTokens }) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: maxTokens,
    }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    let detail = errText;
    try {
      const j = JSON.parse(errText);
      detail = j?.error?.message || errText;
    } catch (_) {}
    throw new Error(`OpenAI error (${res.status}): ${detail}`);
  }
  const data = await res.json();
  let text = (data?.choices?.[0]?.message?.content || "").trim();
  if (text.startsWith('"') && text.endsWith('"')) {
    text = text.slice(1, -1).trim();
  }
  return stripDashes(text);
}

export async function generateNote({ format, tone, profile, userProfile, apiKey, model }) {
  const fmt = format === "inmail" ? "inmail" : "connection";
  const toneStr = (tone || "").trim() || "Professional";
  const modelStr = (model || "gpt-4o-mini").trim();
  const profileBlock = formatTargetProfile(profile);

  const systemPrompt = fmt === "inmail" ? buildInmailPrompt(userProfile) : buildConnectionPrompt(userProfile);
  const maxTokens = fmt === "inmail" ? 900 : 250;
  const reminder =
    fmt === "inmail"
      ? `between ${INMAIL_MIN_WORDS} and ${INMAIL_MAX_WORDS} words, at least two specific references, short paragraphs separated by blank lines, signoff with 'Thanks,' then the user's first name on the next line. Must include a clear, specific ask about openings or referrals at their company. NO em-dashes or en-dashes anywhere.`
      : `strictly under ${CONNECTION_MAX_CHARS} characters, one specific reference, single short paragraph, no signoff. Must include a short, specific ask about openings at their company. NO em-dashes or en-dashes anywhere.`;

  const userMessage =
    `Tone: ${toneStr}\n` +
    `Format: ${fmt}\n\n` +
    `Target profile:\n${profileBlock}\n\n` +
    `Write the message now. Remember: ${reminder}`;

  let raw = await callOpenAI({
    apiKey,
    model: modelStr,
    systemPrompt,
    userMessage,
    maxTokens,
  });

  function parseSubjectAndBody(text) {
    const newlineIdx = text.indexOf("\n");
    const first = (newlineIdx === -1 ? text : text.slice(0, newlineIdx)).trim();
    if (first.toLowerCase().startsWith("subject:")) {
      return {
        subject: first.slice(8).trim().replace(/^["']|["']$/g, ""),
        body: newlineIdx === -1 ? "" : text.slice(newlineIdx + 1).replace(/^\n+/, "").trim(),
      };
    }
    return { subject: "", body: text };
  }

  let subject = "";
  let note = raw;
  if (fmt === "inmail") {
    ({ subject, body: note } = parseSubjectAndBody(raw));
  }

  if (fmt === "inmail") {
    const wordCount = note.split(/\s+/).filter(Boolean).length;
    if (wordCount < INMAIL_MIN_WORDS || wordCount > INMAIL_MAX_WORDS) {
      const retryMsg =
        `Your previous attempt was ${wordCount} words, outside the required range of ` +
        `${INMAIL_MIN_WORDS} to ${INMAIL_MAX_WORDS} words. ` +
        `Rewrite it to land between ${INMAIL_MIN_WORDS} and ${INMAIL_MAX_WORDS} words, ` +
        `keeping the subject line, greeting, paragraph structure, the hiring ask, and the "Thanks," signoff. ` +
        `Output the full message including the "Subject: ..." line at the top.\n\n` +
        `Previous attempt:\nSubject: ${subject}\n\n${note}`;
      const retryRaw = await callOpenAI({
        apiKey,
        model: modelStr,
        systemPrompt,
        userMessage: retryMsg,
        maxTokens,
      });
      const parsed = parseSubjectAndBody(retryRaw);
      if (parsed.subject) subject = parsed.subject;
      note = parsed.body;
    }
  }

  if (fmt === "connection" && note.length > CONNECTION_MAX_CHARS) {
    const retryMsg =
      `Your previous attempt was ${note.length} characters, which exceeds the hard limit of ${CONNECTION_MAX_CHARS}. ` +
      `Rewrite it under ${CONNECTION_MAX_CHARS} characters while keeping the greeting, the one specific reference, ` +
      `and the hiring ask. Output ONLY the revised note.\n\nPrevious attempt:\n${note}`;
    note = await callOpenAI({
      apiKey,
      model: modelStr,
      systemPrompt,
      userMessage: retryMsg,
      maxTokens,
    });
  }
  if (fmt === "connection" && note.length > CONNECTION_MAX_CHARS) {
    note = smartTruncate(note, CONNECTION_MAX_CHARS);
  }

  return {
    note,
    subject,
    format: fmt,
    word_count: note.split(/\s+/).filter(Boolean).length,
    char_count: note.length,
  };
}
