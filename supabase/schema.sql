-- supabase/schema.sql
-- BuildPOS: Database Schema, Enums, Triggers, RLS, and Seed Data untuk Toko Bangunan
-- Siap di-paste langsung ke Supabase SQL Editor

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('kasir', 'admin', 'owner');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('tunai', 'transfer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'kasir',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. PRODUCTS TABLE (Mendukung Decimal/Numeric untuk Qty & Stok Toko Bangunan)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    unit VARCHAR(50) NOT NULL, -- 'Meter', 'Sak', 'Kubik', 'Batang', 'Kg', 'Pail', 'Lembar'
    cost_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    selling_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    stock NUMERIC(15, 2) NOT NULL DEFAULT 0.00,       -- Numeric untuk pecahan seperti 1.5 meter, 0.5 kubik
    min_stock NUMERIC(15, 2) NOT NULL DEFAULT 5.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_no VARCHAR(100) NOT NULL UNIQUE,
    cashier_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    total_amount NUMERIC(15, 2) NOT NULL,
    payment_method payment_method NOT NULL DEFAULT 'tunai',
    amount_paid NUMERIC(15, 2) NOT NULL,
    change_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. TRANSACTION_ITEMS TABLE
CREATE TABLE IF NOT EXISTS transaction_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity NUMERIC(15, 2) NOT NULL, -- Decimal e.g., 1.5 atau 0.25
    selling_price_at_sale NUMERIC(15, 2) NOT NULL,
    cost_price_at_sale NUMERIC(15, 2) NOT NULL,
    subtotal NUMERIC(15, 2) NOT NULL
);

-- ============================================================================
-- 8. DATABASE TRIGGER: PENGURANGAN STOK OTOMATIS SAAT INSERT TRANSACTION_ITEMS
-- ATURAN: Pengurangan stok dilakukan otomatis di level DB, BUKAN di frontend/Next.js
-- ============================================================================
CREATE OR REPLACE FUNCTION reduce_product_stock_on_sale()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET stock = stock - NEW.quantity
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_reduce_stock_after_item_insert ON transaction_items;
CREATE TRIGGER tr_reduce_stock_after_item_insert
AFTER INSERT ON transaction_items
FOR EACH ROW
EXECUTE FUNCTION reduce_product_stock_on_sale();

-- ============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role AS $$
    SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    TO authenticated
    USING (id = auth.uid() OR get_current_user_role() = 'owner');

DROP POLICY IF EXISTS "Owners can manage all profiles" ON profiles;
CREATE POLICY "Owners can manage all profiles"
    ON profiles FOR ALL
    TO authenticated
    USING (get_current_user_role() = 'owner');

-- CATEGORIES POLICIES
DROP POLICY IF EXISTS "Everyone authenticated can view categories" ON categories;
CREATE POLICY "Everyone authenticated can view categories"
    ON categories FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Admins and Owners can manage categories" ON categories;
CREATE POLICY "Admins and Owners can manage categories"
    ON categories FOR ALL
    TO authenticated
    USING (get_current_user_role() IN ('admin', 'owner'));

-- PRODUCTS POLICIES
DROP POLICY IF EXISTS "Everyone authenticated can view active products" ON products;
CREATE POLICY "Everyone authenticated can view active products"
    ON products FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Admins and Owners can insert/update products" ON products;
CREATE POLICY "Admins and Owners can insert/update products"
    ON products FOR ALL
    TO authenticated
    USING (get_current_user_role() IN ('admin', 'owner'));

-- TRANSACTIONS POLICIES
DROP POLICY IF EXISTS "Cashiers can insert transactions" ON transactions;
CREATE POLICY "Cashiers can insert transactions"
    ON transactions FOR INSERT
    TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "View transactions based on role" ON transactions;
CREATE POLICY "View transactions based on role"
    ON transactions FOR SELECT
    TO authenticated
    USING (
        get_current_user_role() = 'owner'
        OR cashier_id = auth.uid()
    );

-- TRANSACTION ITEMS POLICIES
DROP POLICY IF EXISTS "Cashiers can insert items" ON transaction_items;
CREATE POLICY "Cashiers can insert items"
    ON transaction_items FOR INSERT
    TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "View transaction items based on role" ON transaction_items;
CREATE POLICY "View transaction items based on role"
    ON transaction_items FOR SELECT
    TO authenticated
    USING (
        get_current_user_role() = 'owner'
        OR EXISTS (
            SELECT 1 FROM transactions t
            WHERE t.id = transaction_items.transaction_id
            AND t.cashier_id = auth.uid()
        )
    );

-- ============================================================================
-- 10. SEED INITIAL DATA (Bahan Bangunan Realistis)
-- ============================================================================
INSERT INTO categories (id, name) VALUES
    ('c1111111-1111-1111-1111-111111111111', 'Semen & Pasir'),
    ('c2222222-2222-2222-2222-222222222222', 'Besi & Baja'),
    ('c3333333-3333-3333-3333-333333333333', 'Pipa & Plumbing'),
    ('c4444444-4444-4444-4444-444444444444', 'Kelistrikan'),
    ('c5555555-5555-5555-5555-555555555555', 'Cat & Pelapis'),
    ('c6666666-6666-6666-6666-666666666666', 'Kayu & Papan')
ON CONFLICT (name) DO NOTHING;

INSERT INTO products (sku, name, category_id, unit, cost_price, selling_price, stock, min_stock, is_active) VALUES
    ('SMN-001', 'Semen Gresik 40kg', 'c1111111-1111-1111-1111-111111111111', 'Sak', 52000, 60000, 85, 15, true),
    ('SMN-002', 'Semen Tiga Roda 50kg', 'c1111111-1111-1111-1111-111111111111', 'Sak', 65000, 74000, 110, 20, true),
    ('PSR-001', 'Pasir Cor Merapi (Kubik)', 'c1111111-1111-1111-1111-111111111111', 'Kubik', 220000, 280000, 24.5, 5, true),
    ('BTA-001', 'Bata Ringan / Hebel 10cm', 'c1111111-1111-1111-1111-111111111111', 'Kubik', 540000, 630000, 18.0, 4, true),
    ('BSI-001', 'Besi Beton Ulir 10mm SNI', 'c2222222-2222-2222-2222-222222222222', 'Batang', 72000, 85000, 150, 30, true),
    ('BSI-002', 'Besi Beton Polos 8mm SNI', 'c2222222-2222-2222-2222-222222222222', 'Batang', 46000, 55000, 210, 40, true),
    ('PPA-001', 'Pipa PVC Rucika D 3" inch (4m)', 'c3333333-3333-3333-3333-333333333333', 'Batang', 95000, 118000, 42, 10, true),
    ('PPA-002', 'Pipa PVC Rucika AW 1/2" inch (4m)', 'c3333333-3333-3333-3333-333333333333', 'Batang', 28000, 36000, 95, 15, true),
    ('KBL-001', 'Kabel Listrik NYM Eterna 2x1.5', 'c4444444-4444-4444-4444-444444444444', 'Meter', 9500, 13500, 185.5, 25, true),
    ('KBL-002', 'Kabel Listrik NYA Eterna 1x2.5 (100m)', 'c4444444-4444-4444-4444-444444444444', 'Roll', 280000, 340000, 14, 3, true),
    ('CAT-001', 'Cat Tembok Dulux Catylac 25kg Putih', 'c5555555-5555-5555-5555-555555555555', 'Pail', 580000, 690000, 12, 3, true),
    ('CAT-002', 'Cat Avian Kayu & Besi 1kg Hitam', 'c5555555-5555-5555-5555-555555555555', 'Kaleng', 62000, 75000, 38, 8, true),
    ('KYU-001', 'Triplek Meranti 9mm (122x244)', 'c6666666-6666-6666-6666-666666666666', 'Lembar', 105000, 130000, 60, 10, true),
    ('PKU-001', 'Paku Kayu Campur 5cm - 7cm', 'c6666666-6666-6666-6666-666666666666', 'Kg', 18000, 24000, 85.5, 15, true)
ON CONFLICT DO NOTHING;
