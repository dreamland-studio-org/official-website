"use client";

import { ReactLenis } from "@studio-freight/react-lenis";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.14, duration: 1.1, smoothTouch: true } as any}>
      {children as any}
    </ReactLenis>
  );
}
