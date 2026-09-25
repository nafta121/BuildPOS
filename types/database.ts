// types/database.ts

export type Role = 'kasir' | 'admin' | 'owner';

export type PaymentMethod = 'tunai' | 'transfer';

export interface Profile {
  id: string; // UUID references auth.users(id)
  full_name: string;
  role: Role;
  created_at: string;
  email?: string;
}

export interface Category {
  id: string; // UUID primary key
  name: string;
  created_at?: string;
}

export interface Product {
  id: string; // UUID primary key
  sku: string | null;
  name: string;
  category_id: string | null;
  unit: string; // e.g., 'Meter', 'Sak', 'Kubik', 'Kg', 'Batang', 'Pail'
  cost_price: number; // NUMERIC in DB (strictly hidden from 'kasir' role)
  selling_price: number; // NUMERIC in DB
  stock: number; // NUMERIC in DB (supports decimal e.g. 1.5 meter, 0.5 kubik)
  min_stock: number; // NUMERIC in DB
  is_active: boolean;
  created_at: string;
  category?: Category;
}

export interface CartItem extends Product {
  cart_quantity: number; // NUMERIC, supports decimal
  subtotal: number; // NUMERIC, calculated with high precision
}

export interface Transaction {
  id: string; // UUID primary key
  invoice_no: string;
  cashier_id: string | null;
  total_amount: number; // NUMERIC
  payment_method: PaymentMethod;
  amount_paid: number; // NUMERIC
  change_amount: number; // NUMERIC
  created_at: string;
  cashier?: Profile;
  items?: TransactionItem[];
}

export interface TransactionItem {
  id: string; // UUID primary key
  transaction_id: string; // UUID references transactions(id)
  product_id: string; // UUID references products(id)
  quantity: number; // NUMERIC (e.g. 1.5, 0.25)
  selling_price_at_sale: number; // NUMERIC
  cost_price_at_sale: number; // NUMERIC
  subtotal: number; // NUMERIC
  product?: Product;
}

// Sanitized Product view for 'kasir' role (cost_price omitted)
export type CashierProduct = Omit<Product, 'cost_price'>;

// Checkout Payload Interfaces
export interface CheckoutItemPayload {
  productId: string;
  quantity: number;
}

export interface CheckoutPayload {
  cashierId?: string | null;
  cashierRole: Role;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  items: CheckoutItemPayload[];
}

export interface CheckoutResponse {
  success: boolean;
  transaction?: Transaction;
  error?: string;
}
