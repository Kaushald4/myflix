import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";
import QueryProvider from "@/provider/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MyFlix - Discover Your Favorite Movies and TV Shows",
  description: "Bookmark and explore your favorite movies and TV shows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased pb-16 pt-16 md:pb-0 md:pt-20`}
      >
        <script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="ae9e5cfa-8984-430c-a70e-7548eea5f54a"
        ></script>
        <Script src="/playerjs.js" strategy="afterInteractive" />
        <QueryProvider>
          <AuthProvider>
            <Navbar />
            {children}
            <Footer />
            <BottomNav />
            <Toaster />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
