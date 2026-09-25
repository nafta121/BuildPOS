// components/dashboard/OwnerDashboard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Transaction } from '@/types/database';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  getTransactionsAction, 
  getAnalytics, 
  DashboardAnalytics 
} from '@/app/actions/transactions';
import { 
  TrendingUp, 
  DollarSign, 
  Coins, 
  Receipt, 
  ShieldAlert, 
  RefreshCw,
  Award,
  Calendar,
  Layers,
  Clock
} from 'lucide-react';

export const OwnerDashboard: React.FC = () => {
  const { currentProfile } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');

  const isOwner = currentProfile?.role === 'owner';

  const getDateRange = (filter: 'all' | 'today' | '7days' | '30days') => {
    const now = new Date();
    if (filter === 'today') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      return { startDate: start.toISOString(), endDate: now.toISOString() };
    }
    if (filter === '7days') {
      const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { startDate: start.toISOString(), endDate: now.toISOString() };
    }
    if (filter === '30days') {
      const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { startDate: start.toISOString(), endDate: now.toISOString() };
    }
    return { startDate: null, endDate: null };
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const { startDate, endDate } = getDateRange(dateFilter);

      const [txRes, analyticsData] = await Promise.all([
        getTransactionsAction(currentProfile?.role || 'kasir', undefined, startDate, endDate),
        isOwner ? getAnalytics(startDate, endDate) : Promise.resolve(null),
      ]);

      if (txRes.success) {
        setTransactions(txRes.data);
      }
      if (analyticsData) {
        setAnalytics(analyticsData);
      } else if (txRes.analytics) {
        setAnalytics(txRes.analytics);
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
  }, [currentProfile?.role, dateFilter]);

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

  const profitMarginPercent = analytics?.summary.total_revenue && analytics.summary.total_revenue > 0
    ? ((analytics.summary.total_profit / analytics.summary.total_revenue) * 100).toFixed(1)
    : '0';

  const averageTransactionValue = transactions.length > 0 && analytics
    ? Math.round(analytics.summary.total_revenue / transactions.length)
    : 0;

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
              Rekapitulasi pendapatan, beban modal (HPP), dan laba kotor toko bahan bangunan via Supabase RPC.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter Rentang Tanggal */}
            <div className="flex items-center bg-slate-850 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setDateFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  dateFilter === 'all'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setDateFilter('today')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  dateFilter === 'today'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Hari Ini
              </button>
              <button
                type="button"
                onClick={() => setDateFilter('7days')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  dateFilter === '7days'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                7 Hari
              </button>
              <button
                type="button"
                onClick={() => setDateFilter('30days')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  dateFilter === '30days'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                30 Hari
              </button>
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
                    Rp {analytics.summary.total_revenue.toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-3">
                Dari {transactions.length} total transaksi periode ini
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
                    Rp {analytics.summary.total_cost.toLocaleString('id-ID')}
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
                    Rp {analytics.summary.total_profit.toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[11px] text-emerald-300 mt-3 font-semibold">
                Margin Keuntungan: {profitMarginPercent}%
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
                    Rp {averageTransactionValue.toLocaleString('id-ID')}
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
            <p className="text-xs mt-2">Menghitung analitik laba via database RPC...</p>
          </div>
        )}

        {/* Top Products by Profit & Volume */}
        {analytics && analytics.top_products && analytics.top_products.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">
                Material Terlaris & Kontribusi Laba Tertinggi (Database Aggregated)
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {analytics.top_products.map((p, idx) => {
                const margin = p.revenue > 0 ? ((p.profit / p.revenue) * 100).toFixed(1) : '0';
                return (
                  <div
                    key={p.id || idx}
                    className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-bold text-amber-400">Rank #{idx + 1}</span>
                        <span className="font-mono">
                          {p.quantity % 1 === 0 ? p.quantity : Number(p.quantity).toFixed(2)} {p.unit}
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-sm mt-1">{p.name}</h3>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between items-baseline">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Omzet</span>
                        <span className="text-xs font-mono font-bold text-white">
                          Rp {Math.round(p.revenue).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-emerald-400 block">Laba ({margin}%)</span>
                        <span className="text-xs font-mono font-black text-emerald-400">
                          +Rp {Math.round(p.profit).toLocaleString('id-ID')}
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
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                      Tidak ada transaksi pada periode ini.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
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
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
