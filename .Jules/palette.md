## 2026-03-31 - Accessibility and Focus Indicators for Custom Touch Virtual Numpads

**Learning:** Custom virtual numpad controls and touch-optimized preset buttons designed for fat-finger input often lack explicit `aria-label` attributes and keyboard focus-visible outlines. When screen reader users or keyboard-only cashiers navigate touch-heavy POS interfaces, unlabelled buttons and invisible focus states prevent seamless interaction.
**Action:** Always complement tactile touch styling on custom numpad controls with explicit `aria-label` descriptors and `focus-visible:ring-2` focus rings to ensure full accessibility for both touch and keyboard users.

## 2026-03-31 - Modal Dialog Accessibility Standardizing in Inventory Management

**Learning:** Modal dialogs in inventory CRUD screens frequently miss essential dialog semantics (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`), header close controls with `aria-label`, and explicit `htmlFor`/`id` form label linkages. Without these, screen readers fail to announce modal contexts properly and keyboard users cannot easily navigate or exit dialogs.
**Action:** Whenever creating or refactoring modal overlays, ensure proper ARIA dialog semantics, explicit `htmlFor`/`id` bindings for all form controls, header close buttons with `aria-label`, and `focus-visible:ring-2` outline styles on all interactive elements.
