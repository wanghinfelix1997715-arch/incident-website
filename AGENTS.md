# Incident Studio / AfterFall — project instructions
Approved documentation setup: 11 November 2026. Historical falls baseline: v3. Wound/infection released in v4; read current Sites metadata and issue evidence for the active release.
This is one existing Site growing into an incident generator; no second Site or duplicate application is created by this documentation task.

## Read before any task
1. Read [current General AGENTS](https://github.com/wanghinfelix1997715-arch/General/blob/main/AGENTS.md), relevant General issues/comments and task-selected full upstream skills first. Then complete this project layer. Record the General revision actually read. engineering-adoption.json records historical integration; it is not a permission gate or a reason to ignore current General. If a required source is unavailable, report source, impact and next action.
2. Read README, docs/requirements.md, docs/verification.md, docs/incident-roadmap.md and the relevant project issue body/comments, including open and closed history. Search labels AND keywords.
3. Falls/shared-output/API changes must read docs/afterfall/AGENTS.md. Wound work must read docs/wound-questionnaire.md and relevant INC issues.
4. Existing development principles remain preserved in docs/legacy-development-principles.md with their origin. Its ShiftBrief issue numbers and clinical modules are historical cross-project references, not this project's issue IDs or product scope.
5. Read the actual changed source/tests and approved examples. This file is an entry point, not a substitute for task requirements.

## Product boundaries
- Keep the working forest-green AfterFall six-section questionnaire, all retained fields and four document groups. No redesign or conflation of pathways unless separately requested.
- RiskMan retains Summary, Details, Immediate Action Taken and Investigation. Falls eCase retains six existing headings; wound/infection progress notes combine the four incident sections into paragraphs. GP is a concise clinical request; NOK a plain-language family update.
- Incident type selects its own questions, data and drafting rules. Share review/edit/Copy only where behavior remains compatible. Never let a wound field or previous incident contaminate falls.
- Existing defaults GP/NOK/FRAT Completed were explicitly approved for the falls workflow; retain its verification gate. Do not silently extend those defaults to new pathways.
- Wound plan/notification status is explicit: completed/pending/not required as applicable. GP notified, awaiting response and reviewed are distinct.
- Severity matrix supplied by Felix uses Minor/Moderate/Major/Extreme. Severity is user-selected (unconfirmed allowed); no automatic alternative-scale conversion or escalation derived from size/classification alone.
- Wound and infection questionnaire/output directions were approved for implementation on 12 November 2026; see docs/incident-pathways.md. Medication remains planning work. Verify current delivery evidence rather than inferring implementation from an issue.

## Facts, API and edits
Preserve uncertainty, chronology, initial versus later assessment, baseline versus new, values/site/side and action status. Missing observation never becomes normal. Do not invent treatment, review, notification or drug detail.
For Note Generator abbreviation changes, follow [the current approved workflow](docs/note-abbreviation-workflow.md): Tx treatment, t/f transfer, CNS central nervous system, OT occupational therapist; retain familiar clinical abbreviations and units where appropriate, preserve clear numeric notation, and alert only for unresolved meaning. This supersedes historical tx-transfer instructions.
The incident AI validator intentionally allows narrow wording changes and stays unchanged. The separate selected-target Note Generator uses docs/note-generator.md and its own tested source/status/number checks plus model review. Neither contract proves semantic accuracy; user review remains required.
Protect independent manual edits on regeneration; replacement requires existing explicit confirmation. Changed input resets Copy verification; stale async output must not overwrite newer work.
App currently keeps assessments/drafts in page memory. API is optional, server-key only. No new cloud clinical storage or browser persistence in this setup.
Name pseudonymization is proposed for this project, not established as implemented. Refer to ShiftBrief #7 as an engineering source; verify actual local-before-transmission behavior before claiming privacy.
Use synthetic fixtures only. No resident records, original incident screenshots, name maps or credentials in code/issues/logs.

## Verification and delivery
Read [CONSTRAINTS.md](CONSTRAINTS.md), the [task checklist](docs/task-checklist.md) and [API evaluation contract](docs/api-evaluation.md). Entry point: [START-HERE.md](START-HERE.md).
Authoritative commands: npm test (all top-level tests/*.test.mjs), npm run check:repo, npm run typecheck; build using the supported Sites build helper. Discover installed tool paths/runtime again rather than copying old machine paths.
Use foundation / confirmed rules / issue reproductions. Shared changes must run ordinary success plus existing falls cases through the new path. Record any changed expected answer with source and reason.
Mocks, browser UI, real OpenAI response, deployment and user feedback are separate evidence.
Classify the current request before changing anything: a setup/documentation task does not authorize clinical behavior changes; an authorized feature/fix proceeds within its own scope and acceptance. Publish application behavior through the supported Sites workflow when required by that implementation task.
Keep actual GitHub/source/hosting correspondence in docs/source-status.md. GitHub history and Sites source/deployment are separate; verify their actual content correspondence each time.

