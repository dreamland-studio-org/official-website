import type { ReactNode } from 'react';

import Navbar from '@/components/NavBar';
import Footer from '@/components/Footer';
import SmoothScroll from '@/components/SmoothScroll';

export default function WebsiteLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <SmoothScroll>{children}</SmoothScroll>
      <Footer />
    </>
  );
}
