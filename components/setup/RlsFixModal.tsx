// components/setup/RlsFixModal.tsx
'use client';

import React, { useState } from 'react';
import { Database, Copy, Check, X, Terminal, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface RlsFixModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export const RlsFixModal: React.FC<RlsFixModalProps> = ({ isOpen, onClose, onRefresh }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sqlCode = `-- SCRIPT PERBAIKAN RLS AGAR DATA 'products' MUNCUL & SINKRON DI APLIKASI
-- Salin dan jalankan script ini di Supabase SQL Editor:

-- 1. Izin baca & kelola tabel products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Everyone authenticated can view active products" ON public.products;
DROP POLICY IF EXISTS "Allow public read active products" ON public.products;
DROP POLICY IF EXISTS "Admins and Owners can insert/update products" ON public.products;
DROP POLICY IF EXISTS "Allow public manage products" ON public.products;

CREATE POLICY "Allow public read active products"
    ON public.products FOR SELECT TO public USING (true);

CREATE POLICY "Allow public manage products"
    ON public.products FOR ALL TO public USING (true) WITH CHECK (true);

-- 2. Izin baca & kelola tabel categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Everyone authenticated can view categories" ON public.categories;
DROP POLICY IF EXISTS "Allow public read categories" ON public.categories;
DROP POLICY IF EXISTS "Admins and Owners can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Allow public manage categories" ON public.categories;

CREATE POLICY "Allow public read categories"
    ON public.categories FOR SELECT TO public USING (true);

CREATE POLICY "Allow public manage categories"
    ON public.categories FOR ALL TO public USING (true) WITH CHECK (true);

-- 3. Izin transaksi kasir
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public manage transactions" ON public.transactions;
CREATE POLICY "Allow public manage transactions"
    ON public.transactions FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public manage items" ON public.transaction_items;
CREATE POLICY "Allow public manage items"
    ON public.transaction_items FOR ALL TO public USING (true) WITH CHECK (true);

-- 4. Izin profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read profiles" ON public.profiles;
CREATE POLICY "Allow public read profiles"
    ON public.profiles FOR ALL TO public USING (true) WITH CHECK (true);`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden text-white flex flex-col my-auto">
        {/* Header */}
        <div className="p-4 bg-slate-850 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Sinkronisasi Database Supabase</h2>
              <p className="text-xs text-slate-400">
                Solusi membuka izin baca Row Level Security (RLS) pada tabel products
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Explanation Alert */}
          <div className="p-3.5 bg-amber-950/40 border border-amber-800/80 rounded-xl text-xs space-y-1.5 text-amber-200">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Penyebab Data Tabel &quot;products&quot; Belum Tampil:</span>
            </div>
            <p className="leading-relaxed">
              Tabel <code>products</code> di Supabase memiliki aturan RLS dengan hak akses terbatas 
              (<code>TO authenticated</code>). Karena query web/kasir menghubungkan dengan kunci API anonim (<code>anon</code>), 
              PostgreSQL secara otomatis menyembunyikan seluruh baris data.
            </p>
            <p className="font-semibold text-emerald-300">
              ✓ Cukup jalankan script SQL di bawah ini di Supabase SQL Editor untuk mengizinkan aplikasi membaca & menyinkronkan seluruh produk!
            </p>
          </div>

          {/* Action Steps */}
          <div className="text-xs text-slate-300 space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="font-bold text-white mb-1">Langkah 1 Menit:</div>
            <div>1. Klik tombol <strong>Salin Script SQL</strong> di bawah.</div>
            <div>2. Buka dashboard Supabase Anda &gt; menu <strong>SQL Editor</strong> &gt; klik <strong>New Query</strong>.</div>
            <div>3. Tempel (Paste) script tersebut lalu klik <strong>Run</strong>.</div>
            <div>4. Kembali ke halaman ini dan klik tombol <strong>Refresh Data</strong> di bawah.</div>
          </div>

          {/* SQL Snippet */}
          <div className="relative">
            <div className="flex justify-between items-center bg-slate-950 px-3.5 py-2 rounded-t-xl border border-b-0 border-slate-800 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                fix_products_sync.sql
              </span>
              <button
                onClick={handleCopy}
                className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
              </button>
            </div>
            <pre className="p-3.5 bg-slate-950 text-emerald-300 font-mono text-[11px] rounded-b-xl border border-slate-800 overflow-x-auto max-h-56 leading-relaxed">
              {sqlCode}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-850 border-t border-slate-800 flex justify-between items-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
          >
            Tutup
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Berhasil Disalin!' : 'Salin Script SQL'}</span>
            </button>

            {onRefresh && (
              <button
                onClick={() => {
                  onRefresh();
                  onClose();
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold shadow-lg flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Refresh & Cek Sinkronisasi</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
