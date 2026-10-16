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

## 2026-09-29 - POS Catalog Grid DOM Reconciliation Bottleneck on Numpad Keystrokes
**Learning:** In `PosView`, keystrokes on the Virtual Numpad or quantity adjustments update state (`numpadQtyStr`). Because product items in the catalog grid were rendered inline, every keystroke re-evaluated VNodes, formatting logic (`selling_price.toLocaleString('id-ID')`), and DOM diffs for hundreds of product cards across the entire catalog grid.
**Action:** Extract inline product catalog items into a standalone `ProductCard` component wrapped with `React.memo`, pre-format price strings with `useMemo`, and pass memoized `useCallback` click handlers to prevent O(N) catalog DOM re-renders on keystrokes.
