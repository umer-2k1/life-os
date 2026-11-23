# 07 · Design System

Dark luxury. Premium, minimal, emotional. A digital vision board — never a corporate PM tool.

## Mood
- Black / charcoal base, subtle **gold** accents.
- Big photographs do the emotional work.
- Elegant typography, generous space.
- A **few** tasteful animations (reveal, soft parallax, count-ups). **Not** heavy, not gaudy, no loud gradients.

## Color tokens (starting point)
| token | value | use |
|-------|-------|-----|
| `--bg` | `#0A0A0B` | app background |
| `--surface` | `#141416` | cards |
| `--surface-2` | `#1C1C1F` | raised |
| `--border` | `#2A2A2E` | hairlines |
| `--text` | `#F5F5F4` | primary text |
| `--text-muted` | `#A1A1AA` | secondary |
| `--gold` | `#C8A24B` | accent / progress / CTA |
| `--gold-soft` | `#E7D4A2` | highlights |
| `--green` | `#3FB68B` | on-track |
| `--amber` | `#E0A82E` | neutral |
| `--red` | `#E4564A` | waste / decay / danger |

- Gold is an **accent**, not a fill. Restraint = luxury.

## Typography
- Display/headings: a refined serif or premium sans (e.g. *Playfair Display* / *Fraunces* for emotional headers; *Inter* / *Geist* for UI).
- Numbers (scores, money): tabular, bold, large.
- Never cramped. Line length short.

## Components (shadcn/ui based)
- **Dream card**: cover photo, gradient scrim, title, progress ring (gold), priority chip, "days since touched".
- **Score dial** (0–100) — the daily number, hero-sized.
- **Heatmap** — GitHub-style, gold intensity scale.
- **Kanban board** — dark columns, draggable activity cards, color-tagged.
- **Activity card** (expanded): relevance tag, served-dream, short suggestion.
- **North Star banner** — pinned, with motto + identity line.
- **Decay alert** — red, quiet but unmissable.
- **Report card** — downloadable, trend arrow.

## Motion
- Entrance: fade + 8px rise, 200–300ms, ease-out.
- Score/money: count-up on view.
- Progress rings: animate to value.
- Dream page hero: subtle Ken-Burns on cover (optional, respect reduced-motion).
- Respect `prefers-reduced-motion`.

## Emotional surfacing
- "Why you started" block uses the dream's own photo + emotional_reason text, styled large and quiet.
- Rotate daily.

## Responsive
- Mobile-first. Dashboard stacks; Kanban scrolls horizontally; dream gallery swipes.
- Thumb-reachable actions on phone.

## Accessibility
- Contrast AA on dark.
- Red/green never the *only* signal — pair with icon/label.
