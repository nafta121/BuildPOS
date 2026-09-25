// components/dashboard/OwnerDashboard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Transaction } from '@/types/database';
import { useAuthStore } from '@/store/useAuthStore';
import { getTransactionsAction, FinancialAnalytics } from '@/app/actions/transactions';
import { 
  TrendingUp, 
  DollarSign, 
  Coins, 
  Percent, 
  Receipt, 
  ShieldAlert, 
  RefreshCw,
  Award,
  Calendar,
  Layers
} from 'lucide-react';

export const OwnerDashboard: React.FC = () => {
  const { currentProfile } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [analytics, setAnalytics] = useState<FinancialAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isOwner = currentProfile?.role === 'owner';

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await getTransactionsAction(currentProfile?.role || 'kasir');
      if (res.success) {
        setTransactions(res.data);
        if (res.analytics) {
          setAnalytics(res.analytics);
        }
      }
    } catch (err) {
      console.error('Error loading dashboard analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProfile?.role]);

  if (!isOwner) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950">
        <div className="p-6 bg-rose-950/40 border border-rose-800 rounded-2xl max-w-md text-white">
          <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold mb-2">Akses Ditolak: Dashboard Finansial Khusus Owner</h2>
          <p className="text-xs text-slate-300">
            Role saat ini: <strong>{currentProfile?.role?.toUpperCase() || 'KASIR'}</strong> ({currentProfile?.full_name || 'Pengguna'}).
            Data laba bersih, omzet, dan margin keuntungan hanya dapat diakses oleh akun Owner.
          </p>
          <p className="text-xs text-amber-400 mt-4">
            *Silakan beralih ke profil Owner melalui menu pilihan role di pojok kanan atas untuk melihat analitik.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
              <h1 className="text-2xl font-black text-white tracking-tight">
                Dashboard Laba & Finansial Owner
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Rekapitulasi pendapatan, beban modal (HPP), dan laba kotor toko bahan bangunan.
            </p>
          </div>

          <button
            onClick={loadData}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-2 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Perbarui Data</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 flex-1 space-y-6">
        {/* KPI Cards Row */}
        {analytics ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Omzet */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Total Omzet (Penjualan)
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-white mt-1.5 font-mono">
                    Rp {analytics.totalRevenue.toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-3">
                Dari {analytics.totalTransactionsCount} total transaksi kasir
              </p>
            </div>

            {/* Total Modal / HPP */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Beban Modal (HPP)
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-slate-300 mt-1.5 font-mono">
                    Rp {analytics.totalCost.toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Coins className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-3">
                Terkunci di tiap transaksi (histori harga aman)
              </p>
            </div>

            {/* Laba Kotor */}
            <div className="bg-slate-900 border-2 border-emerald-500/50 p-5 rounded-2xl shadow-xl bg-gradient-to-br from-slate-900 to-emerald-950/30">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                    Laba Kotor Bersih
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1.5 font-mono">
                    Rp {analytics.grossProfit.toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[11px] text-emerald-300 mt-3 font-semibold">
                Margin Keuntungan: {analytics.profitMarginPercent}%
              </p>
            </div>

            {/* Rata-Rata Transaksi */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Rata-Rata / Nota
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-white mt-1.5 font-mono">
                    Rp {analytics.averageTransactionValue.toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Receipt className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-3">
                Efektivitas kasir per pelanggan
              </p>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-500" />
            <p className="text-xs mt-2">Menghitung analitik laba...</p>
          </div>
        )}

        {/* Top Products by Profit & Volume */}
        {analytics && analytics.topSellingProducts.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">
                5 Material Terlaris & Kontribusi Laba Tertinggi
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {analytics.topSellingProducts.map((p, idx) => {
                const margin = p.revenue > 0 ? ((p.profit / p.revenue) * 100).toFixed(1) : '0';
                return (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-bold text-amber-400">Rank #{idx + 1}</span>
                        <span className="font-mono">{p.quantity % 1 === 0 ? p.quantity : p.quantity.toFixed(2)} {p.unit}</span>
                      </div>
                      <h3 className="font-bold text-white text-sm mt-1">{p.name}</h3>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between items-baseline">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Omzet</span>
                        <span className="text-xs font-mono font-bold text-white">
                          Rp {p.revenue.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-emerald-400 block">Laba ({margin}%)</span>
                        <span className="text-xs font-mono font-black text-emerald-400">
                          +Rp {p.profit.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Historical Profit Breakdown Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            <span>Audit Rincian Margin per Transaksi</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-850 text-slate-400 text-xs uppercase font-bold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">No. Nota</th>
                  <th className="py-2.5 px-3">Waktu</th>
                  <th className="py-2.5 px-3">Kasir</th>
                  <th className="py-2.5 px-3 text-right">Penjualan</th>
                  <th className="py-2.5 px-3 text-right">HPP Modal</th>
                  <th className="py-2.5 px-3 text-right">Laba Kotor</th>
                  <th className="py-2.5 px-3 text-center">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {transactions.map((tx) => {
                  let txCost = 0;
                  for (const it of tx.items || []) {
                    txCost += it.cost_price_at_sale * it.quantity;
                  }
                  const txProfit = tx.total_amount - txCost;
                  const txMargin = tx.total_amount > 0 ? ((txProfit / tx.total_amount) * 100).toFixed(1) : '0';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-850/50 transition">
                      <td className="py-3 px-3 font-mono font-bold text-white text-xs">
                        {tx.invoice_no}
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-400">
                        {new Date(tx.created_at).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-300">
                        {tx.cashier?.full_name || 'Kasir'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-xs text-white">
                        Rp {tx.total_amount.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-xs text-slate-400">
                        Rp {Math.round(txCost).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-xs font-bold text-emerald-400">
                        Rp {Math.round(txProfit).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full">
                          {txMargin}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
