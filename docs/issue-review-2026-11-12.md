# Post-deployment project issue review — 12 November 2026

Reviewed all GitHub issues INC-01–INC-14 and their comments after the confirmed abbreviation workflow deployed as CareNote v9. Only INC-01 is closed; the others remain open for their stated ongoing work or unverified acceptance. Historical baseline prose is not a current implementation statement.

| Issue | Current implementation/evidence | Outstanding work / next action |
| --- | --- | --- |
| INC-01 setup | Completed and closed; current General + project instructions and GitHub/Sites correspondence retained | Maintain correspondence for each release; do not reopen setup for a feature change |
| INC-02 falls protection | Existing falls A1–A8 and dispatcher protection pass in the 57-test suite; incident renderer unchanged | Continue per-change checks; no new production-browser acceptance claimed |
| INC-03 incident routing | Fall/Wound/Infection routing delivered in v4; synthetic regressions pass | Mobile and signed-in live-provider acceptance still unverified |
| INC-04 wound | Multiple wounds, assessment/status rules and paragraph progress notes delivered in v4; regressions pass | Retain classification warnings; owner acceptance and mobile/provider checks remain |
| INC-05 severity and GP status | Severity user-selected, unknown allowed; no automatic alternate-scale conversion; GP status distinctions tested | Alternative-scale mapping is not a prerequisite; no automatic mapping or size-only severity decision should be added |
| INC-06 language | Selected-target rewrite and SCHN reference delivered; v9 corrects meanings and shorthand retention | Broader incident wording remains narrow; live semantic quality and abbreviation latency unverified |
| INC-07 name protection | Proposed only; no local pseudonymization implemented | Implement and verify separately before claiming names are removed before transmission |
| INC-08 regression | 57/57 tests pass, no skips; calibrated repo gate, types and supported build pass | Current GitHub CI run, required branch rules, browser/mobile/live-model checks are separate and not newly verified |
| INC-09 infection | Independent infection pathway delivered in v4, pending/confirmed status regressions pass | Owner/mobile/live-model acceptance remains unverified |
| INC-10 medication incident | Future specification, not implemented | Agree an independent questionnaire and synthetic acceptance before implementation |
| INC-11 colleague trial | Proposed; Site still owner-private with no external viewers | Plan synthetic trial and verify both Site and application authorization before access changes |
| INC-12 quality gates | CONSTRAINTS, actual test entrypoint and calibrated repository gate exist; diff review completed | Ongoing per-task evidence; no universal semantic scanner or required branch protection claim |
| INC-13 diagnostics/performance | Existing connection-state repair; Note Generator has bounded requests, distinct error paths and prior-result retention | Broader diagnostics and measured live latency remain open; full reference increases input tokens |
| INC-14 Note Generator | Five selected targets delivered; v9 contains confirmed abbreviation workflow and retained familiar shorthand | Owner-signed-in synthetic wording, Copy/edit/switching, mobile and actual provider acceptance remain unverified |

## Latest release correspondence

- Website: https://afterfall-rn.wanghinfelix1997715.chatgpt.site — CareNote v9.
- GitHub application release commit: d06b566c168fa1e3c3f0cafa966635c4a7ae1e52.
- Sites deployed source commit: 9c7768524084beaf79d6a179cb44ad43f5e84651.
- Identical complete release tree: bd392f509ae1a1bcd98f4363cb9cfb18246273c1.
- Saved version: appgprj_6ad7bdb6a78c8191a9a8cec2c462ce2d~appgver_9afb7cff016881918e6cb1d66b7bc2aa.
- Deployment: appgdep_6af5a6321bcc8191964ba3b9611b19b3, succeeded; environment revision 5 unchanged. Previous release/rollback baseline v8.
- Commands: npm test (57/57), npm run check:repo, npm run typecheck, supported Sites build-site.mjs and git diff --check passed. Four new cases failed against v8 first. Prior test expectation changes are explicitly justified in the [approved workflow](note-abbreviation-workflow.md).
- Post-deployment repository review files are documentation updates after this immutable release; they do not change its runtime or imply a second deployment. Current GitHub/Sites documentation source is synchronized separately.

## Remaining alerts

The prior browser URL policy prevents the attempted preview QA path; no workaround was used. Actual provider quality, mobile and signed-in production interaction remain unverified. Next acceptance is an owner-signed-in synthetic case set covering Tx/t/f, CNS/OT, familiar clinical abbreviations versus NOK explanations, in/on/within/every with numeric notation, genuinely conflicting meanings, status/facts, edits and response time. Do not call these complete based on the mock suite or deployment.

Refresh/close still loses page-memory work. Name pseudonymization is not implemented. No audience, storage, server key or model change occurred. These existing boundaries remain visible in the corresponding issues rather than being marked fixed by this release.
