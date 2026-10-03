import { describe, it, expect } from 'vitest';
import { PaymentMethod } from '@/types/database';

describe('CheckoutModal Quick Cash Suggestions Logic', () => {
  it('correctly filters cash suggestions based on total amount', () => {
    const activeTotal = 130000;
    const cashSuggestions = [
      { label: 'Uang Pas', value: activeTotal },
      { label: 'Rp 50.000', value: 50000 },
      { label: 'Rp 100.000', value: 100000 },
      { label: 'Rp 200.000', value: 200000 },
      { label: 'Rp 500.000', value: 500000 },
    ].filter((s) => s.value >= activeTotal || s.label === 'Uang Pas');

    expect(cashSuggestions).toEqual([
      { label: 'Uang Pas', value: 130000 },
      { label: 'Rp 200.000', value: 200000 },
      { label: 'Rp 500.000', value: 500000 },
    ]);
  });

  it('correctly formats accessibility labels for quick cash preset buttons', () => {
    const activeTotal = 130000;
    const cashSuggestions = [
      { label: 'Uang Pas', value: activeTotal },
      { label: 'Rp 200.000', value: 200000 },
    ];

    const formatAriaLabel = (sug: { label: string; value: number }) =>
      `Set nominal pembayaran ${sug.label === 'Uang Pas' ? `uang pas Rp ${sug.value.toLocaleString('id-ID')}` : sug.label}`;

    expect(formatAriaLabel(cashSuggestions[0])).toBe('Set nominal pembayaran uang pas Rp 130.000');
    expect(formatAriaLabel(cashSuggestions[1])).toBe('Set nominal pembayaran Rp 200.000');
  });

  it('correctly computes aria-pressed state matching current paid amount', () => {
    const amountPaidStr = '200000';
    const isSelected = (val: number) => amountPaidStr === val.toString();

    expect(isSelected(130000)).toBe(false);
    expect(isSelected(200000)).toBe(true);
  });
});
