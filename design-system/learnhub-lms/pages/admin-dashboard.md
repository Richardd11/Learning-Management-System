# Admin Dashboard Page Overrides

> **PROJECT:** LearnHub LMS
> **Generated:** 2026-06-01 11:11:40
> **Page Type:** Dashboard / Data View

> ⚠️ **IMPORTANT:** Rules in this file **override** the Master file (`design-system/MASTER.md`).
> Only deviations from the Master are documented here. For all other rules, refer to the Master.

---

## Page-Specific Rules

### Layout Overrides

- **Max Width:** 1200px (standard)
- **Layout:** Full-width sections, centered content
- **Sections:** 1. Hero (product + aggregate rating), 2. Rating breakdown, 3. Individual reviews, 4. Buy/CTA

### Spacing Overrides

- No overrides — use Master spacing

### Typography Overrides

- No overrides — use Master typography

### Color Overrides

- **Strategy:** Trust colors. Star ratings gold. Verified badge green. Review sentiment colors.

### Component Overrides

- Avoid: Use arbitrary large z-index values
- Avoid: No feedback during loading
- Avoid: Override system gestures

---

## Page-Specific Components

- No unique components for this page

---

## Recommendations

- Effects: Funnel animation (fill-down), flow diagram animations (connection draw), conversion pulse, engagement bar fill
- Layout: Define z-index scale system (10 20 30 50)
- Feedback: Show spinner/skeleton for operations > 300ms
- Touch: Avoid horizontal swipe on main content
- CTA Placement: After reviews summary + Buy button alongside reviews
