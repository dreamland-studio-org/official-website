'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const LogoLoader = () => {
  const loaderRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();

    // 設置初始狀態
    gsap.set('.logo-line', {
      strokeDasharray: '100',
      strokeDashoffset: '100'
    });

    // 線條動畫
    tl.to('.logo-line', {
      strokeDashoffset: 0,
      duration: 1.5,
      stagger: 0.2,
      ease: 'power2.inOut'
    })
    // 整體 logo 縮放
    .from('.logo-container', {
      scale: 0.5,
      opacity: 0,
      duration: 0.8,
      ease: 'back.out'
    })
    // 移動到導航欄位置
    .to(loaderRef.current, {
      yPercent: -100,
    //   scale: 0.5,
      y: -10,
    //   x: '45vw',
      duration: 1,
      ease: 'power3.inOut',
      delay: 0.3
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div ref={loaderRef} className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-white z-50">
      <div className="logo-container w-64 h-64">
        <svg ref={logoRef} viewBox="0 0 100 100" className="w-full h-full">
          <path 
            className="logo-line"
            fill="none"
            stroke="black"
            strokeWidth="2"
            d="M20,50 L80,50"
          />
          <path 
            className="logo-line"
            fill="none"
            stroke="black"
            strokeWidth="2"
            d="M50,20 L50,80"
          />
          <path 
            className="logo-line"
            fill="none"
            stroke="black"
            strokeWidth="2"
            d="M30,30 L70,70"
          />
        </svg>
      </div>
    </div>
  );
};

export default LogoLoader;
