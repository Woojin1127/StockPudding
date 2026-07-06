import { Link, useParams } from 'react-router-dom'

import { AnalysisSkeleton, AnalysisView } from '@/components/AnalysisView'
import { ErrorState } from '@/components/ErrorState'
import { useReportById } from '@/hooks/useReport'

/** 저장된 리포트 공유 링크 (/report/:id) — 고유 ID로 재조회 */
export default function ReportPage() {
  const { id } = useParams<{ id: string }>()
  const { data: report, isPending, isError } = useReportById(id)

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {isPending && <AnalysisSkeleton />}
      {(isError || report === null) && !isPending && (
        <ErrorState
          title="리포트를 찾을 수 없어요"
          description="링크가 만료됐거나 잘못됐어요. 종목을 다시 검색해보세요."
        />
      )}
      {report && (
        <>
          <AnalysisView report={report} />
          <p className="mt-4 text-center">
            <Link
              to={`/stock/${report.result.code}`}
              className="text-sm font-medium text-indigo-600 hover:underline"
            >
              최신 분석 다시 받아보기 →
            </Link>
          </p>
        </>
      )}
    </div>
  )
}
