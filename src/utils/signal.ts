/** 신호등/신호 -> Tailwind 클래스·문구 매핑 (DesignSystem.md §2.3, §9.2) */
import type { Light, Signal } from '@/types/stock'

interface LightMeta {
  label: string
  emoji: string
  badge: string
  bar: string
  text: string
  cardBorder: string
  softBg: string
}

export const LIGHT_META: Record<Light, LightMeta> = {
  green: {
    label: '안정',
    emoji: '🟢',
    badge: 'bg-emerald-100 text-emerald-800',
    bar: 'bg-emerald-400',
    text: 'text-emerald-700',
    cardBorder: 'border-emerald-200',
    softBg: 'bg-emerald-50',
  },
  yellow: {
    label: '주의',
    emoji: '🟡',
    badge: 'bg-amber-100 text-amber-800',
    bar: 'bg-amber-400',
    text: 'text-amber-700',
    cardBorder: 'border-amber-200',
    softBg: 'bg-amber-50',
  },
  red: {
    label: '위험',
    emoji: '🔴',
    badge: 'bg-red-100 text-red-800',
    bar: 'bg-red-400',
    text: 'text-red-700',
    cardBorder: 'border-red-200',
    softBg: 'bg-red-50',
  },
}

interface SignalMeta {
  dot: string
  text: string
  leftBorder: string
  icon: string
}

export const SIGNAL_META: Record<Signal, SignalMeta> = {
  good: {
    dot: 'bg-emerald-400',
    text: 'text-emerald-700',
    leftBorder: 'border-l-emerald-400',
    icon: '✅',
  },
  neutral: {
    dot: 'bg-amber-400',
    text: 'text-amber-700',
    leftBorder: 'border-l-amber-400',
    icon: '⚠️',
  },
  bad: {
    dot: 'bg-red-400',
    text: 'text-red-700',
    leftBorder: 'border-l-red-400',
    icon: '❌',
  },
}

/** 점수(0~100) -> 신호등. 엔진(scoring.py composite)과 동일 기준 — 표시 전용으로만 사용. */
export function lightFromScore(score: number): Light {
  if (score >= 65) return 'green'
  if (score >= 45) return 'yellow'
  return 'red'
}
