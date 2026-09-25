export type Role = 'kasir' | 'admin' | 'owner';

export interface Profile {
  id: string; // UUID from auth.users
  full_name: string;
  role: Role;
  created_at: string;
}

export interface Product {
  id: string;
  sku: string | null;
  name: string;
  category_id: string;
  unit: string; // e.g., 'Meter', 'Sak', 'Batang'
  cost_price: number; // Numeric/Decimal in DB
  selling_price: number; // Numeric/Decimal in DB
  stock: number; // Numeric/Decimal in DB
  min_stock: number;
  is_active: boolean;
  created_at: string;
}

export interface CartItem extends Product {
  cart_quantity: number; // Supports decimal, e.g., 1.5
  subtotal: number;
}
