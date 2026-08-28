# SyncMeet — Discord-Inspired Communication Platform Design System & Style Guide

SyncMeet adopts a modern, dark, communication-native visual identity inspired by **Discord** and specified in `frontend/DESIGN.md`, prioritizing typography clarity, immersive atmosphere, spacious rounded components, and tactile micro-interactions.

---

## 1. Aesthetic Archetype: Discord Communication Dark

- **Primary Canvas**: Deep Indigo canvas (`#0A0D3A` / `#070928`) with an atmospheric Blurple-to-Magenta ambient gradient mesh.
- **Brand Identity Accent**: **Blurple** (`#5865F2`) for primary actions, marquee bands, and active brand markings.
- **High-Intent Accent**: **Electric Green** (`#35ED7E`) with dark contrast text for highest-intent CTAs (Get Started, Join Meeting) and active online indicators.
- **Vibrant Accent**: **Magenta** (`#EC48BD`) for badges, highlight accents, and gradient panels.
- **Surfaces & Cards**: Raised Indigo (`#1E2353`), Surface Card (`#141738`), Surface Onyx (`#23272A`), Glassmorphism (`rgba(14, 18, 52, 0.75)`).
- **Hairline Borders**: Soft semi-transparent borders (`rgba(255, 255, 255, 0.08)`).
- **Typography Scale**: High-contrast white text (`#FFFFFF`), secondary text (`#B5BAC1`), muted text (`#80848E`). Display headings powered by `Space Grotesk` & `Plus Jakarta Sans`, code rooms by `JetBrains Mono`.

---

## 2. Color System Tokens

```css
:root {
  /* Surfaces */
  --canvas: #0A0D3A;
  --canvas-dark: #070928;
  --surface-indigo: #1E2353;
  --surface-card: #141738;
  --surface-onyx: #23272A;
  --surface-glass: rgba(14, 18, 52, 0.75);

  /* Brand Accents */
  --primary-blurple: #5865F2;
  --blurple-hover: #4752C4;
  --accent-green: #35ED7E;
  --green-hover: #2FD36F;
  --accent-magenta: #EC48BD;
  --accent-cyan: #00B0F4;

  /* Text & Foreground */
  --text-white: #FFFFFF;
  --text-secondary: #B5BAC1;
  --text-muted: #80848E;
  --text-dark: #000000;

  /* Gradients */
  --brand-gradient: linear-gradient(135deg, #5865F2 0%, #8B5CF6 50%, #EC48BD 100%);
  --brand-gradient-green: linear-gradient(135deg, #35ED7E 0%, #00B0F4 100%);
  --glow-blurple: 0 0 24px rgba(88, 101, 242, 0.35);
  --glow-green: 0 0 20px rgba(53, 237, 126, 0.35);

  /* Semantics */
  --color-error: #F23F43;
  --color-error-bg: rgba(242, 63, 67, 0.15);
  --color-warning: #F0B232;
  --color-warning-bg: rgba(240, 178, 50, 0.15);
  --color-success: #35ED7E;
  --color-success-bg: rgba(53, 237, 126, 0.15);

  /* Radii */
  --radius-sm: 12px;
  --radius-md: 14px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-pill: 9999px;
}
```
