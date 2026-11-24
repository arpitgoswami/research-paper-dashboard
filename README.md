<div align="center">

# Research Paper Dashboard

**A fifteen-section tracker for an MTech review paper — from the working title to the viva slides.**
Swipe it like a phone app, edit it like a document, keep it in the browser.

[**Open the live app →**](https://arpitgoswami.github.io/research-paper-dashboard/) · [Report an issue](https://github.com/arpitgoswami/research-paper-dashboard/issues)

![License: MIT](https://img.shields.io/badge/license-MIT-d8a441?style=flat-square)
![Dependencies: none](https://img.shields.io/badge/dependencies-none-6f7a6a?style=flat-square)
![HTML · CSS · JS](https://img.shields.io/badge/vanilla-HTML%20%C2%B7%20CSS%20%C2%B7%20JS-f2ebdd?style=flat-square)
![GitHub Pages](https://img.shields.io/badge/hosted%20on-GitHub%20Pages-222222?style=flat-square)

</div>

![Desktop overview](assets/desktop-overview.jpg)

<div align="center"><sub>The desktop layout — a title page, its facing column of figures, and the fifteen-section index.</sub></div>

---

## What it is

A personal dashboard for the fifteen sections a review paper actually goes through:
title, abstract, introduction, materials and methods, results and discussions,
conclusion, references, diagrams, embeddings, tables, turnitin, re-establishment,
communication, submission, and the presentation build.

Three screens, paged left and right like a phone. Everything is editable in place and
saved to `localStorage`, so the app works offline, with no account and no server. It is
built from three files and nothing else: one HTML page, one stylesheet, one script. No
framework, no bundler, no dependencies, no build step.

## The three screens

| Screen | What you do there |
| --- | --- |
| **Overview** | Set the paper title, subtitle and submission deadline. Read the completion percentage, the fifteen proof-ticks (one per section), the counts and the next section to work on. |
| **Sections** | All fifteen sections as an index. Filter by status, edit a section's name and phase and due date, and tap the status circle to cycle **not started → in progress → complete**. |
| **Focus** | A chiptune player with three tracks, a volume control, a live waveform, plus JSON export and reset. |

A hairline bar along the bottom fills over 30 seconds and then moves to the next screen,
so the dashboard walks itself while you read.

## Responsive by design

| Viewport | Layout |
| --- | --- |
| **Android / iOS phones** | Full-bleed 9:16 stage, no page scroll — only the active screen scrolls. Status circles 26 px, tabs 34 px tall, arrows 36 px, safe-area insets respected. |
| **Tablets** | The same 9:16 stage, framed and centred. |
| **Desktop (≥ 960 px)** | A wide proof sheet: overview splits into a title column and a facing column of figures, the fifteen sections become a three-column index (5 · 5 · 5), and Focus settles at a readable measure. Paging stays one screen at a time. |

## The look

Ink-paper rather than dashboard-violet: a warm paper white on near-black, one ochre for
progress and completion, one red reserved for overdue dates. Instrument Serif for titles
and numerals, Inter Tight for everything you read at speed. Printer's crop marks, a
manuscript margin rule, and per-section ticks instead of a generic progress bar, because
the content really is a fifteen-step sequence.

## Run it locally

Open `index.html` directly — it works from `file://`. Or serve the folder:

```sh
python3 -m http.server 3001
# then visit http://localhost:3001
```

## Keys and gestures

| Input | Action |
| --- | --- |
| Swipe left / right | Next / previous screen |
| `←` / `→` | Next / previous screen |
| Arrow buttons or the dots | Jump to a screen |
| `Esc` | Close the editor sheet |
| Tap a status circle | Cycle that section's status |

## Your data

Everything lives in this browser under the `review-quest.v3` key; older `v1` / `v2`
copies are cleared on load so the fifteen-section default always wins over a stale save.
Use **Focus → Export** for a JSON copy you can keep, and **Reset** to return to defaults.
Nothing is uploaded anywhere.

## Files

```
index.html   the stage, the three screens and the editor sheet mount
styles.css   the whole visual system, responsive layout, motion
app.js       state, localStorage, paging, editor, chiptune player
assets/      README screenshots
```

## License

[MIT](LICENSE) — do what you like with it.
