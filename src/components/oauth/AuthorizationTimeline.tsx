'use client';

import { motion } from 'framer-motion';

const steps = [
  { id: 'login', label: '登入' },
  { id: 'consent', label: '授權' },
  { id: 'done', label: '完成' },
];

type Stage = 'login' | 'consent';

export default function AuthorizationTimeline({ stage }: { stage: Stage }) {
  const activeIndex = stage === 'consent' ? 1 : 0;
  const progress = ((activeIndex + 1) / steps.length) * 100;
  const headline = stage === 'consent' ? '授權審查中' : '準備登入';
  const description = stage === 'consent' ? '確認授權內容並完成應用程式的請求。' : '先登入你的築夢之地帳號，再繼續授權流程。';

  return (
    <div className="rounded-3xl border border-white/60 bg-white/80 px-5 py-5 text-slate-800 shadow-xl shadow-slate-200/80 backdrop-blur-xl">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-slate-500">
        <span className="inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
        安全授權流程
      </div>
      <p className="mt-2 text-lg font-semibold text-slate-900">{headline}</p>
      <p className="text-sm text-slate-600">{description}</p>

      <div className="mt-5">
        <div className="relative h-1.5 rounded-full bg-slate-100">
          <motion.span
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-emerald-300 via-sky-300 to-purple-400 shadow-[0_0_15px_rgba(79,209,197,0.8)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] uppercase tracking-[0.3em]">
          {steps.map((step, index) => {
            const isCompleted = index <= activeIndex;
            return (
              <motion.span
                key={step.id}
                className={`font-semibold ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                {step.label}
              </motion.span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
