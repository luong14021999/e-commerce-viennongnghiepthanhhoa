import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { ProductProvider } from "./context/ProductContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Viện Nông Nghiệp Thanh Hóa – Cửa hàng trực tuyến",
    template: "%s | Viện Nông Nghiệp Thanh Hóa",
  },
  description:
    "Mua giống cây trồng, phân bón, thuốc BVTV và đặc sản Thanh Hóa trực tuyến. Chất lượng kiểm định, giao hàng toàn tỉnh.",
  keywords: ["nông nghiệp", "Thanh Hóa", "giống cây trồng", "phân bón", "lúa giống", "rau sạch", "đặc sản"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={geistSans.variable}>
      <body className="min-h-screen flex flex-col antialiased bg-gray-50">
        <AuthProvider>
          <ProductProvider>
            <CartProvider>
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </CartProvider>
          </ProductProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
