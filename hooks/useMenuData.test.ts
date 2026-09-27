// hooks/useMenuData.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// 1. Mock Supabase Client using vi.hoisted
const { mockFrom } = vi.hoisted(() => {
  const mockFrom = vi.fn();
  return { mockFrom };
});

vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: mockFrom,
  },
}));

// 2. Mock React hooks for deterministic Node environment execution
let stateStore: any[] = [];
let stateIndex = 0;
let registeredEffects: Array<() => void> = [];

vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react');
  return {
    ...actual,
    useState: (initial: any) => {
      const idx = stateIndex++;
      if (stateStore[idx] === undefined) {
        stateStore[idx] = typeof initial === 'function' ? initial() : initial;
      }
      const setState = (next: any) => {
        stateStore[idx] = typeof next === 'function' ? next(stateStore[idx]) : next;
      };
      return [stateStore[idx], setState];
    },
    useCallback: (fn: any) => fn,
    useEffect: (fn: any) => {
      registeredEffects.push(fn);
    },
  };
});

// Import hook after mock definitions
import { useMenuData } from './useMenuData';

describe('useMenuData Hook', () => {
  const mockCategories = [
    { id: 'cat-1', name: 'Semen & Pasir' },
    { id: 'cat-2', name: 'Cat & Thinner' },
  ];

  const mockMenuItems = [
    { id: 'item-1', name: 'Semen Holcim 50kg', category_id: 'cat-1', price: 72000 },
    { id: 'item-2', name: 'Cat Dulux 5kg', category_id: 'cat-2', price: 145000 },
  ];

  const mockThemeSettings = {
    id: 'theme-1',
    primary_color: '#059669',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    stateStore = [];
    stateIndex = 0;
    registeredEffects = [];

    // Default mock setup for successful Supabase queries
    mockFrom.mockImplementation((table: string) => {
      if (table === 'categories') {
        return {
          select: () => Promise.resolve({ data: mockCategories, error: null }),
        };
      }
      if (table === 'menu_items') {
        return {
          select: () => Promise.resolve({ data: mockMenuItems, error: null }),
        };
      }
      if (table === 'theme_settings') {
        return {
          select: () => ({
            single: () => Promise.resolve({ data: mockThemeSettings, error: null }),
          }),
        };
      }
      return { select: () => Promise.resolve({ data: [], error: null }) };
    });
  });

  it('harus memuat data kategori, item menu, dan themeSettings saat inisialisasi berhasil', async () => {
    // Render awal
    stateIndex = 0;
    const initialHook = useMenuData();

    expect(initialHook.loading).toBe(true);
    expect(initialHook.error).toBeNull();
    expect(initialHook.categories).toEqual([]);

    // Jalankan efek inisialisasi dan tunggu promise selesai
    expect(registeredEffects.length).toBeGreaterThan(0);
    registeredEffects[0]();
    await new Promise((resolve) => setTimeout(resolve, 15));

    // Re-render untuk membaca state terbaru
    stateIndex = 0;
    const updatedHook = useMenuData();

    expect(updatedHook.loading).toBe(false);
    expect(updatedHook.error).toBeNull();
    expect(updatedHook.categories).toEqual(mockCategories);
    expect(updatedHook.menuItems).toEqual(mockMenuItems);
    expect(updatedHook.themeSettings).toEqual(mockThemeSettings);
    expect(updatedHook.data.categories).toEqual(mockCategories);

    // Verifikasi query Supabase
    expect(mockFrom).toHaveBeenCalledWith('categories');
    expect(mockFrom).toHaveBeenCalledWith('menu_items');
    expect(mockFrom).toHaveBeenCalledWith('theme_settings');
  });

  it('harus menangani error ketika query Supabase gagal', async () => {
    const dbError = new Error('Koneksi database timeout');
    mockFrom.mockImplementation((table: string) => {
      if (table === 'categories') {
        return { select: () => Promise.resolve({ data: null, error: dbError }) };
      }
      if (table === 'menu_items') {
        return { select: () => Promise.resolve({ data: [], error: null }) };
      }
      if (table === 'theme_settings') {
        return {
          select: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
          }),
        };
      }
      return { select: () => Promise.resolve({ data: null, error: null }) };
    });

    stateIndex = 0;
    const hook = useMenuData();
    registeredEffects[0]();
    await new Promise((resolve) => setTimeout(resolve, 15));

    stateIndex = 0;
    const updatedHook = useMenuData();

    expect(updatedHook.loading).toBe(false);
    expect(updatedHook.error).toBeDefined();
    expect(updatedHook.error?.message).toMatch(/Koneksi database timeout/i);
    expect(updatedHook.categories).toEqual([]);
  });

  it('harus aman menangani response data bernilai null dengan fallback default', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'categories' || table === 'menu_items') {
        return { select: () => Promise.resolve({ data: null, error: null }) };
      }
      if (table === 'theme_settings') {
        return {
          select: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
          }),
        };
      }
      return { select: () => Promise.resolve({ data: null, error: null }) };
    });

    stateIndex = 0;
    const hook = useMenuData();
    registeredEffects[0]();
    await new Promise((resolve) => setTimeout(resolve, 15));

    stateIndex = 0;
    const updatedHook = useMenuData();

    expect(updatedHook.loading).toBe(false);
    expect(updatedHook.error).toBeNull();
    expect(updatedHook.categories).toEqual([]);
    expect(updatedHook.menuItems).toEqual([]);
    expect(updatedHook.themeSettings).toBeNull();
  });

  it('harus mendukung pemanggilan manual refetch() untuk memperbarui data', async () => {
    stateIndex = 0;
    const hook = useMenuData();
    await hook.refetch();

    // Mock data baru untuk refetch
    const newCategories = [{ id: 'cat-99', name: 'Kayu & Balok' }];
    mockFrom.mockImplementation((table: string) => {
      if (table === 'categories') {
        return { select: () => Promise.resolve({ data: newCategories, error: null }) };
      }
      if (table === 'menu_items') {
        return { select: () => Promise.resolve({ data: [], error: null }) };
      }
      if (table === 'theme_settings') {
        return {
          select: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
          }),
        };
      }
      return { select: () => Promise.resolve({ data: [], error: null }) };
    });

    await hook.refetch();

    stateIndex = 0;
    const refreshedHook = useMenuData();
    expect(refreshedHook.categories).toEqual(newCategories);
  });
});
