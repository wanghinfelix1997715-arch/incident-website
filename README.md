# AfterFall — RN Documentation Studio

Sites migration of the approved six-section post-fall questionnaire and four documentation outputs. The forest-green MagicPath layout is retained. No database, resident persistence, direct RiskMan/eCase submission or email sending is implemented.

## Source and development rules

Start with [START-HERE.md](START-HERE.md), [AGENTS.md](AGENTS.md), the [issue index](docs/issue-index.md), and [source status](docs/source-status.md). Read current General as layer 1 and this project as layer 2; record the General revision actually read. The optional manifest preserves historical integration evidence. AfterFall remains the protected falls pathway; read [its instructions](docs/afterfall/AGENTS.md) before any falls or shared-layer change.

The original full 11-section development principles, originally reused from ShiftBrief, are preserved in [legacy-development-principles.md](docs/legacy-development-principles.md). ShiftBrief-specific modules and issue numbers are historical references, not Incident behavior or issue IDs. The detailed approved requirements and existing synthetic regressions remain authoritative for this app.

Incident expansion is tracked in INC-01–INC-13. Wound and infection now have independent six-section questionnaires, RiskMan four-field drafts, paragraph progress notes and GP/NOK drafts; see [pathway contract](docs/incident-pathways.md). Falls retain their approved six-heading eCase output. Medication remains future work.

## Run and verify

Node 24 and the Sites supported dependency installer are used. `npm test` discovers all top-level test suites: the original 21 synthetic application checks (including A1–A8 and identity/status) plus three calibrated repository-gate checks and ten wound/infection pathway/API checks. `npm run typecheck` checks TypeScript. Build with the Sites `build-site.mjs` helper. The `.github/workflows/afterfall.yml` runs synthetic regression and repository contract checks on PR/push; no claim is made about branch protection or automatic Sites deployment.

## API

Set **OPENAI_API_KEY** as a secret through Sites runtime settings. Optional **OPENAI_MODEL** defaults to the original prototype's `gpt-4.1-mini`; the current hosted setting overrides this with `gpt-6-luna`. **AFTERFALL_OWNER_EMAIL** is a server-only allowlist configured from verified Sites ownership, never supplied by the browser. Secrets must never enter tracked files, client bundles, screenshots, chat or clinical documents. The user has configured the hosted API key; its validity is not implied by its presence.

AI use is optional and opt-in. `POST /api/generate` requires the Sites-injected owner email, same-origin JSON and bounded input. The Site must remain owner-private. Service access without visitor identity is rejected. This shared drafting tool does not invent a stable user ID or store user-owned records; the generic ChatGPT identity helper is unchanged. If sharing changes, review this owner allowlist before granting other users access. It calls the Responses API with `store:false`, a strict schema and timeout. The server constructs its own canonical drafts; it does not trust client-generated templates. Deterministic validation accepts only preservation of clinical tokens, numerical punctuation, chronology, headings and approved synonymous wording. Freer rewrites are rejected and the complete local template is returned. This is deliberately conservative and is not a general semantic proof of clinical correctness. Manual review remains required.

Without a key, local drafting remains fully functional and the AI option is disabled. No real upstream API request was used for verification. Mocked tests exercise success, failure, malformed output, rejected facts and fallback.

## Data

Assessment, drafts and manual edits live in React page memory. Refresh or closing the page loses all work. Clear resets only the active pathway; switching pathways retains separate working drafts. Local drafting makes no assessment request. Opting into AI sends canonical text derived from the assessment through the Site to OpenAI. The app does not log or persist clinical payloads. Platform/provider handling is distinct from application persistence. Do not use identifiable clinical information without workplace approval.

For falls only, default GP informed, NOK informed and FRAT completed are retained by explicit user instruction for their end-of-incident workflow. They must be verified before Copy. Pending/not-completed selections remain explicit. Warnings stay outside all copied text.

Repository completion and verification: [setup delivery](docs/setup-delivery.md). Feature progression remains in [the issue index](docs/issue-index.md).
