'use client';

import { motion } from 'framer-motion';

const orbs = [
  { size: 320, left: '-12%', top: '-6%', delay: 0 },
  { size: 280, left: '68%', top: '-10%', delay: 0.5 },
  { size: 220, left: '10%', top: '60%', delay: 1 },
];

export default function AuthorizeBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[#f6f8fb]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(143,178,255,0.35),_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(255,209,225,0.35),_transparent_55%)]" />

      {orbs.map((orb, index) => (
        <motion.span
          key={index}
          className="absolute rounded-full bg-gradient-to-br from-[#fdf2ff] via-[#d9e8ff] to-transparent blur-[90px] opacity-70"
          style={{ width: orb.size, height: orb.size, left: orb.left, top: orb.top }}
          initial={{ scale: 0.85, opacity: 0.45 }}
          animate={{ scale: 1.08, opacity: 0.8, rotate: 5 }}
          transition={{ duration: 6, repeat: Infinity, repeatType: 'mirror', delay: orb.delay }}
        />
      ))}

      <motion.div
        className="absolute left-1/2 top-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#cfd7ee] opacity-60"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.9),_transparent_75%)]" />
    </div>
  );
}
