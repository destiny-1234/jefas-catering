import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteChrome from "../components/SiteChrome";
import { CartProvider } from "../context/CartContext";
import Script from "next/script";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
export const metadata = {
  title: {
    default: "Jefas Catering & Events",
    template: "%s | Jefas Catering & Events",
  },
  description: "Custom cakes, event planning, and premium baking supplies in Lagos, Nigeria.",
  openGraph: {
    title: "Jefas Catering & Events",
    description: "Custom cakes, event planning, and premium baking supplies in Lagos, Nigeria.",
    images: ["/jefas-logo.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
  <body className="min-h-full flex flex-col">
  <CartProvider>
    <SiteChrome>{children}</SiteChrome>
  </CartProvider>
  <Script src="https://js.paystack.co/v1/inline.js" strategy="afterInteractive" />
</body>
    </html>
  );
}
