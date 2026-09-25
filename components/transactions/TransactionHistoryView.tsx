// components/transactions/TransactionHistoryView.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Transaction } from '@/types/database';
import { useAuthStore } from '@/store/useAuthStore';
import { getTransactionsAction } from '@/app/actions/transactions';
import { ThermalReceipt } from '@/components/pos/ThermalReceipt';
import { 
  Receipt, 
  Printer, 
  Search, 
  RefreshCw, 
  Calendar, 
  CreditCard, 
  Banknote,
  Eye,
  X
} from 'lucide-react';

export const TransactionHistoryView: React.FC = () => {
  const { currentProfile } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeReceiptTx, setActiveReceiptTx] = useState<Transaction | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await getTransactionsAction(currentProfile.role, currentProfile.id);
      if (res.success) {
        setTransactions(res.data);
      }
    } catch (err) {
      console.error('Error loading transaction history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProfile.role]);

  const filteredTransactions = transactions.filter((t) =>
    t.invoice_no.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Receipt className="w-6 h-6 text-emerald-400" />
              <h1 className="text-2xl font-black text-white tracking-tight">
                Riwayat Transaksi & Cetak Nota
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Daftar struk penjualan dan cetak ulang nota kasir thermal 58mm/80mm.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-2 transition"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 flex-1 space-y-4">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nomor nota / invoice..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Transactions Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-850 text-slate-400 text-xs uppercase font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">No. Invoice</th>
                  <th className="py-3 px-4">Tanggal & Jam</th>
                  <th className="py-3 px-4">Kasir</th>
                  <th className="py-3 px-4">Ringkasan Barang</th>
                  <th className="py-3 px-4 text-center">Metode</th>
                  <th className="py-3 px-4 text-right">Total Transaksi</th>
                  <th className="py-3 px-4 text-center">Aksi Struk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-500" />
                      <span className="block mt-2 text-xs">Memuat riwayat transaksi...</span>
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 text-sm">
                      Belum ada data transaksi.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-850/60 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-white text-sm">
                        {tx.invoice_no}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-300">
                        {new Date(tx.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-300">
                        {tx.cashier?.full_name || 'Kasir'}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-300 max-w-xs truncate">
                        {tx.items && tx.items.length > 0 ? (
                          <span>
                            {tx.items
                              .map((it) => `${it.product?.name || 'Material'} (${it.quantity} ${it.product?.unit || ''})`)
                              .join(', ')}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                            tx.payment_method === 'tunai'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}
                        >
                          {tx.payment_method === 'tunai' ? (
                            <Banknote className="w-3.5 h-3.5" />
                          ) : (
                            <CreditCard className="w-3.5 h-3.5" />
                          )}
                          <span>{tx.payment_method}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-400 text-sm">
                        Rp {tx.total_amount.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setActiveReceiptTx(tx)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 mx-auto transition"
                          title="Lihat & Cetak Nota Kasir"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Cetak Nota</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Thermal Receipt Modal */}
      {activeReceiptTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="my-auto">
            <ThermalReceipt
              transaction={activeReceiptTx}
              onClose={() => setActiveReceiptTx(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
