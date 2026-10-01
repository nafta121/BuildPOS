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

## 2026-10-01 - Repeated Currency & Decimal Formatting in POS Render Loop
**Learning:** In `PosView`, keystrokes in search or Virtual Numpad updates trigger re-renders that executed `selling_price.toLocaleString('id-ID')`, `.toFixed(2)`, and `getTotalAmount()` hundreds of times per frame inside `filteredProducts.map` and `cartItems.map`, creating noticeable typing latency on budget hardware.
**Action:** Pre-format product prices/stocks (`preparedProducts`) and cart items/totals (`preparedCartItems`, `formattedTotalAmount`) using `useMemo` whenever `products` or `cartItems` change.
