// app/actions/transactions.ts
'use server';

import { createClient, isSupabaseConfigured } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { dbStore, DbStore } from '@/lib/db-store';
import { Role, Transaction } from '@/types/database';

export interface DashboardAnalytics {
  summary: {
    total_revenue: number;
    total_cost: number;
    total_profit: number;
  };
  top_products: Array<{
    id: string;
    name: string;
    unit: string;
    quantity: number;
    revenue: number;
    profit: number;
  }>;
}

// Backward compatibility alias for FinancialAnalytics
export type FinancialAnalytics = DashboardAnalytics;

/**
 * Calculates dashboard financial analytics by executing the Supabase RPC function `get_dashboard_analytics`.
 * All heavy computations (aggregations, sums, joins, groupings, and orderings) run directly inside PostgreSQL.
 *
 * @param startDate Optional TIMESTAMPTZ string (e.g. '2026-09-01T00:00:00Z')
 * @param endDate Optional TIMESTAMPTZ string (e.g. '2026-09-30T23:59:59Z')
 * @returns DashboardAnalytics | null
 */
export async function getAnalytics(
  startDate?: string | null,
  endDate?: string | null
): Promise<DashboardAnalytics | null> {
  try {
    const useSupabase = isSupabaseConfigured();

    if (useSupabase) {
      const cookieStore = cookies();
      const supabase = createClient(cookieStore);

      const { data, error } = await supabase.rpc('get_dashboard_analytics', {
        start_date: startDate || null,
        end_date: endDate || null,
      });

      if (error) {
        console.error('Supabase RPC get_dashboard_analytics error:', error.message);
        return null;
      }

      if (!data) {
        return null;
      }

      const parsed: DashboardAnalytics = typeof data === 'string' ? JSON.parse(data) : data;
      return parsed;
    }

    // In-memory fallback simulation for offline/preview demo mode
    return getLocalFallbackAnalytics(startDate, endDate);
  } catch (error: unknown) {
    console.error('Unexpected error in getAnalytics:', error);
    return null;
  }
}

/**
 * Lightweight fallback calculation when running in offline preview without Supabase credentials.
 */
function getLocalFallbackAnalytics(
  startDate?: string | null,
  endDate?: string | null
): DashboardAnalytics {
  let totalRevenue = 0;
  let totalCost = 0;
  const productAggMap = new Map<
    string,
    {
      id: string;
      name: string;
      unit: string;
      quantity: number;
      revenue: number;
      profit: number;
    }
  >();

  const startMs = startDate ? new Date(startDate).getTime() : -Infinity;
  const endMs = endDate ? new Date(endDate).getTime() : Infinity;

  const filteredTx = dbStore.transactions.filter((tx) => {
    const txTime = new Date(tx.created_at).getTime();
    return txTime >= startMs && txTime <= endMs;
  });

  for (const tx of filteredTx) {
    totalRevenue += tx.total_amount;
    for (const item of tx.items || []) {
      const cost = item.cost_price_at_sale * item.quantity;
      const rev = item.subtotal;
      const profit = rev - cost;
      totalCost += cost;

      const pId = item.product_id || item.product?.id || 'unknown';
      const existing = productAggMap.get(pId) || {
        id: pId,
        name: item.product?.name || 'Material',
        unit: item.product?.unit || 'Item',
        quantity: 0,
        revenue: 0,
        profit: 0,
      };

      existing.quantity += item.quantity;
      existing.revenue += rev;
      existing.profit += profit;
      productAggMap.set(pId, existing);
    }
  }

  const topProducts = Array.from(productAggMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return {
    summary: {
      total_revenue: Math.round(totalRevenue),
      total_cost: Math.round(totalCost),
      total_profit: Math.round(totalRevenue - totalCost),
    },
    top_products: topProducts,
  };
}

/**
 * Fetches transaction records. Nested loops for analytics calculation have been removed.
 * Cost price is strictly masked for cashiers ('kasir') to preserve RBAC security.
 */
export async function getTransactionsAction(
  userRole: Role,
  cashierId?: string,
  startDate?: string | null,
  endDate?: string | null
): Promise<{
  success: boolean;
  data: Transaction[];
  analytics?: DashboardAnalytics | null;
  error?: string;
}> {
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
            id,
            invoice_no,
            cashier_id,
            total_amount,
            payment_method,
            amount_paid,
            change_amount,
            created_at,
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

        if (startDate) {
          query = query.gte('created_at', startDate);
        }
        if (endDate) {
          query = query.lte('created_at', endDate);
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
              // ATURAN KEAMANAN: Sembunyikan harga modal dari kasir
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
      transactions = dbStore.transactions
        .filter((t) => (userRole === 'kasir' && cashierId ? t.cashier_id === cashierId : true))
        .map((t) => {
          const cashierProfile = dbStore.profiles.find((p) => p.id === t.cashier_id);
          return {
            ...t,
            cashier: cashierProfile,
            items: (t.items || []).map((it) => ({
              ...it,
              cost_price_at_sale: userRole === 'kasir' ? 0 : it.cost_price_at_sale,
            })),
          };
        });
    }

    // If owner role, load analytics via database RPC without any nested loops in Next.js memory
    let analytics: DashboardAnalytics | null = null;
    if (userRole === 'owner') {
      analytics = await getAnalytics(startDate, endDate);
    }

    return { success: true, data: transactions, analytics };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal memuat transaksi.';
    return { success: false, data: [], error: msg };
  }
}
