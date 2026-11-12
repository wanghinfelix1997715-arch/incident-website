# Wound and infection pathways

## Authority and scope
Felix approved the six-section wound/infection questionnaire draft on 12 November 2026 with clarifications: severity is selected by the user (unknown allowed; no automatic cross-scale mapping); generate RiskMan, GP, NOK and paragraph progress notes; General then project checks at each phase. The subsequent “action now” authorizes implementation and publication. Existing falls six-heading eCase output remains unchanged.

Modules: wound and infection each depend on the shared review/edit/Copy surface, not on one another. Fall continues to use its existing assessment and renderer. No medication pathway, new persistence, new name-protection system, audience/model changes or email submission is in scope.

## Input contract
`lib/incident.ts` defines six labelled sections per pathway, explicit Not recorded defaults, free-text context and select values. Wound supports 1–20 separate injuries with independent type/site/size/classification/flap-loss/pain/findings. Add/remove controls affect the current pathway only. Contradictory ISTAP/flap-loss entries trigger an external review warning and are not silently corrected. Other classification systems remain user-entered and require review.

Infection records onset versus discovery, suspected/clinician-diagnosed/laboratory-confirmed status and source, symptoms, new changes versus baseline, observations/time, background/exposure, actual care, test/specimen and treatment statuses, notifications, results/review, later findings and outstanding work. It supplies no diagnosis or treatment recommendations.

Severity is Minor/Moderate/Major/Extreme/unconfirmed with rationale. These are user selections, not computed escalation or an eCase mapping. GP review need, contact, awaiting response, advice and actual review remain distinct. No completed notification, treatment or plan defaults are imported from falls.

## Outputs
Seven fields retain the compatible output envelope: summary, details, actions, investigation, ecase, gp, nok. The first four form the RiskMan report; the UI labels actions “Describe Immediate Action Taken”. Investigation consolidates relevant event/findings/actions with contributors, prevention, reassessment and follow-up. New-pathway `ecase` is that complete narrative in paragraphs, without six eCase headings or needless repeated blocks. GP is clinical; NOK omits detailed wound classification, measurement tables and observation lists in favour of a family update. All outputs are independent editable drafts, never automatic messages.

## State and API boundary
Each pathway retains its own assessment, section/tab, drafts and manual-edit flags in page memory when switching. Verification resets on switching, input changes and manual edits. Clear affects only the active pathway; refresh/close loses all work. Stale async results cannot overwrite newer input. Regenerate retains manual edits unless Replace all is confirmed. Copy requires current generation and user verification.

Browser sends `{pathway, incident}` only on opt-in AI generation. Missing pathway preserves the legacy fall request contract. The authenticated, same-origin bounded server endpoint validates the selected pathway and fields, constructs canonical drafts itself and retains the existing narrow wording validator and safe local fallback. New paragraph notes do not require the falls eCase headings; all facts/order/numerical punctuation still must match canonical text. Model, key, owner allowlist, store:false, request bounds and no-payload-logging remain unchanged. Name pseudonymization and broader language optimisation remain INC-07/INC-06 work, not claims of this release.

## Acceptance and verification
- Wound walker-contact synthetic seed retains side/site/size/fragile skin/dressing/created plan/NOK contact without invented pain, bleeding, cleansing or review.
- Multiple wounds stay separate; conflicting classification raises review; severity never inferred.
- Infection suspected/unknown/pending and baseline/later findings remain accurate; invalid foreign fields/statuses rejected.
- Normal new-pathway provider response accepted; unsafe output and provider failure return labelled canonical fallback.
- All existing A1–A8 expectations unchanged through dispatcher; normal UI switching/edit/regeneration/Copy and desktop/mobile layout checked separately.
- Commands: npm test; npm run check:repo; npm run typecheck; supported Sites build-site.mjs. Synthetic/mocked API, browser, real provider and deployment evidence remain separate.

Related: [INC-03](https://github.com/wanghinfelix1997715-arch/incident-website/issues/3), [INC-04](https://github.com/wanghinfelix1997715-arch/incident-website/issues/4), [INC-05](https://github.com/wanghinfelix1997715-arch/incident-website/issues/5), [INC-08](https://github.com/wanghinfelix1997715-arch/incident-website/issues/8), [INC-09](https://github.com/wanghinfelix1997715-arch/incident-website/issues/9).

## Wound narrative trial — 12 November 2026
Felix reported wound output that repeated questionnaire labels even with API enabled, reviewed a balanced paragraph example and then authorized a trial and deployment. Wound output now uses `lib/wound-prose.ts` via the existing dispatcher. Summary, Details, Describe Immediate Action Taken and Investigation remain the four report fields; within them are sentences and short paragraphs rather than a field-label dump. Wounds remain separate, Investigation/eCase consolidate the same information once, and GP/NOK remain recipient drafts. Missing values do not become normal findings.

Confirmed cause: the old canonical renderer emitted `Injury type:`, `Care actually provided:`, `Photograph status:` and similar labels; the existing model instructions/strict validator required their preservation. The repair changes the wound canonical text rather than weakening validation. The wound-specific API instruction preserves narrative paragraphs; API success and fallback both start from the improved prose. Falls and Infection still dispatch to their existing renderers; Note Generator abbreviation rules, API credentials/model and storage/audience stay unchanged.

Connector sentences render selected statuses explicitly: plan created/updated/pending, photo taken/pending/declined, GP notified-awaiting-response/advice/reviewed and NOK pending/informed remain distinct. User-selected severity is retained. Entered free-text care, treatment, values, dimensions, timing, uncertainty and later findings remain source content; no automatic N/s/NAD/dressing-frequency expansion or invented treatment is added. Source spelling can remain because the incident AI contract continues to allow only narrow variants; this release is not general free rewriting.

Four new synthetic checks cover paragraph style and fact/status retention, pending/declined/unassessable findings, actual wound handler/API and fallback with altered-status rejection, and all entered wound free-text fields in the consolidated report. Two style/API checks failed before implementation; the existing pending-safety check already passed. All prior tests and their expected answers stay unchanged. Browser/live-model/mobile acceptance remain separate and unverified under the prior browser policy limitation; no workaround. New user trial: generate the same wound input again, compare the four sections and paragraph progress note, then verify before Copy. Existing edited drafts remain protected; explicit Replace all is needed to overwrite them.
