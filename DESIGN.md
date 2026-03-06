# ori-term Design Guidelines

## Philosophy

Brutalist terminal aesthetic. Raw, structural, honest. Every element earns its place.
Not ugly-brutalism — intentional, high-craft brutalism with a terminal soul.

---

## Color Palette

```
--bg:             #0a0a0a    Near-black background
--bg-raised:      #111111    Elevated surfaces (cards, nav)
--bg-surface:     #1a1a1a    Hover states, active surfaces
--text:           #d4d4d4    Body text
--text-muted:     #888888    Secondary text, labels, comments
--text-bright:    #ffffff    Headlines, emphasis
--accent:         #00ff41    Terminal green — the ONE color
--accent-dim:     #00cc33    Muted accent for subtle use
--border:         #2a2a2a    Structural borders (default)
--border-strong:  #444444    Emphasized borders
```

### Rules
- **One accent color only.** Terminal green `#00ff41`. No secondary palette.
- **No gradients.** Ever. Flat fills only.
- **No soft shadows.** If depth is needed, use borders or offset solids.
- Backgrounds step in increments: `#0a0a0a` → `#111111` → `#1a1a1a`. No in-between.

---

## Typography

**Font:** IBM Plex Mono — Regular (400), Medium (500), Bold (700).
Monospace everywhere. No sans-serif. No serif. One family.

### Hierarchy

| Element        | Size                        | Weight | Case      | Spacing    |
|----------------|-----------------------------|--------|-----------|------------|
| H1             | `clamp(2rem, 6vw, 4rem)`   | 700    | UPPERCASE | 0.05em     |
| H2             | `clamp(1.5rem, 4vw, 2.5rem)` | 700  | UPPERCASE | 0.05em     |
| H3             | `clamp(1.1rem, 2.5vw, 1.5rem)` | 700 | UPPERCASE | 0.05em    |
| Body           | 1rem (16px)                 | 400    | Normal    | Normal     |
| Label/Caption  | 0.65–0.75rem               | 400    | UPPERCASE | 0.15–0.2em |
| Code/Terminal   | 0.85–1rem                  | 400    | Normal    | Normal     |

### Rules
- All headings are UPPERCASE with letter-spacing.
- Section labels use `// LABEL` comment syntax: `// FEATURES`, `// INSTALL`.
- Body text max-width: `65ch` for readability.
- Line-height: 1.6 for body, 1.1 for headings.

---

## Layout

### Grid
- Max content width: `1200px`.
- Gutter: `24px`.
- All layout uses CSS Grid or Flexbox — no floats, no absolute hacks.

### Borders
- Default: `2px solid #2a2a2a`.
- Strong: `2px solid #444444`.
- Borders are structural — they expose the grid. Not decoration.
- No rounded corners. `border-radius: 0` everywhere.

### Spacing
- Dense but breathable. Tight padding (24–32px) inside cells.
- Generous vertical rhythm between sections (80–120px).
- No ornamental whitespace. Every gap has purpose.

---

## Animation

### Principles
- Use `steps()` timing, never `ease` or `ease-in-out`. Movement should snap.
- Animations are mechanical, not fluid. This is a machine, not water.
- Every animation serves a purpose: reveals content, provides feedback, reinforces identity.

### Approved Patterns

| Pattern           | Usage                                  | Timing               |
|-------------------|----------------------------------------|----------------------|
| **Glitch decode** | H1 and H2 on the **landing page only**. Text scrambles from random chars to real text, char by char. No hover re-trigger. Not used on subpages. | ~40ms per char |
| **Typing**        | Hero terminal. Chars appear with human-like jitter (30–80ms variance). | Per-character |
| **Cursor blink**  | Terminal cursor. Hard on/off with `steps(1)`. | 1s cycle |
| **Cell reveal**   | Grid items. Stagger-in with stepped opacity. | 0.3s `steps(4)` per cell, 80ms stagger |
| **Hover snap**    | Background/color changes. Instant — no transition delay. | 0s |

### Forbidden
- Smooth easing (`ease`, `ease-in-out`, `cubic-bezier`).
- Parallax scrolling.
- Bounce or elastic effects.
- Fade-in without structure (no opacity-only fades).

---

## Components

### Terminal Window
Faux terminal chrome: title bar with close/minimize/maximize dots, border frame, dark body.
Square dots (no rounded). Used to showcase content as if it's terminal output.

### Section Headers
`// SECTION_NAME` format in muted text, uppercase, wide letter-spacing.
Always precede content blocks.

### Buttons / CTAs
No pill shapes. Bordered rectangles with monospace text.
Hover: background snaps to `--bg-surface`, text snaps to `--accent`.

### Links
Default: accent color, no underline.
Hover: `2px solid` underline snaps in (not transitions).

### Cards / Feature Cells
Hard borders. No shadow. No rounded corners.
Hover: background snaps to `--bg-surface`, value text snaps to accent.
Small uppercase label, large value, muted detail.

---

## Content Voice

- Direct. Short sentences. Commands, not paragraphs.
- Technical accuracy over marketing fluff.
- Use terminal metaphors: "boot", "execute", "pipe", "fork".
- Comment syntax for labels: `// SECTION`.
- No exclamation marks. No emoji. No buzzwords.

---

## Responsive

- Mobile: single column, same aesthetic. No design compromises.
- Breakpoints: 480px (phone), 768px (tablet), 1024px (desktop).
- Grid collapses: 3-col → 2-col → 1-col.
- Nav links tighten spacing; no hamburger menu (brutalism rejects hiding).

---

## Accessibility

Despite the raw aesthetic:
- All text meets WCAG AA contrast (4.5:1 minimum).
- Semantic HTML (`<nav>`, `<main>`, `<section>`, `<footer>`).
- `aria-label` on interactive elements.
- Keyboard navigable throughout.
- Reduced motion: respect `prefers-reduced-motion` — disable glitch/typing, show final state.
- Screen reader text via `.sr-only` for icon-only elements.
