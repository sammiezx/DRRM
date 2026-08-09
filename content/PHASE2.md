# Phase 2 — writing plan

Working note. Not served. Read [`../SCOPE.md`](../SCOPE.md) first — it settles audience,
weighting and editorial rules; this file is only the order of work.

## Order

Write in this order, because each stage feeds the next:

1. **Parts 1–2** — foundations and Nepal's hazards. Establishes the vocabulary the rest uses.
2. **Part 5** — designing for the hazard. The heaviest part; write it while fresh.
   Includes the worked base-shear example.
3. **Parts 4, 6, 7** — assessment, non-engineered construction, retrofitting. These
   three interlock and cross-reference constantly.
4. **Parts 3, 8, 9, 10** — law, lifelines, response, recovery.
5. **Fast Track** — written *last*. It is a compression of the finished book, and cannot
   be written before the book exists.
6. **Part 11** — practice kit. Harvested from parts 1–10: every number, clause, checklist
   and abbreviation already written, collected in one place.

## Per-chapter checklist

- [ ] Opens with the decision the engineer is actually facing, not a definition
- [ ] Every design number carries its clause (`NBC 105:2020, cl. X` / `IS 13920, cl. Y`)
- [ ] Anything added on top of the sources is visibly marked as an addition
- [ ] At least one figure where a figure explains better than a paragraph
- [ ] Flashcard candidates extracted into `app.js` `DECKS`
- [ ] MCQ candidates extracted into `#mcqs`
- [ ] Numbers and clauses extracted into Part 11

## Figures

No source imagery exists — every figure is hand-authored inline SVG in `img/`, referenced
from `index.html` and added to the `CORE` list in `sw.js`.

High-value figures, roughly in order of how much they earn their place:

| Fig | Shows |
|---|---|
| Force path | Inertia at the floors → beams → columns → foundation → ground |
| Soft storey | Drift concentrating in one level; why the open ground floor kills |
| Short column | Partial infill shortening a column, shear failure |
| Capacity design | Strong column / weak beam, and where the hinges are meant to form |
| Plan irregularity | Torsion from an eccentric stiffness centre |
| Pounding | Adjacent buildings at different floor levels |
| Band layout | Plinth, sill, lintel, roof and gable bands in a masonry house |
| Through-stone | Wythe separation and the stone that prevents it |
| Splint-and-bandage | Vertical splints at corners, horizontal bandages at band level |
| RC jacketing | Section before and after, with dowel and tie detail |
| Hazard cascade | Earthquake → landslide → river blockage → outburst flood |
| Tagging | Green / yellow / red decision flow after a rapid assessment |
| DRRM cycle | Mitigation, preparedness, response, recovery — and where the money goes |

## Deck plan

`DECKS` in `app.js` currently holds placeholders. Target shape:

| Deck | Content |
|---|---|
| Definitions | Terms whose exact meaning changes the engineering |
| Nepal hazards | Events, mechanisms, dates, magnitudes |
| Codes & clauses | Clause number → what it requires |
| Numbers | Coefficients, limits, spacings, ratios |
| Detailing rules | The rules a site engineer must recall without opening a book |
| Failure modes | Symptom → mechanism → what it tells you |
