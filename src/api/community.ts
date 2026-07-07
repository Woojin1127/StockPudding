/**
 * 커뮤니티 집계 (v3) — 오늘 많이 본 종목(F8), 도움된 분석 TOP(F7).
 * Supabase 미설정·마이그레이션 전이면 빈 배열 (섹션 자동 숨김).
 */
import { supabase } from '@/api/supabaseClient'
import type { Light } from '@/types/stock'

export interface PopularStock {
  code: string
  name: string
  views: number
}

export interface TopReport {
  code: string
  name: string
  score: number
  light: Light
  up: number
  down: number
}

/** 종목 조회 기록 — 실패해도 조용히 무시 (부가 기능) */
export async function recordView(code: string, name: string): Promise<void> {
  if (!supabase) return
  try {
    await supabase.from('stock_views').insert({ code, name })
  } catch {
    // stock_views 테이블 미생성(마이그레이션 전) 등 — 무시
  }
}

/** 오늘 많이 본 종목 TOP */
export async function fetchTodayPopular(top = 5): Promise<PopularStock[]> {
  if (!supabase) return []
  const midnight = new Date()
  midnight.setHours(0, 0, 0, 0)
  const { data, error } = await supabase
    .from('stock_views')
    .select('code, name')
    .gte('viewed_at', midnight.toISOString())
    .limit(2000)
  if (error || !data) return []

  const counts = new Map<string, PopularStock>()
  for (const row of data) {
    const entry = counts.get(row.code) ?? { code: row.code, name: row.name, views: 0 }
    entry.views += 1
    counts.set(row.code, entry)
  }
  return [...counts.values()].sort((a, b) => b.views - a.views).slice(0, top)
}

interface VoteRow {
  vote: 'up' | 'down'
  reports: { code: string; name: string; score: number; light: Light } | null
}

/** 도움된 분석 TOP — 좋아요 많은 순 */
export async function fetchTopReports(top = 5): Promise<TopReport[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('votes')
    .select('vote, reports(code, name, score, light)')
    .limit(2000)
    .overrideTypes<VoteRow[]>()
  if (error || !data) return []

  const byCode = new Map<string, TopReport>()
  for (const row of data) {
    if (!row.reports) continue
    const r = row.reports
    const entry =
      byCode.get(r.code) ??
      { code: r.code, name: r.name, score: r.score, light: r.light, up: 0, down: 0 }
    entry[row.vote] += 1
    byCode.set(r.code, entry)
  }
  return [...byCode.values()]
    .filter((r) => r.up > 0)
    .sort((a, b) => b.up - a.up || a.down - b.down)
    .slice(0, top)
}
