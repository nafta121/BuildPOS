-- supabase/create_users.sql
-- Script untuk membuat 3 akun pengguna bawaan:
-- 1. Kasir: kasir@buildpos.com | Password: 123456
-- 2. Admin Gudang: admin@buildpos.com | Password: 123456
-- 3. Owner Toko: owner@buildpos.com | Password: 123456
-- Siap di-paste dan di-run langsung di Supabase SQL Editor!

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
    kasir_id UUID := '11111111-1111-1111-1111-111111111111';
    admin_id UUID := '22222222-2222-2222-2222-222222222222';
    owner_id UUID := '33333333-3333-3333-3333-333333333333';
    hashed_password TEXT := crypt('123456', gen_salt('bf', 10));
BEGIN
    -- 1. BUAT AKUN KASIR DI auth.users
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'kasir@buildpos.com') THEN
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            role,
            aud,
            confirmation_token
        ) VALUES (
            kasir_id,
            '00000000-0000-0000-0000-000000000000',
            'kasir@buildpos.com',
            hashed_password,
            now(),
            '{"provider":"email","providers":["email"]}'::jsonb,
            '{"full_name":"Budi Santoso (Kasir)"}'::jsonb,
            now(),
            now(),
            'authenticated',
            'authenticated',
            encode(gen_random_bytes(32), 'hex')
        );
    ELSE
        SELECT id INTO kasir_id FROM auth.users WHERE email = 'kasir@buildpos.com';
        UPDATE auth.users SET encrypted_password = hashed_password WHERE id = kasir_id;
    END IF;

    -- LINK KE public.profiles (KASIR)
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (kasir_id, 'Budi Santoso (Kasir)', 'kasir')
    ON CONFLICT (id) DO UPDATE SET 
        full_name = EXCLUDED.full_name,
        role = 'kasir';

    -- 2. BUAT AKUN ADMIN DI auth.users
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@buildpos.com') THEN
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            role,
            aud,
            confirmation_token
        ) VALUES (
            admin_id,
            '00000000-0000-0000-0000-000000000000',
            'admin@buildpos.com',
            hashed_password,
            now(),
            '{"provider":"email","providers":["email"]}'::jsonb,
            '{"full_name":"Agus Setiawan (Gudang)"}'::jsonb,
            now(),
            now(),
            'authenticated',
            'authenticated',
            encode(gen_random_bytes(32), 'hex')
        );
    ELSE
        SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@buildpos.com';
        UPDATE auth.users SET encrypted_password = hashed_password WHERE id = admin_id;
    END IF;

    -- LINK KE public.profiles (ADMIN)
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (admin_id, 'Agus Setiawan (Gudang)', 'admin')
    ON CONFLICT (id) DO UPDATE SET 
        full_name = EXCLUDED.full_name,
        role = 'admin';

    -- 3. BUAT AKUN OWNER DI auth.users
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'owner@buildpos.com') THEN
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            role,
            aud,
            confirmation_token
        ) VALUES (
            owner_id,
            '00000000-0000-0000-0000-000000000000',
            'owner@buildpos.com',
            hashed_password,
            now(),
            '{"provider":"email","providers":["email"]}'::jsonb,
            '{"full_name":"H. Suryanto (Owner)"}'::jsonb,
            now(),
            now(),
            'authenticated',
            'authenticated',
            encode(gen_random_bytes(32), 'hex')
        );
    ELSE
        SELECT id INTO owner_id FROM auth.users WHERE email = 'owner@buildpos.com';
        UPDATE auth.users SET encrypted_password = hashed_password WHERE id = owner_id;
    END IF;

    -- LINK KE public.profiles (OWNER)
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (owner_id, 'H. Suryanto (Owner)', 'owner')
    ON CONFLICT (id) DO UPDATE SET 
        full_name = EXCLUDED.full_name,
        role = 'owner';

END $$;
