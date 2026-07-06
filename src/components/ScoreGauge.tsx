import { useEffect, useState } from 'react'

import type { Light } from '@/types/stock'

const STROKE_COLOR: Record<Light, string> = {
  green: 'text-emerald-400',
  yellow: 'text-amber-400',
  red: 'text-red-400',
}

/** 반원형 점수 게이지 — 마운트 시 0에서 점수까지 차오르는 애니메이션 */
export function ScoreGauge({ score, light }: { score: number; light: Light }) {
  const [filled, setFilled] = useState(0)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setFilled(score))
    return () => cancelAnimationFrame(frame)
  }, [score])

  return (
    <div className="relative mx-auto w-full max-w-55">
      <svg viewBox="0 0 200 110" className="w-full" aria-hidden="true">
        <path
          d="M 16 104 A 84 84 0 0 1 184 104"
          fill="none"
          strokeWidth="14"
          strokeLinecap="round"
          className="stroke-gray-100"
        />
        <path
          d="M 16 104 A 84 84 0 0 1 184 104"
          fill="none"
          strokeWidth="14"
          strokeLinecap="round"
          stroke="currentColor"
          pathLength={100}
          strokeDasharray="100"
          strokeDashoffset={100 - filled}
          className={`transition-[stroke-dashoffset] duration-1000 ease-out ${STROKE_COLOR[light]}`}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <span className="text-5xl font-bold text-gray-900 tabular-nums">
          {score}
        </span>
        <span className="ml-1 text-sm text-gray-400">/ 100</span>
      </div>
    </div>
  )
}
