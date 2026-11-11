# Incident API evaluation contract

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
