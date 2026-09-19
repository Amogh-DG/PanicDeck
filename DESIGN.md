# Design System & Token Specifications

## 1. Color System (Dark High-Precision Theme)

```css
:root {
  /* Surface & Background */
  --bg-canvas: #0b0f19;
  --bg-surface-lowest: #0e1322;
  --bg-surface: #111827;
  --bg-surface-raised: #182235;
  --bg-surface-overlay: #1f2c45;
  --bg-glass: rgba(17, 24, 39, 0.75);
  --bg-glass-hover: rgba(26, 36, 56, 0.85);

  /* Border & Dividers */
  --border-subtle: rgba(255, 255, 255, 0.07);
  --border-default: rgba(255, 255, 255, 0.12);
  --border-focus: #38bdf8;
  --border-glass: rgba(255, 255, 255, 0.15);

  /* Typography Colors */
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --text-inverse: #0b0f19;

  /* Accent & Brand Colors */
  --brand-primary: #38bdf8;
  --brand-primary-glow: rgba(56, 189, 248, 0.25);
  --brand-secondary: #6366f1;
  --brand-secondary-glow: rgba(99, 102, 241, 0.25);

  /* Semantic Feedback */
  --status-success: #10b981;
  --status-success-bg: rgba(16, 185, 129, 0.12);
  --status-warning: #f59e0b;
  --status-warning-bg: rgba(245, 158, 11, 0.12);
  --status-danger: #ef4444;
  --status-danger-bg: rgba(239, 68, 68, 0.12);
  --status-info: #0ea5e9;
  --status-info-bg: rgba(14, 165, 233, 0.12);

  /* Radii */
  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-full: 9999px;

  /* Shadows & Elevation */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.4);
  --shadow-md: 0 4px 12px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 12px 30px -4px rgba(0, 0, 0, 0.6), 0 4px 8px -2px rgba(0, 0, 0, 0.5);
  --shadow-glow: 0 0 24px -2px var(--brand-primary-glow);
}
```

---

## 2. Typography Rules

* **Primary Sans**: `'Inter'`, `'Plus Jakarta Sans'`, system-ui, -apple-system, sans-serif
* **Telemetry Monospace**: `'JetBrains Mono'`, `'Fira Code'`, monospace
* **Scale**:
  * `Display Title`: `1.75rem` / `700 weight` / `line-height: 1.2`
  * `Section Heading`: `1.25rem` / `600 weight` / `line-height: 1.3`
  * `Metric Value`: `1.5rem` to `2rem` / `700 weight` / `tabular-nums`
  * `Body Text`: `0.9375rem` / `400-500 weight` / `line-height: 1.5`
  * `Micro / Badge`: `0.75rem` / `600 weight` / `letter-spacing: 0.04em` / uppercase

---

## 3. Component Standards

### Cards & Panels
* Background: `var(--bg-glass)` with `backdrop-filter: blur(12px)`.
* Border: `1px solid var(--border-subtle)`.
* Corner Radius: `var(--radius-md)` (10px).
* Hover Effect: Border transitions to `var(--border-glass)` and adds a subtle top gradient sheen.

### Buttons & Interactive Elements
* **Primary Action**: Gradient background (`linear-gradient(135deg, #38bdf8, #2563eb)`), crisp text with shadow, hover elevation with `var(--shadow-glow)`.
* **Secondary / Ghost**: `background: rgba(255, 255, 255, 0.05)`, `border: 1px solid var(--border-default)`, `color: var(--text-primary)`.
* **Metric Cards**: Real-time change indicator (+/- delta badge), sparkline/trend visual, icon badge with glow.

---

## 4. Layout Architecture
* **App Shell**: Persistent responsive sidebar navigation + top telemetry status header + dynamic dashboard viewport.
* **Grid**: 12-column responsive CSS grid with `1.25rem` (20px) gap.
