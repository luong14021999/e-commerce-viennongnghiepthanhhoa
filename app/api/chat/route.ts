import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Bạn là trợ lý AI của Viện Nông Nghiệp Thanh Hóa – một đơn vị nghiên cứu và kinh doanh nông sản uy tín tại Thanh Hóa, Việt Nam.

Nhiệm vụ của bạn:
1. Hỗ trợ khách hàng sử dụng website: tìm kiếm sản phẩm, đặt hàng, theo dõi đơn hàng, thanh toán.
2. Tư vấn thông tin nông nghiệp: giống cây trồng, phân bón, thuốc bảo vệ thực vật, kỹ thuật canh tác, mùa vụ, sâu bệnh, v.v.
3. Giới thiệu sản phẩm của viện: lúa giống, rau sạch, phân bón, đặc sản Thanh Hóa.

Hướng dẫn sử dụng website:
- Trang chủ: xem sản phẩm nổi bật và danh mục
- /san-pham: duyệt toàn bộ sản phẩm, lọc theo danh mục
- /gio-hang: xem và chỉnh sửa giỏ hàng
- /thanh-toan: đặt hàng, chọn phương thức thanh toán (COD hoặc chuyển khoản)
- /don-hang: xem lịch sử đơn hàng của bạn (cần đăng nhập)
- /dang-nhap và /dang-ky: đăng nhập hoặc tạo tài khoản mới

Phương thức thanh toán:
- COD (thanh toán khi nhận hàng)
- Chuyển khoản ngân hàng (có QR code tự động)

Phí vận chuyển: miễn phí cho đơn từ 500.000đ, dưới 500.000đ phí 30.000đ.

Luôn trả lời bằng tiếng Việt, thân thiện, ngắn gọn và hữu ích. Nếu không biết câu trả lời, hãy thành thật nói vậy và hướng dẫn khách hàng liên hệ trực tiếp.`;

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    const stream = client.messages.stream({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Lỗi hệ thống";
          controller.enqueue(encoder.encode(`[Lỗi: ${msg}]`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Lỗi hệ thống" },
      { status: 500 }
    );
  }
}
