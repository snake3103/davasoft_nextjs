import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Davasoft - Contabilidad e Impuestos",
  description: "Dashboard principal de contabilidad",
};

import Providers from "@/components/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <ToastProvider>
            <Providers>
              {children}
              <GlobalSearch />
            </Providers>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
