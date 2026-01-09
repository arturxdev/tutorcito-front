import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { ApiProvider } from "@/components/providers/ApiProvider";
import "./globals.css";
import Script from 'next/script'
import { reverseEasing } from "framer-motion";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tutorcito - Quiz Inteligente con IA",
  description:
    "Genera quizzes interactivos desde tus PDFs con inteligencia artificial",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="es">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ApiProvider>
            {children}
          </ApiProvider>
          <Toaster position="top-center" richColors />
          <Script
            src="https://analytics.ahrefs.com/analytics.js"
            data-key="QsZZw5qrAut371fAeF8dKA"
            strategy="afterInteractive"
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
