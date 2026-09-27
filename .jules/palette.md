# Palette's UX & Accessibility Journal - Critical Learnings Only
<!-- This file is only for critical codebase-specific UX discoveries, accessibility anti-patterns, or user behavioral insights. -->

## 2026-09-26 - Physical POS Cashier Keyboard Shortcut & ARIA Parity
**Learning:** In cashier and POS terminals, action buttons often advertise physical hotkeys (e.g. `Bayar Sekarang (F9)`). Displaying hotkey hints without real window keyboard listeners and matching `aria-keyshortcuts` breaks cashier workflow continuity and confuses assistive tech.
**Action:** Whenever a button advertises a hotkey hint, always bind a corresponding global keyboard handler (with modal/empty state guards) and attach `aria-keyshortcuts` alongside accessible focus ring indicators.
