# Phase 2 — figures and decks

Working note, not served. The *what* is in [`../SCOPE.md`](../SCOPE.md), the *how* and
the session order in [`../PLAN.md`](../PLAN.md). This file holds only the two asset
inventories, so they can be ticked off as they are drawn and written.

## Per-session checklist

Each of the 32 sessions is done when all of this is true:

- [ ] **Hook** — a real building on a real day, 100–150 words, ending on a question
- [ ] **The idea** — one sentence, in a box, near the top
- [ ] **Body** — 800–1400 words. Concrete before abstract
- [ ] Every design number carries its clause (`NBC 105:2020, cl. X` / `IS 13920, cl. Y`)
- [ ] Anything added on top of the sources is visibly marked as an addition
- [ ] **Judgment** — what he does differently on Monday; "it depends" is allowed, vagueness is not
- [ ] **Field assignment** — 15 minutes, outside, produces something, with a "what you probably found" note
- [ ] **Check yourself** — 3–5 questions, answers hidden until tapped
- [ ] Reading time measured and set, not guessed
- [ ] Flashcard candidates extracted into `app.js` `DECKS`
- [ ] MCQ candidates extracted into the Practice Kit question bank
- [ ] Numbers and clauses extracted into the Practice Kit

## Figures

No source imagery exists — every figure is hand-authored inline SVG in `img/`, referenced
from `index.html` and added to the `CORE` list in `sw.js`. Drawn alongside the session
that needs them.

| Fig | Session | Shows |
|---|---|---|
| Force path | 8 | Inertia at the floors → beams → columns → foundation → ground |
| Soft storey | 9 | Drift concentrating in one level; why the open ground floor kills |
| Short column | 9 | Partial infill shortening a column into shear failure |
| Torsion | 10 | Eccentric stiffness centre twisting the plan |
| Pounding | 10 | Adjacent buildings at mismatched floor levels |
| Liquefaction | 11 | Valley lacustrine deposits losing strength; the building settles, the frame is fine |
| RVS card | 12 | The screening form, annotated |
| Capacity design | 14 | Strong column / weak beam, and where the hinges are meant to form |
| Spectrum | 16 | Hazard map → response spectrum → design coefficient |
| Ductile detail | 18 | Confinement near the joint, and what happens without it |
| Band layout | 19 | Plinth, sill, lintel, roof and gable bands in a masonry house |
| Through-stone | 19 | Wythe separation, and the stone that prevents it |
| Splint-and-bandage | 25 | Vertical splints at corners, horizontal bandages at band level |
| RC jacketing | 24 | Section before and after, with dowel and tie detail |
| Hazard cascade | 3 | Earthquake → landslide → river blockage → outburst flood |
| Tagging | 30 | Green / yellow / red decision flow after a rapid assessment |

Sixteen. If a figure is not clearly better than the paragraph it replaces, drop it.

## Flashcard decks

`DECKS` in `app.js` currently holds placeholders. Target shape — filled as sessions are
written, never invented separately:

| Deck | Content |
|---|---|
| Definitions | Terms whose exact meaning changes the engineering |
| Nepal hazards | Events, mechanisms, dates, magnitudes |
| Codes & clauses | Clause number → what it requires |
| Numbers | Coefficients, limits, spacings, ratios |
| Detailing rules | What a site engineer must recall without opening a book |
| Failure modes | Symptom → mechanism → what it tells you |
