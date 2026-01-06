import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Perbarui Metadata untuk Branding Aplikasi kamu
export const metadata: Metadata = {
  title: "ImunKita | Sistem Informasi Posyandu Digital",
  description:
    "Pantau jadwal imunisasi dan tumbuh kembang anak dengan mudah dan aman.",
  icons: {
    icon: "/favicon.ico", // Pastikan kamu punya favicon bertema kesehatan
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* PENTING: Solusi agar gambar Google Auth muncul */}
        <meta name="referrer" content="no-referrer" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {/* Toaster untuk notifikasi sukses/error (seperti login/logout) */}
        <Toaster position="top-center" richColors />

        {/* Main content */}
        {children}
      </body>
    </html>
  );
}
