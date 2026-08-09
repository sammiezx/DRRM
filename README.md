# DRRM

**Disaster Risk Reduction & Management — A Civil Engineer's Handbook**

A single-file, offline-capable handbook on disaster risk reduction and management,
written for a **practising civil engineer in Nepal**.

📖 **[Read it here](https://sammiezx.github.io/DRRM/)**

> **Status — Phase 1 (planning).** Structure, chassis and learning design are in place;
> the sessions are empty shells. **[PLAN.md](PLAN.md)** — how it teaches.
> **[SCOPE.md](SCOPE.md)** — what it covers and why.
> Phase 2 writes the content, Phase 3 deploys.

---

## What it covers

The centre of gravity is the part of DRRM that **only a civil engineer can do** — judging
whether a structure will stand, designing so that it does, and strengthening it when it will
not. Governance, response and recovery are the frame around that, not the subject.

Thirty-two sessions, twelve to twenty minutes each, in five acts. Two a week is four months.

| Act | | Sessions |
|---|---|---|
| ★ | **Fast Track** | The whole argument in twenty minutes |
| I | **The Ground** | Why this matters, before any engineering |
| II | **Reading Buildings** | Learning to see a building's death before it happens |
| III | **Making It Stand** | The craft — ductility, capacity design, NBC 105:2020, detailing, masonry |
| IV | **Strengthening What Stands** | Assessment, jacketing, splint-and-bandage, cost–benefit |
| V | **Beyond the Building** | Lifelines, the first 72 hours, building back better |
| ≡ | **Practice Kit** | Checklists, numbers, question bank, glossary, sources |

Every session ends with a **field assignment** — fifteen minutes, outside, on the street he
already walks — and **check yourself** questions with answers hidden until tapped.

## Features

Built mobile-first — it is designed to be read on a phone, standing on a site.

- **Search** the whole handbook, with result snippets (or press `/`)
- **Flashcards** — definitions, Nepal hazards, code clauses, numbers, detailing rules, failure modes
- **Self-test** MCQs with instant feedback, explanations and a running score
- **Continue where you left off**, with progress and assignments tracked on his own phone
- **Works offline** — installable to the home screen
- **Print to PDF** — clean A4 booklet
- Figures are hand-drawn inline SVG, so they stay sharp and legible in dark mode
- Dark mode, reading-progress bar, contents drawer with scroll-spy, chapter steppers

## Files

- `index.html` + `style.css` + `app.js` — the handbook
- `sw.js`, `manifest.webmanifest`, `icon.svg` — offline / add-to-home-screen support
- `PLAN.md` — the learning design: session list, assignments, practice, engagement
- `SCOPE.md` — what this is, who it is for, and the editorial rules
- `img/` — inline SVG figures
- `content/` — working outlines and notes, not served

## Design

Graphite for structure, the way a drawing is drawn. Safety orange is the only chromatic
colour in the book and it means one thing: *hazard*, or *look here*. Status colours follow
site signage — green safe, amber caution, red restricted — which is the same convention as
the post-earthquake tagging in Part 9.

---

> Educational use. Not a design authority and not a substitute for the codes themselves.
