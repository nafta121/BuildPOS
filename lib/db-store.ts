// lib/db-store.ts
import { Category, Product, Transaction, TransactionItem, Role, Profile } from '@/types/database';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_PROFILES, INITIAL_TRANSACTIONS } from './mock-data';

// Persistent in-memory store for server-side demo/mock mode
// (When Supabase is connected, queries run directly on Supabase)
interface GlobalDb {
  categories: Category[];
  products: Product[];
  transactions: Transaction[];
  profiles: Profile[];
}

declare global {
  // eslint-disable-next-line no-var
  var __buildpos_db: GlobalDb | undefined;
}

if (!global.__buildpos_db) {
  global.__buildpos_db = {
    categories: [...INITIAL_CATEGORIES],
    products: [...INITIAL_PRODUCTS],
    transactions: [...INITIAL_TRANSACTIONS],
    profiles: [...INITIAL_PROFILES],
  };
}

export const dbStore = global.__buildpos_db;
