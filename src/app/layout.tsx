import type { Metadata } from "next";
import "./globals.css";
import SEO from "@/config/SEO.json";

import { Roboto } from 'next/font/google'

const roboto = Roboto({
  weight: '400',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: SEO.default.title,
  description: SEO.default.description,
  twitter: {
    card: "summary_large_image",
    images: "https://raw.githubusercontent.com/dreamland-studio-org/official-website/refs/heads/main/public/Banner.png"
  }
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={roboto.className}>
      <body>
        {children}
      </body>
    </html>
  );
}
