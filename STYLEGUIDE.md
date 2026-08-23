# SyncMeet — Clean Google Meet-Grade Design System & Style Guide

SyncMeet adopts a crisp, professional, white-based visual identity inspired by Google Meet, focused on typography clarity, spatial harmony, and smooth tactile micro-interactions.

---

## 1. Aesthetic Archetype: Google Meet Clean Light

- **Primary Canvas**: Clean Crisp White (`#FFFFFF`) with subtle off-white elevation surfaces (`#F8FAFC`, `#F1F5F9`).
- **Brand Identity Colors**: Google Meet Blue (`#1A73E8`) & Teal (`#0D9488`).
- **Borders & Dividers**: Crisp slate hairlines (`#E2E8F0`).
- **Typography Scale**: High-contrast slate text (`#0F172A` Primary, `#475569` Secondary).
- **Video Room Dark Mode**: Dedicated call canvas (`#111827` / `#0B0F19`) for participant grid and floating slate controls (`#1E293B`).

---

## 2. Color System Tokens

```css
:root {
  /* Surfaces */
  --bg-main: #FFFFFF;
  --surface-1: #F8FAFC;
  --surface-2: #F1F5F9;
  --surface-3: #E2E8F0;
  --surface-dark: #1E293B;

  /* Text & Foreground */
  --text-primary: #0F172A;
  --text-secondary: #475569;
  --text-muted: #94A3B8;

  /* Brand Accent */
  --brand-blue: #1A73E8;
  --brand-blue-hover: #1557B0;
  --brand-teal: #0D9488;
  --brand-gradient: linear-gradient(135deg, #1A73E8 0%, #0D9488 100%);
  --brand-glow: 0 4px 20px rgba(26, 115, 232, 0.18);

  /* Semantics */
  --color-success: #10B981;
  --color-success-bg: #ECFDF5;
  --color-error: #DC2626;
  --color-error-bg: #FEF2F2;
  --color-warning: #D97706;
  --color-warning-bg: #FFFBEB;

  /* Borders */
  --border-subtle: 1px solid #E2E8F0;
  --border-active: 1px solid #1A73E8;
}
```
