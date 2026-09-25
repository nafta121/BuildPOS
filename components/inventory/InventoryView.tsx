// components/inventory/InventoryView.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Product, Category } from '@/types/database';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  getProductsAction, 
  getCategoriesAction, 
  saveProductAction, 
  adjustStockAction,
  saveCategoryAction,
  ProductFormData 
} from '@/app/actions/products';
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  Edit3, 
  Layers, 
  RefreshCw, 
  Check, 
  X, 
  ShieldAlert,
  ArrowUpDown
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const { currentProfile } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Edit / Form state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [stockAdjustProduct, setStockAdjustProduct] = useState<Product | null>(null);
  const [newStockValue, setNewStockValue] = useState<string>('');
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Product form fields
  const [formData, setFormData] = useState<ProductFormData>({
    sku: '',
    name: '',
    category_id: '',
    unit: 'Sak',
    cost_price: 0,
    selling_price: 0,
    stock: 0,
    min_stock: 5,
    is_active: true,
  });

  const canEdit = currentProfile.role === 'admin' || currentProfile.role === 'owner';
  const canSeeCostPrice = currentProfile.role === 'admin' || currentProfile.role === 'owner';

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        getProductsAction(currentProfile.role),
        getCategoriesAction(),
      ]);
      if (prodRes.success) setProducts(prodRes.data);
      if (catRes.success) {
        setCategories(catRes.data);
        if (catRes.data.length > 0 && !formData.category_id) {
          setFormData((prev) => ({ ...prev, category_id: catRes.data[0].id }));
        }
      }
    } catch (err) {
      console.error('Error loading inventory data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProfile.role]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchCat = selectedCatId === 'all' || p.category_id === selectedCatId;
      const matchLowStock = !filterLowStockOnly || p.stock <= p.min_stock;
      return matchSearch && matchCat;
    });
  }, [products, searchQuery, selectedCatId, filterLowStockOnly]);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.stock <= p.min_stock).length;
  }, [products]);

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setFormData({
      sku: `TB-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      category_id: categories[0]?.id || '',
      unit: 'Meter',
      cost_price: 0,
      selling_price: 0,
      stock: 10,
      min_stock: 5,
      is_active: true,
    });
    setFormError(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      id: prod.id,
      sku: prod.sku || '',
      name: prod.name,
      category_id: prod.category_id,
      unit: prod.unit,
      cost_price: prod.cost_price,
      selling_price: prod.selling_price,
      stock: prod.stock,
      min_stock: prod.min_stock,
      is_active: prod.is_active,
    });
    setFormError(null);
    setIsProductModalOpen(true);
  };

  const handleOpenStockAdjust = (prod: Product) => {
    setStockAdjustProduct(prod);
    setNewStockValue(prod.stock.toString());
    setFormError(null);
    setIsStockModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const res = await saveProductAction(formData, currentProfile.role);
      if (!res.success) {
        setFormError(res.error || 'Gagal menyimpan produk.');
        setIsSubmitting(false);
        return;
      }
      setIsProductModalOpen(false);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghubungi server.';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveStockAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockAdjustProduct) return;
    const stockNum = parseFloat(newStockValue);
    if (isNaN(stockNum) || stockNum < 0) {
      setFormError('Nilai stok harus berupa angka positif.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await adjustStockAction(stockAdjustProduct.id, stockNum, currentProfile.role);
      if (!res.success) {
        setFormError(res.error || 'Gagal mengubah stok.');
        setIsSubmitting(false);
        return;
      }
      setIsStockModalOpen(false);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengubah stok.';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await saveCategoryAction(newCategoryName, currentProfile.role);
      if (!res.success) {
        setFormError(res.error || 'Gagal menyimpan kategori.');
        setIsSubmitting(false);
        return;
      }
      setNewCategoryName('');
      setIsCategoryModalOpen(false);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan kategori.';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canEdit) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950">
        <div className="p-4 bg-amber-950/40 border border-amber-800 rounded-2xl max-w-md">
          <ShieldAlert className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white mb-2">Akses Terbatas: Hanya Admin / Owner</h2>
          <p className="text-sm text-slate-300">
            Anda login sebagai <strong>{currentProfile.full_name}</strong> dengan role <strong>{currentProfile.role.toUpperCase()}</strong>.
            Kasir hanya diizinkan untuk melayani transaksi kasir dan cetak nota.
          </p>
          <p className="text-xs text-amber-400 mt-4">
            *Gunakan pengubah role di bilah atas untuk beralih ke role Admin atau Owner.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Package className="w-6 h-6 text-emerald-400" />
              <h1 className="text-2xl font-black text-white tracking-tight">
                Gudang & Master Produk
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Manajemen stok desimal material bangunan (meter, kubik, sak, batang).
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-sm font-semibold flex items-center gap-1.5 transition"
            >
              <Layers className="w-4 h-4" />
              <span>+ Kategori</span>
            </button>

            <button
              onClick={handleOpenAddProduct}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg text-sm font-bold flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Produk</span>
            </button>
          </div>
        </div>

        {/* Low Stock Warning Banner if any */}
        {lowStockCount > 0 && (
          <div className="max-w-7xl mx-auto w-full mt-4 p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-amber-300 text-xs sm:text-sm font-medium">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                Peringatan: Terdapat <strong>{lowStockCount} produk</strong> dengan stok di bawah batas minimum!
              </span>
            </div>
            <button
              onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
              className="text-xs font-bold text-amber-300 underline hover:text-white"
            >
              {filterLowStockOnly ? 'Tampilkan Semua' : 'Filter Stok Menipis'}
            </button>
          </div>
        )}
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 flex-1 flex flex-col space-y-4">
        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari SKU atau nama produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <select
              value={selectedCatId}
              onChange={(e) => setSelectedCatId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs sm:text-sm rounded-xl px-3 py-2 text-slate-300 focus:outline-none"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <button
              onClick={loadData}
              className="p-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-300 hover:text-white"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex-1 flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-850 text-slate-400 text-xs uppercase font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">SKU / Nama Produk</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Satuan</th>
                  {canSeeCostPrice && <th className="py-3 px-4 text-right">Harga Modal (HPP)</th>}
                  <th className="py-3 px-4 text-right">Harga Jual</th>
                  <th className="py-3 px-4 text-right">Stok Fisik</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-500" />
                      <span className="block mt-2 text-xs">Memuat data inventaris...</span>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500 text-sm">
                      Tidak ada produk ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((prod) => {
                    const isLow = prod.stock <= prod.min_stock;
                    return (
                      <tr key={prod.id} className="hover:bg-slate-850/60 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white text-sm">{prod.name}</div>
                          <div className="text-[11px] font-mono text-slate-400">
                            {prod.sku || '-'}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 text-xs">
                          {prod.category?.name || 'Material'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 bg-slate-800 text-amber-300 rounded text-xs font-bold font-mono">
                            {prod.unit}
                          </span>
                        </td>
                        {canSeeCostPrice && (
                          <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-300">
                            Rp {prod.cost_price.toLocaleString('id-ID')}
                          </td>
                        )}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400 text-sm">
                          Rp {prod.selling_price.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-extrabold text-sm">
                          <span
                            className={
                              prod.stock <= 0
                                ? 'text-rose-400'
                                : isLow
                                ? 'text-amber-400'
                                : 'text-slate-100'
                            }
                          >
                            {prod.stock % 1 === 0 ? prod.stock : prod.stock.toFixed(2)} {prod.unit}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {prod.stock <= 0 ? (
                            <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold rounded-full">
                              Habis
                            </span>
                          ) : isLow ? (
                            <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold rounded-full">
                              Menipis (&le;{prod.min_stock})
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-full">
                              Aman
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenStockAdjust(prod)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded text-xs font-semibold transition"
                              title="Update Stok Fisik"
                            >
                              Stok
                            </button>
                            <button
                              onClick={() => handleOpenEditProduct(prod)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition"
                              title="Edit Detail Produk"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-white my-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
              <h2 className="text-lg font-bold">
                {editingProduct ? 'Edit Master Produk' : 'Tambah Produk Bahan Bangunan'}
              </h2>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-lg">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Nama Produk / Material *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Semen Gresik 40kg, Pasir Cor..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                    Kode SKU
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                    Kategori
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                    Satuan Jual (Unit) *
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-bold"
                  >
                    <option value="Meter">Meter (Pecahan Kabel/Pipa/Seng)</option>
                    <option value="Kubik">Kubik / m³ (Pasir/Bata/Batu)</option>
                    <option value="Sak">Sak (Semen/Plester)</option>
                    <option value="Batang">Batang (Besi/Pipa PVC)</option>
                    <option value="Kg">Kg (Paku/Kawat/Cat Ecer)</option>
                    <option value="Pail">Pail / Kaleng Besar (Cat)</option>
                    <option value="Kaleng">Kaleng Kecil</option>
                    <option value="Lembar">Lembar (Triplek/Gypsum/Seng)</option>
                    <option value="Dus">Dus / Box (Keramik/Granit)</option>
                    <option value="Roll">Roll (Kawat/Selang/Kabel)</option>
                    <option value="Pcs">Pcs / Buah</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                    Min. Stok Peringatan
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.min_stock}
                    onChange={(e) => setFormData({ ...formData, min_stock: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                    Harga Modal / HPP (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                    Harga Jual Kasir (Rp) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.selling_price}
                    onChange={(e) => setFormData({ ...formData, selling_price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-emerald-400 font-bold font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Stok Awal Fisik (Bisa Desimal, contoh 18.5)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold shadow-lg"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {isStockModalOpen && stockAdjustProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl text-white">
            <h2 className="text-lg font-bold mb-1">Penyesuaian Stok Fisik</h2>
            <p className="text-xs text-slate-400 mb-4">
              Produk: <strong>{stockAdjustProduct.name}</strong> ({stockAdjustProduct.unit})
            </p>

            <form onSubmit={handleSaveStockAdjust} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Kuantitas Stok Baru ({stockAdjustProduct.unit})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={newStockValue}
                  onChange={(e) => setNewStockValue(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border-2 border-amber-500/50 rounded-xl text-xl font-bold font-mono text-amber-300 text-center"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Mendukung pecahan desimal (contoh: 0.5 kubik, 2.75 meter, 10.5 kg).
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsStockModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-bold shadow-lg"
                >
                  {isSubmitting ? 'Memperbarui...' : 'Update Stok'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-6 shadow-2xl text-white">
            <h2 className="text-lg font-bold mb-3">Tambah Kategori Baru</h2>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  placeholder="Misal: Atap & Plafon, Keramik..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
