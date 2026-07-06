/** 분석 로딩 스켈레톤 — ScoreCard + 지표 카드 6개 자리 (DesignSystem.md §5.8) */
export function AnalysisSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-hidden="true">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="h-6 w-32 rounded bg-gray-200" />
        <div className="mt-2 h-3 w-48 rounded bg-gray-100" />
        <div className="mx-auto mt-8 h-24 w-48 rounded-t-full bg-gray-100" />
        <div className="mx-auto mt-4 h-4 w-40 rounded bg-gray-200" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="h-24 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="h-3 w-24 rounded bg-gray-200" />
            <div className="mt-3 h-3 w-full rounded bg-gray-100" />
            <div className="mt-2 h-3 w-2/3 rounded bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  )
}
