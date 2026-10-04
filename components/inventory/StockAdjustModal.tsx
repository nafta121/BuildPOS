'use client';

import React from 'react';
import { Product } from '@/types/database';
import { X } from 'lucide-react';

interface StockAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  newStockValue: string;
  setNewStockValue: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({
  isOpen,
  onClose,
  product,
  newStockValue,
  setNewStockValue,
  onSubmit,
  isSubmitting,
}) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl text-white">
        <div className="flex justify-between items-start mb-1">
          <h2 className="text-lg font-bold">Penyesuaian Stok Fisik</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal penyesuaian stok"
            className="text-slate-400 hover:text-white p-1 rounded-lg focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Produk: <strong>{product.name}</strong> ({product.unit})
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="stock-adjust-input" className="block text-xs font-bold text-slate-400 uppercase mb-1">
              Kuantitas Stok Baru ({product.unit})
            </label>
            <input
              id="stock-adjust-input"
              type="number"
              step="0.01"
              min="0"
              required
              value={newStockValue}
              onChange={(e) => setNewStockValue(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border-2 border-amber-500/50 rounded-xl text-xl font-bold font-mono text-amber-300 text-center focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Mendukung pecahan desimal (contoh: 0.5 kubik, 2.75 meter, 10.5 kg).
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-semibold focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg text-sm font-bold shadow-lg focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
            >
              {isSubmitting ? 'Memperbarui...' : 'Update Stok'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
