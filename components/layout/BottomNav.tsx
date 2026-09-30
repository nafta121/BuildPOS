// components/layout/BottomNav.tsx
'use client';

import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { ActiveTab } from './Navbar';
import { 
  ShoppingCart, 
  Receipt, 
  Package, 
  TrendingUp 
} from 'lucide-react';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const { currentProfile } = useAuthStore();

  const isOwner = currentProfile?.role === 'owner';
  const isAdminOrOwner = currentProfile?.role === 'admin' || currentProfile?.role === 'owner';

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 text-white flex items-center justify-around h-16 px-1 safe-area-bottom">
      <button
        onClick={() => setActiveTab('pos')}
        aria-label="Kasir POS"
        aria-current={activeTab === 'pos' ? 'page' : undefined}
        className={`flex flex-col items-center justify-center flex-1 h-full py-1 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none focus-visible:ring-inset ${
          activeTab === 'pos' ? 'text-emerald-400 font-bold' : 'text-slate-400'
        }`}
      >
        <ShoppingCart className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">Kasir</span>
      </button>

      <button
        onClick={() => setActiveTab('history')}
        aria-label="Riwayat Nota"
        aria-current={activeTab === 'history' ? 'page' : undefined}
        className={`flex flex-col items-center justify-center flex-1 h-full py-1 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none focus-visible:ring-inset ${
          activeTab === 'history' ? 'text-emerald-400 font-bold' : 'text-slate-400'
        }`}
      >
        <Receipt className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">Riwayat</span>
      </button>

      {isAdminOrOwner && (
        <button
          onClick={() => setActiveTab('inventory')}
          aria-label="Gudang & Stok"
          aria-current={activeTab === 'inventory' ? 'page' : undefined}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none focus-visible:ring-inset ${
            activeTab === 'inventory' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Package className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Gudang</span>
        </button>
      )}

      {isOwner && (
        <button
          onClick={() => setActiveTab('owner')}
          aria-label="Dashboard Laba"
          aria-current={activeTab === 'owner' ? 'page' : undefined}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none focus-visible:ring-inset ${
            activeTab === 'owner' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <TrendingUp className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Laba</span>
        </button>
      )}
    </div>
  );
};
