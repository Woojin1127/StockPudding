import { useEffect } from 'react'
import { Navigate, useParams } from 'react-router-dom'

import { recordView } from '@/api/community'
import { AnalysisSkeleton, AnalysisView } from '@/components/AnalysisView'
import { ErrorState } from '@/components/ErrorState'
import { useReport } from '@/hooks/useReport'
import { useRecentStocks } from '@/store/recentStocks'
import { isStockCode } from '@/utils/format'

export default function StockPage() {
  const { code } = useParams<{ code: string }>()
  const { data: report, isPending, isError, refetch } = useReport(code)
  const addRecent = useRecentStocks((s) => s.addRecent)

  useEffect(() => {
    if (report) {
      addRecent({ code: report.result.code, name: report.result.name })
      void recordView(report.result.code, report.result.name) // 오늘 많이 본 종목 집계용
    }
  }, [report, addRecent])

  if (!code || !isStockCode(code)) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {isPending && (
        <>
          <p className="mb-4 text-center text-sm text-gray-500">
            지표를 계산하고 있어요… 첫 분석은 몇 초 걸릴 수 있어요 🍮
          </p>
          <AnalysisSkeleton />
        </>
      )}
      {isError && (
        <ErrorState
          title="잠시 데이터를 불러오지 못했어요"
          description="분석 엔진이 응답하지 않아요. 잠시 후 다시 시도해주세요."
          onRetry={() => void refetch()}
        />
      )}
      {report && <AnalysisView report={report} />}
    </div>
  )
}
