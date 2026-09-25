# BuildPOS - MVP Point of Sale Toko Bangunan

Aplikasi Point of Sale (POS) dan manajemen inventaris berbasis web yang dirancang khusus untuk toko bangunan. Mendukung transaksi dengan satuan desimal (meter, kubik) dan UI yang mobile-friendly.

## Tech Stack
- Frontend: Next.js (App Router), React, Tailwind CSS
- State Management: Zustand (Client-side dengan persist localStorage)
- Backend & Database: Supabase (PostgreSQL, Auth, RLS)
- UI Components: Lucide React (Icons)

## Fitur Utama MVP
1. Transaksi Kasir (Mendukung input Qty Desimal & Numpad Virtual)
2. Manajemen Stok (Admin Gudang)
3. Pengurangan Stok Otomatis (PostgreSQL Trigger)
4. Dashboard & Laporan Laba Kotor (Owner)
