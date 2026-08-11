import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Deluxe Saloon 2.0 — Sun lo, baal katao",
  description:
    "The sound of an Indian barbershop. Bollywood, regional classics, straight from a plastic chair in the 90s.",
  openGraph: {
    title: "Deluxe Saloon 2.0",
    description: "Sun lo, baal katao. Regional barbershop radio.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Rozha+One&family=Noto+Serif+Devanagari:wght@700&family=Noto+Serif+Bengali:wght@700&family=Noto+Serif+Tamil:wght@700&family=Work+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        {/* Favicon */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="shortcut icon" href="/favicon.png" />
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#c9a227" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Deluxe Saloon" />
        <link rel="apple-touch-icon" href="/icons/icon-512.png" />
      </head>
      <body style={{ backgroundColor: '#171b16', minHeight: '100vh', overflow: 'hidden' }}>
        {children}
      </body>
    </html>
  );
}
