import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import FloatingContact from "./components/FloatingContact";
import HomeBreadcrumb from "./components/HomeBreadcrumb";
import RealtimeRefresher from "./components/RealtimeRefresher";
import { CartProvider } from "./context/CartContext";
import { CartFlyProvider } from "./components/CartFlyer";
import { AuthProvider } from "./context/AuthContext";
import { ProductProvider } from "./context/ProductContext";
import { ReviewStatsProvider } from "./context/ReviewStatsContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const SITE_NAME = "Viện Nông Nghiệp Thanh Hóa";
const DEFAULT_DESCRIPTION =
  "Mua giống cây trồng, phân bón, thuốc BVTV và đặc sản Thanh Hóa trực tuyến. Chất lượng kiểm định, giao hàng toàn quốc.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} – Cửa hàng trực tuyến`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: ["nông nghiệp", "Thanh Hóa", "giống cây trồng", "phân bón", "lúa giống", "rau sạch", "đặc sản", "OCOP", "Viện Nông Nghiệp"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} – Cửa hàng trực tuyến`,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: "/thanh_hoa_agriculture_logo.png",
        width: 512,
        height: 512,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} – Cửa hàng trực tuyến`,
    description: DEFAULT_DESCRIPTION,
    images: ["/thanh_hoa_agriculture_logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  verification: {
    google: "l8NFo7VQSnoxpo0hZjkwFJzegi7hxwPKvAlKMajy5Xk",
  },
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
                <CartFlyProvider>
                  <RealtimeRefresher />
                  <Header />
                  <HomeBreadcrumb />
                  <main className="flex-1">{children}</main>
                  <Footer />
                  <FloatingContact />
                </CartFlyProvider>
              </CartProvider>
            </ReviewStatsProvider>
          </ProductProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
