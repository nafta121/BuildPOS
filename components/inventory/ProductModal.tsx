'use client';

import React from 'react';
import { Product, Category } from '@/types/database';
import { ProductFormData } from '@/app/actions/products';
import { X } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: Product | null;
  categories: Category[];
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  formError: string | null;
  isSubmitting: boolean;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  editingProduct,
  categories,
  formData,
  setFormData,
  onSubmit,
  formError,
  isSubmitting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-white my-auto">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
          <h2 className="text-lg font-bold">
            {editingProduct ? 'Edit Master Produk' : 'Tambah Produk Bahan Bangunan'}
          </h2>
          <button
            onClick={onClose}
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

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
              SKU / Kode Barcode
            </label>
            <input
              type="text"
              value={formData.sku || ''}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="Contoh: TB-001"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Nama Produk *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Semen Tiga Roda 50kg"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Kategori
              </label>
              <select
                value={formData.category_id || ''}
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
                step="0.01"
                min="0"
                value={formData.min_stock}
                onChange={(e) =>
                  setFormData({ ...formData, min_stock: Math.max(0, parseFloat(e.target.value) || 0) })
                }
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
                step="0.01"
                min="0"
                value={formData.cost_price}
                onChange={(e) =>
                  setFormData({ ...formData, cost_price: Math.max(0, parseFloat(e.target.value) || 0) })
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Harga Jual Kasir (Rp) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.selling_price}
                onChange={(e) =>
                  setFormData({ ...formData, selling_price: Math.max(0, parseFloat(e.target.value) || 0) })
                }
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
              min="0"
              required
              value={formData.stock}
              onChange={(e) =>
                setFormData({ ...formData, stock: Math.max(0, parseFloat(e.target.value) || 0) })
              }
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono font-bold"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
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
  );
};
