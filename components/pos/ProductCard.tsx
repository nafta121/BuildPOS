// components/pos/ProductCard.tsx
'use client';

import React from 'react';
import { Product, CartItem } from '@/types/database';

interface ProductCardProps {
  product: Product;
  inCart: CartItem | undefined;
  onProductClick: (product: Product) => void;
  onQuickAddFraction: (product: Product, qty: number, e: React.MouseEvent) => void;
}

// OPTIMIZATION: Memoized with React.memo to prevent unnecessary catalog card re-renders
// when numpad state, search keystrokes, or active selection changes in parent PosView.
export const ProductCard: React.FC<ProductCardProps> = React.memo(
  ({ product, inCart, onProductClick, onQuickAddFraction }) => {
    const isOutOfStock = product.stock <= 0;
    const isLowStock = product.stock <= product.min_stock && !isOutOfStock;

    const formattedStock =
      product.stock % 1 === 0 ? product.stock : product.stock.toFixed(2);
    const ariaText = `${product.name}, Rp ${product.selling_price.toLocaleString(
      'id-ID'
    )}, Stok: ${formattedStock} ${product.unit}${
      inCart ? `, Di keranjang: ${inCart.cart_quantity} ${inCart.unit}` : ''
    }${isOutOfStock ? ', Stok habis' : ''}`;

    return (
      <div
        role="button"
        tabIndex={isOutOfStock ? -1 : 0}
        aria-label={ariaText}
        aria-disabled={isOutOfStock}
        onClick={() => onProductClick(product)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onProductClick(product);
          }
        }}
        className={`group relative bg-slate-900 border rounded-xl p-3 sm:p-4 flex flex-col justify-between transition-all select-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none ${
          isOutOfStock
            ? 'opacity-50 border-slate-800 cursor-not-allowed'
            : inCart
            ? 'border-emerald-500/80 bg-slate-900/90 ring-1 ring-emerald-500/50 shadow-md cursor-pointer'
            : 'border-slate-800 hover:border-slate-700 hover:bg-slate-850 active:scale-[0.98] cursor-pointer'
        }`}
      >
        <div>
          {/* Category Badge & Unit */}
          <div className="flex justify-between items-start gap-1 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800 px-2 py-0.5 rounded truncate max-w-[120px]">
              {product.category?.name || 'Material'}
            </span>
            <span className="text-[11px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {product.unit}
            </span>
          </div>

          {/* Product Name (Fat-finger clear text) */}
          <h3 className="font-bold text-sm sm:text-base text-white line-clamp-2 leading-tight">
            {product.name}
          </h3>

          {product.sku && (
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">
              {product.sku}
            </p>
          )}
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-800/80">
          {/* Price and Stock status */}
          <div className="flex justify-between items-baseline mb-2">
            <span className="font-black text-sm sm:text-base text-emerald-400 font-mono">
              Rp {product.selling_price.toLocaleString('id-ID')}
            </span>
            <span
              className={`text-[10px] font-semibold ${
                isOutOfStock
                  ? 'text-rose-400 font-bold'
                  : isLowStock
                  ? 'text-amber-400'
                  : 'text-slate-400'
              }`}
            >
              Stok: {formattedStock} {product.unit}
            </span>
          </div>

          {/* Quick Decimal Add Buttons for Toko Bangunan (e.g., 0.5, 1, 5) */}
          {!isOutOfStock && (
            <div className="grid grid-cols-3 gap-1 pt-1">
              <button
                type="button"
                aria-label={`Tambah 0.5 ${product.unit} ${product.name}`}
                onClick={(e) => onQuickAddFraction(product, 0.5, e)}
                className="py-1 text-[11px] font-bold bg-slate-800 hover:bg-slate-700 active:bg-amber-600 text-amber-300 hover:text-white rounded border border-slate-700 transition focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
                title="Tambah 0.5"
              >
                +0.5
              </button>
              <button
                type="button"
                aria-label={`Tambah 1 ${product.unit} ${product.name}`}
                onClick={(e) => onQuickAddFraction(product, 1, e)}
                className="py-1 text-[11px] font-bold bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 text-slate-200 hover:text-white rounded border border-slate-700 transition focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
                title="Tambah 1"
              >
                +1
              </button>
              <button
                type="button"
                aria-label={`Tambah 5 ${product.unit} ${product.name}`}
                onClick={(e) => onQuickAddFraction(product, 5, e)}
                className="py-1 text-[11px] font-bold bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 text-slate-200 hover:text-white rounded border border-slate-700 transition focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
                title="Tambah 5"
              >
                +5
              </button>
            </div>
          )}

          {/* In-cart badge */}
          {inCart && (
            <div className="mt-2 py-1 px-2 bg-emerald-950/80 border border-emerald-800/80 rounded flex items-center justify-between text-[11px] font-bold text-emerald-300">
              <span>Di Keranjang:</span>
              <span>
                {inCart.cart_quantity} {inCart.unit}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

ProductCard.displayName = 'ProductCard';
