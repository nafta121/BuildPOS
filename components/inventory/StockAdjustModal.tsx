'use client';

import React, { useEffect } from 'react';
import { Product } from '@/types/database';

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
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="stock-adjust-title"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl text-white">
        <h2 id="stock-adjust-title" className="text-lg font-bold mb-1">
          Penyesuaian Stok Fisik
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Produk: <strong>{product.name}</strong> ({product.unit})
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="new-stock-input" className="block text-xs font-bold text-slate-400 uppercase mb-1">
              Kuantitas Stok Baru ({product.unit})
            </label>
            <input
              id="new-stock-input"
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
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 rounded-lg text-sm font-semibold focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 disabled:opacity-50 text-white rounded-lg text-sm font-bold shadow-lg focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
            >
              {isSubmitting ? 'Memperbarui...' : 'Update Stok'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
