# Wound / skin injury questionnaire — proposed specification
Status: questionnaire direction approved for implementation on 12 November 2026. The [pathway contract](incident-pathways.md) records the later paragraph-note and user-selected severity decisions; the proposal below is retained as its source.

1. Incident: resident; date/time (unknown/approximate allowed); place; injury type; witnessed/unwitnessed/unknown; identified time if later; factual account; source of account; known/suspected/unknown mechanism.
2. Wound assessment: site/side; separate entries for multiple wounds; length x width cm and depth if assessed; classification system+category/not assessed/uncertain; flap/skin loss; bleeding; appearance; surrounding skin; pain (denied/reported/observed/not assessed); other findings.
3. Severity/escalation: supplied matrix Minor/Moderate/Major/Extreme/unconfirmed; any distinct eCase scale pending verification; selection reason; GP required yes/no at present/unsure; planned/requested-awaiting-response/advice/reviewed; other escalation and supporting reason.
4. Treatment: RN assessment status; actual cleansing/bleeding actions/dressing; analgesia status/details if recorded; observed response; wound chart/care plan created/updated/pending; photo status if relevant; documented review/dressing instructions.
5. Notifications: NOK status/method/time/optional name+relationship/response; GP status/method/time/advice or awaiting response; management notification status. Notification is not proof of review.
6. Contributors/prevention/follow-up: identified versus suspected factors; supporting narrative; actually implemented prevention; separately planned actions; monitoring/reassessment; optional timestamped later findings; outstanding task/person/timeframe if known.

RiskMan four fields retained; eCase appropriate note; NOK simple family wording; GP draft when review requested. No automatic severity conversion or treatment recommendations.
Do not silently reconcile contradictory classification/skin-loss entries; show for user review. Missing fields do not generate normal findings.

## Synthetic acceptance seed
Resident A, seated in dining area, accidental contact with a visitor's walker, left lower-leg skin tear 2 x 2 cm, fragile/dry surrounding skin; RN applied non-adherent dressing; wound plan created; NOK emailed.
Expected: retain mechanism/site/size/skin context and completed care/notification. Do not invent no pain, controlled bleeding, GP review, cleansing or prevention actions.
Use a separately confirmed consistent classification in a fixture; any classification mismatch is a review scenario rather than silently corrected data.

