import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import payos from "@/lib/payos";

function getAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // PayOS sends a "test" ping on webhook setup — acknowledge it
    if (body?.data === null) return NextResponse.json({ error: "0", message: "Ok" });

    const isValid = payos.verifyPaymentWebhookData(body);
    if (!isValid) {
      return NextResponse.json({ error: "1", message: "Invalid signature" }, { status: 400 });
    }

    const { code, data } = body as { code: string; data: { orderCode: number; amount: number } };

    // Only process successful payments
    if (code !== "00") return NextResponse.json({ error: "0", message: "Ok" });

    const { orderCode } = data;

    const admin = getAdminClient();
    const { error } = await admin
      .from("orders")
      .update({ status: "processing", payment_status: "paid" })
      .eq("payment_code", orderCode);

    if (error) console.error("Webhook DB update error:", error.message);

    return NextResponse.json({ error: "0", message: "Ok" });
  } catch (e) {
    console.error("Webhook error:", e);
    return NextResponse.json({ error: "1", message: "Internal error" }, { status: 500 });
  }
}
