// components/inventory/InventoryView.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Product, Category, Role } from '@/types/database';
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
  Layers, 
  RefreshCw, 
  ShieldAlert
} from 'lucide-react';
import { RlsFixModal } from '@/components/setup/RlsFixModal';
import { ProductModal } from './ProductModal';
import { StockAdjustModal } from './StockAdjustModal';
import { CategoryModal } from './CategoryModal';
import { ProductTable } from './ProductTable';

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
  const [isRlsModalOpen, setIsRlsModalOpen] = useState(false);
  const [dataSource, setDataSource] = useState<'database' | 'local_fallback'>('local_fallback');

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

  const userRole: Role = currentProfile?.role || 'kasir';
  const canEdit = userRole === 'admin' || userRole === 'owner';
  const canSeeCostPrice = userRole === 'admin' || userRole === 'owner';

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        getProductsAction(userRole),
        getCategoriesAction(),
      ]);
      if (prodRes.success) {
        setProducts(prodRes.data);
        if (prodRes.source) setDataSource(prodRes.source);
      }
      if (catRes.success) {
        setCategories(catRes.data);
        if (catRes.data.length > 0) {
          setFormData((prev) => (prev.category_id ? prev : { ...prev, category_id: catRes.data[0].id }));
        }
      }
    } catch (err) {
      console.error('Error loading inventory data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userRole]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchCat = selectedCatId === 'all' || p.category_id === selectedCatId;
      const matchLowStock = !filterLowStockOnly || p.stock <= p.min_stock;
      return matchSearch && matchCat && matchLowStock;
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
      category_id: prod.category_id || '',
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

    if (formData.selling_price < 0 || formData.cost_price < 0 || formData.stock < 0 || formData.min_stock < 0) {
      setFormError('Nilai harga modal, harga jual, dan stok fisik tidak boleh bernilai negatif (minus).');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await saveProductAction(formData, userRole);
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
      const res = await adjustStockAction(stockAdjustProduct.id, stockNum, userRole);
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
      const res = await saveCategoryAction(newCategoryName, userRole);
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
            Anda login sebagai <strong>{currentProfile?.full_name || 'Pengguna'}</strong> dengan role <strong>{userRole.toUpperCase()}</strong>.
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
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 min-h-screen pb-16">
      {/* Top Banner Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Package className="w-6 h-6 text-emerald-400" />
              <h1 className="text-xl sm:text-2xl font-bold text-white">Manajemen Stok Gudang</h1>
              <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800/80 rounded-full">
                {products.length} Item Master
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Atur harga modal, harga jual desimal, dan penyesuaian stok bahan bangunan fisik.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {dataSource === 'local_fallback' && (
              <button
                onClick={() => setIsRlsModalOpen(true)}
                className="px-3 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-pulse"
                title="Buka panduan perbaikan izin Supabase RLS"
              >
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Fix Supabase DB</span>
              </button>
            )}

            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 border border-slate-700 transition"
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>+ Kategori</span>
            </button>

            <button
              onClick={handleOpenAddProduct}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-900/30 transition"
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
        <ProductTable
          products={filteredProducts}
          isLoading={isLoading}
          canSeeCostPrice={canSeeCostPrice}
          onOpenStockAdjust={handleOpenStockAdjust}
          onOpenEditProduct={handleOpenEditProduct}
        />
      </div>

      {/* Add / Edit Product Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        editingProduct={editingProduct}
        categories={categories}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSaveProduct}
        formError={formError}
        isSubmitting={isSubmitting}
      />

      {/* Stock Adjustment Modal */}
      <StockAdjustModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        product={stockAdjustProduct}
        newStockValue={newStockValue}
        setNewStockValue={setNewStockValue}
        onSubmit={handleSaveStockAdjust}
        isSubmitting={isSubmitting}
      />

      {/* Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categoryName={newCategoryName}
        setCategoryName={setNewCategoryName}
        onSubmit={handleSaveCategory}
        isSubmitting={isSubmitting}
      />

      {/* Supabase RLS Fix Helper Modal */}
      <RlsFixModal
        isOpen={isRlsModalOpen}
        onClose={() => setIsRlsModalOpen(false)}
        onRefresh={loadData}
      />
    </div>
  );
};
