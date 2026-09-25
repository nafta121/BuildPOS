// components/auth/LoginPage.tsx
'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { signInAction } from '@/app/actions/auth';
import { 
  Hammer, 
  Lock, 
  Mail, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  ShieldCheck, 
  UserCheck,
  Building2,
  KeyRound
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await signInAction({ email, password });
      if (res.success && res.profile) {
        login(res.profile);
      } else {
        setErrorMessage(res.error || 'Login gagal. Periksa email dan password Anda.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kendala saat menghubungi server.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (quickEmail: string) => {
    setEmail(quickEmail);
    setPassword('123456');
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await signInAction({ email: quickEmail, password: '123456' });
      if (res.success && res.profile) {
        login(res.profile);
      } else {
        setErrorMessage(res.error || 'Login gagal.');
      }
    } catch (err: unknown) {
      setErrorMessage('Terjadi kendala koneksi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Background Subtle Accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black -z-10 pointer-events-none" />

      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-amber-500 shadow-2xl shadow-emerald-500/20 mb-4 border border-emerald-400/30">
            <Hammer className="w-8 h-8 text-slate-950" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">BuildPOS</h1>
          <p className="text-sm text-slate-400 mt-1">
            Point of Sale & Inventaris Khusus <strong className="text-amber-400">Toko Bangunan</strong>
          </p>
          <div className="inline-block mt-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-xs font-semibold text-slate-300">
            TB. Makmur Jaya
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Masuk ke Sistem</h2>
            <p className="text-xs text-slate-400 mt-1">
              Silakan login dengan akun Kasir, Admin Gudang, atau Owner.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 bg-rose-950/70 border border-rose-800/80 rounded-xl flex items-start gap-2.5 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                Email Pengguna
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="kasir@buildpos.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Password default akun awal: <strong className="text-slate-300 font-mono">123456</strong>
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-950 transition flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Aplikasi</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Role Login Presets */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3 text-center">
              Akses Cepat Pengujian (1-Klik):
            </span>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('kasir@buildpos.com')}
                disabled={isLoading}
                className="w-full p-2.5 bg-slate-950 hover:bg-slate-800 border border-emerald-500/40 hover:border-emerald-500 rounded-xl text-left flex items-center justify-between text-xs transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    K
                  </div>
                  <div>
                    <div className="font-bold text-white group-hover:text-emerald-300">
                      Budi Santoso (Kasir)
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      kasir@buildpos.com
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  Hanya POS & Struk
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@buildpos.com')}
                disabled={isLoading}
                className="w-full p-2.5 bg-slate-950 hover:bg-slate-800 border border-blue-500/40 hover:border-blue-500 rounded-xl text-left flex items-center justify-between text-xs transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                    A
                  </div>
                  <div>
                    <div className="font-bold text-white group-hover:text-blue-300">
                      Agus Setiawan (Gudang)
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      admin@buildpos.com
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                  Gudang & Master Stok
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('owner@buildpos.com')}
                disabled={isLoading}
                className="w-full p-2.5 bg-slate-950 hover:bg-slate-800 border border-amber-500/40 hover:border-amber-500 rounded-xl text-left flex items-center justify-between text-xs transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                    O
                  </div>
                  <div>
                    <div className="font-bold text-white group-hover:text-amber-300">
                      H. Suryanto (Owner)
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      owner@buildpos.com
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                  Akses Penuh & Laba
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-xs text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Terintegrasi dengan Supabase Auth & PostgreSQL RLS</span>
        </div>
      </div>
    </div>
  );
};
