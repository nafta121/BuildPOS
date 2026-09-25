'use client';

import React from 'react';
import { Product } from '@/types/database';
import { Edit3, RefreshCw } from 'lucide-react';

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  canSeeCostPrice: boolean;
  onOpenStockAdjust: (prod: Product) => void;
  onOpenEditProduct: (prod: Product) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  isLoading,
  canSeeCostPrice,
  onOpenStockAdjust,
  onOpenEditProduct,
}) => {
  return (
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
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500 text-sm">
                  Tidak ada produk ditemukan.
                </td>
              </tr>
            ) : (
              products.map((prod) => {
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
                          onClick={() => onOpenStockAdjust(prod)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded text-xs font-semibold transition"
                          title="Update Stok Fisik"
                        >
                          Stok
                        </button>
                        <button
                          onClick={() => onOpenEditProduct(prod)}
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
  );
};
