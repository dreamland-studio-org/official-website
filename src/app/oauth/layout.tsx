import type { ReactNode } from 'react';

export default function OAuthLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <>{children}</>;
}
