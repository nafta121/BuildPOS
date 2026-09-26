// lib/db-store.ts
import { Category, Product, Transaction, Profile } from '@/types/database';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_PRODUCTS, 
  INITIAL_PROFILES, 
  INITIAL_TRANSACTIONS 
} from './mock-data';

// Tipe data store in-memory untuk fallback offline/demo
export interface DbStore {
  categories: Category[];
  products: Product[];
  transactions: Transaction[];
  profiles: Profile[];
}

/**
 * Fungsi inisialisasi state awal (seeding) untuk store in-memory.
 */
function createInitialDbStore(): DbStore {
  return {
    categories: [...INITIAL_CATEGORIES],
    products: [...INITIAL_PRODUCTS],
    transactions: [...INITIAL_TRANSACTIONS],
    profiles: [...INITIAL_PROFILES],
  };
}

/**
 * Type-Safe Singleton Module Pattern menggunakan `globalThis`.
 * Pendekatan ini mempertahankan cache instance store selama siklus Hot Module Replacement (HMR)
 * di development mode tanpa memerlukan deklarasi keyword `var` atau bypass eslint (`eslint-disable no-var`).
 */
const globalForDb = globalThis as unknown as {
  dbStore: DbStore | undefined;
};

export const dbStore: DbStore = globalForDb.dbStore ?? createInitialDbStore();

// Simpan instance ke globalThis pada mode non-production agar tidak ter-reset saat hot reload
if (process.env.NODE_ENV !== 'production') {
  globalForDb.dbStore = dbStore;
}
