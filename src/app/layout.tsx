import type { Metadata } from "next";
import "./globals.css";
import SEO from "@/config/SEO.json";
import Navbar from "@/components/NavBar";
import Footer from "@/components/Footer";
import LogoLoader from "@/components/LogoLoader";
import SmoothScroll from "@/components/SmoothScroll";

import { Roboto } from 'next/font/google'

const roboto = Roboto({
  weight: '400',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: SEO.default.title,
  description: SEO.default.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={roboto.className}>
      <body>
        <Navbar />
        {/* <LogoLoader /> */}
        <SmoothScroll>
          {children}
        </SmoothScroll>
        <Footer />
      </body>
    </html>
  );
}
