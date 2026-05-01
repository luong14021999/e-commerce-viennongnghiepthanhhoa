"use server";

import { createClient } from "@/lib/supabase/server";

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
