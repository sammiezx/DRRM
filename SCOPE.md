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
| Already fluent in structures | Skip statics, RCC basics, and mechanics of materials. Start where DRRM starts |
| Reading on a phone, in gaps | Be mobile-first, offline, resumable. Never require a desktop |
| Accountable for real buildings | Carry the **code clause numbers** and the **numbers you must not get wrong** |
| Nepali, working under Nepali law | Be anchored in NBC, the DRRM Act 2074, and NDRRMA — not generic international theory |

**Tone.** Peer to peer. A senior engineer explaining to a colleague what he has learned
the hard way. No lecturing, no exam-cramming voice, no padding.

---

## 2. The subject, stated exactly

**Disaster Risk Reduction & Management, for the civil engineer who has to build things
that survive.**

The centre of gravity is **the part of DRRM that only a civil engineer can do** —
assessing whether a structure will stand, designing so it does, and strengthening it when
it will not. Governance, policy and response are present, and present properly, but they
are the frame around the engineering, not the subject.

Weighting, roughly:

```
Engineering practice  ██████████████████████████  ~60%
Risk & hazard science ████████████                ~20%
Governance / law / response / recovery ██████     ~20%
```

**Geography.** Nepal-first. Global frameworks (Sendai, UNDRR terminology) appear where they
explain the Nepali system, not for their own sake. Every case study is one he can place on a
map he knows: Gorkha 2015, Jajarkot 2023, Melamchi 2021, Thame 2024, the 1934 Bihar–Nepal
earthquake.

**Language.** English, which is the working language of Nepali engineering practice and of
every code he will open. Nepali terms are given where the field uses them
(e.g. *bhukampa*, ward-level *LDMC*) but the book is in English.

---

## 3. What it is *not*

- Not an exam guide. No syllabus-chasing, no "likely question" boxes.
- Not a policy paper. If a chapter can't change what he does on site, it gets cut.
- Not a general disaster-management textbook. Public health, humanitarian logistics and
  psychosocial response are named and bounded, not developed.
- Not a substitute for the codes. It teaches him to read NBC 105:2020, it does not reprint it.

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
| **II — Reading Buildings** | 6–12 | Learning to see a building's death before it happens |
| **III — Making It Stand** | 13–21 | The craft. The longest act |
| **IV — Strengthening What Stands** | 22–27 | Most buildings that will be here in twenty years are already here |
| **V — Beyond the Building** | 28–32 | Where an engineer becomes useful to a whole community |
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
will be **hand-authored inline SVG**: force flow through a frame, soft-storey collapse
mechanism, band positions in a masonry wall, jacketing sections, the BETT-equivalent decision
trees, hazard maps in schematic. This is better, not worse: they will be legible in dark mode,
they will scale on a phone, they cost nothing to load, and there is no copyright question.

### Palette — the drawing office and the site

Structure is drawn in **graphite** (`#31414c`), the way a drawing is. **Safety orange**
(`#b8410a`) is the only chromatic colour in the book, and it means exactly one thing:
*hazard*, or *look here*. Nothing else competes with it. Status colours follow site
signage — green safe, amber caution, red restricted — which is also the tagging convention
in session 30, so the colour language and the subject matter agree.

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

1. **Depth on hydro-hazards.** Floods, GLOF and landslides get one session (3) plus a
   share of 29. If his work is more water and highway than buildings, they are worth an
   act of their own. *[Assumed: buildings-led, as scoped.]*
2. **Any Nepali-language sections?** *[Assumed: English throughout.]*
3. **Is he working toward anything specific** — a municipal role, a retrofit programme,
   a licence upgrade? If so, those sessions get deepened. *[Assumed: general practice.]*
4. **Pace.** The plan assumes two sessions a week, which is four months. If he wants it
   faster, the acts are independent enough to reorder. *[Assumed: no deadline.]*
