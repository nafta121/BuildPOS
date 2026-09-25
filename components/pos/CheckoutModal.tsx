// components/pos/CheckoutModal.tsx
'use client';

import React, { useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { checkoutAction } from '@/app/actions/pos';
import { PaymentMethod, Transaction } from '@/types/database';
import { VirtualNumpad } from './VirtualNumpad';
import { Check, X, CreditCard, Banknote, AlertCircle, Loader2 } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (transaction: Transaction) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { items, getTotalAmount, clearCart } = useCartStore();
  const { currentProfile } = useAuthStore();

  const totalAmount = getTotalAmount();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('tunai');
  const [amountPaidStr, setAmountPaidStr] = useState<string>(totalAmount.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const amountPaidNum = parseFloat(amountPaidStr || '0');
  const changeAmount = amountPaidNum - totalAmount;
  const isSufficient = amountPaidNum >= totalAmount;

  // Preset cash values
  const cashSuggestions = [
    { label: 'Uang Pas', value: totalAmount },
    { label: 'Rp 50.000', value: 50000 },
    { label: 'Rp 100.000', value: 100000 },
    { label: 'Rp 200.000', value: 200000 },
    { label: 'Rp 500.000', value: 500000 },
  ].filter((s) => s.value >= totalAmount || s.label === 'Uang Pas');

  const handleCheckout = async () => {
    if (!isSufficient && paymentMethod === 'tunai') {
      setErrorMessage(`Uang pembayaran kurang Rp ${Math.abs(changeAmount).toLocaleString('id-ID')}`);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const finalAmountPaid = paymentMethod === 'transfer' ? totalAmount : amountPaidNum;

      const result = await checkoutAction({
        cashierId: currentProfile?.id || '',
        cashierRole: currentProfile?.role || 'kasir',
        paymentMethod,
        amountPaid: finalAmountPaid,
        items: items.map((i) => ({
          productId: i.id,
          quantity: i.cart_quantity,
        })),
      });

      if (!result.success || !result.transaction) {
        setErrorMessage(result.error || 'Terjadi kesalahan saat memproses checkout.');
        setIsSubmitting(false);
        return;
      }

      // Success: clear cart and trigger receipt view
      clearCart();
      onSuccess(result.transaction);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Koneksi checkout gagal.';
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden text-white flex flex-col my-auto max-h-[95vh]">
        {/* Header */}
        <div className="p-4 bg-slate-800/90 border-b border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Pembayaran Kasir</h2>
              <p className="text-xs text-slate-400">
                Kasir: {currentProfile?.full_name || 'Kasir'} ({currentProfile?.role?.toUpperCase() || 'KASIR'})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Grid */}
        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-5 overflow-y-auto">
          {/* Left Column: Summary & Payment Method */}
          <div className="space-y-4">
            {/* Total Bill Card */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-semibold">Total Tagihan</span>
              <div className="text-3xl font-black text-emerald-400 tracking-tight mt-1 font-mono">
                Rp {totalAmount.toLocaleString('id-ID')}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {items.length} jenis barang ({items.reduce((acc, i) => acc + i.cart_quantity, 0)} total kuantitas)
              </p>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2 uppercase">
                Metode Pembayaran
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('tunai');
                    setAmountPaidStr(totalAmount.toString());
                  }}
                  className={`p-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition ${
                    paymentMethod === 'tunai'
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/30'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  <Banknote className="w-5 h-5" />
                  <span>Tunai / Cash</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('transfer');
                    setAmountPaidStr(totalAmount.toString());
                  }}
                  className={`p-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition ${
                    paymentMethod === 'transfer'
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/30'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Transfer Bank / QRIS</span>
                </button>
              </div>
            </div>

            {/* Quick Cash Presets */}
            {paymentMethod === 'tunai' && (
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-2 uppercase">
                  Pilihan Uang Cepat (Fat-Finger)
                </label>
                <div className="flex flex-wrap gap-2">
                  {cashSuggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAmountPaidStr(sug.value.toString())}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 active:bg-amber-600 text-xs sm:text-sm font-bold text-amber-300 hover:text-white rounded-lg border border-slate-700 transition"
                    >
                      {sug.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Kembalian Calculation */}
            {paymentMethod === 'tunai' && (
              <div
                className={`p-3.5 rounded-xl border ${
                  isSufficient
                    ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                }`}
              >
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span>{isSufficient ? 'Uang Kembalian:' : 'Uang Kurang:'}</span>
                  <span className="text-xl font-mono font-black">
                    Rp {Math.abs(changeAmount).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 bg-rose-950/70 border border-rose-800 rounded-lg flex items-center gap-2 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Right Column: Virtual Numpad for Cash Input */}
          <div className="flex flex-col justify-between">
            {paymentMethod === 'tunai' ? (
              <VirtualNumpad
                value={amountPaidStr}
                onChange={(val) => setAmountPaidStr(val)}
                title="Input Uang Diterima"
                mode="currency"
                onEnter={handleCheckout}
                onClear={() => setAmountPaidStr('')}
              />
            ) : (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center text-center space-y-3 h-full">
                <CreditCard className="w-12 h-12 text-blue-400" />
                <h3 className="font-bold text-white text-base">Pembayaran Non-Tunai / Transfer</h3>
                <p className="text-xs text-slate-400 max-w-xs">
                  Pastikan dana transfer / QRIS sebesar{' '}
                  <strong className="text-emerald-400">Rp {totalAmount.toLocaleString('id-ID')}</strong>{' '}
                  telah masuk ke rekening toko.
                </p>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 w-full text-left">
                  BCA: 8820-9912-33 (TB. Makmur Jaya)<br />
                  Mandiri: 1370-0012-9988
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-800/90 border-t border-slate-700 flex justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-3 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 font-bold text-sm transition"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleCheckout}
            disabled={isSubmitting || (!isSufficient && paymentMethod === 'tunai')}
            className="flex-1 py-3 px-6 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-base rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Memproses Transaksi...</span>
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                <span>
                  {paymentMethod === 'tunai'
                    ? `Konfirmasi Bayar & Cetak Nota`
                    : `Selesaikan Transfer (Rp ${totalAmount.toLocaleString('id-ID')})`}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
