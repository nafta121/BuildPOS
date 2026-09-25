// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BuildPOS - Toko Bangunan POS & Inventory',
  description:
    'Aplikasi Point of Sale (POS) MVP dan manajemen inventaris cerdas khusus Toko Bangunan dengan dukungan kuantitas desimal, kasir fat-finger, cetak struk thermal, dan role-based access control.',
  openGraph: {
    title: 'BuildPOS - Toko Bangunan POS & Inventory',
    description:
      'Aplikasi Point of Sale (POS) MVP dan manajemen inventaris cerdas khusus Toko Bangunan dengan dukungan kuantitas desimal, kasir fat-finger, cetak struk thermal, dan role-based access control.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased select-none">
        {children}
      </body>
    </html>
  );
}
