import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const PAYMENT_LABELS: Record<string, string> = {
  cod:    "Thanh toán khi nhận hàng (COD)",
  bank:   "Chuyển khoản ngân hàng",
  momo:   "Ví MoMo",
  vnpay:  "VNPay",
};

export type OrderEmailData = {
  orderId: string;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  note?: string;
  paymentMethod: string;
  totalPrice: number;
  shippingFee: number;
  grandTotal: number;
  items: {
    productName: string;
    productPrice: number;
    productUnit: string;
    quantity: number;
    subtotal: number;
  }[];
};

function fmt(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

function buildHtml(d: OrderEmailData): string {
  const orderCode = `DH${d.orderId.slice(0, 8).toUpperCase()}`;
  const itemRows = d.items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0">${item.productName}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center">${item.quantity} ${item.productUnit}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right">${fmt(item.productPrice)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600">${fmt(item.subtotal)}</td>
        </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;font-size:14px;color:#333">
  <div style="max-width:620px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#166534,#15803d);padding:28px 32px">
      <p style="margin:0 0 4px;color:#bbf7d0;font-size:12px;letter-spacing:1px;text-transform:uppercase">Viện Nông Nghiệp Thanh Hóa</p>
      <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700">🛒 Đơn hàng mới</h1>
      <p style="margin:8px 0 0;color:#dcfce7;font-size:13px">Mã đơn: <strong>${orderCode}</strong></p>
    </div>

    <!-- Customer info -->
    <div style="padding:24px 32px;border-bottom:1px solid #f0f0f0">
      <h2 style="margin:0 0 14px;font-size:15px;color:#166534">Thông tin khách hàng</h2>
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="width:140px;padding:4px 0;color:#666">Người nhận</td>
          <td style="padding:4px 0;font-weight:600">${d.shippingName}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#666">Điện thoại</td>
          <td style="padding:4px 0;font-weight:600">${d.shippingPhone}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#666">Địa chỉ giao</td>
          <td style="padding:4px 0">${d.shippingAddress}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#666">Thanh toán</td>
          <td style="padding:4px 0">${PAYMENT_LABELS[d.paymentMethod] ?? d.paymentMethod}</td>
        </tr>
        ${d.note ? `<tr><td style="padding:4px 0;color:#666;vertical-align:top">Ghi chú</td><td style="padding:4px 0;font-style:italic;color:#555">${d.note}</td></tr>` : ""}
      </table>
    </div>

    <!-- Items -->
    <div style="padding:24px 32px;border-bottom:1px solid #f0f0f0">
      <h2 style="margin:0 0 14px;font-size:15px;color:#166534">Sản phẩm đặt mua</h2>
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:#f9fafb">
            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#666;font-weight:600;border-bottom:2px solid #e5e7eb">Sản phẩm</th>
            <th style="padding:8px 12px;text-align:center;font-size:12px;color:#666;font-weight:600;border-bottom:2px solid #e5e7eb">SL</th>
            <th style="padding:8px 12px;text-align:right;font-size:12px;color:#666;font-weight:600;border-bottom:2px solid #e5e7eb">Đơn giá</th>
            <th style="padding:8px 12px;text-align:right;font-size:12px;color:#666;font-weight:600;border-bottom:2px solid #e5e7eb">Thành tiền</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
    </div>

    <!-- Totals -->
    <div style="padding:20px 32px;border-bottom:1px solid #f0f0f0;background:#fafafa">
      <table style="width:100%;border-collapse:collapse;max-width:260px;margin-left:auto">
        <tr>
          <td style="padding:4px 0;color:#666">Tạm tính</td>
          <td style="padding:4px 0;text-align:right">${fmt(d.totalPrice)}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#666">Phí vận chuyển</td>
          <td style="padding:4px 0;text-align:right">${d.shippingFee === 0 ? '<span style="color:#16a34a">Miễn phí</span>' : fmt(d.shippingFee)}</td>
        </tr>
        <tr style="border-top:2px solid #e5e7eb">
          <td style="padding:10px 0 4px;font-weight:700;font-size:15px">Tổng cộng</td>
          <td style="padding:10px 0 4px;text-align:right;font-weight:700;font-size:16px;color:#dc2626">${fmt(d.grandTotal)}</td>
        </tr>
      </table>
    </div>

    <!-- Footer -->
    <div style="padding:20px 32px;text-align:center;color:#9ca3af;font-size:12px">
      <p style="margin:0">Email tự động từ hệ thống cửa hàng trực tuyến Viện Nông Nghiệp Thanh Hóa</p>
      <p style="margin:4px 0 0">Vui lòng không trả lời email này.</p>
    </div>
  </div>
</body>
</html>`;
}

export type ProductSubmissionEmailData = {
  productName: string;
  category: string;
  price: number;
  unit: string;
  sellerName: string;
  sellerPhone?: string;
};

function buildProductSubmissionHtml(d: ProductSubmissionEmailData): string {
  const priceLabel = d.price === 0
    ? '<span style="color:#16a34a;font-weight:700">Liên hệ để biết giá</span>'
    : `<strong>${d.price.toLocaleString("vi-VN")}đ/${d.unit}</strong>`;

  return `<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;font-size:14px;color:#333">
  <div style="max-width:580px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
    <div style="background:linear-gradient(135deg,#1e40af,#1d4ed8);padding:28px 32px">
      <p style="margin:0 0 4px;color:#bfdbfe;font-size:12px;letter-spacing:1px;text-transform:uppercase">Viện Nông Nghiệp Thanh Hóa</p>
      <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700">📦 Sản phẩm mới chờ duyệt</h1>
    </div>
    <div style="padding:28px 32px">
      <p style="margin:0 0 20px;color:#555">Một doanh nghiệp vừa gửi sản phẩm mới. Vui lòng kiểm tra và phê duyệt.</p>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#666;width:140px">Tên sản phẩm</td><td style="padding:8px 0;font-weight:700;color:#111">${d.productName}</td></tr>
        <tr style="background:#f9fafb"><td style="padding:8px 0;color:#666">Danh mục</td><td style="padding:8px 0">${d.category}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Giá bán</td><td style="padding:8px 0">${priceLabel}</td></tr>
        <tr style="background:#f9fafb"><td style="padding:8px 0;color:#666">Doanh nghiệp</td><td style="padding:8px 0;font-weight:600">${d.sellerName}</td></tr>
        ${d.sellerPhone ? `<tr><td style="padding:8px 0;color:#666">Số điện thoại</td><td style="padding:8px 0"><a href="tel:${d.sellerPhone}" style="color:#1d4ed8">${d.sellerPhone}</a></td></tr>` : ""}
      </table>
      <div style="margin-top:24px;text-align:center">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://localhost:3000"}/admin"
          style="display:inline-block;background:#1d4ed8;color:#fff;font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px">
          Vào trang Admin để duyệt →
        </a>
      </div>
    </div>
    <div style="padding:16px 32px;text-align:center;color:#9ca3af;font-size:12px;border-top:1px solid #f0f0f0">
      Email tự động từ hệ thống Viện Nông Nghiệp Thanh Hóa. Vui lòng không trả lời email này.
    </div>
  </div>
</body>
</html>`;
}

export async function sendProductSubmissionEmail(data: ProductSubmissionEmailData): Promise<void> {
  const instituteEmail = process.env.INSTITUTE_EMAIL;
  if (!instituteEmail || !process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return;

  await transporter.sendMail({
    from: `"Viện Nông Nghiệp Thanh Hóa" <${process.env.GMAIL_USER}>`,
    to: instituteEmail,
    subject: `[Chờ duyệt] ${data.productName} — ${data.sellerName}`,
    html: buildProductSubmissionHtml(data),
  });
}

export async function sendOrderNotificationEmail(data: OrderEmailData): Promise<void> {
  const instituteEmail = process.env.INSTITUTE_EMAIL;
  if (!instituteEmail || !process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return;

  const orderCode = `DH${data.orderId.slice(0, 8).toUpperCase()}`;

  await transporter.sendMail({
    from: `"Viện Nông Nghiệp Thanh Hóa" <${process.env.GMAIL_USER}>`,
    to: instituteEmail,
    subject: `[Đơn hàng mới] ${orderCode} — ${data.shippingName} — ${data.grandTotal.toLocaleString("vi-VN")}đ`,
    html: buildHtml(data),
  });
}
