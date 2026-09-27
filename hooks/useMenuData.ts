// hooks/useMenuData.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface Category {
  id: string;
  name: string;
  [key: string]: any;
}

export interface MenuItem {
  id: string;
  name: string;
  category_id?: string;
  price?: number;
  [key: string]: any;
}

export interface ThemeSettings {
  id?: string;
  primary_color?: string;
  [key: string]: any;
}

export interface MenuData {
  categories: Category[];
  menuItems: MenuItem[];
  themeSettings: ThemeSettings | null;
}

export const useMenuData = () => {
  const [data, setData] = useState<MenuData>({ categories: [], menuItems: [], themeSettings: null });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [categoriesRes, menuItemsRes, themeRes] = await Promise.all([
        supabase.from('categories').select('*'),
        supabase.from('menu_items').select('*'),
        supabase.from('theme_settings').select('*').single(),
      ]);

      if (categoriesRes.error) throw categoriesRes.error;
      if (menuItemsRes.error) throw menuItemsRes.error;

      setData({
        categories: categoriesRes.data || [],
        menuItems: menuItemsRes.data || [],
        themeSettings: themeRes.data || null,
      });
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(err?.message || 'Failed to fetch menu data'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    categories: data.categories,
    menuItems: data.menuItems,
    themeSettings: data.themeSettings,
    loading,
    error,
    refetch: fetchData,
  };
};
