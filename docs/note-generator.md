# Selected-target Note Generator

## Approved scope — 12 November 2026
Felix approved the draft, changed it to one selected target per generation and added Pharmacy. Targets: eCase, GP, NOK, Manager, Pharmacy. Source text may be rough notes, an outgoing draft/sent email, received reply or thread. No new incident questionnaire, email sending or eCase submission is introduced. Existing Fall/Wound/Infection output and API validation stay unchanged.

## User flow
Open Note Generator; paste original text (16,000 characters maximum); select source type and communication status (Unknown default), optionally add context (4,000 maximum). Select one target, then use its named Generate button. No target is preselected; no generation of all targets. eCase uses factual paragraphs without compulsory incident headings; GP is clinical, NOK plain language, Manager operational, Pharmacy a medication/supply enquiry using exact supplied details.

The original input is shared across targets, while each output/manual edit is banked separately in page memory. Selecting another target or source edit resets Copy verification and invalidates late results. A source fingerprint marks older drafts as stale. Edited drafts are protected; replacement requires an explicit confirmation. Clear resets the note workspace only. Both Studio modes stay mounted so incident and note work survive switching. Refresh/close still loses page-memory work.

## Rewriting boundary
`POST /api/notes` is a separate authenticated same-origin endpoint using the existing owner allowlist, server key and model. No change to the incident exact-wording validator or server handler. A selected-target request triggers at most two provider requests: a structured rewrite and a separate source/meaning review, using store:false, strict JSON, bounded text and one total 55-second budget. No automatic retries.

Draft shape: text, external warnings and exact source/draft quotation references. Deterministic checks reject unsupported output numbers, fabricated source references, invalid shapes and completed-contact language for an outgoing Draft/Unknown converted to eCase. A separate model review checks unsupported/changed facts, clinically material omissions, uncertainty, status, source actors and chronology. Any failed/malformed/incomplete review returns an error with no document. Original input and previous outputs remain unchanged; the original source is never relabelled as a successful optimisation.

These are layered checks, not semantic proof: matching numbers does not establish correct units/association, references do not prove every claim and a model reviewer can miss errors. Human comparison is required before Copy. Audience adaptation can omit irrelevant detail but must preserve audience-critical information. No new diagnosis, treatment, prescription, medication route, delivery arrangement, contact, advice or outcome is authorised by rewriting. Source/context are treated as untrusted data, never executable instructions.

## Privacy and limits
Only pressing Generate sends original text/context and selected metadata through the private Site to OpenAI; the second review includes the same source and candidate. No source/note logging or persistence is added; no name map/clinical fixtures are committed. Automatic name pseudonymization remains INC-07, not a claimed protection. Existing audience, key/model and page-memory boundary remain unchanged. Use workplace-authorised/de-identified material.

## Verification
`npm test`, `npm run check:repo`, `npm run typecheck`, supported Sites build-site.mjs. Nine new synthetic API/contract tests cover all targets and safe paraphrases, source/status/numeric validation, rejected review, auth/origin/media/size/config/provider errors and source-fingerprint ownership. Existing 34 tests remain unchanged. Tests initially failed with missing new module. Provider tests are mocked; browser controls, live provider and signed-in production acceptance are distinct evidence. Prior rollback baseline is v4.

Related: [INC-06 rewriting](https://github.com/wanghinfelix1997715-arch/incident-website/issues/6), [INC-07 privacy](https://github.com/wanghinfelix1997715-arch/incident-website/issues/7), [INC-08 regression](https://github.com/wanghinfelix1997715-arch/incident-website/issues/8), [INC-13 failure evidence](https://github.com/wanghinfelix1997715-arch/incident-website/issues/13).
