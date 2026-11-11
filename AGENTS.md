# Incident Studio / AfterFall — project instructions
Approved documentation setup: 11 November 2026. Current hosted baseline: AfterFall v3, source e84576504f243222f3744afc17ff97f43572b0de.
This is one existing Site growing into an incident generator; no second Site or duplicate application is created by this documentation task.

## Read before any task
1. Read engineering-adoption.json. Load [General AGENTS at the adopted commit](https://github.com/wanghinfelix1997715-arch/General/blob/521fdfc48f6d566d3db51ead1cfd062435617b72/AGENTS.md) and applicable skill workflows at that commit. If publication/adoption is pending or unavailable, report it; do not invent a commit or claim successful cross-repo loading.
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
Discovered commands: node --test tests/regression.test.mjs; package script typecheck; build using supported Sites build helper. Discover installed tool paths/runtime again rather than copying old machine paths.
Use foundation / confirmed rules / issue reproductions. Shared changes must run ordinary success plus existing falls cases through the new path. Record any changed expected answer with source and reason.
Mocks, browser UI, real OpenAI response, deployment and user feedback are separate evidence.
This task changes instructions and tracking only; no clinical algorithm/UI/model/access changes. Publish application behavior only under the corresponding implementation task.
Keep actual GitHub/source/hosting correspondence in docs/source-status.md. Pending remote setup must not be described as fully synchronized.

