// app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { LoginPage } from '@/components/auth/LoginPage';
import { Navbar, ActiveTab } from '@/components/layout/Navbar';
import { BottomNav } from '@/components/layout/BottomNav';
import { PosView } from '@/components/pos/PosView';
import { InventoryView } from '@/components/inventory/InventoryView';
import { OwnerDashboard } from '@/components/dashboard/OwnerDashboard';
import { TransactionHistoryView } from '@/components/transactions/TransactionHistoryView';

export default function HomePage() {
  const { isAuthenticated, currentProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<ActiveTab>('pos');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Avoid hydration mismatch while reading persisted store
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show Login Page if user is not authenticated
  if (!isAuthenticated || !currentProfile) {
    return <LoginPage />;
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-950">
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Tab Content */}
      <main className="flex-1 flex flex-col overflow-hidden pb-16 md:pb-0">
        {activeTab === 'pos' && <PosView />}
        {activeTab === 'history' && <TransactionHistoryView />}
        {activeTab === 'inventory' && <InventoryView />}
        {activeTab === 'owner' && <OwnerDashboard />}
      </main>

      {/* Mobile Bottom Navigation (< 768px) */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
