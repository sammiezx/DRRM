# DRRM — Scope & Vision

> **Phase 1 document.** This defines *what* we are building and *for whom*.
> [`PLAN.md`](PLAN.md) defines *how it teaches* — sessions, assignments, practice.
> Read both, correct anything wrong, then Phase 2 writes and Phase 3 deploys.

---

## 1. Who it is for

**A practising civil engineer in Nepal.** Not a student, not an exam candidate.

That single fact sets every editorial decision:

| Because he is… | The book must… |
|---|---|
| A working engineer, not a student | Give **judgment**, not just definitions. "Here is how you decide", not "here are the four types" |
| A **road and highway** engineer, with water behind him | Put slopes, hydrology and the road itself at the centre. Buildings are a supporting session, not an act |
| Already fluent in civil fundamentals | Skip statics, soil mechanics basics, open-channel first principles. Start where the hazard starts |
| Reading on a phone, in gaps | Be mobile-first, offline, resumable. Never require a desktop |
| Accountable for real alignments | Carry the **standards and clause numbers** and the **numbers you must not get wrong** |
| Nepali, working under Nepali law | Be anchored in DoR and DoLI standards, the DRRM Act 2074 and NDRRMA — not generic international theory |

**Tone.** Peer to peer. A senior engineer explaining to a colleague what he has learned
the hard way. No lecturing, no exam-cramming voice, no padding.

---

## 2. The subject, stated exactly

**Disaster Risk Reduction & Management for the engineer who builds through unstable
ground and moving water.**

His career is **roads and highways**, with a water background. So the centre of gravity is
not buildings — it is the DRRM that a highway engineer in Nepal actually practises:

- **Slopes.** Landslide mechanics, terrain reading, rock and soil cut stability, and the
  uncomfortable fact that badly built roads *manufacture* landslides.
- **Water.** Catchment behaviour, design discharge, river morphology, flood and GLOF,
  and scour — which destroys more Nepali bridges than earthquakes ever have.
- **The road itself.** Alignment as the primary risk decision, drainage, cross-drainage,
  retaining and breast walls, bio-engineering, Green Roads, bridges under hazard.

This is also where Nepal genuinely leads the field: **bio-engineering and the Green Roads
approach are Nepali contributions**, cited internationally. He is studying something his
own country is good at, which is worth saying out loud.

Weighting, roughly:

```
Slopes, water, roads      ████████████████████████████  ~70%
Hazard science & framing  ████████                      ~15%
Governance / response / recovery ████████               ~15%
```

**Buildings** get exactly one compressed session — load path, soft storey, NBC 105,
retrofit basics. Enough to judge a school and hold an argument, not a second subject.
This is a deliberate trade, and an easy one to reverse if he wants more.

**Geography.** Nepal-first. Global frameworks (Sendai, UNDRR terminology) appear where they
explain the Nepali system, not for their own sake. Every case is one he can place on a map
he knows: Sunkoshi 2014, Melamchi 2021, Thame 2024, the Prithvi and Narayanghat–Mugling
corridors, Gorkha 2015, Jajarkot 2023.

**Language.** English, which is the working language of Nepali engineering practice and of
every standard he will open. Nepali terms are given where the field uses them, but the
book is in English.

---

## 3. What it is *not*

- Not an exam guide. No syllabus-chasing, no "likely question" boxes.
- Not a policy paper. If a chapter can't change what he does on site, it gets cut.
- Not a general disaster-management textbook. Public health, humanitarian logistics and
  psychosocial response are named and bounded, not developed.
- Not a structural engineering course. Buildings get one session, on purpose.
- Not a substitute for the standards. It teaches him to read them; it does not reprint them.

---

## 4. The outline

**The session list lives in [`PLAN.md`](PLAN.md)** — 32 sessions across five acts, with
the idea each one lands. That document also settles how it teaches: the six-part session
rhythm, the field assignments, and the three layers of practice.

The arc, in one line each:

| Act | Sessions | What it does |
|---|---|---|
| ★ | Fast Track | The whole argument in twenty minutes. Written last |
| **I — The Ground** | 1–5 | Why this matters, before any engineering |
| **II — Reading the Terrain** | 6–12 | Learning to see a slope fail before it does |
| **III — Water** | 13–19 | Hydrology as a hazard discipline, not a textbook chapter |
| **IV — The Road That Survives** | 20–27 | The craft. The longest act |
| **V — Beyond the Alignment** | 28–32 | Where an engineer becomes useful to a whole district |
| ≡ | Practice Kit | Checklists, numbers, question bank, glossary, sources. Reference, not reading |

## 5. How it will be built

Same chassis as [Vision](https://sammiezx.github.io/Vision/) — proven on a phone, already
in the family's hands.

- **One page.** `index.html` + `style.css` + `app.js`. No build step, no framework, no CDN.
- **Offline.** Service worker pre-caches everything on first visit; installable to the home screen.
- **Search** the whole handbook with snippets (`/` to open).
- **Flashcards** — decks for definitions, Nepal hazards, code clauses, numbers, detailing rules,
  failure modes.
- **Self-test** — MCQs with instant feedback and explanations.
- **Print to PDF** — clean A4 booklet, so he can carry a paper copy to site.
- **Dark mode**, reading-progress bar, contents drawer with scroll-spy, chapter steppers.

### Figures

Vision had 76 slide photographs to draw on. **DRRM has no source images** — so every figure
will be **hand-authored inline SVG**: slope failure geometry, the forces in a cut, drainage
sections, scour at a pier, gabion wall detail, bio-engineering planting layouts, the hazard
cascade. This is better, not worse: they will be legible in dark mode, they will scale on a
phone, they cost nothing to load, and there is no copyright question.

### Palette — the drawing office and the site

Structure is drawn in **graphite** (`#31414c`), the way a drawing is. **Safety orange**
(`#b8410a`) is the only chromatic colour in the book, and it means exactly one thing:
*hazard*, or *look here*. Nothing else competes with it. Status colours follow site
signage — green safe, amber caution, red restricted — which is the convention on the
work he already does, so the colour language and the subject matter agree.

Full light and dark token sets are already in `style.css`.

---

## 6. Sourcing & honesty rules

The material will be compiled from the public record — Nepali codes and Acts, NDRRMA and NRA
publications, UNDRR/Sendai documents, NSET and NDRRMA technical guidance, and the standard
earthquake-engineering literature. Two rules hold throughout:

1. **Every number that matters carries its source clause.** A design coefficient without
   "NBC 105:2020, cl. X" is not useful to a working engineer.
2. **Anything I add on top of the sources is marked as such.** Judgment boxes, checklists and
   worked decisions are study aids, and will say so — the same convention Vision uses.

> Educational use. Not a design authority and not a substitute for the codes themselves.

---

## 7. Hosting

```
repo   git@github.com:sammiezx/DRRM.git
branch main
pages  branch deploy from /  (.nojekyll present)
url    https://sammiezx.github.io/DRRM/
```

---

## 8. Open questions

None are blocking — Phase 2 can start on the assumptions in brackets.

1. **Strategic network or local roads?** DoR highway practice and DoLI/rural road practice
   pull different ways — Green Roads and labour-based construction (session 25) matter
   enormously for one and barely for the other. *[Assumed: both, session 25 leaning rural.]*
2. **How much buildings, really?** Currently one compressed session. If he wants to be able
   to sit on a school-safety committee it should be three. *[Assumed: one is enough.]*
3. **Any Nepali-language sections?** *[Assumed: English throughout.]*
4. **Pace.** The plan assumes two sessions a week — four months. The acts are independent
   enough to reorder if he wants water or slopes first. *[Assumed: no deadline.]*
