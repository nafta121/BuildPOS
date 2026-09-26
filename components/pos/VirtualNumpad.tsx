// components/pos/VirtualNumpad.tsx
'use client';

import React from 'react';
import { Delete, Check, RotateCcw } from 'lucide-react';

export interface VirtualNumpadProps {
  value?: string;
  onChange?: (val: string) => void;
  onKeyPress?: (key: string) => void;
  onDelete?: () => void;
  onClear?: () => void;
  onEnter?: () => void;
  disableDecimal?: boolean;
  title?: string;
  unit?: string;
  mode?: 'qty' | 'currency';
  quickPresets?: number[];
  onPresetClick?: (delta: number) => void;
}

export const VirtualNumpad: React.FC<VirtualNumpadProps> = ({
  value = '',
  onChange,
  onKeyPress,
  onDelete,
  onClear,
  onEnter,
  disableDecimal = false,
  title = 'Numpad Virtual',
  unit = '',
  mode = 'qty',
  quickPresets,
  onPresetClick,
}) => {
  const handleDigit = (digit: string) => {
    if (onKeyPress) {
      onKeyPress(digit);
    }

    if (!onChange) return;

    if (digit === '.') {
      if (disableDecimal) return;
      if (value.includes('.')) return; // Prevent multiple decimal points
      onChange(value === '' ? '0.' : value + '.');
      return;
    }

    if (value === '0') {
      onChange(digit);
    } else {
      onChange(value + digit);
    }
  };

  const handleBackspace = () => {
    if (onDelete) {
      onDelete();
    }
    if (onChange) {
      if (value.length <= 1) {
        onChange('');
      } else {
        onChange(value.slice(0, -1));
      }
    }
  };

  const handleReset = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange('');
    }
  };

  // Preset default kuantitas pecahan (toko bangunan) & mata uang tunai
  const defaultQtyPresets = [0.5, 1, 2, 5, 10];
  const defaultCashPresets = [50000, 100000, 200000, 500000];

  const presetsToUse = quickPresets || (mode === 'qty' ? defaultQtyPresets : defaultCashPresets);

  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-3 sm:p-4 text-white shadow-xl select-none">
      {/* Title & Display Header */}
      <div className="mb-3">
        <div className="flex justify-between items-center text-xs text-slate-400 font-medium mb-1 uppercase tracking-wider">
          <span>{title}</span>
          {unit && (
            <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-[11px] font-bold border border-amber-500/30">
              Satuan: {unit}
            </span>
          )}
        </div>

        {/* Fat-Finger Display */}
        <div className="bg-slate-950 border-2 border-emerald-500/40 rounded-lg p-2.5 sm:p-3 text-right">
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-wider overflow-x-auto whitespace-nowrap">
            {mode === 'currency' ? (
              <span>Rp {value ? Number(value).toLocaleString('id-ID') : '0'}</span>
            ) : (
              <span>
                {value || '0'} {unit}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Presets Row (Fat-finger friendly untuk kondisi lapangan) */}
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 mb-2.5">
        {presetsToUse.map((preset) => {
          const label =
            mode === 'currency'
              ? `${preset / 1000}rb`
              : preset % 1 !== 0
              ? `+${preset}`
              : `+${preset}`;

          return (
            <button
              key={preset}
              type="button"
              aria-label={
                mode === 'currency'
                  ? `Atur nilai ${preset.toLocaleString('id-ID')} rupiah`
                  : `Tambah ${preset} ${unit}`.trim()
              }
              onClick={() => {
                if (onPresetClick) {
                  onPresetClick(preset);
                } else if (onChange) {
                  if (mode === 'qty') {
                    const currentNum = parseFloat(value || '0');
                    const nextNum = Number((currentNum + preset).toFixed(2));
                    onChange(nextNum.toString());
                  } else {
                    onChange(preset.toString());
                  }
                }
              }}
              className="py-2 px-1 text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 active:bg-amber-600 text-amber-300 hover:text-white rounded border border-slate-700 active:scale-95 transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Main 4x3 Grid (Big Tactile Keys) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
        {['7', '8', '9', '4', '5', '6', '1', '2', '3'].map((digit) => (
          <button
            key={digit}
            type="button"
            aria-label={`Angka ${digit}`}
            onClick={() => handleDigit(digit)}
            className="h-12 sm:h-14 bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 text-white active:text-white text-xl sm:text-2xl font-bold rounded-lg border border-slate-700 shadow-sm active:scale-95 transition-all flex items-center justify-center focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
          >
            {digit}
          </button>
        ))}

        {/* Decimal Point Button (Pecahan material: 0.5 kubik, 1.5 meter) */}
        <button
          type="button"
          aria-label="Titik desimal"
          disabled={disableDecimal}
          onClick={() => handleDigit('.')}
          className={`h-12 sm:h-14 bg-slate-800 hover:bg-slate-700 active:bg-amber-600 text-amber-400 text-2xl font-black rounded-lg border border-slate-700 shadow-sm active:scale-95 transition-all flex items-center justify-center focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${
            disableDecimal ? 'opacity-40 cursor-not-allowed' : ''
          }`}
          title={disableDecimal ? 'Desimal dinonaktifkan' : 'Titik Desimal'}
        >
          .
        </button>

        {/* Zero */}
        <button
          type="button"
          aria-label="Angka 0"
          onClick={() => handleDigit('0')}
          className="h-12 sm:h-14 bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 text-white text-xl sm:text-2xl font-bold rounded-lg border border-slate-700 shadow-sm active:scale-95 transition-all flex items-center justify-center focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
        >
          0
        </button>

        {/* Backspace */}
        <button
          type="button"
          aria-label="Hapus satu karakter"
          onClick={handleBackspace}
          className="h-12 sm:h-14 bg-rose-950/60 hover:bg-rose-900 active:bg-rose-700 text-rose-300 text-lg font-bold rounded-lg border border-rose-800/50 shadow-sm active:scale-95 transition-all flex items-center justify-center focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none"
          title="Hapus Satu Karakter"
        >
          <Delete className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Control Actions Row (Clear & Enter) */}
      <div className="grid grid-cols-2 gap-2 sm:gap-2.5 mt-2.5">
        <button
          type="button"
          aria-label="Reset input numpad"
          onClick={handleReset}
          className="h-11 sm:h-12 bg-slate-800 hover:bg-rose-900/70 text-slate-300 hover:text-white font-bold rounded-lg border border-slate-700 active:scale-95 transition flex items-center justify-center gap-1.5 text-sm focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset / C</span>
        </button>

        <button
          type="button"
          aria-label="Selesai input numpad"
          onClick={onEnter}
          className="h-11 sm:h-12 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-lg shadow-lg active:scale-95 transition flex items-center justify-center gap-1.5 text-sm focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
        >
          <Check className="w-5 h-5" />
          <span>Selesai (OK)</span>
        </button>
      </div>
    </div>
  );
};
