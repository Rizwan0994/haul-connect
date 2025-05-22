import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeSwitch } from "@/components/theme-switch";
import { ModalProvider } from "@/components/carrier-management/modal-context";
import CarrierModalsContainer from "@/components/carrier-management/carrier-modals-container";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Haul Connect BPO",
  description: "Logistics & Carrier Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased p-0 m-0`}
      >
        <ThemeProvider defaultTheme="dark">
          <ModalProvider>
            <div className="fixed top-5 right-5 z-[100]">
              <ThemeSwitch />
            </div>
            {children}
            <CarrierModalsContainer />
            <Toaster />
          </ModalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
