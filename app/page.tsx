// app/page.tsx
'use client';

import React, { useState } from 'react';
import { Navbar, ActiveTab } from '@/components/layout/Navbar';
import { BottomNav } from '@/components/layout/BottomNav';
import { PosView } from '@/components/pos/PosView';
import { InventoryView } from '@/components/inventory/InventoryView';
import { OwnerDashboard } from '@/components/dashboard/OwnerDashboard';
import { TransactionHistoryView } from '@/components/transactions/TransactionHistoryView';
import { DatabaseSetupView } from '@/components/setup/DatabaseSetupView';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('pos');

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
        {activeTab === 'setup' && <DatabaseSetupView />}
      </main>

      {/* Mobile Bottom Navigation (< 768px) */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
