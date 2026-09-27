// app/actions/products.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dbStore } from '@/lib/db-store';

// Gunakan vi.hoisted agar mock instances diinisialisasi sebelum module hoisting
const {
  mockCreateClient,
  mockIsSupabaseConfigured,
  mockFrom,
  mockInsert,
  mockUpdate,
  mockCookies,
  mockSingle,
} = vi.hoisted(() => {
  const mockSingle = vi.fn();
  const mockSelect = vi.fn(() => ({ single: mockSingle }));
  const mockEq = vi.fn(() => ({ select: mockSelect }));
  const mockInsert = vi.fn(() => ({ select: mockSelect }));
  const mockUpdate = vi.fn(() => ({ eq: mockEq }));

  const mockFrom = vi.fn(() => ({
    insert: mockInsert,
    update: mockUpdate,
  }));

  const mockSupabaseClient = {
    from: mockFrom,
  };

  const mockCreateClient = vi.fn(() => mockSupabaseClient);
  const mockIsSupabaseConfigured = vi.fn(() => true);
  const mockCookies = vi.fn(() => ({
    getAll: vi.fn().mockReturnValue([]),
    set: vi.fn(),
  }));

  return {
    mockCreateClient,
    mockIsSupabaseConfigured,
    mockFrom,
    mockInsert,
    mockUpdate,
    mockCookies,
    mockSingle,
  };
});

vi.mock('next/headers', () => ({
  cookies: () => mockCookies(),
}));

vi.mock('@/utils/supabase/server', () => ({
  createClient: mockCreateClient,
  isSupabaseConfigured: mockIsSupabaseConfigured,
}));

// Import modul target setelah deklarasi mock
import { saveProductAction, ProductFormData } from './products';

describe('RBAC Security: saveProductAction (Kasir Role Restriction)', () => {
  const mockProductPayload: ProductFormData = {
    name: 'Semen Holcim 50kg',
    sku: 'SMN-HLC-50',
    category_id: 'cat-semen-1',
    unit: 'sak',
    cost_price: 65000,
    selling_price: 72000,
    stock: 100,
    min_stock: 10,
    is_active: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('harus menolak akses role "kasir" dengan early return dan pesan unauthorized', async () => {
    // Act: Eksekusi Server Action dengan role 'kasir'
    const result = await saveProductAction(mockProductPayload, 'kasir');

    // Assert 1: Penolakan dini (Early Return)
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toMatch(/akses ditolak|tidak diizinkan/i);
    expect(result.data).toBeUndefined();

    // Assert 2: Verifikasi 0 interaksi dengan layer database (Supabase createClient & query builder)
    expect(mockCreateClient).toHaveBeenCalledTimes(0);
    expect(mockFrom).toHaveBeenCalledTimes(0);
    expect(mockInsert).toHaveBeenCalledTimes(0);
    expect(mockUpdate).toHaveBeenCalledTimes(0);

    // Assert 3: Verifikasi fungsi cookies session tidak disentuh
    expect(mockCookies).toHaveBeenCalledTimes(0);
  });

  it('harus memastikan database in-memory fallback (dbStore) tidak terpengaruh saat kasir ditolak', async () => {
    const initialProductCount = dbStore.products.length;

    // Act
    const result = await saveProductAction(mockProductPayload, 'kasir');

    // Assert: Operasi ditolak dan data lokal tidak bertambah
    expect(result.success).toBe(false);
    expect(dbStore.products.length).toBe(initialProductCount);

    // Pastikan item payload tidak terselip ke dalam database
    const found = dbStore.products.find((p) => p.sku === mockProductPayload.sku);
    expect(found).toBeUndefined();
  });

  it('memverifikasi bahwa role "admin" atau "owner" diizinkan melewati RBAC guard', async () => {
    mockSingle.mockResolvedValueOnce({
      data: {
        id: 'prod-new-1',
        ...mockProductPayload,
      },
      error: null,
    });

    // Act: Eksekusi dengan role berwenang 'admin'
    const result = await saveProductAction(mockProductPayload, 'admin');

    // Assert: RBAC guard lolos dan memanggil database
    expect(result.success).toBe(true);
    expect(mockCreateClient).toHaveBeenCalledTimes(1);
    expect(mockFrom).toHaveBeenCalledWith('products');
    expect(mockInsert).toHaveBeenCalledTimes(1);
  });
});
