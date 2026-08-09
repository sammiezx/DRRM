# Phase 2 — figures and decks

Working note, not served. The *what* is in [`../SCOPE.md`](../SCOPE.md), the *how* and
the session order in [`../PLAN.md`](../PLAN.md). This file holds only the two asset
inventories, so they can be ticked off as they are drawn and written.

## Per-session checklist

Each of the 32 sessions is done when all of this is true:

- [ ] **Hook** — a real place on a real day, something that failed. 100–150 words, ending on a question
- [ ] **The idea** — one sentence, in a box, near the top
- [ ] **Body** — 800–1400 words. Concrete before abstract: the slope first, the principle second
- [ ] Every design number carries its source (DoR / DoLI standard, NBC, IRC, or the paper it comes from)
- [ ] Anything added on top of the sources is visibly marked as an addition
- [ ] **Judgment** — what he does differently on Monday; "it depends" is allowed, vagueness is not
- [ ] **Field assignment** — 15 minutes, outside, produces something, with a "what you probably found" note
- [ ] **Check yourself** — 3–5 questions, answers hidden until tapped
- [ ] Reading time measured and set, not guessed
- [ ] Flashcard candidates extracted into `app.js` `DECKS`
- [ ] MCQ candidates extracted into the Practice Kit question bank
- [ ] Numbers and standards extracted into the Practice Kit

## Figures

No source imagery exists — every figure is hand-authored inline SVG in `img/`, referenced
from `index.html` and added to the `CORE` list in `sw.js`. Drawn alongside the session
that needs them.

| Fig | Session | Shows |
|---|---|---|
| Slope forces | 6 | Driving vs resisting force on a slice; where pore pressure enters |
| Rain and the water table | 6 | Why the factor of safety falls days *after* the rain, not during |
| Movement types | 7 | Fall, topple, slide, spread, flow — one hillside, five geometries |
| Debris flow reach | 8 | Initiation zone, transport channel, deposition fan — and why the fan is where the road is |
| Field indicators | 9 | An annotated hillside: tension cracks, seepage, tilted trees, hummocks, displaced spring |
| Cut and spoil | 10 | The same slope before the road, after a bad cut, and after a good one |
| Rock failure modes | 11 | Planar, wedge, toppling — stereonet logic without the stereonet |
| Catchment response | 13 | Two catchments, same rainfall, very different hydrographs |
| River in plan | 15 | Braiding, aggradation, avulsion, bank attack — and what each does to a crossing |
| Cascade | 5 | Earthquake → landslide → river blockage → outburst flood |
| Scour at a pier | 17 | General, contraction and local scour distinguished at one crossing |
| Training works | 18 | Spur, revetment, guide bund — plan and section, with flow direction |
| Road drainage | 21 | Camber, side drain, turnout, catch drain, and where the water is meant to end up |
| Culvert sizing | 22 | Afflux, blockage, and headwall geometry |
| Wall types | 23 | Gabion, dry stone, RCC breast — with the drainage behind each |
| Bio-engineering | 24 | Root reinforcement depth vs slip surface depth. The honest limit of vegetation |
| Bridge under hazard | 26 | Approach settlement, abutment, bearing, liquefiable layer |
| Load path (buildings) | 30 | The whole building act compressed into one diagram |

Eighteen. If a figure is not clearly better than the paragraph it replaces, drop it.

## Flashcard decks

`DECKS` in `app.js` currently holds placeholders. Target shape — filled as sessions are
written, never invented separately:

| Deck | Content |
|---|---|
| Definitions | Terms whose exact meaning changes the engineering |
| Nepal events | Sunkoshi, Melamchi, Thame, Gorkha, Jajarkot — date, mechanism, lesson |
| Standards & clauses | Clause number → what it requires (DoR, DoLI, NBC, IRC where adopted) |
| Numbers | Return periods, slope angles, spacings, factors of safety, discharge coefficients |
| Field indicators | What you see → what it means → what you do |
| Failure modes | Symptom → mechanism → what it tells you |
