"use client";

import { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "buyer" | "business" | "admin";

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
  login: (phone: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  registerBuyer: (data: BuyerRegisterData) => Promise<{ ok: boolean; error?: string }>;
  registerBusiness: (data: BusinessRegisterData) => Promise<{ ok: boolean; error?: string }>;
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

type StoredUser = User & { password: string };

const MOCK_USERS: StoredUser[] = [
  {
    id: "buyer-1",
    name: "Nguyễn Văn A",
    phone: "0912345678",
    email: "nguyenvana@gmail.com",
    address: "123 Đường Lê Lợi, TP. Thanh Hóa",
    role: "buyer",
    password: "123456",
  },
  {
    id: "biz-1",
    name: "Trần Thị B",
    phone: "0987654321",
    email: "tranthib@gmail.com",
    role: "business",
    password: "123456",
    business: {
      businessName: "HTX Nông Sản Xanh Thanh Hóa",
      taxCode: "2801234567",
      businessAddress: "Xã Vĩnh Tân, Vĩnh Lộc, Thanh Hóa",
      category: "rau",
      description: "Chuyên cung cấp rau sạch VietGAP và các sản phẩm nông sản hữu cơ từ vùng Vĩnh Lộc.",
      verified: true,
    },
  },
  {
    id: "admin-1",
    name: "Admin Viện",
    phone: "0000000000",
    email: "admin@viennongnghiep.vn",
    role: "admin",
    password: "admin123",
  },
];

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("auth_user");
      if (saved) setUser(JSON.parse(saved));
      // Merge any newly registered users from localStorage into MOCK_USERS
      const extra = localStorage.getItem("registered_users");
      if (extra) {
        const parsed: StoredUser[] = JSON.parse(extra);
        parsed.forEach((u) => {
          if (!MOCK_USERS.find((m) => m.phone === u.phone)) MOCK_USERS.push(u);
        });
      }
    } catch {}
    setIsLoading(false);
  }, []);

  function persistNewUser(u: StoredUser) {
    const extra: StoredUser[] = JSON.parse(localStorage.getItem("registered_users") ?? "[]");
    extra.push(u);
    localStorage.setItem("registered_users", JSON.stringify(extra));
  }

  async function login(phone: string, password: string) {
    await new Promise((r) => setTimeout(r, 600));
    // Also check registered users
    const extra: StoredUser[] = JSON.parse(localStorage.getItem("registered_users") ?? "[]");
    const allUsers = [...MOCK_USERS, ...extra.filter((u) => !MOCK_USERS.find((m) => m.phone === u.phone))];
    const found = allUsers.find((u) => u.phone === phone && u.password === password);
    if (!found) return { ok: false, error: "Số điện thoại hoặc mật khẩu không đúng" };
    const { password: _pw, ...userWithoutPw } = found;
    setUser(userWithoutPw);
    localStorage.setItem("auth_user", JSON.stringify(userWithoutPw));
    return { ok: true, role: userWithoutPw.role };
  }

  async function registerBuyer(data: BuyerRegisterData) {
    await new Promise((r) => setTimeout(r, 800));
    const all = [...MOCK_USERS, ...JSON.parse(localStorage.getItem("registered_users") ?? "[]")];
    if (all.find((u) => u.phone === data.phone)) return { ok: false, error: "Số điện thoại đã được đăng ký" };
    const newUser: User = { id: "buyer-" + Date.now(), name: data.name, phone: data.phone, email: data.email, role: "buyer" };
    persistNewUser({ ...newUser, password: data.password });
    setUser(newUser);
    localStorage.setItem("auth_user", JSON.stringify(newUser));
    return { ok: true };
  }

  async function registerBusiness(data: BusinessRegisterData) {
    await new Promise((r) => setTimeout(r, 800));
    const all = [...MOCK_USERS, ...JSON.parse(localStorage.getItem("registered_users") ?? "[]")];
    if (all.find((u) => u.phone === data.phone)) return { ok: false, error: "Số điện thoại đã được đăng ký" };
    const newUser: User = {
      id: "biz-" + Date.now(),
      name: data.name,
      phone: data.phone,
      email: data.email,
      role: "business",
      business: {
        businessName: data.businessName,
        taxCode: data.taxCode,
        businessAddress: data.businessAddress,
        category: data.category,
        description: data.description,
        verified: false,
      },
    };
    persistNewUser({ ...newUser, password: data.password });
    setUser(newUser);
    localStorage.setItem("auth_user", JSON.stringify(newUser));
    return { ok: true };
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("auth_user");
  }

  return (
    <AuthContext.Provider value={{ user, login, registerBuyer, registerBusiness, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
