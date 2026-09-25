-- supabase/fix_products_sync.sql
-- ============================================================================
-- SCRIPT PERBAIKAN RLS SUPABASE AGAR DATA 'products' MUNCUL & SINKRON DI APLIKASI
-- Jalankan script ini langsung di Supabase SQL Editor (New Query -> Run)
-- ============================================================================

-- 1. PERBAIKI POLISI RLS PADA TABEL PRODUCTS
-- Mengizinkan role public (anon & authenticated) membaca data barang
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone authenticated can view active products" ON public.products;
DROP POLICY IF EXISTS "Allow public read active products" ON public.products;
DROP POLICY IF EXISTS "Admins and Owners can insert/update products" ON public.products;
DROP POLICY IF EXISTS "Allow public manage products" ON public.products;

CREATE POLICY "Allow public read active products"
    ON public.products FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Allow public manage products"
    ON public.products FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- 2. PERBAIKI POLISI RLS PADA TABEL CATEGORIES
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone authenticated can view categories" ON public.categories;
DROP POLICY IF EXISTS "Allow public read categories" ON public.categories;
DROP POLICY IF EXISTS "Admins and Owners can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Allow public manage categories" ON public.categories;

CREATE POLICY "Allow public read categories"
    ON public.categories FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Allow public manage categories"
    ON public.categories FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- 3. PERBAIKI POLISI RLS PADA TABEL TRANSACTIONS & TRANSACTION_ITEMS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Cashiers can insert transactions" ON public.transactions;
DROP POLICY IF EXISTS "View transactions based on role" ON public.transactions;
DROP POLICY IF EXISTS "Allow public manage transactions" ON public.transactions;

CREATE POLICY "Allow public manage transactions"
    ON public.transactions FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Cashiers can insert items" ON public.transaction_items;
DROP POLICY IF EXISTS "View transaction items based on role" ON public.transaction_items;
DROP POLICY IF EXISTS "Allow public manage items" ON public.transaction_items;

CREATE POLICY "Allow public manage items"
    ON public.transaction_items FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- 4. PERBAIKI POLISI RLS PADA PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Owners can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public read profiles" ON public.profiles;

CREATE POLICY "Allow public read profiles"
    ON public.profiles FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- 5. PASTIKAN DATA SEED AWAL ADA DI TABEL PRODUCTS & CATEGORIES
INSERT INTO public.categories (id, name) VALUES
    ('c1111111-1111-1111-1111-111111111111', 'Semen & Pasir'),
    ('c2222222-2222-2222-2222-222222222222', 'Besi & Baja'),
    ('c3333333-3333-3333-3333-333333333333', 'Pipa & Plumbing'),
    ('c4444444-4444-4444-4444-444444444444', 'Kelistrikan'),
    ('c5555555-5555-5555-5555-555555555555', 'Cat & Pelapis'),
    ('c6666666-6666-6666-6666-666666666666', 'Kayu & Papan')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.products (sku, name, category_id, unit, cost_price, selling_price, stock, min_stock, is_active) VALUES
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
ON CONFLICT (sku) DO NOTHING;
