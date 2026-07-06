import type { IndicatorCardData } from '@/types/stock'
import { SIGNAL_META } from '@/utils/signal'

/** 지표 카드 (DesignSystem.md §5.4) */
export function IndicatorCard({ card }: { card: IndicatorCardData }) {
  const meta = SIGNAL_META[card.signal]

  return (
    <div
      className={`rounded-xl border border-l-4 border-gray-200 bg-white p-4 shadow-sm ${meta.leftBorder}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs tracking-wide text-gray-500 uppercase">
          <span className={`h-2 w-2 shrink-0 rounded-full ${meta.dot}`} />
          {card.label}
        </span>
        <span
          className={`text-right text-sm font-bold tabular-nums sm:text-base ${meta.text}`}
        >
          {card.value}
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">
        {card.comment}
      </p>
    </div>
  )
}
