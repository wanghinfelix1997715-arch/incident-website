# Incident Studio / AfterFall — project instructions
Approved documentation setup: 11 November 2026. Current hosted baseline: AfterFall v3, source e84576504f243222f3744afc17ff97f43572b0de.
This is one existing Site growing into an incident generator; no second Site or duplicate application is created by this documentation task.

## Read before any task
1. Read [current General AGENTS](https://github.com/wanghinfelix1997715-arch/General/blob/main/AGENTS.md), relevant General issues/comments and task-selected full upstream skills first. Then complete this project layer. Record the General revision actually read. engineering-adoption.json records historical integration; it is not a permission gate or a reason to ignore current General. If a required source is unavailable, report source, impact and next action.
2. Read README, docs/requirements.md, docs/verification.md, docs/incident-roadmap.md and the relevant project issue body/comments, including open and closed history. Search labels AND keywords.
3. Falls/shared-output/API changes must read docs/afterfall/AGENTS.md. Wound work must read docs/wound-questionnaire.md and relevant INC issues.
4. Existing development principles remain preserved in docs/legacy-development-principles.md with their origin. Its ShiftBrief issue numbers and clinical modules are historical cross-project references, not this project's issue IDs or product scope.
5. Read the actual changed source/tests and approved examples. This file is an entry point, not a substitute for task requirements.

## Product boundaries
- Keep the working forest-green AfterFall six-section questionnaire, all retained fields and four document groups. No redesign or conflation of pathways unless separately requested.
- RiskMan retains Summary, Details, Immediate Action Taken and Investigation. eCase retains six existing headings; GP concise clinical request; NOK plain-language family update.
- Incident type selects its own questions, data and drafting rules. Share review/edit/Copy only where behavior remains compatible. Never let a wound field or previous incident contaminate falls.
- Existing defaults GP/NOK/FRAT Completed were explicitly approved for the falls workflow; retain its verification gate. Do not silently extend those defaults to new pathways.
- Wound plan/notification status is explicit: completed/pending/not required as applicable. GP notified, awaiting response and reviewed are distinct.
- Severity matrix supplied by Felix uses Minor/Moderate/Major/Extreme. Any alternative eCase scale and mapping remain to confirm; do not invent a conversion or derive escalation from size/classification alone.
- Wound questionnaire is a design proposal pending detailed acceptance; infection and medication pathways are planning work. Documentation/issue creation does not implement them.

## Facts, API and edits
Preserve uncertainty, chronology, initial versus later assessment, baseline versus new, values/site/side and action status. Missing observation never becomes normal. Do not invent treatment, review, notification or drug detail.
Current AI validator intentionally allows narrow wording changes; broader language optimization requires a separately tested contract. No silent relaxing of fact checks.
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

