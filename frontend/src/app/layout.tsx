import "./globals.css";
import type { Metadata } from "next";
import { AppProviders } from "@/components/providers/AppProviders";

export const metadata: Metadata = {
  title: "Advanced TodoApp",
  description: "Multi-user real-time task management platform"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
