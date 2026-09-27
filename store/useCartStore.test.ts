// store/useCartStore.test.ts
import { describe, it, expect } from 'vitest';
import { round2, calcSubtotal } from './useCartStore';

describe('useCartStore Math Helpers', () => {
  it('round2 correctly handles standard rounding and floating-point edge cases', () => {
    expect(round2(10.123)).toBe(10.12);
    expect(round2(10.005)).toBe(10.01);
    expect(round2(0.1 + 0.2)).toBe(0.3);
  });

  it('calcSubtotal accurately calculates empty cart arrays and multiple decimal items', () => {
    expect(calcSubtotal([])).toBe(0);
    expect(
      calcSubtotal([
        { price: 10.99, qty: 2 },
        { price: 5.50, qty: 1 },
      ])
    ).toBe(27.48);
  });
});
