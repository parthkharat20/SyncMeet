# SyncMeet — Design System & Style Guide

SyncMeet features a bespoke, dark-mode-first visual identity designed specifically for real-time WebRTC video collaboration.

---

## 1. Core Visual Tenets & Non-Negotiable Constraints

### Constraint 1: Distinctive Identity Accent & Glow Treatment
- **SyncMeet Accent Gradient**: `linear-gradient(135deg, #06B6D4 0%, #3B82F6 50%, #8B5CF6 100%)`
- **Electric Cyan Token**: `#06B6D4`
- **Signature Glow Effect**: `box-shadow: 0 0 24px rgba(6, 182, 212, 0.35), 0 4px 16px rgba(0, 0, 0, 0.4)`
- **Hairline Border**: `1px solid rgba(255, 255, 255, 0.08)`

### Constraint 2: Custom Motion Signature
- **Easing Curve**: `cubic-bezier(0.16, 1, 0.3, 1)` (Spring-like deceleration curve)
- **Durations**:
  - `micro`: 120ms (button clicks, toggle switches)
  - `normal`: 240ms (hover states, modal overlays, dropdowns)
  - `entrance`: 360ms (page transitions, drawer slide-ins, tile grid reveals)
- **Stagger Effect**: Keyframe `fadeInSlideUp` applied with `animation-delay: calc(var(--stagger-index) * 60ms)`.

---

## 2. Color Palette & Semantic System

### Surfaces & Backgrounds (Dark-First Scale)
- **App Background (`--bg-dark`)**: `#0B0F19` (Deep Space Navy)
- **Surface Elevation 1 (`--surface-1`)**: `#111827` (Card & Sidebar background)
- **Surface Elevation 2 (`--surface-2`)**: `#1E293B` (Interactive elements & inputs)
- **Surface Elevation 3 (`--surface-3`)**: `#334155` (Active states & elevated modals)
- **Glassmorphic Surface (`--surface-glass`)**: `rgba(17, 24, 39, 0.75)` with `backdrop-filter: blur(16px)`

### Typography & Foreground Scales
- **Text Primary (`--text-primary`)**: `#F8FAFC` (100% opacity)
- **Text Secondary (`--text-secondary`)**: `#94A3B8` (70% opacity)
- **Text Muted (`--text-muted`)**: `#64748B` (45% opacity)

### Accents & Semantics
- **Brand Primary (`--cyan-accent`)**: `#06B6D4`
- **Brand Violet (`--violet-accent`)**: `#8B5CF6`
- **Success (`--color-success`)**: `#10B981` (Emerald Green)
- **Error / Danger (`--color-error`)**: `#F43F5E` (Rose Red)
- **Warning (`--color-warning`)**: `#F59E0B` (Amber Yellow)
- **Info (`--color-info`)**: `#38BDF8` (Sky Blue)

---

## 3. Typography Hierarchy

- **Display & Headings**: `Plus Jakarta Sans`, `Inter`, -apple-system, sans-serif
- **Metadata & Meeting Codes**: `JetBrains Mono`, `Fira Code`, monospace
- **Scale**:
  - `Display 1`: 48px / 1.1 / Font Weight 800 (`tracking-tight`)
  - `Heading 1`: 32px / 1.2 / Font Weight 700
  - `Heading 2`: 24px / 1.3 / Font Weight 600
  - `Body Lead`: 18px / 1.5 / Font Weight 400
  - `Body Regular`: 15px / 1.6 / Font Weight 400
  - `Caption / Code`: 13px / 1.4 / Font Weight 500 (`font-mono`)

---

## 4. Spacing, Radii & Shadows

- **Border Radii**:
  - `sm`: 8px
  - `md`: 12px
  - `lg`: 18px
  - `pill`: 9999px
- **Elevation System**:
  - `Card Elevation`: `0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)`
  - `Modal Elevation`: `0 24px 64px rgba(0, 0, 0, 0.7)`

---

## 5. Primitive Reusable Component State Architecture

Every UI component in `src/components/ui/` implements:
1. **Default State**: Crisp contrast, subtle hairline border.
2. **Hover State**: Elevation boost, border cyan highlight (`border-color: rgba(6, 182, 212, 0.4)`), scale `1.01`.
3. **Active/Focus State**: Custom cyan focus ring (`outline: 2px solid #06B6D4; outline-offset: 2px`).
4. **Disabled State**: Opacity `0.45`, `pointer-events: none`.
5. **Loading State**: Embedded spinner, label update, interactive lock.
