// components/pos/PosView.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Product, Category, Transaction } from '@/types/database';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { getProductsAction, getCategoriesAction } from '@/app/actions/products';
import { VirtualNumpad } from './VirtualNumpad';
import { CheckoutModal } from './CheckoutModal';
import { ThermalReceipt } from './ThermalReceipt';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  Check, 
  Package, 
  Layers, 
  ArrowRight, 
  RefreshCw,
  Calculator,
  SlidersHorizontal,
  X
} from 'lucide-react';

export const PosView: React.FC = () => {
  const { currentProfile } = useAuthStore();
  const {
    items: cartItems,
    addItem,
    updateQuantity,
    incrementQuantity,
    removeItem,
    clearCart,
    getTotalAmount,
    selectedProductId,
    setSelectedProductId,
  } = useCartStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  
  // Checkout & Receipt Modal states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);

  // Mobile Cart Drawer State
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  // Load products and categories
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        getProductsAction(currentProfile?.role || 'kasir'),
        getCategoriesAction(),
      ]);

      if (prodRes.success) setProducts(prodRes.data);
      if (catRes.success) setCategories(catRes.data);
    } catch (err) {
      console.error('Error loading POS data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProfile?.role]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchesSearch =
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (prod.sku && prod.sku.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCat =
        selectedCategoryId === 'all' || prod.category_id === selectedCategoryId;
      return matchesSearch && matchesCat && prod.is_active;
    });
  }, [products, searchQuery, selectedCategoryId]);

  // Selected Cart Item for Virtual Numpad manipulation
  const activeCartItem = useMemo(() => {
    if (!selectedProductId) {
      return cartItems.length > 0 ? cartItems[cartItems.length - 1] : null;
    }
    return cartItems.find((i) => i.id === selectedProductId) || null;
  }, [cartItems, selectedProductId]);

  // Numpad quantity value string
  const [numpadQtyStr, setNumpadQtyStr] = useState<string>('');

  useEffect(() => {
    if (activeCartItem) {
      setNumpadQtyStr(activeCartItem.cart_quantity.toString());
    } else {
      setNumpadQtyStr('');
    }
  }, [activeCartItem]);

  const handleNumpadChange = (val: string) => {
    setNumpadQtyStr(val);
    if (activeCartItem) {
      const parsed = parseFloat(val);
      if (!isNaN(parsed) && parsed > 0) {
        updateQuantity(activeCartItem.id, parsed);
      }
    }
  };

  const handleNumpadPreset = (delta: number) => {
    if (activeCartItem) {
      incrementQuantity(activeCartItem.id, delta);
    }
  };

  const handleProductClick = (product: Product) => {
    if (product.stock <= 0) return;
    addItem(product, 1);
    setSelectedProductId(product.id);
  };

  const handleQuickAddFraction = (product: Product, qty: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock < qty) return;
    addItem(product, qty);
    setSelectedProductId(product.id);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100">
      {/* Top Search & Filter Bar */}
      <div className="bg-slate-900 border-b border-slate-800 p-3 sm:p-4 shrink-0">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between max-w-7xl mx-auto w-full">
          {/* Search Box - Big fat-finger friendly */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari semen, pasir, kabel, pipa, paku..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-base text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Refresh Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="px-3.5 py-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-xl border border-slate-700 text-slate-300 hover:text-white transition flex items-center gap-2 text-sm font-semibold"
              title="Perbarui Data Produk"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Categories Chips Row */}
        <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-1 scrollbar-none max-w-7xl mx-auto w-full">
          <button
            onClick={() => setSelectedCategoryId('all')}
            className={`px-4 py-2 rounded-lg font-bold text-xs sm:text-sm whitespace-nowrap border transition-all ${
              selectedCategoryId === 'all'
                ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Semua Produk ({products.length})
          </button>
          {categories.map((cat) => {
            const count = products.filter((p) => p.category_id === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-4 py-2 rounded-lg font-bold text-xs sm:text-sm whitespace-nowrap border transition-all ${
                  selectedCategoryId === cat.id
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Layout */}
      {/* Responsive: Tablet 65% / 35%, Desktop with integrated sidebar/numpad, Mobile single list */}
      <div className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full p-2 sm:p-4 gap-4">
        {/* Left: Product Catalog (65% on tablet/desktop) */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center p-12">
              <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-500 text-center">
              <Package className="w-12 h-12 mb-3 stroke-1" />
              <p className="font-semibold text-base text-slate-300">Tidak ada produk yang cocok</p>
              <p className="text-xs text-slate-500 mt-1">Coba kata kunci pencarian atau kategori lain</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-2.5 sm:gap-3.5 pb-24 md:pb-4">
              {filteredProducts.map((product) => {
                const isOutOfStock = product.stock <= 0;
                const isLowStock = product.stock <= product.min_stock && !isOutOfStock;
                const inCart = cartItems.find((i) => i.id === product.id);

                return (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    className={`group relative bg-slate-900 border rounded-xl p-3 sm:p-4 flex flex-col justify-between transition-all select-none cursor-pointer ${
                      isOutOfStock
                        ? 'opacity-50 border-slate-800 cursor-not-allowed'
                        : inCart
                        ? 'border-emerald-500/80 bg-slate-900/90 ring-1 ring-emerald-500/50 shadow-md'
                        : 'border-slate-800 hover:border-slate-700 hover:bg-slate-850 active:scale-[0.98]'
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
                          Stok: {product.stock % 1 === 0 ? product.stock : product.stock.toFixed(2)}{' '}
                          {product.unit}
                        </span>
                      </div>

                      {/* Quick Decimal Add Buttons for Toko Bangunan (e.g., 0.5, 1, 2) */}
                      {!isOutOfStock && (
                        <div className="grid grid-cols-3 gap-1 pt-1">
                          <button
                            type="button"
                            onClick={(e) => handleQuickAddFraction(product, 0.5, e)}
                            className="py-1 text-[11px] font-bold bg-slate-800 hover:bg-slate-700 active:bg-amber-600 text-amber-300 hover:text-white rounded border border-slate-700 transition"
                            title="Tambah 0.5"
                          >
                            +0.5
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleQuickAddFraction(product, 1, e)}
                            className="py-1 text-[11px] font-bold bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 text-slate-200 hover:text-white rounded border border-slate-700 transition"
                            title="Tambah 1"
                          >
                            +1
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleQuickAddFraction(product, 5, e)}
                            className="py-1 text-[11px] font-bold bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 text-slate-200 hover:text-white rounded border border-slate-700 transition"
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
              })}
            </div>
          )}
        </div>

        {/* Right: Static Cart & Numpad Split-Screen (Hidden on mobile <768px, 35% on tablet, 380px on desktop) */}
        <div className="hidden md:flex flex-col w-[340px] lg:w-[380px] bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden shrink-0">
          {/* Cart Header */}
          <div className="p-3.5 bg-slate-850 border-b border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-emerald-400" />
              <h2 className="font-bold text-base text-white">Keranjang Kasir</h2>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full">
                {cartItems.length}
              </span>
            </div>
            {cartItems.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold p-1 hover:bg-rose-950/30 rounded"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Kosongkan</span>
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[40vh]">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-10 text-slate-500 text-center">
                <ShoppingCart className="w-10 h-10 mb-2 stroke-1 opacity-40" />
                <p className="font-semibold text-sm">Keranjang kosong</p>
                <p className="text-xs text-slate-500 mt-0.5">Pilih produk di sebelah kiri</p>
              </div>
            ) : (
              cartItems.map((item) => {
                const isSelected = selectedProductId === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedProductId(item.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800 border-emerald-500 ring-1 ring-emerald-500'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-2">
                        <div className="font-bold text-xs sm:text-sm text-white line-clamp-1">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                          Rp {item.selling_price.toLocaleString('id-ID')} / {item.unit}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(item.id);
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Hapus Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-800">
                      {/* Decimal Quantity Selector Controls */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            incrementQuantity(item.id, -0.5);
                          }}
                          className="w-7 h-7 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded flex items-center justify-center text-slate-300 font-bold"
                          title="Kurangi 0.5"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="min-w-[48px] text-center font-bold text-xs sm:text-sm text-emerald-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
                          {item.cart_quantity} {item.unit}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            incrementQuantity(item.id, 0.5);
                          }}
                          className="w-7 h-7 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded flex items-center justify-center text-slate-300 font-bold"
                          title="Tambah 0.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right font-black text-sm text-white font-mono">
                        Rp {item.subtotal.toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Virtual Numpad Panel for currently selected cart item */}
          {activeCartItem && (
            <div className="p-3 bg-slate-950 border-t border-slate-800">
              <VirtualNumpad
                value={numpadQtyStr}
                onChange={handleNumpadChange}
                onPresetClick={handleNumpadPreset}
                title={`Atur Qty: ${activeCartItem.name}`}
                unit={activeCartItem.unit}
                mode="qty"
                onEnter={() => setSelectedProductId(null)}
                onClear={() => {
                  setNumpadQtyStr('0');
                  updateQuantity(activeCartItem.id, 0);
                }}
              />
            </div>
          )}

          {/* Cart Footer & Checkout CTA */}
          <div className="p-3.5 bg-slate-850 border-t border-slate-800 space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs uppercase font-bold text-slate-400">Total Belanja</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                Rp {getTotalAmount().toLocaleString('id-ID')}
              </span>
            </div>

            <button
              onClick={() => setIsCheckoutOpen(true)}
              disabled={cartItems.length === 0}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-base rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <span>Bayar Sekarang (F9)</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Floating Action Button (FAB) for Cart (< 768px) */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 p-3 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none z-30">
        <button
          onClick={() => setIsMobileCartOpen(true)}
          className="pointer-events-auto w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-extrabold text-base rounded-2xl shadow-2xl flex items-center justify-between border border-emerald-400/30"
        >
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            <span>Keranjang ({cartItems.length})</span>
          </div>
          <span className="font-mono text-lg">
            Rp {getTotalAmount().toLocaleString('id-ID')}
          </span>
        </button>
      </div>

      {/* Mobile Bottom Sheet Drawer for Cart */}
      {isMobileCartOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/80 flex flex-col justify-end">
          <div className="bg-slate-900 rounded-t-3xl border-t border-slate-700 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Keranjang Kasir</h3>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full">
                  {cartItems.length}
                </span>
              </div>
              <button
                onClick={() => setIsMobileCartOpen(false)}
                className="p-2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedProductId(item.id)}
                  className={`p-3 rounded-xl border ${
                    selectedProductId === item.id
                      ? 'bg-slate-800 border-emerald-500 ring-1 ring-emerald-500'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-sm text-white">{item.name}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        Rp {item.selling_price.toLocaleString('id-ID')} / {item.unit}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeItem(item.id);
                      }}
                      className="text-slate-400 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-800">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          incrementQuantity(item.id, -0.5);
                        }}
                        className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center text-slate-200 font-bold text-sm"
                      >
                        -
                      </button>
                      <span className="font-bold text-emerald-400 font-mono text-sm px-2">
                        {item.cart_quantity} {item.unit}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          incrementQuantity(item.id, 0.5);
                        }}
                        className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center text-slate-200 font-bold text-sm"
                      >
                        +
                      </button>
                    </div>
                    <div className="font-mono font-black text-white text-base">
                      Rp {item.subtotal.toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>
              ))}

              {/* Virtual Numpad in Mobile */}
              {activeCartItem && (
                <div className="pt-2">
                  <VirtualNumpad
                    value={numpadQtyStr}
                    onChange={handleNumpadChange}
                    onPresetClick={handleNumpadPreset}
                    title={`Atur Qty: ${activeCartItem.name}`}
                    unit={activeCartItem.unit}
                    mode="qty"
                    onEnter={() => setSelectedProductId(null)}
                    onClear={() => {
                      setNumpadQtyStr('0');
                      updateQuantity(activeCartItem.id, 0);
                    }}
                  />
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase text-slate-400 font-bold">Total Pembayaran</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  Rp {getTotalAmount().toLocaleString('id-ID')}
                </span>
              </div>
              <button
                onClick={() => {
                  setIsMobileCartOpen(false);
                  setIsCheckoutOpen(true);
                }}
                disabled={cartItems.length === 0}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base rounded-xl"
              >
                Lanjut ke Pembayaran
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={(tx) => {
          setIsCheckoutOpen(false);
          setLastTransaction(tx);
          loadData(); // Reload stock updates
        }}
      />

      {/* Thermal Receipt Modal (Appears after checkout or when re-printing) */}
      {lastTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="my-auto">
            <ThermalReceipt
              transaction={lastTransaction}
              onClose={() => setLastTransaction(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
