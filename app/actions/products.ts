// app/actions/products.ts
'use server';

import { createClient, isSupabaseConfigured } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { dbStore } from '@/lib/db-store';
import { Product, Role, Category } from '@/types/database';

export interface ProductFormData {
  id?: string;
  sku: string;
  name: string;
  category_id: string;
  unit: string;
  cost_price: number;
  selling_price: number;
  stock: number;
  min_stock: number;
  is_active: boolean;
}

export async function getProductsAction(role: Role = 'kasir'): Promise<{ success: boolean; data: Product[]; error?: string }> {
  try {
    const cookieStore = cookies();
    const useSupabase = isSupabaseConfigured();

    if (useSupabase) {
      try {
        const supabase = createClient(cookieStore);
        // If cashier, DO NOT fetch or return cost_price!
        const query = role === 'kasir'
          ? supabase.from('products').select('id, sku, name, category_id, unit, selling_price, stock, min_stock, is_active, created_at, category:categories(id, name)').order('name')
          : supabase.from('products').select('*, category:categories(id, name)').order('name');

        const { data, error } = await query;
        if (!error && data) {
          const products: Product[] = data.map((item: any) => ({
            id: item.id,
            sku: item.sku,
            name: item.name,
            category_id: item.category_id,
            unit: item.unit,
            // Strictly hide cost_price from kasir role
            cost_price: role === 'kasir' ? 0 : Number(item.cost_price || 0),
            selling_price: Number(item.selling_price || 0),
            stock: Number(item.stock || 0),
            min_stock: Number(item.min_stock || 0),
            is_active: Boolean(item.is_active),
            created_at: item.created_at,
            category: item.category ? { id: item.category.id, name: item.category.name } : undefined,
          }));
          return { success: true, data: products };
        }
      } catch (err) {
        console.warn('Supabase getProducts failed, falling back to local store:', err);
      }
    }

    // Local in-memory fallback
    const products: Product[] = dbStore.products.map((p) => {
      const cat = dbStore.categories.find((c) => c.id === p.category_id);
      return {
        ...p,
        // Strictly sanitize cost_price for kasir
        cost_price: role === 'kasir' ? 0 : p.cost_price,
        category: cat,
      };
    });

    return { success: true, data: products };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal memuat produk.';
    return { success: false, data: [], error: msg };
  }
}

export async function getCategoriesAction(): Promise<{ success: boolean; data: Category[]; error?: string }> {
  try {
    const cookieStore = cookies();
    const useSupabase = isSupabaseConfigured();

    if (useSupabase) {
      try {
        const supabase = createClient(cookieStore);
        const { data, error } = await supabase.from('categories').select('*').order('name');
        if (!error && data) {
          return { success: true, data };
        }
      } catch (err) {
        console.warn('Supabase getCategories failed, falling back to local store:', err);
      }
    }

    return { success: true, data: [...dbStore.categories] };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal memuat kategori.';
    return { success: false, data: [], error: msg };
  }
}

export async function saveProductAction(
  data: ProductFormData,
  userRole: Role
): Promise<{ success: boolean; data?: Product; error?: string }> {
  try {
    // Only admin and owner can manage products
    if (userRole === 'kasir') {
      return { success: false, error: 'Akses ditolak. Kasir tidak diizinkan mengubah master produk.' };
    }

    if (!data.name || !data.unit || data.selling_price < 0) {
      return { success: false, error: 'Data produk tidak lengkap atau tidak valid.' };
    }

    const cookieStore = cookies();
    const useSupabase = isSupabaseConfigured();

    if (useSupabase) {
      try {
        const supabase = createClient(cookieStore);

        if (data.id) {
          // Update existing
          const { data: updated, error } = await supabase
            .from('products')
            .update({
              sku: data.sku,
              name: data.name,
              category_id: data.category_id || null,
              unit: data.unit,
              cost_price: Number(data.cost_price),
              selling_price: Number(data.selling_price),
              stock: Number(data.stock),
              min_stock: Number(data.min_stock),
              is_active: data.is_active,
            })
            .eq('id', data.id)
            .select()
            .single();

          if (error) throw new Error(error.message);
          return { success: true, data: updated };
        } else {
          // Insert new
          const { data: inserted, error } = await supabase
            .from('products')
            .insert({
              sku: data.sku || null,
              name: data.name,
              category_id: data.category_id || null,
              unit: data.unit,
              cost_price: Number(data.cost_price),
              selling_price: Number(data.selling_price),
              stock: Number(data.stock),
              min_stock: Number(data.min_stock),
              is_active: data.is_active,
            })
            .select()
            .single();

          if (error) throw new Error(error.message);
          return { success: true, data: inserted };
        }
      } catch (err: unknown) {
        console.warn('Supabase saveProduct failed, fallback to local store:', err);
      }
    }

    // Local store fallback
    if (data.id) {
      const idx = dbStore.products.findIndex((p) => p.id === data.id);
      if (idx === -1) return { success: false, error: 'Produk tidak ditemukan.' };

      dbStore.products[idx] = {
        ...dbStore.products[idx],
        sku: data.sku,
        name: data.name,
        category_id: data.category_id,
        unit: data.unit,
        cost_price: Number(data.cost_price),
        selling_price: Number(data.selling_price),
        stock: Number(data.stock),
        min_stock: Number(data.min_stock),
        is_active: data.is_active,
      };

      return { success: true, data: dbStore.products[idx] };
    } else {
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        sku: data.sku || `SKU-${Date.now().toString().slice(-4)}`,
        name: data.name,
        category_id: data.category_id,
        unit: data.unit,
        cost_price: Number(data.cost_price),
        selling_price: Number(data.selling_price),
        stock: Number(data.stock),
        min_stock: Number(data.min_stock),
        is_active: data.is_active,
        created_at: new Date().toISOString(),
      };
      dbStore.products.push(newProduct);
      return { success: true, data: newProduct };
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal menyimpan produk.';
    return { success: false, error: msg };
  }
}

export async function adjustStockAction(
  productId: string,
  newStock: number,
  userRole: Role
): Promise<{ success: boolean; error?: string }> {
  try {
    if (userRole === 'kasir') {
      return { success: false, error: 'Kasir tidak memiliki akses untuk penyesuaian stok manual.' };
    }

    const cleanStock = Number(newStock.toFixed(2));
    const cookieStore = cookies();
    const useSupabase = isSupabaseConfigured();

    if (useSupabase) {
      try {
        const supabase = createClient(cookieStore);
        const { error } = await supabase
          .from('products')
          .update({ stock: cleanStock })
          .eq('id', productId);

        if (error) throw new Error(error.message);
        return { success: true };
      } catch (err) {
        console.warn('Supabase adjustStock failed, fallback to local store:', err);
      }
    }

    const product = dbStore.products.find((p) => p.id === productId);
    if (!product) return { success: false, error: 'Produk tidak ditemukan.' };
    product.stock = cleanStock;
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal mengubah stok.';
    return { success: false, error: msg };
  }
}

export async function saveCategoryAction(
  name: string,
  userRole: Role
): Promise<{ success: boolean; data?: Category; error?: string }> {
  try {
    if (userRole === 'kasir') {
      return { success: false, error: 'Kasir tidak diizinkan menambah kategori.' };
    }

    const trimmed = name.trim();
    if (!trimmed) {
      return { success: false, error: 'Nama kategori tidak boleh kosong.' };
    }

    const cookieStore = cookies();
    const useSupabase = isSupabaseConfigured();

    if (useSupabase) {
      try {
        const supabase = createClient(cookieStore);
        const { data, error } = await supabase
          .from('categories')
          .insert({ name: trimmed })
          .select()
          .single();

        if (error) throw new Error(error.message);
        return { success: true, data };
      } catch (err) {
        console.warn('Supabase saveCategory failed, fallback to local store:', err);
      }
    }

    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: trimmed,
    };
    dbStore.categories.push(newCat);
    return { success: true, data: newCat };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal menyimpan kategori.';
    return { success: false, error: msg };
  }
}
