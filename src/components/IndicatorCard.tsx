import type { IndicatorCardData } from '@/types/stock'
import { INDICATOR_HELP } from '@/utils/indicatorHelp'
import { SIGNAL_META } from '@/utils/signal'

/** 지표 카드 (DesignSystem.md §5.4)
 *  "?"는 호버/포커스 툴팁 — 카드 높이가 안 변해 그리드 옆 카드가 밀리지 않는다 */
export function IndicatorCard({ card }: { card: IndicatorCardData }) {
  const meta = SIGNAL_META[card.signal]
  const help = INDICATOR_HELP[card.key]

  return (
    <div
      className={`rounded-xl border border-l-4 border-gray-200 bg-white p-4 shadow-sm ${meta.leftBorder}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs tracking-wide text-gray-500 uppercase">
          <span className={`h-2 w-2 shrink-0 rounded-full ${meta.dot}`} />
          {card.label}
          {help && (
            <span className="relative">
              <button
                type="button"
                aria-label={`${card.label} 설명`}
                className="peer rounded-full bg-gray-100 px-1.5 py-0.5 text-xs text-gray-400 transition hover:bg-indigo-50 hover:text-indigo-500"
              >
                ?
              </button>
              <span
                role="tooltip"
                className="pointer-events-none absolute top-full left-0 z-10 mt-1.5 hidden w-64 rounded-lg bg-gray-900/95 p-3 text-xs leading-relaxed font-normal tracking-normal normal-case text-gray-100 shadow-lg peer-hover:block peer-focus:block"
              >
                {help}
              </span>
            </span>
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
    </div>
  )
}
