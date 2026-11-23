# UI Reference — LOCKED design

## ✅ Chosen direction: **Gold Luxury** (dark)

File: [`ui-gold-luxury-demo.html`](ui-gold-luxury-demo.html)

This is the **approved, locked look & feel** for the build. The implementing agent/dev treats it as the visual source of truth and builds the real Next.js app to match its *feel* — not its sample data.

### How to view it
- Open the file directly in any browser (double-click, or `open docs/reference/ui-gold-luxury-demo.html`).
- It's a single self-contained HTML file (inline CSS/JS, Google Fonts). No build step, no server.

### What it demonstrates
- The full dark-luxury aesthetic: black/charcoal base, restrained **gold** accent, **Fraunces** (display/numbers) + **Inter** (UI).
- Four views: **Dashboard**, **Dreams** (with clickable detail sheets), **Activity** (Kanban), **Reports**.
- Core behaviors: score dial, streak, points/level, decay alert, GitHub-style heatmap, priced-waste ("+2 days to Dream Car"), emotional "why you started", trajectory verdict.

### Build against these, in order
1. **This demo** — look, feel, layout, motion, color, type.
2. [`../07-design-system.md`](../07-design-system.md) — exact tokens, type scale, component specs.
3. [`../10-ui-build-brief.md`](../10-ui-build-brief.md) — screen-by-screen components, states, interactions, data bindings.
4. [`../03-data-model.md`](../03-data-model.md) — what each screen binds to.

### Rules when implementing
- It's a **mockup**: data is hardcoded sample data. Replace with real Supabase data; keep the visuals.
- Rebuild it properly in **Next.js + Tailwind + shadcn/ui** — don't ship this raw HTML as the app. Use it as the pixel/motion target.
- Gradient dream covers are placeholders for **real uploaded photos**.
- Keep the **brevity law** (bullets/keywords, never paragraphs) and **semantic color** (green on-track / amber neutral / red waste-&-decay) exactly as shown.
- Everything stays **dark** — no light theme.

### Not chosen (archived for reference only)
Two alternate directions were explored and set aside: a gamified "Quest HUD" and a "Cinematic" vision board. Gold Luxury won. If any single element from those is wanted later (e.g. XP/boss-bar mechanics on the Activity screen), it will be specced explicitly — otherwise ignore them.
