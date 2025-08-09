import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Arogya Card - Digital Health Management System",
  description: "Secure digital health card system for patients, doctors, and emergency services",
  keywords: "health card, digital health, medical records, QR code, patient portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
          {children}
        </div>
      </body>
    </html>
  );
}
