// components/layout/Navbar.tsx
'use client';

import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { signOutAction } from '@/app/actions/auth';
import { Role } from '@/types/database';
import { 
  Hammer, 
  ShoppingCart, 
  Receipt, 
  Package, 
  TrendingUp, 
  UserCircle2, 
  LogOut 
} from 'lucide-react';

export type ActiveTab = 'pos' | 'history' | 'inventory' | 'owner';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { currentProfile, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await signOutAction();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      logout();
    }
  };

  const getRoleBadgeStyle = (role?: Role) => {
    switch (role) {
      case 'owner':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'admin':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'kasir':
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  const isOwner = currentProfile?.role === 'owner';
  const isAdminOrOwner = currentProfile?.role === 'admin' || currentProfile?.role === 'owner';

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-3">
        {/* Brand & Store Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-amber-500 flex items-center justify-center shadow-lg">
            <Hammer className="w-5 h-5 text-slate-950 font-black" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg tracking-tight text-white">BuildPOS</span>
              <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30 hidden sm:inline">
                Toko Bangunan
              </span>
            </div>
            <p className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">
              TB. Makmur Jaya (Bahan Bangunan & Teknik)
            </p>
          </div>
        </div>

        {/* Desktop / Tablet Nav Tabs */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('pos')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'pos'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Kasir POS</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'history'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Riwayat Nota</span>
          </button>

          {/* Gudang & Stok tab (admin & owner only) */}
          {isAdminOrOwner && (
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'inventory'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Gudang & Stok</span>
            </button>
          )}

          {/* Owner Dashboard tab (owner only) */}
          {isOwner && (
            <button
              onClick={() => setActiveTab('owner')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'owner'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Dashboard Laba</span>
            </button>
          )}
        </nav>

        {/* User Info & Logout Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 sm:px-3 py-1.5 gap-2">
            <UserCircle2 className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-white leading-tight max-w-[120px] sm:max-w-[160px] truncate">
                {currentProfile?.full_name || 'Pengguna'}
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                {currentProfile?.role}
              </span>
            </div>
            <span
              className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border hidden sm:inline-block ${getRoleBadgeStyle(
                currentProfile?.role
              )}`}
            >
              {currentProfile?.role}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 sm:px-3 sm:py-2 bg-slate-950 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-800 text-slate-300 hover:text-rose-300 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold"
            title="Keluar dari Akun"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>
    </header>
  );
};
