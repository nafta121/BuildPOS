# Bolt's Performance Journal - Critical Learnings Only
<!-- This file is only for critical codebase-specific performance discoveries, anti-patterns, or failed optimizations. -->

## 2026-09-26 - High-Frequency POS Render Loop Bottleneck with Inline Filters
**Learning:** In BuildPOS, keystrokes in search and numpad updates trigger frequent re-renders of `PosView`. Inline `products.filter` inside `categories.map` and `cartItems.find` inside `filteredProducts.map` ran O(C*N) and O(P*K) nested loops on every single keystroke and cart touch, allocating temporary arrays and causing frame drops on budget cashier hardware.
**Action:** Always pre-aggregate category item counts into a memoized `Map<string, number>` and cart items into `Map<string, CartItem>`. Hoist string normalizations outside predicate loops to keep per-render lookups strictly O(1).
