/** 종목 분석 리포트 조회 (F2~F4, F6) — Supabase 캐시 -> 엔진 -> 저장 */
import { useQuery } from '@tanstack/react-query'

import { fetchReport, fetchReportById } from '@/api/reports'

export function useReport(code: string | undefined) {
  return useQuery({
    queryKey: ['report', code],
    queryFn: () => fetchReport(code!),
    enabled: !!code && /^\d{6}$/.test(code),
    staleTime: 5 * 60_000,
    retry: 1,
  })
}

export function useReportById(id: string | undefined) {
  return useQuery({
    queryKey: ['report-by-id', id],
    queryFn: () => fetchReportById(id!),
    enabled: !!id,
    staleTime: Infinity, // 저장본은 불변
  })
}
