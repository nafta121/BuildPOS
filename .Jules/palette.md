## 2026-03-31 - Accessibility and Focus Indicators for Custom Touch Virtual Numpads

**Learning:** Custom virtual numpad controls and touch-optimized preset buttons designed for fat-finger input often lack explicit `aria-label` attributes and keyboard focus-visible outlines. When screen reader users or keyboard-only cashiers navigate touch-heavy POS interfaces, unlabelled buttons and invisible focus states prevent seamless interaction.
**Action:** Always complement tactile touch styling on custom numpad controls with explicit `aria-label` descriptors and `focus-visible:ring-2` focus rings to ensure full accessibility for both touch and keyboard users.
