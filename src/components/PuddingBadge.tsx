import type { Light } from '@/types/stock'

/** 점수 -> 오늘의 푸딩 상태 🍮 (브랜드 시그니처, 신호등과 1:1 매핑) */
const PUDDING: Record<Light, { emoji: string; label: string; anim: string; text: string }> = {
  green: {
    emoji: '🍮',
    label: '탱글탱글',
    anim: 'animate-pudding-boing',
    text: 'text-emerald-700',
  },
  yellow: {
    emoji: '🍮',
    label: '흔들흔들',
    anim: 'animate-pudding-wobble',
    text: 'text-amber-700',
  },
  red: {
    emoji: '🫠',
    label: '와르르…',
    anim: '',
    text: 'text-red-700',
  },
}

export function PuddingBadge({ light }: { light: Light }) {
  const p = PUDDING[light]
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1 text-xs text-gray-500">
      오늘의 푸딩
      <span className={`inline-block text-base ${p.anim}`} aria-hidden="true">
        {p.emoji}
      </span>
      <span className={`font-semibold ${p.text}`}>{p.label}</span>
    </span>
  )
}
