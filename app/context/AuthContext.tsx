'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { registerUserAction, insertBusinessProfileAction, updateBusinessProfileAction, updateBuyerProfileAction, updatePhoneAction, checkBanStatusAction } from '@/lib/actions';

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

type BusinessProfileUpdateData = {
  businessName: string;
  taxCode: string;
  businessAddress: string;
  category: string;
  description: string;
  contactName: string;
  contactEmail: string;
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
  updateBusinessProfile: (
    data: BusinessProfileUpdateData,
  ) => Promise<{ ok: boolean; error?: string }>;
  updateBuyerProfile: (
    data: { name: string; email: string },
  ) => Promise<{ ok: boolean; error?: string }>;
  updatePhone: (newPhone: string) => Promise<{ ok: boolean; error?: string }>;
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
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') {
        setIsLoading(false);
      }
      if (session?.user) {
        const { banned } = await checkBanStatusAction(session.user.id);
        if (banned) {
          supabase.auth.signOut();
          setUser(null);
          return;
        }
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
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const msg = (error.message ?? '').toLowerCase();
      if (msg.includes('banned') || msg.includes('ban')) {
        return { ok: false, error: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.' };
      }
      return { ok: false, error: 'Số điện thoại hoặc mật khẩu không đúng' };
    }
    // Double-check ban status in case Supabase didn't catch it
    if (data.user) {
      const { banned } = await checkBanStatusAction(data.user.id);
      if (banned) {
        await supabase.auth.signOut();
        return { ok: false, error: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.' };
      }
    }
    // onAuthStateChange handles setting user state
    return { ok: true };
  }

  async function registerBuyer(data: BuyerRegisterData) {
    return registerUserAction({
      phone: data.phone,
      password: data.password,
      name: data.name,
      email: data.email,
      role: 'buyer',
    });
  }

  async function registerBusiness(data: BusinessRegisterData) {
    const result = await registerUserAction({
      phone: data.phone,
      password: data.password,
      name: data.name,
      email: data.email,
      role: 'business',
    });
    if (!result.ok || !result.userId) return result;
    await insertBusinessProfileAction(result.userId, {
      businessName: data.businessName,
      taxCode: data.taxCode,
      businessAddress: data.businessAddress,
      category: data.category,
      description: data.description,
    });
    return { ok: true };
  }

  async function updatePhone(newPhone: string) {
    const result = await updatePhoneAction(newPhone);
    if (result.ok) {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const profile = await fetchProfile(authUser.id);
        setUser(profile);
      }
    }
    return result;
  }

  async function updateBuyerProfile(data: { name: string; email: string }) {
    const result = await updateBuyerProfileAction(data);
    if (result.ok) {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const profile = await fetchProfile(authUser.id);
        setUser(profile);
      }
    }
    return result;
  }

  async function updateBusinessProfile(data: BusinessProfileUpdateData) {
    const result = await updateBusinessProfileAction(data);
    if (result.ok) {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const profile = await fetchProfile(authUser.id);
        setUser(profile);
      }
    }
    return result;
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
        updatePhone,
        updateBuyerProfile,
        updateBusinessProfile,
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
