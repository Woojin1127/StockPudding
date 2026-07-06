import { ScoreGauge } from '@/components/ScoreGauge'
import { SignalBadge } from '@/components/SignalBadge'
import type { AnalysisResult } from '@/types/stock'
import { formatBaseDate, formatKrw } from '@/utils/format'
import { LIGHT_META } from '@/utils/signal'

/** 종합 점수 카드 (DesignSystem.md §5.2) */
export function ScoreCard({ result }: { result: AnalysisResult }) {
  const meta = LIGHT_META[result.light]

  return (
    <section
      className={`rounded-2xl border bg-white p-6 shadow-sm ${meta.cardBorder}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{result.name}</h1>
          <p className="mt-0.5 text-xs text-gray-500 tabular-nums">
            {result.code} · {formatKrw(result.price)} ·{' '}
            {formatBaseDate(result.date)}
          </p>
        </div>
        <SignalBadge light={result.light} />
      </div>

      <div className="mt-6">
        <ScoreGauge score={result.score} light={result.light} />
        <p className={`mt-3 text-center text-base font-semibold ${meta.text}`}>
          {result.verdict}
        </p>
      </div>
    </section>
  )
}
