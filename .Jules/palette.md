## 2026-03-31 - Accessibility and Focus Indicators for Custom Touch Virtual Numpads

**Learning:** Custom virtual numpad controls and touch-optimized preset buttons designed for fat-finger input often lack explicit `aria-label` attributes and keyboard focus-visible outlines. When screen reader users or keyboard-only cashiers navigate touch-heavy POS interfaces, unlabelled buttons and invisible focus states prevent seamless interaction.
**Action:** Always complement tactile touch styling on custom numpad controls with explicit `aria-label` descriptors and `focus-visible:ring-2` focus rings to ensure full accessibility for both touch and keyboard users.

## 2026-03-31 - Label Associations and Focus-Visible Outlines for Dark Mode Form Modals

**Learning:** Modal input dialogs in dark-themed interfaces often lack explicit `htmlFor` / `id` label bindings and high-contrast `focus-visible` focus rings. Screen readers fail to announce form labels when clicking labels doesn't focus inputs, and keyboard navigation becomes guessing game without visible focus rings on dark inputs.
**Action:** Pair every form label with matching `htmlFor` and `id` attributes and add `focus-visible:ring-2 focus-visible:ring-emerald-500` outline rings on form controls in dark mode modals.
