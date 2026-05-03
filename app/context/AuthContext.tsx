'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export type UserRole = 'buyer' | 'business' | 'admin';

export type BusinessProfile = {
  businessName: string;
  taxCode: string;
  businessAddress: string;
  category: string;
  description: string;
  verified: boolean;
};

export type User = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  role: UserRole;
  business?: BusinessProfile;
};

type AuthContextValue = {
  user: User | null;
  login: (
    phone: string,
    password: string,
  ) => Promise<{ ok: boolean; error?: string; role?: UserRole }>;
  registerBuyer: (
    data: BuyerRegisterData,
  ) => Promise<{ ok: boolean; error?: string }>;
  registerBusiness: (
    data: BusinessRegisterData,
  ) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
};

export type BuyerRegisterData = {
  name: string;
  phone: string;
  email: string;
  password: string;
};

export type BusinessRegisterData = BuyerRegisterData & {
  businessName: string;
  taxCode: string;
  businessAddress: string;
  category: string;
  description: string;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfile(userId: string): Promise<User | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('profiles')
    .select('*, business_profiles(*)')
    .eq('id', userId)
    .single();

  if (!data) return null;

  const bp = data.business_profiles as Record<string, unknown> | null;

  return {
    id: data.id,
    name: data.name,
    phone: data.phone,
    email: data.email ?? '',
    address: data.address ?? undefined,
    role: data.role as UserRole,
    business: bp
      ? {
          businessName: bp.business_name as string,
          taxCode: bp.tax_code as string,
          businessAddress: bp.business_address as string,
          category: bp.category as string,
          description: (bp.description as string) ?? '',
          verified: bp.verified as boolean,
        }
      : undefined,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') {
        setIsLoading(false);
      }
      if (session?.user) {
        fetchProfile(session.user.id).then((profile) => setUser(profile));
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function login(phone: string, password: string) {
    const supabase = createClient();
    const email = `${phone}@vnn.vn`;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return {
        ok: false,
        error: error.message ?? 'Số điện thoại hoặc mật khẩu không đúng',
      };
    }
    // onAuthStateChange handles setting user state
    return { ok: true };
  }

  async function registerBuyer(data: BuyerRegisterData) {
    const supabase = createClient();
    const email = `${data.phone}@vnn.vn`;
    const { error } = await supabase.auth.signUp({
      email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          phone: data.phone,
          email: data.email,
          role: 'buyer',
        },
      },
    });
    if (error) {
      if (error.message.toLowerCase().includes('already')) {
        return { ok: false, error: 'Số điện thoại đã được đăng ký' };
      }
      if (error.message.toLowerCase().includes('database')) {
        return { ok: false, error: 'Lỗi hệ thống, vui lòng thử lại sau' };
      }
      return { ok: false, error: error.message };
    }
    return { ok: true };
  }

  async function registerBusiness(data: BusinessRegisterData) {
    const supabase = createClient();
    const email = `${data.phone}@vnn.vn`;
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          phone: data.phone,
          email: data.email,
          role: 'business',
        },
      },
    });
    if (error) {
      if (error.message.toLowerCase().includes('already')) {
        return { ok: false, error: 'Số điện thoại đã được đăng ký' };
      }
      if (error.message.toLowerCase().includes('database')) {
        return { ok: false, error: 'Lỗi hệ thống, vui lòng thử lại sau' };
      }
      return { ok: false, error: error.message };
    }
    if (authData.user) {
      await supabase.from('business_profiles').upsert({
        id: authData.user.id,
        business_name: data.businessName,
        tax_code: data.taxCode,
        business_address: data.businessAddress,
        category: data.category,
        description: data.description,
        verified: false,
      });
    }
    return { ok: true };
  }

  function logout() {
    const supabase = createClient();
    supabase.auth.signOut();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        registerBuyer,
        registerBusiness,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
