# AI stage timing — 25 November 2026

Production evidence for INC-13: five `/api/generate` requests on 25 November stopped at 55,001–55,002 ms. The application shared one 55-second AbortSignal between writing and independent review. Existing logs cannot identify which stage was active at expiry. No evidence establishes date rejection or credential rejection in these attempts.

Both incident and Note Generator now give writing and independent review separate 90-second windows. The shared runner cancels an expired provider request, clears its timer and reports the failed stage. Both browser clients wait 195 seconds, beyond the two-stage 180-second budget. No automatic retries or additional provider calls. Approved factual review, complete original source, full abbreviation reference and model remain unchanged. Increasing the ceiling removes the demonstrated premature abort; it does not make the provider faster or guarantee that every request finishes.

Safe stage diagnostics contain only event, fixed operation/stage, completion/failure/timeout code and elapsed milliseconds. Never include clinical input, candidate text, error contents, identity or keys. Existing drafts/manual edits are retained on failure. Provider incomplete/unreadable responses remain failures, distinct from timeouts.

Synthetic accelerated-clock tests reproduce a 60-second writer plus 60-second review through all three incident pathways and Note Generator. They fail against the prior shared deadline and pass with separate stage budgets. Stalled writer/reviewer cases still time out without accepting an unreviewed draft, starting paid retries or logging private payloads. Client budget checks prevent the old 65-second browser deadline from cancelling the longer server workflow. Real provider latency and signed-in production generation remain separately unverified; browser reached the owner sign-in gate.

---

# Current natural-rewriting contract

See [the 20 November repair contract](natural-rewrite-repair.md): equivalent numeric notation is accepted; production quotation matching is a review aid, not a hard veto. Independent original-source review, fact/status protections and manual-edit retention remain required. This supersedes older production exact-quotation statements below.

# Incident API evaluation contract

Current AI rewriting authority: [shared language and independent source-review workflow](shared-language-workflow.md), approved 13 November 2026. Historical narrow-validator statements below describe prior releases and are superseded for production reviewed rewriting.

Use [General's standard](https://github.com/wanghinfelix1997715-arch/General/blob/main/docs/api-evaluations.md) and the actual project source. INC-06 owns wording improvements; INC-07 owns name protection; INC-13 owns diagnosis. This document defines acceptance, not a claim those features are delivered.

## Existing baseline

The current generator constructs canonical local drafts on the server, validates provider output conservatively, and returns a labelled local template when provider output fails its contract. Existing tests exercise valid synonym wording, unsafe/malformed/refused/timeout responses, authentication, absent-key fallback, chronology and numerical punctuation. See tests/regression.test.mjs and docs/verification.md for exact scope and historical limits.

## Required additions for expansion

| Test family | Acceptance |
| --- | --- |
| Safe wording | Correct grammar/flow without changing meaning, facts or audience rules |
| Facts | Changed site/side/value, unsupported normal/pain/bleeding/review or omitted required fact cannot silently enter the draft |
| Status | GP requested/notified/awaiting advice/reviewed; wound plan pending/created; NOK pending/notified stay distinct |
| Chronology | Initial versus later findings and baseline versus new preserved |
| Privacy | Normal prose succeeds through full protected pipeline; unknown identities/tokens rejected without guessing or raw-name retransmission |
| Edits and async | Regeneration/late results preserve the appropriate manual edits and input ownership |
| Failure | Actual auth/config/provider/timeout/validation reason reported outside copied text; previous valid draft retained |

All cases use synthetic facts. Each case records source revision, expected facts/forbidden changes, actual output, command/harness and result/limits in its issue. A live-model check requires its own authorized call and cannot be inferred from mocks or a configured key. This setup makes no live call and does not loosen the current validator.
