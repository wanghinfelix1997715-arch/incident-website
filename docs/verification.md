# Migration verification

## Owner identity and connection-state repair

- Evidence: production status requests had a Sites-injected email but lacked the stable-ID header required by the starter identity helper. They failed before OpenAI. Presence of an API key was therefore not tested by those failures.
- Both API routes now authorize the platform-injected email against the verified owner allowlist, fail closed without configuration, reject anonymous and non-owner callers, and retain the platform's owner-private boundary. No synthetic ID, public bypass or browser-held secret is introduced.
- 21 synthetic regression tests, TypeScript and production build passed. Original 19 expected cases unchanged. New cases cover owner email without ID, ID plus email, wrong owner, no identity, service bearer alone, missing allowlist, and distinct status states.
- Internal browser QA: connection failures are no longer called missing keys; the visible retry button works without clearing the synthetic example; local document generation still works.
- Actual OpenAI response and deployed signed-in browser behavior remain separate from these mocked/internal checks; do not claim live API success from build or deployment alone.
- Sites source is saved through the supported source workflow. External GitHub synchronization remains blocked by the earlier rejected operation; no retry or workaround was attempted.

## Original migration checks

- 19 synthetic regression tests passed, including the eight recovered Phase 1 acceptance directions. New tests; no pre-existing expected answer was changed.
- TypeScript passed.
- Production Vinext/Worker build passed with routes `/`, `/api/generate`, `/api/status`.
- Browser QA at the supported internal preview: original forest-green two-column layout compared with MagicPath screenshot; six sections navigated; synthetic example and four output groups generated; eCase headings inspected; GP/NOK editors opened; independent manual Details edit preserved across changed Location and regeneration; Summary/eCase/NOK location updated; copy refused before verification; verified Copy produced document text only in the clipboard; editing input resets verification; GP Pending remains pending in eCase; unchanged 18:00 reassessment retained after initial findings without invented deterioration.
- API success/failure/refusal/malformed-output, unsafe clinical text, absent credentials, input validation, authentication, same-origin and payload limits exercised with synthetic mocked requests. No real OpenAI call made and no runtime key configured.
- Mobile viewport and deployed-production browser interactions not separately tested. Responsive breakpoints are retained from the original design; no claim of complete device coverage.
- Original ZIP smoke tests were static string checks. Migration adds executable rule and API-path tests rather than claiming original smoke checks prove clinical correctness.
- Source snapshots preserve the exact read MagicPath revision and original ZIP source; docs/requirements.md maps the merged fields and intentional fixes.

## Repository workflow completion — 11 November 2026
The setup task retained every original application test and expected answer. npm test now discovers all top-level *.test.mjs suites; local run passed 24 checks (21 original application regressions and 3 repository-gate controls). npm run typecheck and the supported Sites production build passed. General's independent runner passed 38 checks (35 task-history plus 3 repository controls). No new real-browser or live-provider acceptance was performed. Current commit/run/source correspondence is recorded in INC-01 and General #10; earlier results above remain historical.
