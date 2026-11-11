# Incident engineering constraints

Reviewed 11 November 2026. Apply with root AGENTS, current General and scoped Falls instructions. These constraints describe the demonstrated checks and review requirements; they do not invent a coverage percentage or claim full clinical correctness.

| Gate | Actual command | Scope |
| --- | --- | --- |
| Repository contract | node scripts/check-repository.mjs | Required entry files and local Markdown links; fails on missing targets/tool errors |
| Synthetic regression | npm test | All top-level tests/*.test.mjs through scripts/run-tests.mjs; production drafting/AI-handler boundaries with mocks plus repository-gate controls |
| Types | npm run typecheck | Project TypeScript after implementation/dependency changes |
| Build | supported Sites build-site.mjs helper; npm run build in the prepared project environment | Framework/Worker build; does not establish runtime layout/API acceptance |
| Diff review | compare source, constraints and tests against task baseline | Approved answers/fields preserved; no unexplained skipped/deleted tests, weaker assertions/suppressions or hidden unfinished behavior |

## Must-preserve rules

- Falls A1–A8, six-section design, four output groups and approved defaults with Copy verification.
- Manual edits, pending status, uncertainty, chronology, baseline findings, site/side and values.
- Existing page-memory data boundary, optional server-side AI and owner access; no name map/clinical payload/key in repository diagnostics.
- New processing layers must exercise normal old input and safe failure through the real affected path.
- Rejection/fallback behavior cannot be silently weakened to make rewritten prose pass.

## Enforcement and limits

Repository and synthetic commands are configured in GitHub Actions. Type/build are local task checks for changes that require them; the regression workflow does not claim to run them. Required branch protection is not configured/verified by this setup. Review of constraints/test weakening is a human/agent diff review, not an installed universal scanner.

The repository-gate tests calibrate the actual command with a clean control, broken-link violation and missing-instructions/tool-error case. API tests intercept the provider and are not live-model evidence. Browser UI, clipboard, transport/name protection and colleague access require their own evidence. A regression result or build is not a substitute for those checks.

Critical correctness, privacy or loss-of-work failures block dependent delivery. An out-of-scope or unverified item must have an issue/source, impact and next action; reporting it does not certify a fix. No blanket exemption is introduced.
