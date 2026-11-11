# AfterFall — Post-Fall Documentation Studio (V1 prototype)

A responsive, single-incident RN documentation assistant that gathers one six-section assessment and creates four editable output types: RiskMan (Summary, Details, Immediate Action Taken, Investigation), eCase (six fixed headings), concise GP email, family-friendly NOK email.

## Start

Requires Node.js 20+. No npm installation needed.

```bash
node server.mjs
```

Open `http://localhost:4173`.

Without an API key, **Generate documents** tries the AI endpoint, then transparently falls back to offline templates. To enable AI drafting:

```bash
OPENAI_API_KEY=your_key_here OPENAI_MODEL=gpt-4.1-mini node server.mjs
```

API key remains on the server; never expose it in client JavaScript, GitHub or screenshots. AI request carries entered assessment data and optional reference templates to the API. No data is written to a database, localStorage or disk by this application. Browser state lasts for the current page session only. Do not submit identifiable resident information unless the facility has approved the system and data transfer.

## Safety / use limitations

This is a **documentation draft tool**, not a clinical assessment, monitoring or escalation pathway. RN must verify accuracy against actual clinical findings and facility policy before submission. Blank findings are not presumed normal. AI-generated clinical text can contain errors even when given explicit constraints. Users must verify GP/NOK notifications, FRAT status and all other claimed completed actions.

A synthetic demonstration incident is included. No real resident data or private documents are bundled.

## Files

- `index.html`: app shell
- `styles.css`: responsive layout and design
- `app.js`: questionnaire, conditional fields, local templates, draft editing / clipboard, user verification
- `server.mjs`: zero-dependency HTTP server and optional server-side AI endpoint

## Known limitations / next QA

- This V1 is a local runnable prototype, **not deployed to ChatGPT Sites** and not connected to RiskMan/eCase/Gmail.
- Exact RiskMan screenshots were discussed; the four requested text fields are implemented. Form schema outside those fields remains handled in RiskMan.
- Template text is basic; manual RN review is needed. The optional AI response is validated for keys and eCase headings, but is not semantically guaranteed correct.
- Browser compatibility, live API behavior and clinical user acceptance are not established without interactive testing and facility sign-off.
- Default GP informed/NOK informed/FRAT completed are conveniences based on requested workflow and require verification before copying. For real clinical use, stronger final verification may be warranted.
