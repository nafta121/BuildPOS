// app/actions/pos.ts
'use server';

import { createClient, isSupabaseConfigured } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { dbStore } from '@/lib/db-store';
import { PaymentMethod, Role, Transaction, TransactionItem } from '@/types/database';

export interface CheckoutItemInput {
  productId: string;
  quantity: number; // Supports decimal, e.g. 1.5, 0.5
}

export interface CheckoutParams {
  cashierId: string;
  cashierRole: Role;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  items: CheckoutItemInput[];
}

export interface CheckoutResult {
  success: boolean;
  transaction?: Transaction;
  error?: string;
}

export async function checkoutAction(params: CheckoutParams): Promise<CheckoutResult> {
  try {
    const { cashierId, cashierRole, paymentMethod, amountPaid, items } = params;

    if (!items || items.length === 0) {
      return { success: false, error: 'Keranjang belanja masih kosong.' };
    }

    if (amountPaid <= 0) {
      return { success: false, error: 'Jumlah pembayaran tidak valid.' };
    }

    // Generate Invoice Number: INV-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const invoiceNo = `INV-${dateStr}-${randomSuffix}`;

    const cookieStore = cookies();
    const useSupabase = isSupabaseConfigured();

    if (useSupabase) {
      try {
        const supabase = createClient(cookieStore);

        // 1. Fetch current products to guarantee current price snapshot
        const productIds = items.map((i) => i.productId);
        const { data: dbProducts, error: prodErr } = await supabase
          .from('products')
          .select('id, name, unit, cost_price, selling_price, stock')
          .in('id', productIds);

        if (prodErr || !dbProducts) {
          throw new Error(prodErr?.message || 'Gagal memuat produk dari database.');
        }

        // Validate stock and calculate totals
        let totalAmount = 0;
        const lineItems: Array<{
          product_id: string;
          quantity: number;
          selling_price_at_sale: number;
          cost_price_at_sale: number;
          subtotal: number;
          name: string;
          unit: string;
        }> = [];

        for (const item of items) {
          const product = dbProducts.find((p) => p.id === item.productId);
          if (!product) {
            return { success: false, error: `Produk ID ${item.productId} tidak ditemukan.` };
          }
          if (item.quantity <= 0) {
            return { success: false, error: `Jumlah barang untuk ${product.name} harus lebih dari 0.` };
          }
          if (product.stock < item.quantity) {
            return { 
              success: false, 
              error: `Stok tidak mencukupi untuk ${product.name}. Tersisa: ${product.stock} ${product.unit}, diminta: ${item.quantity}` 
            };
          }

          const sellingPrice = Number(product.selling_price);
          const costPrice = Number(product.cost_price);
          const subtotal = Number((item.quantity * sellingPrice).toFixed(2));
          totalAmount += subtotal;

          lineItems.push({
            product_id: product.id,
            quantity: Number(item.quantity.toFixed(2)),
            selling_price_at_sale: sellingPrice,
            cost_price_at_sale: costPrice,
            subtotal,
            name: product.name,
            unit: product.unit,
          });
        }

        totalAmount = Number(totalAmount.toFixed(2));
        if (amountPaid < totalAmount) {
          return {
            success: false,
            error: `Nominal pembayaran kurang. Total: Rp ${totalAmount.toLocaleString('id-ID')}, Dibayar: Rp ${amountPaid.toLocaleString('id-ID')}`,
          };
        }

        const changeAmount = Number((amountPaid - totalAmount).toFixed(2));

        // 2. Insert Transaction Record
        const { data: txRecord, error: txErr } = await supabase
          .from('transactions')
          .insert({
            invoice_no: invoiceNo,
            cashier_id: cashierId || null,
            total_amount: totalAmount,
            payment_method: paymentMethod,
            amount_paid: amountPaid,
            change_amount: changeAmount,
          })
          .select()
          .single();

        if (txErr || !txRecord) {
          throw new Error(txErr?.message || 'Gagal menyimpan transaksi ke database.');
        }

        // 3. Insert Transaction Items
        // ATURAN KRUSIAL: Pengurangan stok dilakukan OTOMATIS oleh DB Trigger
        // tr_reduce_stock_after_item_insert saat ada INSERT ke transaction_items
        const itemsToInsert = lineItems.map((li) => ({
          transaction_id: txRecord.id,
          product_id: li.product_id,
          quantity: li.quantity,
          selling_price_at_sale: li.selling_price_at_sale,
          cost_price_at_sale: li.cost_price_at_sale,
          subtotal: li.subtotal,
        }));

        const { data: insertedItems, error: itemsErr } = await supabase
          .from('transaction_items')
          .insert(itemsToInsert)
          .select();

        if (itemsErr) {
          throw new Error(itemsErr.message);
        }

        // Prepare response transaction
        const safeItems: TransactionItem[] = (insertedItems || []).map((it) => {
          const detail = lineItems.find((li) => li.product_id === it.product_id);
          return {
            id: it.id,
            transaction_id: it.transaction_id,
            product_id: it.product_id,
            quantity: Number(it.quantity),
            selling_price_at_sale: Number(it.selling_price_at_sale),
            // ATURAN: Sembunyikan harga modal jika role adalah kasir
            cost_price_at_sale: cashierRole === 'kasir' ? 0 : Number(it.cost_price_at_sale),
            subtotal: Number(it.subtotal),
            product: detail ? {
              id: detail.product_id,
              sku: null,
              name: detail.name,
              category_id: '',
              unit: detail.unit,
              cost_price: 0,
              selling_price: detail.selling_price_at_sale,
              stock: 0,
              min_stock: 0,
              is_active: true,
              created_at: '',
            } : undefined,
          };
        });

        const completedTx: Transaction = {
          id: txRecord.id,
          invoice_no: txRecord.invoice_no,
          cashier_id: txRecord.cashier_id,
          total_amount: Number(txRecord.total_amount),
          payment_method: txRecord.payment_method,
          amount_paid: Number(txRecord.amount_paid),
          change_amount: Number(txRecord.change_amount),
          created_at: txRecord.created_at,
          items: safeItems,
        };

        return { success: true, transaction: completedTx };
      } catch (err: unknown) {
        console.warn('Supabase checkout failed, falling back to local store:', err);
      }
    }

    // =========================================================================
    // FALLBACK / DEMO STORE MODE (when Supabase credentials not yet populated)
    // =========================================================================
    let totalAmount = 0;
    const lineItems: TransactionItem[] = [];

    for (const item of items) {
      const product = dbStore.products.find((p) => p.id === item.productId);
      if (!product) {
        return { success: false, error: `Produk ID ${item.productId} tidak ditemukan.` };
      }
      if (item.quantity <= 0) {
        return { success: false, error: `Kuantitas untuk ${product.name} harus lebih dari 0.` };
      }
      if (product.stock < item.quantity) {
        return { 
          success: false, 
          error: `Stok tidak mencukupi untuk ${product.name}. Tersedia: ${product.stock} ${product.unit}, Diminta: ${item.quantity}` 
        };
      }

      const sellingPrice = product.selling_price;
      const costPrice = product.cost_price;
      const subtotal = Number((item.quantity * sellingPrice).toFixed(2));
      totalAmount += subtotal;

      // Simulate Database Trigger: stock reduction
      product.stock = Number((product.stock - item.quantity).toFixed(2));

      lineItems.push({
        id: `txi-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        transaction_id: `tx-${Date.now()}`,
        product_id: product.id,
        quantity: Number(item.quantity.toFixed(2)),
        selling_price_at_sale: sellingPrice,
        cost_price_at_sale: cashierRole === 'kasir' ? 0 : costPrice, // Hide cost price for kasir
        subtotal,
        product: {
          ...product,
          cost_price: cashierRole === 'kasir' ? 0 : product.cost_price,
        },
      });
    }

    totalAmount = Number(totalAmount.toFixed(2));
    if (amountPaid < totalAmount) {
      return {
        success: false,
        error: `Pembayaran kurang. Total belanja: Rp ${totalAmount.toLocaleString('id-ID')}, Dibayar: Rp ${amountPaid.toLocaleString('id-ID')}`,
      };
    }

    const changeAmount = Number((amountPaid - totalAmount).toFixed(2));
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      invoice_no: invoiceNo,
      cashier_id: cashierId || 'p1111111-1111-1111-1111-111111111111',
      total_amount: totalAmount,
      payment_method: paymentMethod,
      amount_paid: amountPaid,
      change_amount: changeAmount,
      created_at: new Date().toISOString(),
      items: lineItems,
    };

    dbStore.transactions.unshift(newTx);

    return { success: true, transaction: newTx };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan sistem saat checkout.';
    return { success: false, error: message };
  }
}
