# Bolt's Performance Journal - Critical Learnings Only
<!-- This file is only for critical codebase-specific performance discoveries, anti-patterns, or failed optimizations. -->

## 2026-09-26 - High-Frequency POS Render Loop Bottleneck with Inline Filters
**Learning:** In BuildPOS, keystrokes in search and numpad updates trigger frequent re-renders of `PosView`. Inline `products.filter` inside `categories.map` and `cartItems.find` inside `filteredProducts.map` ran O(C*N) and O(P*K) nested loops on every single keystroke and cart touch, allocating temporary arrays and causing frame drops on budget cashier hardware.
**Action:** Always pre-aggregate category item counts into a memoized `Map<string, number>` and cart items into `Map<string, CartItem>`. Hoist string normalizations outside predicate loops to keep per-render lookups strictly O(1).

## 2026-09-26 - Inventory Modal Form Keystrokes Re-rendering Product Table
**Learning:** In BuildPOS, typing inside modal dialogs (`StockAdjustModal`, `ProductModal`, `CategoryModal`) updates state in `InventoryView`. Unmemoized `ProductTable` and inline callback handlers caused the full product table to re-render and reconcile DOM rows on every keystroke.
**Action:** Wrap `ProductTable` in `React.memo` and memoize handler props (`onOpenStockAdjust`, `onOpenEditProduct`) using `useCallback` in parent view components.

## 2026-09-28 - Transaction History Table Rendering CPU Bottleneck with Date & I18N Formatting
**Learning:** In `TransactionHistoryView`, `toLocaleDateString('id-ID')`, `.toLocaleString('id-ID')`, and `items.map().join()` ran inside table row rendering loops on every keystroke in search or modal state change (`activeReceiptTx`), instantiating I18N formatters repeatedly and causing UI lag.
**Action:** Pre-process transaction display fields (`formattedDate`, `itemsSummary`, `formattedTotal`, `searchStr`) into a `preparedTransactions` `useMemo` hook whenever `transactions` change.

## 2026-10-02 - Virtual Numpad Re-rendering Cascade on Unmemoized Callbacks & Presets
**Learning:** In BuildPOS, `VirtualNumpad` contains 15+ interactive button elements and icons. When `VirtualNumpad` was unmemoized and passed inline callback handlers from `PosView` or `CheckoutModal`, typing in search boxes or payment inputs re-created default preset arrays (`defaultQtyPresets`, `defaultCashPresets`) and re-rendered the entire numpad DOM tree on every keystroke.
**Action:** Wrap `VirtualNumpad` with `React.memo`, hoist default preset arrays outside component bodies, and wrap parent handler props (`handleNumpadChange`, `handleNumpadPreset`, `handleNumpadClear`, `handleNumpadEnter`) in `useCallback`.
