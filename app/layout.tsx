import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import FloatingContact from "./components/FloatingContact";
import AIChatWidget from "./components/AIChatWidget";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { ProductProvider } from "./context/ProductContext";
import { ReviewStatsProvider } from "./context/ReviewStatsContext";
import { AIChatProvider } from "./context/AIChatContext";

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

export const viewport = {
  width: "device-width",
  initialScale: 1,
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
            <ReviewStatsProvider>
              <CartProvider>
                <AIChatProvider>
                  <Header />
                  <main className="flex-1">{children}</main>
                  <Footer />
                  <FloatingContact />
                  <AIChatWidget />
                </AIChatProvider>
              </CartProvider>
            </ReviewStatsProvider>
          </ProductProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
