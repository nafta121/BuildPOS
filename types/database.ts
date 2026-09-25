// types/database.ts

export type Role = 'kasir' | 'admin' | 'owner';

export type PaymentMethod = 'tunai' | 'transfer';

export interface Profile {
  id: string; // UUID from auth.users
  full_name: string;
  role: Role;
  created_at: string;
  email?: string;
}

export interface Category {
  id: string;
  name: string;
  created_at?: string;
}

export interface Product {
  id: string;
  sku: string | null;
  name: string;
  category_id: string;
  unit: string; // e.g., 'Meter', 'Sak', 'Batang', 'Kubik', 'Kg', 'Pail'
  cost_price: number; // Numeric/Decimal in DB - hidden from 'kasir'
  selling_price: number; // Numeric/Decimal in DB
  stock: number; // Numeric/Decimal in DB - supports fractional (e.g. 12.5)
  min_stock: number; // Numeric/Decimal in DB
  is_active: boolean;
  created_at: string;
  category?: Category;
}

export interface CartItem extends Product {
  cart_quantity: number; // Supports decimal, e.g., 1.5 meter, 0.5 kubik
  subtotal: number;
}

export interface Transaction {
  id: string;
  invoice_no: string;
  cashier_id: string;
  total_amount: number;
  payment_method: PaymentMethod;
  amount_paid: number;
  change_amount: number;
  created_at: string;
  cashier?: Profile;
  items?: TransactionItem[];
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  product_id: string;
  quantity: number; // Supports decimal
  selling_price_at_sale: number;
  cost_price_at_sale: number;
  subtotal: number;
  product?: Product;
}

// Sanitized Product view for 'kasir' role (cost_price omitted)
export type CashierProduct = Omit<Product, 'cost_price'>;
