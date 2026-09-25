// components/pos/ThermalReceipt.tsx
'use client';

import React from 'react';
import { Transaction } from '@/types/database';
import { Printer, CheckCircle, X } from 'lucide-react';

interface ThermalReceiptProps {
  transaction: Transaction;
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
  onClose?: () => void;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({
  transaction,
  storeName = 'TB. MAKMUR JAYA',
  storeAddress = 'Jl. Raya Industri No. 45, Kab. Bangunan',
  storePhone = '0812-3456-7890',
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Action Bar (hidden on print) */}
      <div className="print:hidden w-full max-w-sm flex items-center justify-between mb-4 bg-slate-900 text-white p-3 rounded-lg shadow-md">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="font-semibold text-sm">Transaksi Berhasil</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded text-sm font-medium transition"
          >
            <Printer className="w-4 h-4" />
            Cetak Struk
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Thermal Receipt Paper (58mm / 80mm printable layout) */}
      <div
        id="thermal-receipt"
        className="thermal-receipt bg-white text-black p-4 font-mono text-xs w-[320px] max-w-[320px] shadow-lg border border-slate-200 rounded-sm print:shadow-none print:border-none print:w-full print:p-0"
      >
        {/* Header */}
        <div className="text-center pb-2 border-b border-dashed border-black">
          <h2 className="font-bold text-sm tracking-wider uppercase">{storeName}</h2>
          <p className="text-[10px] text-gray-600 leading-tight mt-0.5">{storeAddress}</p>
          <p className="text-[10px] text-gray-600 leading-tight">Telp: {storePhone}</p>
        </div>

        {/* Metadata */}
        <div className="py-2 border-b border-dashed border-black text-[11px] space-y-0.5">
          <div className="flex justify-between">
            <span>No. Nota:</span>
            <span className="font-semibold">{transaction.invoice_no}</span>
          </div>
          <div className="flex justify-between">
            <span>Waktu:</span>
            <span>{formatDate(transaction.created_at)}</span>
          </div>
          <div className="flex justify-between">
            <span>Kasir:</span>
            <span>{transaction.cashier?.full_name || 'Kasir Standar'}</span>
          </div>
          <div className="flex justify-between">
            <span>Metode:</span>
            <span className="uppercase font-semibold">{transaction.payment_method}</span>
          </div>
        </div>

        {/* Items List */}
        <div className="py-2 border-b border-dashed border-black space-y-1.5">
          {transaction.items && transaction.items.map((item, idx) => {
            const productName = item.product?.name || `Item ${idx + 1}`;
            const unit = item.product?.unit || '';
            const qtyStr = item.quantity % 1 === 0 ? item.quantity.toString() : item.quantity.toFixed(2);
            return (
              <div key={item.id || idx} className="text-[11px]">
                <div className="font-semibold truncate">{productName}</div>
                <div className="flex justify-between text-gray-700">
                  <span>
                    {qtyStr} {unit} x Rp {item.selling_price_at_sale.toLocaleString('id-ID')}
                  </span>
                  <span className="font-bold text-black">
                    Rp {item.subtotal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Totals */}
        <div className="py-2 border-b border-dashed border-black text-[11px] space-y-1">
          <div className="flex justify-between font-bold text-xs pt-0.5">
            <span>TOTAL:</span>
            <span>Rp {transaction.total_amount.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between">
            <span>Bayar:</span>
            <span>Rp {transaction.amount_paid.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between">
            <span>Kembali:</span>
            <span className="font-semibold">Rp {transaction.change_amount.toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-3 text-[10px] space-y-1 text-gray-700">
          <p className="font-bold">*** TERIMA KASIH ***</p>
          <p className="leading-tight">
            Barang yang sudah dibeli tidak dapat ditukar/dikembalikan tanpa nota asli.
          </p>
          <p className="text-[9px] text-gray-500 pt-1">
            BuildPOS - Solusi Kasir Toko Bangunan
          </p>
        </div>
      </div>
    </div>
  );
};
