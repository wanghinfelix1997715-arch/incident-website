# Incident task checklist

Use General as layer 1 and Incident as layer 2. Keep the task record in its GitHub issue, using General's template if useful.

Before changes: record General/project/source revisions actually read; relevant issue bodies/comments and full skills/references; task mode, acceptance, must-preserve behavior and source/verification gaps.

During work: keep a complete useful slice, preserve independent edits and use synthetic fixtures. Shared changes must exercise existing Falls cases through the new boundary. Respect the current narrow API validator until the separately tested language-improvement contract is implemented.

Before delivery: run CONSTRAINTS commands appropriate to the change; review application/spec/test/constraint diffs; explain changed expected answers; record GitHub/Sites correspondence and actual deployment state. Distinguish unit/mock, browser, live API and user feedback. A total failure cannot overwrite prior valid output.

Issue routing: defect, questionnaire, exact clinical answer, UI expectation and test evidence belong here. A reusable missing engineering practice can update an existing General issue with a link to this one. Do not duplicate full mutable specifications.

Current blockers/plans: Wound questionnaire details and eCase severity scale need specification acceptance; name pseudonymization and freer API rewriting are planned. Their issue creation is not proof of implementation. Source/config/access changes require actual current evidence.
