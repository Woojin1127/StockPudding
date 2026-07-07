import { useState } from 'react'

import type { IndicatorCardData } from '@/types/stock'
import { INDICATOR_HELP } from '@/utils/indicatorHelp'
import { SIGNAL_META } from '@/utils/signal'

/** 지표 카드 (DesignSystem.md §5.4) + "이게 뭐예요?" 쉬운 설명 토글 (v2) */
export function IndicatorCard({ card }: { card: IndicatorCardData }) {
  const meta = SIGNAL_META[card.signal]
  const help = INDICATOR_HELP[card.key]
  const [showHelp, setShowHelp] = useState(false)

  return (
    <div
      className={`rounded-xl border border-l-4 border-gray-200 bg-white p-4 shadow-sm ${meta.leftBorder}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs tracking-wide text-gray-500 uppercase">
          <span className={`h-2 w-2 shrink-0 rounded-full ${meta.dot}`} />
          {card.label}
          {help && (
            <button
              type="button"
              onClick={() => setShowHelp((v) => !v)}
              aria-label={`${card.label} 설명 보기`}
              aria-expanded={showHelp}
              className="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs text-gray-400 transition hover:bg-indigo-50 hover:text-indigo-500"
            >
              ?
            </button>
          )}
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
      {showHelp && help && (
        <p className="mt-2 rounded-lg bg-indigo-50/60 p-3 text-xs leading-relaxed text-gray-600">
          {help}
        </p>
      )}
    </div>
  )
}
