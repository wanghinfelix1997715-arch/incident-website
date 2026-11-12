# Note Generator abbreviation workflow

Status: approved for implementation and deployment by Felix, 12 November 2026. This is the current rule; it supersedes the v7/v8 tx-transfer instruction and the briefly proposed blanket ban on alphabetic abbreviations. Applies to the selected-target Note Generator, not the incident generator's protected narrow validator.

## Agreed meanings

| Input | Project meaning |
| --- | --- |
| Tx / tx | Treatment |
| t/f / T/F | Transfer |
| CNS | Central nervous system |
| OT | Occupational therapist |
| f&f | Food and fluid |
| ax | Assessment |

The SCHN table is a reference with provenance, not an instruction to replace these meanings with its alternate staff/theatre definitions. An explicit conflicting definition in the actual source must be surfaced for clarification; do not silently choose one. Retain the original table for audit rather than rewriting its historical source meanings.

## Runtime workflow

1. Read the full source, surrounding sentences, source type, communication status and selected recipient. Identify facts, chronology, uncertainty and actual actions before rephrasing.
2. Apply the confirmed meanings above. Interpret other shorthand using sentence context and the versioned SCHN reference. Do not infer a diagnosis, medication identity, route or completed action merely from a reference entry.
3. Preserve familiar established abbreviations for clinical recipients where clear and appropriate; no blanket alphabetic-abbreviation ban. Keep measurement units such as mg, mL and cm and their exact values. Expand unfamiliar wording when it improves comprehension. NOK receives plain-language explanations rather than unnecessary clinical jargon; Manager wording follows relevance.
4. Numeric shorthand may remain in output. Inputs normally carry in/on/within/every (or another clear cue): in 3/12 = a review in three months; every 3/12 = recurring three-monthly review; within 2/7 = a two-day deadline; every 6/52 = every six weeks; on 9/11 = Australian day/month date. Do not add ambiguity alerts merely for a slash. Retain original notation when clear; existing supported month/date expansions remain optional. Other numeric expansions must not bypass existing number guards.
5. Correct spelling and improve flow; combine repeated descriptions of the same assessment without dropping separate times, observed versus reported findings, or audience-critical facts. Preserve source attribution, pending/completed status, values and uncertainty. Alert outside the copied note only for a real unresolved interpretation, conflicting source or questionable reference entry. Unknown TOF remains unresolved with a warning.
6. Run existing structured source/number/status checks and an independent source review. Both model requests receive the same current meanings and recipient rules. A failed check produces no successful replacement and retains existing work. These layers are assistance, not semantic proof.
7. Keep drafts editable, require source comparison before Copy and retain all existing manual-edit/stale-request protections. No sending, submission, storage, audience, key or model change.

## Change and delivery workflow

Read General first, then project instructions, relevant open/closed issues/comments, actual code and applicable previously loaded Addy workflows. Record current revisions and source gaps. Draft concrete rules and reproduce the defect; implement only the approved slice. Run focused regressions plus the full suite, repository gate, types and supported build. Review source/spec/test differences, sync identical GitHub/Sites trees and deploy with the existing owner-private audience. Then update INC-06/14 and regression evidence with the real deployment, checks, remaining alerts and next action. Do not close broader issues based on prompt tests or deployment alone.

## Verification and changed expectations

Four new regressions failed against v8 before the change: missing corrected meanings, blanket rejection of familiar shorthand, false 2/7 and 6/52 warnings, and ordinary abbreviation-rich input rejected in the actual handler. They pass after the change, including all five targets with mocked writer/reviewer.

Intentional updates to prior tests follow Felix's explicit correction: retained f&f is now permitted (full wording is also permitted); the synthetic transfer example now uses t/f rather than tx; prompt assertions require the confirmed CNS/OT meanings rather than alternate dictionary senses. All existing numeric safety expectations and application cases remain. The removed f&f/ax/care-and-tx hard rejection enforced the superseded language preference, not a factual safety rule. Source references, number checks, communication status and independent meaning review remain active.

Browser access was previously blocked by the browser URL policy. No workaround is attempted. No new browser, mobile or actual provider response is claimed by this release. Remaining acceptance: owner-signed-in synthetic notes across all targets, checking Tx/t/f, CNS/OT, familiar abbreviations, numeric cues, genuine conflicts, wording and response time. Full reference input-token overhead and name pseudonymization remain existing limits; follow INC-06/07/08/13/14.
