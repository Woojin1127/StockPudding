import { AnalysisSkeleton } from '@/components/AnalysisSkeleton'
import { IndicatorCard } from '@/components/IndicatorCard'
import { ScoreCard } from '@/components/ScoreCard'
import { SignalSummary } from '@/components/SignalSummary'
import { VoteButtons } from '@/components/VoteButtons'
import type { StockReport } from '@/types/stock'
import { formatRelativeTime } from '@/utils/format'

export { AnalysisSkeleton }

/** 분석 리포트 본문 — /stock/:code 와 /report/:id 가 공유 */
export function AnalysisView({ report }: { report: StockReport }) {
  const { result } = report

  return (
    <div className="animate-fade-up space-y-6">
      <ScoreCard result={result} />

      <section>
        <h2 className="px-1 text-xs font-semibold tracking-wide text-gray-400 uppercase">
          지표 6종 자세히 보기
        </h2>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {result.cards.map((card) => (
            <IndicatorCard key={card.key} card={card} />
          ))}
        </div>
      </section>

      <SignalSummary signals={result.signals} />

      <section className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
        <h2 className="text-xs font-semibold tracking-wide text-indigo-400 uppercase">
          한줄 진단
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-gray-700">
          {result.diagnosis}
        </p>
      </section>

      <VoteButtons reportId={report.reportId} stockCode={result.code} />

      <p className="text-center text-xs text-gray-400">
        {report.fromCache
          ? `${formatRelativeTime(report.analyzedAt)} 분석 결과를 다시 보여드렸어요`
          : '방금 분석한 결과예요'}
        {' · '}종가 기준 데이터
      </p>
    </div>
  )
}
