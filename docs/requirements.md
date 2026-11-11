# Approved requirements and migration trace

## Evidence

- Existing MagicPath project `463369048227479552`, component `463369246601285632`, selected/base revision `463369246601285633`, read directly on migration. Complete unmodified editable files retained in `reference/magicpath/`.
- Original `AfterFall_V1_Prototype.zip`, Library identity `libfile_bd863976ac588191a070957d9c5d2fa5`, read directly; source retained in `reference/zip-prototype/`.
- Prior conversation retrieved through Personal Context: Phase 1 approval 20 October 2026 18:11 UTC; Phase 2/3 hybrid architecture approval; RiskMan four-field confirmation 18:27 and 18:29 UTC; user-approved GP/NOK/FRAT completed defaults and external warnings visible in conversation context.
- AGENTS.md from existing GitHub repository and workflow issue #2 were read. No AfterFall-specific issue existed in the repository search.
- Retrieved conversation provides the eight acceptance *directions*. Original complete chat transcript and verbatim test fixtures are not available. The fixtures in tests are newly authored synthetic inputs implementing those directions, not claimed as recovered original clinical records.

## Requirements → implementation → verification

| Requirement | Implementation | Verification |
|---|---|---|
| Six sections, quick-select and optional free text | lib/assessment.ts, components/AfterFall.tsx | A1–A8, schema test, browser section navigation |
| Incomplete drafts allowed with external warnings | draft/getWarnings | A7, copy-text test, browser blank generation |
| Four independent editable output groups | RiskMan four fields; eCase; GP; NOK | A8, browser tabs and manual-edit regeneration |
| RiskMan Summary, Details, Immediate Action Taken, Investigation | seven-field Docs type, four RiskMan editors | A1–A8, UI inspection |
| Investigation may repeat findings/actions and include documented factors/prevention/follow-up | draft | field coverage test |
| Six exact eCase headings in order | headings constant | A7, AI rejection test, browser |
| Brief GP clinical summary/review request | draft.gp | A4/A5, browser |
| Brief family-friendly NOK email | draft.nok | A2/A5, no-invented-deterioration test, browser |
| Chronological optional reassessment | initial facts then subsequent assessment, without overwriting | A2 |
| Missing ≠ normal, suspected ≠ confirmed, baseline ≠ new | deterministic rendering | A1/A3/A7 |
| Head strike/anticoagulant and escalation retained | clinical rendering, risk warnings | A4 |
| No pain does not exclude injury | independent selections | A5 |
| Pending ≠ completed | explicit status rendering | A6 |
| GP/NOK/FRAT default Completed; clean drafts and warnings outside | empty defaults, copy gate | A6, browser copy gate/clipboard |
| Optional AI plus deterministic validation and fallback | lib/generate.ts and API routes | mocked API tests; live API pending key |
| Protect manual changes across regenerate | mergeDrafts + explicit replace-all confirmation | A8, browser |
| Keep assessment in page memory; no new cloud clinical storage | React state; no D1/R2 | source check, browser refresh |
| Preserve MagicPath visual design and all original fields | source-derived UI; ZIP-only fields restored | original screenshot compared with browser |

## Eight acceptance directions

A1: Uncertain staircase mechanism remains uncertain; no invented GCS.
A2: Initial assessment and later deterioration retained in sequence.
A3: Pre-existing weakness remains baseline, not a new deficit.
A4: Head strike plus anticoagulation and documented escalation retained.
A5: No pain and identified injury both retained.
A6: Pending GP notification never becomes informed; same status logic for NOK/FRAT.
A7: Missing observations do not become normal values.
A8: Re-edit/regenerate updates all four output types while protecting independent manual edits.

## Differences resolved

The ZIP has richer fields than the later MagicPath component: found/scene narrative, mechanism certainty, pupils, cognition, baseline history, weight bearing, mobilised status, medication notes, transfer method, other actions and separate GP/NOK advice. These are retained alongside MagicPath fields in the same six sections. The MagicPath forest-green two-column design is retained.

Observed prototype defects corrected without changing the approved outcomes: date/LOC/medications/prevention/mobility selectors were not consistently rendered; default selections could appear without data state; GP pending was silently omitted; an unchanged reassessment could become “changes requiring management” in the ZIP NOK template; unconditional “incident reviewed” claims were unsupported; regeneration overwrote manual edits in MagicPath. Cases were added, not adjusted to satisfy faulty behavior.

The AI validator is stricter than the ZIP's key/heading-only validation. It allows limited equivalent phrases and formatting, rather than accepting arbitrary clinical rewriting. Broader wording is rejected to templates; this limit is explicit.

No clinical-case fixtures from residents were copied into tests. No changes to the existing ShiftBrief application or its historical test expected answers.
