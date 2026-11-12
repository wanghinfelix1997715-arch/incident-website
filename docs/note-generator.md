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

## Contextual shorthand and prose — 12 November 2026
User-reported live output left shorthand unexpanded and repeated stilted wording. Source inspection found no local abbreviation guidance; the old numeric validator rejected a faithful `every 3/12` -> `every 3 months` expansion. Replayed baseline confirms that unexpanded `f&f` passed while that month expansion failed.

`lib/note-language.ts` now supplies BOTH writer and reviewer with whole-sentence/context instructions, local meanings (f&f food and fluid; ax assessment; tx transfer in care/mobility notes), standard clinical abbreviation guidance and a synthetic natural-prose example. The list is not exhaustive: other familiar shorthand can be expanded when context establishes meaning; unsupported or ambiguous meanings must stay unresolved with a warning. Tx is not globally replaced: treatment may be correct in another context. Local definitions are user-supplied, not claimed as universal approved abbreviations.

Faithful restructuring and deduplication of the same observation are allowed; separate times, observed versus reported pain and other distinct findings remain. No invented normality, ongoing monitoring or continuity words. Known local f&f/ax and care-and-tx cannot simply be copied as a supposedly optimised output.

Only explicit sentence cues permit slash-notation numeric normalisation: every/in/for/etc N/12 can become N months; a date marked on/dated/etc day/month can use a named month in Australian day/month order. Only the matching expanded phrase is normalised back for the numeric check: a sanctioned three-month interval does not authorise a new 3 mg dose. Scores, BP, medication values and isolated ambiguous notation are not globally split or converted. Exact original source quotation references are retained. Source/meaning review and manual verification still apply; these rules are not complete semantic proof.

Online reference reviewed: [ACSQHC safe medicines terminology](https://www.safetyandquality.gov.au/resources/recommendations-safe-use-medicines-terminology) and its [fact sheet](https://www.safetyandquality.gov.au/resources/recommendations-safe-use-medicines-terminology-fact-sheet). These support clear wording and careful abbreviation use; they are not a dictionary of every local nursing term. The app does not browse resident text online or claim access to all abbreviations. Existing private Site -> OpenAI data boundary, key/model, incident validators and edit protection remain unchanged.

Seven additional synthetic tests bring the suite to 50, with all previous 43 unchanged. They cover expansions, recurring interval/date distinction, no invented year, ambiguous/score/ratio preservation, medication-number protection, and writer/reviewer instructions through mocked production handler. Actual provider wording and browser acceptance remain distinct from these checks.
