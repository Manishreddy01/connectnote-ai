const CONNECTION_MAX_CHARS = 300;
const INMAIL_MIN_WORDS = 60;
const INMAIL_MAX_WORDS = 150;

function buildSharedRules(userProfile) {
  const userBlock = formatUserProfile(userProfile);
  return `${userBlock}

Shared rules:

ANCHOR PRIORITY (strict, in order):
1. The target's CURRENT role at their CURRENT company (highest priority - this is what's relevant for outreach).
2. The target's About section (if substantial).
3. The target's headline.
4. A substantive Original post (only if listed under "Original posts", and only if it makes a specific, concrete claim).
5. Education, ONLY if nothing above is available.

NEVER anchor on:
- A past job that ended more than 2 years ago. If the target's experience list shows a current role, anchor on THAT, not on a job from 2018 or 2019. Past jobs are background information, not anchors.
- Reposts, shared posts, or content the target did not write themselves.
- Generic phrases like "your work in AI", "your expertise in [broad field]", "production systems", "your background in tech", "extensive experience in [field]". Those are bans.
- ANY mention of mutual connections, shared connections, "people we both know", "I see we are both connected to", "we have X in common", or named third parties. The extension does NOT know the user's connection graph. Any names appearing in the input (sidebar lists, "people you may know", suggested profiles) are NOT the user's contacts and MUST NOT be referenced. Do not infer or invent shared connections under any circumstance.

BANNED OPENERS (do NOT start the body with any of these, regardless of what follows):
- "I see..." (e.g. "I see you are", "I see that you", "I see your")
- "I noticed..." (e.g. "I noticed you are", "I noticed your")
- "I came across..."
- "I was impressed by..."
- "I hope this finds you well..."
Any opener beginning with "I see", "I noticed", "I came across", or "I was impressed by" is auto-rejected.

GREETING (mandatory):
- If the input gives a target name (Name field is not "(unknown)"), you MUST include the target's first name in the greeting. Example: "Hi Jeremy,". Never just "Hi," when a name is given.
- If and only if the Name field is "(unknown)" or empty, use "Hi,".

Other rules:
- If the input lists Original posts, evaluate each one for relevance: does it reveal something specific about how they think or what they're building? If yes, you may use it. If it's a generic life update, congrats, or vague motivational content, IGNORE it.
- Reference at least one specific, concrete detail: a named company (their CURRENT company), a named product or project, a specific job function, a school, a niche skill, or a specific claim from an original post.
- Mirror the target's own wording where relevant rather than imposing your own.
- Sound like a real human wrote it. Avoid templated phrasing, buzzwords, and AI tells. Banned words/phrases: "compelling", "insights", "keen", "I'd love to connect and learn more", "exchange insights", "explore potential collaborations".
- NEVER use em-dashes (,) or en-dashes (,) anywhere in the message. Em-dashes are an AI tell. Use commas, periods, parentheses, or colons instead. A hyphen (-) is fine.
- The user IS actively job-searching. Every message must include a clear, polite ask about openings or referrals at the target's CURRENT company (for the roles listed in the user's "ROLES THE USER IS APPLYING FOR" section). The ask should feel earned, not desperate: anchor it to something specific about their CURRENT work or company first, THEN ask.
- Do not be vague ("interested in opportunities"); be specific: ask about openings at their CURRENT named company, or whether they'd be open to a quick chat about it.
- Do not oversell the user. State their situation in one short line at most, based on the "About you" block.
- Write in first person as the user.

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
- Tone is POLITE and warm. Frame as a respectful ask from someone reaching out, not as observation or analysis of them.
- The hiring ask MUST reference the exact roles from the "ROLES THE USER IS APPLYING FOR" section, verbatim. Do NOT substitute role names you infer from the user's bio (e.g. do not write "AI Engineer" if "Software Engineer" is what they listed).

Opener variety (CRITICAL):
- Do NOT open with the templated formula "I see you are <role> at <company>" or "I noticed you are..." or "I see that you...". These read as AI-generated and are banned.
- Instead, vary the opener. Pick the pattern that best fits the specific anchor you have. Examples:
  - Lead with appreciation: "Hi <name>, the work your team is doing on <X> at <Company> is exactly what I have been studying."
  - Lead with shared interest: "Hi <name>, your <project/post/role> on <X> caught my attention because I have been working on something similar."
  - Lead with a question framed as curiosity: "Hi <name>, quick question on the <X> work at <Company>..."
  - Lead with a respectful direct ask: "Hi <name>, hope you don't mind the cold message. I have been following the <X> work at <Company> and wanted to reach out."
  - Lead with the specific thing first, then yourself: "Hi <name>, <one specific thing about their work in 10 to 15 words>. I am a <user's short situation> and was hoping to ask..."
- Do NOT start two consecutive sentences with "I". Vary the sentence subjects.
- The opener should reference something specific (About, headline, role, company, or a substantive original post), but the sentence shape must not be "I see/notice you are X".

Structure: greeting, one polite sentence that anchors on a specific signal (without using the banned opener formulas), one short sentence with the hiring ask. That is it.`;
}

function buildConnectionTemplatePrompt(userProfile) {
  const userBlock = formatUserProfile(userProfile);
  return `You write a short LinkedIn connection request note on behalf of the user.

${userBlock}

This is a STRUCTURED self-introduction, NOT personalized to the target. Do NOT comment on, compliment, or analyze the target's work, posts, role, or background. The target is referenced only by first name, plus their current company name in one slot.

Universal rules:
- Write in first person as the user.
- NEVER use em-dashes (,) or en-dashes (,). A hyphen (-) is fine.
- Plain language. No buzzwords. No flattery, no "I admire / I'm impressed by your work".
- Output: ONLY the note text. No quotes, no preamble, no subject line, no signoff.

HARD LIMIT: the whole note must be under ${CONNECTION_MAX_CHARS} characters including greeting, spaces, and punctuation. Aim for 220 to 285.

Follow this template:

Hi <target first name> - I'm a <user's current role> with <N>+ years in <2 to 3 of the user's core stack items>, <short education line with expected graduation, if available>. Actively targeting <user's seeking roles> roles at <target's current company>. Would love to connect!

Rules:
- Use ONLY data from the "About you" block, except the target's first name and the target's current company name.
- For the years-of-experience number: use the user's TOTAL professional experience. Do NOT use the tenure of one single past job. If the "About you" block states a total (e.g. "3 years of experience", "3+ years"), use that exact number. If it only lists separate jobs, add their durations together. Never undercount by picking just one job's length.
- For the seeking-roles slot, use the roles from the "ROLES THE USER IS APPLYING FOR" section. You may shorten a long list to the 2 or 3 most important roles to fit the character limit, but do NOT change the role names themselves or substitute roles inferred from the bio.
- Pick only 2 to 3 stack items, the most relevant ones. Do not list more (character budget).
- If a piece of info is missing from "About you" (years of experience, education), omit that clause gracefully rather than inventing it.
- COMPANY SLOT: use the target's REAL current company name (e.g. "at GitHub", "at Nutanix"). NEVER write a generic placeholder. The phrases "at your company", "at your organization", "at your team", "at your firm", "at their company" are BANNED in the connection note. If, and only if, the target's current company is genuinely unknown or shows as "(none)" in the input, drop the clause entirely and write "Actively targeting <roles> roles." with no "at ..." part at all. Never substitute a generic word for the company.
- Keep the "Would love to connect!" closing line.`;
}

function buildInmailPrompt(userProfile) {
  const userBlock = formatUserProfile(userProfile);
  return `You write LinkedIn InMail / DM outreach messages on behalf of the user.

${userBlock}

This is a STRUCTURED outreach template, not a personalized-on-the-target message. The InMail introduces the user (their role, experience, and the roles they are seeking) and asks the target if they or someone they know is hiring. Do NOT anchor on the target's About, headline, posts, or experience. Use the target's first name only.

Universal rules:
- Write in first person as the user.
- NEVER use em-dashes (,) or en-dashes (,) anywhere in the message. Use commas, periods, parentheses, or colons. A hyphen (-) is fine.
- Banned phrases: "compelling", "insights", "keen", "exchange insights", "explore potential collaborations", "I hope this finds you well", "I came across your profile and was impressed", "your work in AI", "your expertise in [broad field]", "production systems".
- Sound like a real human wrote it. Plain language. No buzzwords, no marketing fluff.
- Tone guidance:
  - Professional: warm but polished.
  - Casual: friendly and conversational.
- Output: ONLY the message text. No quotes, no preamble, no explanation, no length count.

Output format: FIRST line is the subject line prefixed exactly with "Subject: ". Then a blank line. Then the body.

Subject line rules:
- Max 60 characters.
- About the user's intent: openings for their target roles. May reference the target's company by name in the subject only. Sentence case. No clickbait, no exclamation marks.
- Do NOT mention "InMail", "introduction", or "outreach".

Body structure: follow this EXACT template. Keep the empty lines between paragraphs.

Hi <target's first name>,

Hope you are doing well.

I'm a <user's current role> at <user's current company>, previously worked at <user's most recent prior company>.

I have <N> years of experience in <user's core stack, 4 to 6 items, listed naturally> and currently exploring <user's seeking roles> roles at your organization.

If you are hiring or know someone who is hiring for these positions, let me know, I can share my resume as well.

Thanks,
<user's first name>

Body rules:
- Use ONLY data from the "About you" block. Do NOT reference the target's About, headline, role, posts, education, or skills in the body. The target is addressed only by first name.
- For the years-of-experience number: use the user's TOTAL professional experience, not one single job's tenure. If the "About you" block states a total, use it exactly; if it lists separate jobs, add their durations. Never undercount.
- For the "currently exploring <roles> roles at your organization" slot, use the EXACT text from the "ROLES THE USER IS APPLYING FOR" section. Do NOT swap in role names you infer from the user's bio (e.g. do not write "AI Engineer" if that's not in the applying-for list). If the user wrote "Software Engineer" there, the message MUST say "Software Engineer roles". If they listed multiple, list them in the same order they provided.
- Keep "your organization" generic in the body. Do NOT substitute the target's company name there.
- If a piece of info is missing from the "About you" block (years of experience, prior company, etc.), omit that clause gracefully rather than inventing it. Example: if no prior company is mentioned, write "I'm a <role> at <company>." without the prior-company clause.
- Body length: between ${INMAIL_MIN_WORDS} and ${INMAIL_MAX_WORDS} words.
- End body with "Thanks," on its own line, then the user's first name on the next line.`;
}

function buildInmailPersonalizedPrompt(userProfile) {
  return `You write a personalized LinkedIn InMail / DM message on behalf of the user (long-form, NOT the 300-char connection request).

${buildSharedRules(userProfile)}

InMail-specific rules (personalized mode):
- Output format: FIRST line is the subject line, prefixed exactly with "Subject: ". Then a blank line. Then the body.
- Subject line: max 60 characters, sentence case, referencing the target's CURRENT role or company. No clickbait, no exclamation marks. Do NOT mention "InMail", "introduction", or "outreach".
- Body length: between ${INMAIL_MIN_WORDS} and ${INMAIL_MAX_WORDS} words.
- Body structure:
  1. Greeting with the target's first name.
  2. One short paragraph (2 to 3 sentences) anchoring on the target's CURRENT role at their current company, or a substantive Original post if one is listed. Keep it grounded, no flattery, no "I admire your work".
  3. One short paragraph (2 to 3 sentences): one brief line on the user (from "About you"), then the ask: whether their team is hiring for the user's target roles (use the exact roles from the "ROLES THE USER IS APPLYING FOR" section), or whether they could point the user to the right person.
- End the body with "Thanks," on its own line, then the user's first name on the next line.`;
}

function formatUserProfile(u) {
  const name = (u.fullName || "the user").trim();
  const bio = (u.aboutYou || "").trim();
  const seeking = (u.seekingRoles || "").trim();
  const parts = [`About the user (${name}):`];
  if (bio) parts.push(bio);
  if (seeking) {
    parts.push(
      `\nROLES THE USER IS APPLYING FOR (use this VERBATIM in the message; do NOT paraphrase, do NOT substitute role names you think fit their bio better, do NOT add or remove roles):\n${seeking}`
    );
  }
  return parts.join("\n");
}

function formatTargetProfile(p) {
  const parts = [
    `Name: ${p.name || "(unknown)"}`,
    `Headline: ${p.headline || "(none)"}`,
    `CURRENT ROLE (this is what to anchor on; the company here is the one the user wants to apply to): ${p.currentRole || "(none)"}`,
    `About: ${p.about || "(none)"}`,
  ];
  if (p.experience && p.experience.length) {
    parts.push(
      "Past experience (for CONTEXT ONLY, not for anchoring; the first entry is the current role already shown above; DO NOT anchor on jobs that ended more than 2 years ago, and DO NOT reference old companies in the ask):\n" +
        p.experience.map((e) => `- ${e}`).join("\n")
    );
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

export async function generateNote({ format, tone, profile, userProfile, extraContext, isRecruiter, apiKey, model }) {
  const fmt = format === "inmail" ? "inmail" : "connection";
  const recruiterMode = isRecruiter !== false;
  const toneStr = (tone || "").trim() || "Professional";
  const modelStr = (model || "gpt-4o-mini").trim();
  const profileBlock = formatTargetProfile(profile);
  const extras = (extraContext || "").trim();

  let systemPrompt;
  let reminder;
  if (fmt === "inmail" && recruiterMode) {
    systemPrompt = buildInmailPrompt(userProfile);
    reminder = `Follow the structured template exactly. Subject line on the first line. Then: greeting using target's first name, "Hope you are doing well.", one-sentence user intro (current role + company + prior company), one paragraph on user's stack and seeking-roles ending with "at your organization", the hiring ask, then "Thanks," and the user's first name. Use ONLY the user's About-you data in the body. Do NOT anchor on the target's profile in the body. Body length ${INMAIL_MIN_WORDS} to ${INMAIL_MAX_WORDS} words. NO em-dashes or en-dashes anywhere.`;
  } else if (fmt === "inmail" && !recruiterMode) {
    systemPrompt = buildInmailPersonalizedPrompt(userProfile);
    reminder = `Personalized InMail. Subject line on the first line. First paragraph anchors on the target's CURRENT role or a substantive original post (no flattery). Second paragraph: one short line on the user, then the ask about openings on their team for the user's exact target roles. End with "Thanks," then the user's first name. Body length ${INMAIL_MIN_WORDS} to ${INMAIL_MAX_WORDS} words. NO em-dashes or en-dashes anywhere.`;
  } else if (fmt === "connection" && recruiterMode) {
    systemPrompt = buildConnectionTemplatePrompt(userProfile);
    reminder = `Follow the connection template exactly: "Hi <first name> - I'm a <role> with <N>+ years in <stack>, <education>. Actively targeting <seeking roles> roles at <target's company>. Would love to connect!" Use only the user's About-you data plus the target's first name and current company. Strictly under ${CONNECTION_MAX_CHARS} characters. No flattery, no comment on the target. NO em-dashes or en-dashes anywhere.`;
  } else {
    systemPrompt = buildConnectionPrompt(userProfile);
    reminder = `strictly under ${CONNECTION_MAX_CHARS} characters, one specific reference, single short paragraph, no signoff. Must include a short, specific ask about openings at their company. NO em-dashes or en-dashes anywhere.`;
  }
  const maxTokens = fmt === "inmail" ? 900 : 250;

  const extrasBlock = extras
    ? `\nUser's additional instructions for THIS message (highest priority, but must NOT override hard constraints: character/word limits, banned phrases, no em-dashes, the structured template for InMail):\n${extras}\n`
    : "";

  const userMessage =
    `Tone: ${toneStr}\n` +
    `Format: ${fmt}\n\n` +
    `Target profile:\n${profileBlock}\n` +
    extrasBlock +
    `\nWrite the message now. Remember: ${reminder}`;

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
