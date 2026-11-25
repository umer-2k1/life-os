# Design System

> The visual contract for Life OS. Reference demo: [`reference/ui-gold-luxury-demo.html`](reference/ui-gold-luxury-demo.html).
> Longer spec: [`07-design-system.md`](07-design-system.md), [`10-ui-build-brief.md`](10-ui-build-brief.md).

---

## 1. Direction

**Dark luxury, gold restraint, emotional photography.**

This is a private trophy room, not a corporate dashboard. Black and charcoal surfaces, one gold accent, large photographs, generous space, calm motion.

Rules:
- Gold is an **accent**, never a fill. Restraint is the luxury.
- Red is reserved for waste / decay / danger. Green means on-track. Amber is neutral.
- Numbers are emotional: scores, money and trajectory are large and tabular.
- Copy is bullets and keywords, never paragraphs.

---

## 2. Tokens

Defined once in `src/app/globals.css` as CSS variables and exposed to Tailwind 4 via `@theme inline`.

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0A0A0B` | app background |
| `--surface` | `#141416` | cards |
| `--surface-2` | `#1C1C1F` | raised / inputs |
| `--surface-3` | `#242428` | tracks, hover |
| `--border` | `#2A2A2E` | hairlines |
| `--fg` | `#F5F5F4` | primary text |
| `--muted` | `#9A9AA2` | secondary text |
| `--faint` | `#6B6B73` | labels, captions |
| `--gold` | `#C8A24B` | accent, progress, CTA |
| `--gold-soft` | `#E7D4A2` | highlights, active text |
| `--green` | `#3FB68B` | on-track |
| `--amber` | `#E0A82E` | neutral / streak |
| `--red` | `#E4564A` | waste, decay, danger |

Gradients:
- Gold CTA: `linear-gradient(145deg, var(--gold), #8A6D28)`
- Gold bar: `linear-gradient(90deg, var(--gold), var(--gold-soft))`
- Page glow: radial, gold at 7% opacity, top-right, fixed.

Radii:
- Card `16px`, sheet `20px`, control `10px`, pill `999px`.

Spacing:
- Page gutter `max(18px, safe-area)`, max width `1120px`.
- Card padding `18px` (`14px` tight), section gap `16px`.

---

## 3. Typography

| Role | Font | Notes |
|---|---|---|
| Display / emotional | **Fraunces** | headings, the why quote, big numbers |
| UI | **Inter** | everything else |
| Numbers | Inter/Fraunces + `tabular-nums` | scores, money, dates |

Loaded with `next/font/google` and `display: swap`.
- Display: `font-display`, weight 400–500, italic for quotes.
- Eyebrow: 11px, uppercase, `letter-spacing .14em`, faint.
- Body: 13–14px, line-height 1.5.
- Hero numbers: `clamp(34px, 7vw, 52px)`.
- Score dial: 34px inside the ring.

---

## 4. Components

### Buttons
Variants: `default` (surface + gold border), `gold` (gradient), `outline`, `ghost`, `danger`.
Sizes: `sm` 32px, `default` 36px, `lg` 44px, `icon` 36px.
Focus: 2px gold outline, 2px offset.

### Cards
- `.card` = surface + 1px border + 16px radius + 18px padding.
- Hover lift only on interactive cards: `translateY(-2px)` + soft gold shadow.
- Cover images use a gradient scrim at the bottom for legible text.

### Badges / chips
Tones: `gold`, `green`, `amber`, `red`, `muted`.
Always pair color with a word or icon (never color alone).

### Inputs
- Height 40px, surface-2, 1px border, radius 10px.
- Focus: gold border.
- Labels: 11px uppercase, faint.
- PIN input: six 46×54 boxes, active box gold border + 3px gold ring, blinking caret.

### Sheet / dialog
Radix Dialog.
- Mobile: bottom sheet, rounded top, max 92dvh.
- Desktop: centered, 680px max, rounded 20px.
- Esc / scrim close, focus trap, `aria-modal`.

### Dream card
16:10 cover · gradient/glyph fallback · priority chip top-left · progress ring bottom-right · title (Fraunces) · target date · “Nd ago” (red when stale).

### Score dial
SVG ring, 7px stroke, gold gradient, track `surface-3`. Number centered. Empty state shows `—` and “no log”.

### Heatmap
20 weeks × 7 days, 12px cells, 3px gap, gold intensity 0→4. Horizontal scroll on mobile, legend below.

### Kanban
4 columns: Today · Doing · Done · Wasted. Cards have a 3px severity stripe, points or `+N days`, dream label, dashed suggestion. Drag on desktop, arrows on touch.

### North Star
Gold number, label, identity line, soft radial glow in the corner, edit link.

### Prioritites / recap
Checkable rows; recap uses ON / NEU / WASTE tags and a dashed gold “Next:” box.

### “Why you started”
Dream photo or glyph + the raw reason in Fraunces italic, left gold rule. Rotates by day.

### Decay banner
Red border, red icon, quiet but unmissable. Shows the most neglected dream.

### Report body
Markdown-ish renderer: `#` title, `##` gold uppercase section labels, `-` bullets with gold dots, `**bold**` emphasis.

---

## 5. Layout

```
sticky header (wordmark · nav · live clock)
motto strip (gold dot + italic line)
main (max 1120px, 18px gutters)
footer (small, faint)
```

- Nav: Dashboard · Dreams · Activity · Reports · Settings. Active = gold-soft on raised surface.
- Mottos: “Make a shit ton of money. Nobody cares about it.” — never hidden.
- Dashboard order: North Star + Today → decay → priorities + recap → heatmap → why → dreams.
- Grids: `repeat(auto-fill, minmax(215px, 1fr))`.

---

## 6. Motion

| Motion | Spec |
|---|---|
| Page enter | fade + 8px rise, 300ms ease-out |
| Sheet | fade overlay + rise content, 250ms |
| Score ring / progress | width/dashoffset transition 500–700ms |
| Hover lift | 180ms |
| Caret | 1.15s blink |
| Wrong PIN | 350ms shake |

Every animation is disabled under `prefers-reduced-motion: reduce`.

---

## 7. Responsive

- Mobile-first. Single column stacks.
- Kanban scrolls horizontally (`repeat(4, minmax(230px, 1fr))`).
- Dream sheet becomes a bottom sheet.
- Header clock hides under 640px.
- Touch controls are always visible (no hover-only actions).
- Safe-area insets respected on iOS.

---

## 8. Accessibility

- AA contrast on dark (body text 9:1+, muted 4.5:1+).
- 2px gold `:focus-visible` ring everywhere.
- Dialogs: focus trap, Esc, labelled title.
- Icons paired with text; color never the only signal.
- `aria-current="page"` on nav.
- Progress bars expose `role="progressbar"` + values.
- Reduced motion honoured.

---

## 9. Copy rules

1. Bullets or keywords. No paragraphs.
2. Max ~5 bullets per block.
3. Loss framing: “+2 days to Dream Car”, “14 days untouched”, “streak can break”.
4. Numbers are specific: scores, days, money.
5. Harsh when earned, never fluffy.
6. Dates, not day counters. (“Today is Wednesday, November 25.”)

---

## 10. Screens

| Screen | Purpose |
|---|---|
| Login | PIN entry, OTP boxes, motto, privacy note |
| Dashboard | trophy room: North Star, score, streak, priorities, recap, heatmap, why |
| Dreams | grid of covers, progress, decay |
| Dream sheet | why, milestones, savings, gallery, next action, edit/delete |
| Activity | dated kanban + log composer |
| Reports | generate, read, PDF, history |
| Settings | identity, security, AI keys, notifications, integrations |
| Offline | PWA fallback |

---

## 11. Implementation notes

- Tokens live in `src/app/globals.css`; Tailwind 4 reads them via `@theme inline`.
- Reusable classes: `.card`, `.eyebrow`, `.tnum`, `.gutter`, `.wrap`, `.scrim`, `.dashed-gold`.
- Components: `src/components/ui/*` (button, card, input, badge, progress, sheet, input-otp, pin-input).
- Fonts: Fraunces + Inter via `next/font` in `src/app/layout.tsx`.
- Use `cn()` (clsx + tailwind-merge) for conditional classes.
- No light theme. No corporate blue. No paragraph walls.
