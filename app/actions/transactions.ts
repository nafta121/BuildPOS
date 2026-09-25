// app/actions/transactions.ts
'use server';

import { createClient, isSupabaseConfigured } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { dbStore } from '@/lib/db-store';
import { Role, Transaction } from '@/types/database';

export interface FinancialAnalytics {
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  profitMarginPercent: number;
  totalTransactionsCount: number;
  averageTransactionValue: number;
  topSellingProducts: Array<{
    name: string;
    unit: string;
    quantity: number;
    revenue: number;
    profit: number;
  }>;
}

export async function getTransactionsAction(
  userRole: Role,
  cashierId?: string
): Promise<{ success: boolean; data: Transaction[]; analytics?: FinancialAnalytics; error?: string }> {
  try {
    const cookieStore = cookies();
    const useSupabase = isSupabaseConfigured();

    let transactions: Transaction[] = [];

    if (useSupabase) {
      try {
        const supabase = createClient(cookieStore);
        let query = supabase
          .from('transactions')
          .select(`
            *,
            cashier:profiles(id, full_name, role),
            items:transaction_items(
              id,
              transaction_id,
              product_id,
              quantity,
              selling_price_at_sale,
              cost_price_at_sale,
              subtotal,
              product:products(id, name, unit)
            )
          `)
          .order('created_at', { ascending: false });

        if (userRole === 'kasir' && cashierId) {
          query = query.eq('cashier_id', cashierId);
        }

        const { data, error } = await query;
        if (!error && data) {
          transactions = data.map((t: any) => ({
            id: t.id,
            invoice_no: t.invoice_no,
            cashier_id: t.cashier_id,
            total_amount: Number(t.total_amount),
            payment_method: t.payment_method,
            amount_paid: Number(t.amount_paid),
            change_amount: Number(t.change_amount),
            created_at: t.created_at,
            cashier: t.cashier,
            items: (t.items || []).map((it: any) => ({
              id: it.id,
              transaction_id: it.transaction_id,
              product_id: it.product_id,
              quantity: Number(it.quantity),
              selling_price_at_sale: Number(it.selling_price_at_sale),
              // ATURAN: Sembunyikan harga modal dari kasir
              cost_price_at_sale: userRole === 'kasir' ? 0 : Number(it.cost_price_at_sale),
              subtotal: Number(it.subtotal),
              product: it.product,
            })),
          }));
        }
      } catch (err) {
        console.warn('Supabase getTransactions failed, falling back to local store:', err);
      }
    }

    if (transactions.length === 0 && dbStore.transactions.length > 0) {
      // Use local store
      transactions = dbStore.transactions
        .filter((t) => (userRole === 'kasir' && cashierId ? t.cashier_id === cashierId : true))
        .map((t) => {
          const cashierProfile = dbStore.profiles.find((p) => p.id === t.cashier_id);
          return {
            ...t,
            cashier: cashierProfile,
            items: (t.items || []).map((it) => ({
              ...it,
              // Strictly hide cost_price from kasir
              cost_price_at_sale: userRole === 'kasir' ? 0 : it.cost_price_at_sale,
            })),
          };
        });
    }

    // Calculate Analytics ONLY for Owner role!
    // ATURAN: Kasir dan Admin TIDAK BOLEH melihat dashboard keuangan / laba
    let analytics: FinancialAnalytics | undefined = undefined;

    if (userRole === 'owner') {
      let totalRevenue = 0;
      let totalCost = 0;
      const productMap = new Map<string, { name: string; unit: string; quantity: number; revenue: number; profit: number }>();

      for (const tx of transactions) {
        totalRevenue += tx.total_amount;
        for (const item of tx.items || []) {
          const cost = item.cost_price_at_sale * item.quantity;
          const rev = item.subtotal;
          const profit = rev - cost;
          totalCost += cost;

          const prodKey = item.product_id || item.product?.name || 'unknown';
          const prodName = item.product?.name || 'Barang Bahan Bangunan';
          const prodUnit = item.product?.unit || 'Item';

          const existing = productMap.get(prodKey) || {
            name: prodName,
            unit: prodUnit,
            quantity: 0,
            revenue: 0,
            profit: 0,
          };

          existing.quantity += item.quantity;
          existing.revenue += rev;
          existing.profit += profit;
          productMap.set(prodKey, existing);
        }
      }

      const grossProfit = totalRevenue - totalCost;
      const profitMarginPercent = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
      const count = transactions.length;
      const averageTransactionValue = count > 0 ? totalRevenue / count : 0;

      const topSellingProducts = Array.from(productMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      analytics = {
        totalRevenue: Math.round(totalRevenue),
        totalCost: Math.round(totalCost),
        grossProfit: Math.round(grossProfit),
        profitMarginPercent: Number(profitMarginPercent.toFixed(1)),
        totalTransactionsCount: count,
        averageTransactionValue: Math.round(averageTransactionValue),
        topSellingProducts,
      };
    }

    return { success: true, data: transactions, analytics };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal memuat transaksi.';
    return { success: false, data: [], error: msg };
  }
}
