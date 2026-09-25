// app/actions/auth.ts
'use server';

import { createClient, isSupabaseConfigured } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { Profile, Role } from '@/types/database';
import { INITIAL_PROFILES } from '@/lib/mock-data';

export interface AuthResult {
  success: boolean;
  profile?: Profile;
  error?: string;
}

export async function signInAction(formData: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  const { email, password } = formData;
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail || !password) {
    return { success: false, error: 'Email dan password wajib diisi.' };
  }

  const cookieStore = cookies();
  const useSupabase = isSupabaseConfigured();

  if (useSupabase) {
    try {
      const supabase = createClient(cookieStore);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        // If Supabase returned an error, check if this is demo fallback credentials
        console.warn('Supabase signInWithPassword error:', error.message);
      } else if (data?.user) {
        // Fetch user profile from public.profiles
        const { data: profileData, error: profileErr } = await supabase
          .from('profiles')
          .select('id, full_name, role, created_at')
          .eq('id', data.user.id)
          .single();

        if (profileData && !profileErr) {
          const profile: Profile = {
            id: profileData.id,
            full_name: profileData.full_name,
            role: profileData.role as Role,
            created_at: profileData.created_at || new Date().toISOString(),
            email: cleanEmail,
          };
          return { success: true, profile };
        }

        // Profile might be in raw_user_meta_data if profiles table row doesn't exist yet
        const metaRole = (data.user.user_metadata?.role as Role) || 'kasir';
        const metaName = data.user.user_metadata?.full_name || cleanEmail.split('@')[0];
        const profile: Profile = {
          id: data.user.id,
          full_name: metaName,
          role: metaRole,
          created_at: data.user.created_at || new Date().toISOString(),
          email: cleanEmail,
        };
        return { success: true, profile };
      }
    } catch (err: unknown) {
      console.warn('Supabase auth call exception:', err);
    }
  }

  // Predefined fallback credentials (password: 123456)
  if (password === '123456') {
    if (cleanEmail === 'kasir@buildpos.com') {
      return {
        success: true,
        profile: {
          ...INITIAL_PROFILES[0],
          email: 'kasir@buildpos.com',
        },
      };
    }
    if (cleanEmail === 'admin@buildpos.com') {
      return {
        success: true,
        profile: {
          ...INITIAL_PROFILES[1],
          email: 'admin@buildpos.com',
        },
      };
    }
    if (cleanEmail === 'owner@buildpos.com') {
      return {
        success: true,
        profile: {
          ...INITIAL_PROFILES[2],
          email: 'owner@buildpos.com',
        },
      };
    }
  }

  return {
    success: false,
    error: 'Email atau password salah. Pastikan password adalah "123456" atau jalankan script SQL create_users.',
  };
}

export async function signOutAction(): Promise<{ success: boolean }> {
  try {
    const cookieStore = cookies();
    if (isSupabaseConfigured()) {
      const supabase = createClient(cookieStore);
      await supabase.auth.signOut();
    }
    return { success: true };
  } catch (err) {
    console.error('SignOut error:', err);
    return { success: true };
  }
}

export async function getCurrentUserAction(): Promise<{ profile?: Profile; error?: string }> {
  try {
    if (!isSupabaseConfigured()) return {};
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return {};

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileData) {
      return {
        profile: {
          id: profileData.id,
          full_name: profileData.full_name,
          role: profileData.role,
          created_at: profileData.created_at,
          email: user.email,
        },
      };
    }

    return {};
  } catch (err: unknown) {
    return { error: 'Failed to get user' };
  }
}
