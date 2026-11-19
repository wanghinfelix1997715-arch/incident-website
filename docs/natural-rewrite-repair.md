# Meaning-based review update — 20 November 2026

Felix approved input assessment and independent output review in place of rigid numeric-format rejection. Production first asks the writer to assess original facts, context, status and unresolved ambiguity, then draft with external input alerts. The second call independently checks the draft against the complete original source. Production structural checks bound readable output and required document fields/headings; numeric-token membership and blanket contact-word matching no longer veto a candidate before semantic review or in the browser. Strict numeric helper defaults remain for legacy comparisons and targeted tests. Actual changed facts still require correction; review rejection returns specific reasons. This supersedes numeric-veto requirements below. There are still two provider calls. Source ambiguity may be preserved with warnings. Model review is fallible and does not establish live usability.

# Natural rewriting repair - 20 November 2026

## Goal and authorization

Felix wants notes optimised as in the conversation: correct established typos and clear shorthand, organise related facts into natural prose and tailor the recipient. Harmless wording changes must not stop generation. The 17 November Note Generator report and 20 November infection screenshots revealed related failures; prior investigation was not a deployment. The latest bug report authorizes a focused repair of both existing generators, with publication through the same private Site.

## Reproduced defects

- A compact clock such as `at 1655` was rejected when rewritten `at 16:55`.
- A supplied quantity such as `ONE tablet TWICE a day` could not become `1 tablet twice daily` because the original number-token set omitted word numbers.
- Explicit day/week intervals could not be expanded, although the language policy already allowed contextual interpretation.
- Incident warning preparation flattened field values (and sometimes JSON/canonical duplicates), losing the date field context and falsely warning about `19/11`.
- A writer's imperfect quotation anchor rejected an otherwise usable candidate before the independent original-source review could assess it.
- Review rejection details were hidden behind a generic message.

These are synthetic reproductions of defects in inspected source. The actual rejected provider candidates from the user's attempts are unavailable, so no individual subcheck is asserted as the confirmed cause of those attempts.

## Runtime contract

1. Keep owner authentication, input limits, strict writer/reviewer JSON, existing server key/model, two-call budget, original source and document scope.
2. Permit equivalent contextual clocks, one-to-twelve word quantities with explicit quantity units, twice/two times, and clear `/7`, `/52` intervals alongside existing `/12` and day/month handling. Compare normalized numbers on both sides. Do not convert measurement units, calculate doses, invent years, split BP/scores or rewrite an ambiguous slash expression as a date.
3. The original `validateNoteDraft` and `validIncidentCandidate` default exact-quotation checks remain available for their existing contract/tests. Production calls pass `requireExactQuotes=false`: bounds, reference shape and required reference coverage still apply, but substring matching is a review aid rather than a hard veto. This intentional change follows Felix's request for less rigid natural rewriting. No raw candidate is displayed solely because a quotation mismatch was ignored.
4. Every admitted candidate still requires a separate review of the COMPLETE ORIGINAL source, including values and units in context, actor, certainty, status, chronology and required recipient detail. An anchor never proves support. Missing optional metadata can remain missing; unresolved terms can remain as supplied with an external warning. No inferred normality, diagnosis, treatment or completed action.
5. Preserve original date/time field labels when building incident warnings; do not rescan canonical copies as new ambiguous source text. The browser's immediate clinical warnings remain intact.
6. If the reviewer rejects, return bounded reasons outside all document fields. The Note Generator displays those reasons in its existing status area; incident failures include them in external warnings. Malformed reviews, unsupported numeric tokens, malformed references and transport/provider failures still fail safely. Prior drafts/manual edits remain; local incident drafting requires the explicit AI toggle as before.

## Acceptance and limits

`tests/flexible-rewrite.test.mjs` adds synthetic clock/quantity/interval controls, sparse infection planned-medication and date-field coverage, both generators' independent review after quotation mismatch, rejected-review reasons and malformed/value failure controls. All five initial reproductions failed on v12 before changes; additional safety controls were added during review. Existing test expected answers are unchanged.

Numeric-token membership does not prove correct association, dose, units or completeness. Independent review can miss errors; this change does not promise ChatGPT-equivalent model quality or clinical correctness. Full SCHN reference and current model are retained. No resident records, names, screenshots or secrets are committed. No new persistence, audience, auto-sending or pseudonymization.

General AGENTS blob `5c690d6992a2cc1aa4ff9944b93d1473071ab572` and project AGENTS blob `b0ebedb04ca1baf94fd8ab2e84d8cc3f175ffc34`, relevant General #5/#8/#9 and Incident #6/#8/#9/#13/#14 bodies/comments were read. Applicable context/debugging/API/testing/review skills at upstream `301b02b12bff98e4688e6984af6556802322bbde` were consulted. Reopened Sites baseline `c5e5c14b4a5fc5b6efb5c36dbb9e4f6e76bd30ed` matches deployed v12; GitHub baseline is recorded in those issues. Final commands, source correspondence and actual publication outcome belong in the delivery issue entries.

Real model output and signed-in browser/mobile acceptance remain separate from deterministic and mocked provider tests. The previous browser URL-policy restriction is not bypassed. No live reproduction of resident text is attempted.
