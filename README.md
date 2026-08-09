# DRRM

**Disaster Risk Reduction & Management — A Civil Engineer's Handbook**

A single-file, offline-capable handbook on disaster risk reduction and management,
written for a **practising civil engineer in Nepal**.

📖 **[Read it here](https://sammiezx.github.io/DRRM/)**

> **Status — Phase 1.** The structure, chassis and editorial scope are in place.
> The chapters are empty. See **[SCOPE.md](SCOPE.md)** for what is being built and why.

---

## What it covers

The centre of gravity is the part of DRRM that **only a civil engineer can do** — judging
whether a structure will stand, designing so that it does, and strengthening it when it will
not. Governance, response and recovery are the frame around that, not the subject.

| Part | Topic |
|---|---|
| ★ | **Fast Track** — the whole field in twenty minutes |
| 1 | Foundations of risk — hazard, exposure, vulnerability, capacity |
| 2 | Nepal's hazard profile — earthquake, flood, GLOF, landslide |
| 3 | Law & institutions — DRRM Act 2074, NDRRMA, NBC enforcement, Sendai |
| 4 | Risk assessment — hazard maps, typologies, fragility, RVS, damage grading |
| 5 | **Designing for the hazard** — ductility, capacity design, configuration, NBC 105:2020 |
| 6 | Non-engineered construction — masonry, bands, through-stones, MRT |
| 7 | **Assessment & retrofitting** — jacketing, splint-and-bandage, cost–benefit |
| 8 | Non-structural risk & lifelines |
| 9 | Preparedness & response — early warning, the first 72 hours, tagging |
| 10 | Recovery & reconstruction — Build Back Better, the NRA experience |
| 11 | Practice kit — checklists, numbers, self-test, glossary, sources |

## Features

Built mobile-first — it is designed to be read on a phone, standing on a site.

- **Search** the whole handbook, with result snippets (or press `/`)
- **Flashcards** — definitions, Nepal hazards, code clauses, numbers, detailing rules, failure modes
- **Self-test** MCQs with instant feedback, explanations and a running score
- **Works offline** — installable to the home screen
- **Print to PDF** — clean A4 booklet
- Figures are hand-drawn inline SVG, so they stay sharp and legible in dark mode
- Dark mode, reading-progress bar, contents drawer with scroll-spy, chapter steppers

## Files

- `index.html` + `style.css` + `app.js` — the handbook
- `sw.js`, `manifest.webmanifest`, `icon.svg` — offline / add-to-home-screen support
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
