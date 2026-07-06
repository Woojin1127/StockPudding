/**
 * 리포트 저장·캐싱 (PRD 6.2, 6.4)
 * 흐름: Supabase 캐시(TTL 내 최신 리포트) 확인 -> 없으면 엔진 분석 -> Supabase 저장.
 * Supabase 미설정이면 엔진 직접 호출로 폴백 (reportId = null).
 */
import { analyzeStock } from '@/api/engine'
import { supabase } from '@/api/supabaseClient'
import type { AnalysisResult, StockReport } from '@/types/stock'

/** 같은 종목 재검색 시 이 시간 안에는 저장된 분석을 재사용 */
export const CACHE_TTL_MINUTES = 30

interface ReportRow {
  id: string
  code: string
  result: AnalysisResult
  created_at: string
}

export async function fetchReport(code: string): Promise<StockReport> {
  if (!supabase) {
    const result = await analyzeStock(code)
    return {
      reportId: null,
      analyzedAt: new Date().toISOString(),
      fromCache: false,
      result,
    }
  }

  const since = new Date(Date.now() - CACHE_TTL_MINUTES * 60_000).toISOString()
  const { data: cached } = await supabase
    .from('reports')
    .select('id, code, result, created_at')
    .eq('code', code)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle<ReportRow>()

  if (cached) {
    return {
      reportId: cached.id,
      analyzedAt: cached.created_at,
      fromCache: true,
      result: cached.result,
    }
  }

  const result = await analyzeStock(code)
  const { data: inserted, error } = await supabase
    .from('reports')
    .insert({
      code: result.code,
      name: result.name,
      score: result.score,
      light: result.light,
      result,
    })
    .select('id, created_at')
    .single<Pick<ReportRow, 'id' | 'created_at'>>()

  // 저장 실패해도 분석 결과는 보여준다 (저장은 부가 기능)
  if (error || !inserted) {
    return {
      reportId: null,
      analyzedAt: new Date().toISOString(),
      fromCache: false,
      result,
    }
  }
  return {
    reportId: inserted.id,
    analyzedAt: inserted.created_at,
    fromCache: false,
    result,
  }
}

/** 저장된 리포트를 고유 ID로 재조회 (공유 링크 대비) */
export async function fetchReportById(id: string): Promise<StockReport | null> {
  if (!supabase) return null
  const { data } = await supabase
    .from('reports')
    .select('id, code, result, created_at')
    .eq('id', id)
    .maybeSingle<ReportRow>()
  if (!data) return null
  return {
    reportId: data.id,
    analyzedAt: data.created_at,
    fromCache: true,
    result: data.result,
  }
}
