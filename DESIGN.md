# Design Brief: Student Life Optimization System

## Visual Direction
Modern, soft, educational. Warm cream neutrals with accessible contrast. Card-based layout emphasizing algorithm concepts. Student-friendly, approachable, unintimidating.

## Tone
Credible yet inviting. Explains complex concepts clearly without corporate heaviness. Interactive and engaging through color distinction and smooth interactions.

## Differentiation
Three algorithm cards in distinct soft accent colors (cyan/blue for Knapsack, mint/emerald for LCS, purple for Matrix Chain). DP table visualization with intuitive color-coded cells. Hero section with subtle gradient accents. Section backgrounds alternate for rhythm.

## Color Palette (Light/Dark)

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| Primary (Cyan) | `0.62 0.15 260` | `0.72 0.18 260` | Buttons, focus, interactive states |
| Secondary (Emerald) | `0.68 0.12 150` | `0.65 0.14 150` | Knapsack algorithm, secondary actions |
| Accent (Purple) | `0.62 0.13 295` | `0.70 0.16 295` | LCS highlights, tertiary accent |
| Chart-1 (Gold) | `0.75 0.12 60` | `0.72 0.15 60` | Matrix Chain algorithm, data viz |
| Background | `0.97 0.02 60` | `0.12 0.02 240` | Page background |
| Card | `1.0 0 0` | `0.16 0.01 240` | Elevated card surfaces |
| Foreground | `0.15 0.01 240` | `0.94 0.01 240` | Body text |
| Muted | `0.92 0.01 240` | `0.22 0.02 240` | Section backgrounds, disabled states |

## Typography
- **Display**: Figtree (warm, approachable, modern)
- **Body**: Plus Jakarta Sans (clean, readable, friendly)
- **Mono**: Geist Mono (code examples, DP table cells)
- **Scale**: 3.5rem hero title, 2rem section heads, 1.125rem body, 0.875rem captions

## Structural Zones

| Zone | Light Treatment | Dark Treatment |
|------|-----------------|-----------------|
| Hero | Warm cream bg with gradient accent overlay | Dark blue-slate bg with muted gradient overlay |
| Navigation | Bg-card with subtle border-b, shadow-subtle | Bg-card with subtle border-b |
| Content Sections | Alternate bg-background & bg-muted/20 | Alternate dark bg-background & bg-muted/20 |
| Cards | Bg-card with shadow-md, hover:shadow-lg | Bg-card with shadow-subtle, elevated |
| Algorithm Cards | Soft gradient tints (blue, green, purple) | Dark tinted gradients |
| Footer | Echo hero gradient, bg-muted/40 | Dark bg-muted/40 with border-t |

## Component Patterns
- **Cards**: `card-elevated` utility (soft shadow, smooth hover lift)
- **Algorithm cards**: Distinct gradient backgrounds (`.algo-card-knapsack`, `.algo-card-lcs`, `.algo-card-matrix`)
- **Buttons**: Primary (cyan bg) and Secondary (emerald bg) with smooth transitions
- **Forms**: `bg-input` with `border-border`, `focus:ring-2 ring-primary`
- **Tables**: Alternating `bg-muted/20` rows for readability
- **DP Grid**: Color-coded cells (initial=gray, computed=primary, reused=accent)

## Motion & Animation
- **Transitions**: All interactive elements use `transition-smooth` (0.3s cubic-bezier)
- **Entrance**: Cards animate in with `animate-slide-up` on scroll
- **Hover**: Cards lift with shadow increase, buttons darken slightly
- **Pulse**: DP table highlights reused values with `animate-pulse-soft`
- **No bouncy springs** — maintains educational clarity

## Spacing & Rhythm
- **Base rhythm**: 0.75rem (12px) default radius
- **Padding**: Cards use 1.5rem–2rem, sections use 2rem–3rem vertical
- **Gap**: 1rem between cards, 1.5rem between sections
- **Density**: Generous whitespace around educational content (not cramped)

## Signature Detail
Gradient hero section with soft cyan + purple blend that echoes in hover states. Algorithm cards each possess a subtle tinted gradient background matching their color identity. DP table cells glow softly when visited/reused — reinforces "solve once, reuse many times" concept visually.

## Constraints
- No hard shadows or neon glows (maintains approachable tone)
- No rainbow color mixing (3–5 core colors only)
- No system fonts (always load bundled: Figtree, Plus Jakarta Sans, Geist Mono)
- All color values OKLCH only (no hex, no rgb, no hsl)
