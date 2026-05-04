import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import payos from "@/lib/payos";

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 });

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: order } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .eq("buyer_id", user.id)
      .single();

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // Numeric code PayOS uses to identify the payment
    const paymentCode = Date.now();

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    const linkData = {
      orderCode: paymentCode,
      amount: order.grand_total,
      // max 25 chars, appears in bank transfer description
      description: `DH${orderId.slice(0, 6).toUpperCase()}`,
      items: (order.order_items as { product_name: string; quantity: number; product_price: number }[]).map((item) => ({
        name: item.product_name.slice(0, 50),
        quantity: item.quantity,
        price: item.product_price,
      })),
      returnUrl: `${siteUrl}/thanh-toan/ket-qua?orderId=${orderId}&code=00`,
      cancelUrl: `${siteUrl}/thanh-toan/ket-qua?orderId=${orderId}&code=cancel`,
    };

    const result = await payos.createPaymentLink(linkData);

    // Persist the payment code so the webhook can find this order
    await supabase
      .from("orders")
      .update({ payment_code: paymentCode })
      .eq("id", orderId);

    return NextResponse.json({ checkoutUrl: result.checkoutUrl });
  } catch (e) {
    console.error("PayOS create error:", e);
    return NextResponse.json({ error: "Payment creation failed" }, { status: 500 });
  }
}
