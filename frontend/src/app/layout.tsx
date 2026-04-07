import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppProviders } from "@/components/providers/AppProviders";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Advanced TodoApp",
  description: "Multi-user real-time task management platform"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} min-h-screen font-sans`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
