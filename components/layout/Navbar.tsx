// components/layout/Navbar.tsx
'use client';

import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { Role } from '@/types/database';
import { 
  Hammer, 
  ShoppingCart, 
  Receipt, 
  Package, 
  TrendingUp, 
  Database, 
  UserCircle2, 
  ChevronDown 
} from 'lucide-react';

export type ActiveTab = 'pos' | 'history' | 'inventory' | 'owner' | 'setup';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { currentProfile, availableProfiles, setProfile } = useAuthStore();
  const { getTotalItemsCount } = useCartStore();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const found = availableProfiles.find((p) => p.id === selectedId);
    if (found) {
      setProfile(found);
      // If cashier tries to stay on owner dashboard or inventory, redirect to POS
      if (found.role === 'kasir' && (activeTab === 'owner' || activeTab === 'inventory')) {
        setActiveTab('pos');
      } else if (found.role === 'admin' && activeTab === 'owner') {
        setActiveTab('inventory');
      }
    }
  };

  const getRoleBadgeStyle = (role: Role) => {
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'history'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Riwayat Nota</span>
          </button>

          {/* Gudang tab (admin/owner only) */}
          {(currentProfile.role === 'admin' || currentProfile.role === 'owner') && (
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
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
          {currentProfile.role === 'owner' && (
            <button
              onClick={() => setActiveTab('owner')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'owner'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Dashboard Laba</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('setup')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'setup'
                ? 'bg-slate-800 text-emerald-400 shadow-md border border-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>SQL Setup</span>
          </button>
        </nav>

        {/* User Role Switcher Dropdown (Crucial for RBAC testing & cashier ergonomics) */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5">
            <UserCircle2 className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <div className="flex flex-col text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 leading-tight">
                Role Akses:
              </span>
              <select
                value={currentProfile.id}
                onChange={handleRoleChange}
                className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer pr-4 appearance-none"
              >
                {availableProfiles.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                    {p.full_name} ({p.role.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
          </div>

          <span
            className={`text-[10px] font-black uppercase px-2 py-1 rounded-md border hidden lg:inline-block ${getRoleBadgeStyle(
              currentProfile.role
            )}`}
          >
            {currentProfile.role}
          </span>
        </div>
      </div>
    </header>
  );
};
