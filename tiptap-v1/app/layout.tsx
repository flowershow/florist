import type { Metadata } from "next";
import { Spectral, Work_Sans } from "next/font/google";
import "./globals.css";

const spectral = Spectral({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const workSans = Work_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "TipTap v1",
  description: "Minimal editorial editor prototype",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spectral.variable} ${workSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
