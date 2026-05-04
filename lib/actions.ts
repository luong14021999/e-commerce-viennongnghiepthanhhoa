"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

function getAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

type RegisterInput = {
  phone: string;
  password: string;
  name: string;
  email?: string;
  role: "buyer" | "business";
};

export async function registerUserAction(
  input: RegisterInput
): Promise<{ ok: boolean; error?: string; userId?: string }> {
  try {
    const admin = getAdminClient();
    const { data, error } = await admin.auth.admin.createUser({
      email: `${input.phone}@vnn.vn`,
      password: input.password,
      email_confirm: true,
      user_metadata: {
        name: input.name,
        phone: input.phone,
        email: input.email ?? "",
        role: input.role,
      },
    });
    if (error) {
      if (error.message.toLowerCase().includes("already")) {
        return { ok: false, error: "Số điện thoại đã được đăng ký" };
      }
      return { ok: false, error: error.message };
    }
    return { ok: true, userId: data.user.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Lỗi hệ thống" };
  }
}

export async function insertBusinessProfileAction(
  userId: string,
  data: {
    businessName: string;
    taxCode: string;
    businessAddress: string;
    category: string;
    description: string;
  }
): Promise<void> {
  const supabase = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  await supabase.from("business_profiles").upsert({
    id: userId,
    business_name: data.businessName,
    tax_code: data.taxCode,
    business_address: data.businessAddress,
    category: data.category,
    description: data.description,
    verified: false,
  });
}

export async function updateBusinessProfileAction(
  data: {
    businessName: string;
    taxCode: string;
    businessAddress: string;
    category: string;
    description: string;
    contactName: string;
    contactEmail: string;
  }
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Chưa đăng nhập" };

    const admin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const [bpRes, profRes] = await Promise.all([
      admin.from("business_profiles").update({
        business_name: data.businessName,
        tax_code: data.taxCode,
        business_address: data.businessAddress,
        category: data.category,
        description: data.description,
      }).eq("id", user.id),
      admin.from("profiles").update({
        name: data.contactName,
        email: data.contactEmail,
      }).eq("id", user.id),
    ]);

    if (bpRes.error) return { ok: false, error: bpRes.error.message };
    if (profRes.error) return { ok: false, error: profRes.error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Lỗi hệ thống" };
  }
}


type OrderItem = {
  productId?: string;
  productName: string;
  productPrice: number;
  productUnit: string;
  productIcon?: string;
  productImageUrl?: string;
  quantity: number;
  subtotal: number;
};

type CreateOrderInput = {
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  note?: string;
  totalPrice: number;
  shippingFee: number;
  grandTotal: number;
  paymentMethod: string;
  items: OrderItem[];
};

export async function createOrderAction(input: CreateOrderInput): Promise<{ ok: boolean; error?: string; orderId?: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Chưa đăng nhập" };

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      buyer_id: user.id,
      status: "pending",
      shipping_name: input.shippingName,
      shipping_phone: input.shippingPhone,
      shipping_address: input.shippingAddress,
      note: input.note ?? null,
      total_price: input.totalPrice,
      shipping_fee: input.shippingFee,
      grand_total: input.grandTotal,
      payment_method: input.paymentMethod,
      payment_status: input.paymentMethod === "cod" ? null : "pending",
    })
    .select("id")
    .single();

  if (error || !order) return { ok: false, error: error?.message ?? "Không thể tạo đơn hàng" };

  const { error: itemsError } = await supabase.from("order_items").insert(
    input.items.map((item) => ({
      order_id: order.id,
      product_id: item.productId ?? null,
      product_name: item.productName,
      product_price: item.productPrice,
      product_unit: item.productUnit,
      product_icon: item.productIcon ?? null,
      product_image_url: item.productImageUrl ?? null,
      quantity: item.quantity,
      subtotal: item.subtotal,
    }))
  );

  if (itemsError) {
    // Rollback the order if items failed
    await supabase.from("orders").delete().eq("id", order.id);
    return { ok: false, error: itemsError.message };
  }

  return { ok: true, orderId: order.id as string };
}
