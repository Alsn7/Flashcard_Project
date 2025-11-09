import type { Metadata, Viewport } from "next";
import "../src/index.css";
import { Providers } from "./providers";
import { Header } from "@/components/layout/Header";
import { Toaster } from "@/components/ui/toaster";
import { PasswordRecoveryHandler } from "@/components/auth/PasswordRecoveryHandler";

export const metadata: Metadata = {
  title: "ClassNerd",
  description: "Your flashcard learning application",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&family=Noto+Kufi+Arabic:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <PasswordRecoveryHandler />
          <div className="relative flex min-h-screen flex-col bg-background">
            <Header />
            <main className="flex-1 pt-14 sm:pt-16">{children}</main>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
