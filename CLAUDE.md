# ori_term_website

Marketing and documentation website for [ori_term](../ori_term/) — a GPU-accelerated terminal emulator in Rust. The terminal project repo lives at `~/projects/ori_term/`; consult its `CLAUDE.md` for product context when writing copy or describing features.

**Do it properly, not just simply. Correct architecture over quick hacks; no shortcuts or "good enough" solutions.**

---

## Standards

- **No stale content.** Do not hardcode feature lists, version numbers, or roadmap status that will drift from the ori_term repo. If content must reflect the terminal's current state, generate it or link to the source of truth.
- **Performance.** Lighthouse 90+ across all categories. No layout shift. Optimize images (WebP/AVIF, lazy loading). Minimal JS — prefer CSS and semantic HTML.
- **Accessibility.** WCAG 2.1 AA minimum. Semantic HTML, proper heading hierarchy, alt text on all images, sufficient color contrast, keyboard navigable.
- **No dead code.** No commented-out blocks, no unused CSS/JS, no placeholder pages.

---

## Stack

Astro 5 + Svelte 5 components. IBM Plex Mono throughout. Brutalist terminal aesthetic.

## Commands

- `npm run dev` — Dev server on port **4322** (4321 is ori_lang website)
- `npm run build` — Production build to `dist/`
- `npm run preview` — Preview production build on port 4322

## Design System

- **Font**: IBM Plex Mono (400/500/700) — monospace everywhere, no sans-serif mixing
- **Palette**: Near-black bg (`#0a0a0a`), raw white text (`#d4d4d4`), terminal green accent (`#00ff41`), hard borders (`#2a2a2a` / `#444444`)
- **Brutalism rules**: No rounded corners. No gradients. No soft shadows. `steps()` timing for animations. Visible structural borders. Tight spacing. Uppercase section headers.
- **Animations**: Typing effect (hero), glitch-decode text, `steps()` CSS transitions — never smooth easing
