## 2026-03-31 - Accessibility and Focus Indicators for Custom Touch Virtual Numpads

**Learning:** Custom virtual numpad controls and touch-optimized preset buttons designed for fat-finger input often lack explicit `aria-label` attributes and keyboard focus-visible outlines. When screen reader users or keyboard-only cashiers navigate touch-heavy POS interfaces, unlabelled buttons and invisible focus states prevent seamless interaction.
**Action:** Always complement tactile touch styling on custom numpad controls with explicit `aria-label` descriptors and `focus-visible:ring-2` focus rings to ensure full accessibility for both touch and keyboard users.

## 2026-04-01 - Dark Theme Modal Form Accessibility and Visual Focus Rings

**Learning:** In dark theme modal dialogs, standard form inputs and action buttons can lack distinct visual focus indicators and proper `htmlFor`/`id` associations. Users navigating via screen readers or keyboard Tab navigation require explicit label associations, high-contrast focus rings (`focus:ring-2 focus:ring-emerald-500`), and animated loading indicators (`Loader2`) during async submission.
**Action:** Pair every modal form label with explicit `htmlFor` and matching `id` attributes, apply high-contrast focus rings to all form controls and action buttons, and provide visual spinner feedback during async submission states.
