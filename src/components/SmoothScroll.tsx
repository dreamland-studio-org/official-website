'use client';
import { ReactLenis, useLenis } from 'lenis/react';
import { useEffect, useRef, type ReactNode } from 'react';

export default function SmoothScrolling({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5 }}>
      {children}
    </ReactLenis>
  );
}
