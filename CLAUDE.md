# TraceWorks — Claude Session Context

## Who & What
TraceWorks is a custom PCB design studio run by **Prithvi Gupta**, based in Nashua, NH.
The live website is **traceworkspcb.com** — a static HTML/CSS/JS SPA deployed on Vercel.

---

## Repositories
| Remote | URL | Purpose |
|--------|-----|---------|
| `origin` | https://github.com/Prithvi-0g/Tracework-alpha | Design/dev mirror |
| `live` | https://github.com/Prithvi-0g/traceworks-site | Production repo (Vercel pulls from here) |

Both remotes must be pushed on every change:
```bash
git push origin main && git push live main
```

Then deploy:
```bash
npx vercel --prod --yes
```

The Vercel project is named `traceworks` under `prithvi-0gs-projects`. `vercel.json` sets `framework: null` so it serves static files from `.` with no build step.

---

## Project Structure
```
Tracework-alpha/
├── index.html          # Single HTML file — all 7 sections + modals
├── style.css           # Full design system + all component styles
├── main.js             # Section nav, reveals, counters, KiCuddy terminal, privacy modal
├── pcb3d.js            # Three.js r128 interactive PCB hero
├── vercel.json         # { framework: null, buildCommand: "", outputDirectory: "." }
└── assets/
    ├── logo.png                  # TraceWorks nav/footer logo
    ├── kicuddy-logo.png          # KiCuddy brand logo (circuit-brain, red/blue)
    ├── motorcontrollerboard.png  # Portfolio PCB photo
    ├── screen-1.png … screen-7.png  # Design preview screens
    ├── logo-kicad.png            # Tool badge favicons (self-hosted)
    ├── logo-jlcpcb.png
    ├── logo-pcbway.png
    ├── logo-digikey.png
    └── logo-ipc.png
```

---

## Architecture — SPA Navigation
All pages are `<section id="...">` elements. Only one has `.active` at a time.
`showSection(name)` in `main.js` handles switching: removes `.active` from current,
adds `.active` + `.entering` to next, resets `.reveal` elements, scrolls to top.

**SECTIONS array** (order matters for arrow-key nav):
```js
['home', 'services', 'process', 'pricing', 'gallery', 'kicuddy', 'preview']
```

**Nav theme**: sections `home`, `gallery`, `kicuddy`, `preview` → dark nav.
All others → light nav (white background).

---

## Sections
| ID | Theme | Notes |
|----|-------|-------|
| `home` | Dark → Light | Hero (Three.js PCB) + ticker + tiers grid + projects + CTA |
| `services` | Light | 4 service cards (Prototyping, Production, RF, Power) |
| `process` | Light | 6-step timeline (draws on enter) + quote card + docs card |
| `pricing` | Light | 3-tier pricing + deliverables grid |
| `gallery` | Dark | Spotlight cone + 3 project cards + submit bar |
| `kicuddy` | Dark | Brand logo + terminal demo + 6-capability grid |
| `preview` | Dark | 7 design screens in browser chrome frames (order: 3,4,5,6,7,1,2) |

---

## Design System (style.css)
```css
--dark:        #080810
--accent:      #7c3aed   /* purple — primary */
--accent-soft: #a78bfa
--green:       #22c55e
--ease:        cubic-bezier(0.22, 1, 0.36, 1)      /* Jakub enter */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)   /* spring/playful */
--mono:  'DM Mono', monospace
--serif: 'DM Serif Display', serif
--sans:  'DM Sans', sans-serif
```

**Reveal system**: `.reveal` = `opacity:0 + translateY(14px) + blur(6px)`.
Add `.in` to trigger. IntersectionObserver at threshold 0.12.
Each element gets `--d` CSS var for stagger delay.

**Overflow:hidden grids** (tiers, projects, deliverables): use `background: color-mix(...)` hover tint instead of `translateY` — translateY is clipped by the parent.

---

## Three.js PCB Hero (pcb3d.js)
- Three.js r128 loaded via CDN in `<head>`
- Canvas fills `#pcb-container` (`position: absolute; inset: 0`) inside `.hero-visual`
- `alpha: true` renderer — transparent background blends with dark hero
- Pixel ratio capped at 2
- Components: FR4 board, MCU chip (12-pin), flash (16-pin), power reg (8-pin), 6× SMDs, gold traces, edge connector pads, 4× mounting holes with gold rings
- Green `PointLight` pulses at `1.2 + sin(t×2.2)×0.3` intensity
- Mouse parallax: `lerp × 0.05` toward `baseRot + mouse × 0.4`
- Resize handler recalculates `camera.aspect` and renderer size

---

## KiCuddy Section
- KiCuddy is the AI PCB design agent (subagent in Claude Code, `subagent_type: "kicuddy"`)
- Logo: `assets/kicuddy-logo.png` — circuit-board brain icon, red/blue
- Terminal demo: 19 lines, CSS `animation-delay` per line (`--td` var), triggered by `showSection('kicuddy')` which removes + re-adds `.running` class on `#kcTerminal`
- 6 capability cards in a dark 3×2 grid

---

## Privacy Policy
- Triggered by "Privacy Policy" button in footer
- Slide-up sheet modal (`#privacyOverlay`): `translateY(100%) → 0` + backdrop blur
- Close: button, click-outside, Escape key
- Covers: data collection, Stripe, Formsubmit, Vercel Analytics, cookies, rights

---

## Motion Principles (design-motion-principles skill)
Designer weighting for this marketing site:
- **Jakub Krehel** (primary) — blur+translate enters, production polish
- **Jhey Tompkins** (secondary) — ambient orbs, ticker, playful interactions
- **Emil Kowalski** (selective) — forms, nav, keyboard nav (never animated)

Key rules applied:
- Keyboard navigation (arrow keys) = instant section switch, no animation
- `prefers-reduced-motion` at end of CSS collapses all to 0.01ms
- Hover lifts blocked by `overflow:hidden` parent → use background tint instead

---

## MCP Servers (available in Claude Code)
| Server | Status |
|--------|--------|
| Canva | ✓ Connected |
| Google Drive | ✓ Connected |
| Stitch (googleapis) | ✓ Connected |
| Vercel | Needs auth |

Stitch was added with:
```
claude mcp add stitch --transport http https://stitch.googleapis.com/mcp \
  --header "X-Goog-Api-Key: <key>" -s user
```

---

## Business Context
- **Service tiers**: Starter $5 · Pro $15 · Complex $40+
- **Deliverables**: Gerbers, drill files, BOM, CPL, schematic PDF, 3D render, sourcing sheet
- **Tools**: KiCad 8, JLCPCB, PCBWay, IPC-2221, IPC-7351, DigiKey
- **Contact**: Quote@traceworkspcb.com
- **Intake flow**: Email form → Stripe 50% deposit (Pro/Complex)

---

## Common Commands
```bash
# Local dev server (already running on :3000)
python3 -m http.server 3000 --directory /Users/prithvigupta/Documents/Tracework-alpha

# Deploy
cd /Users/prithvigupta/Documents/Tracework-alpha
git add -A && git commit -m "..." && git push origin main && git push live main
npx vercel --prod --yes

# Check Vercel project
npx vercel project ls

# MCP servers
claude mcp list
```
