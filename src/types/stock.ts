/** 엔진·DB와 공유하는 도메인 타입. 계산은 전부 Python 엔진 담당이고 여기는 표시용 계약만 정의한다. */

/** 지표별 신호 (엔진 scoring.py와 동일한 문자열) */
export type Signal = 'good' | 'neutral' | 'bad'

/** 종합 신호등 (점수 65+ green / 45~64 yellow / ~44 red) */
export type Light = 'green' | 'yellow' | 'red'

export interface StockSearchResult {
  code: string
  name: string
  market: string
}

export interface IndicatorCardData {
  key: string
  label: string
  value: string
  score: number
  signal: Signal
  comment: string
}

export interface SignalSummaryItem {
  type: Signal
  text: string
}

/** 차트용 시계열 (v2) — 최근 250영업일, 워밍업 구간은 null */
export interface ChartSeries {
  dates: string[]
  close: number[]
  volume: number[]
  ma20: (number | null)[]
  ma60: (number | null)[]
  ma120: (number | null)[]
  rsi: (number | null)[]
}

/** 기술 지표 신호 집계 (v2) */
export interface TechSummary {
  good: number
  neutral: number
  bad: number
  verdict: string
}

/** GET /analyze/{code} 응답 (engine/analyze.py)
 *  v2 필드(series/technicals/tech_summary)는 v1 시절 캐시된 리포트에 없을 수 있어 optional */
export interface AnalysisResult {
  code: string
  name: string
  price: number
  date: string
  score: number
  light: Light
  verdict: string
  diagnosis: string
  signals: SignalSummaryItem[]
  cards: IndicatorCardData[]
  technicals?: IndicatorCardData[]
  tech_summary?: TechSummary
  series?: ChartSeries
}

/** 분석 결과 + 저장 메타. Supabase 미설정 시 reportId는 null. */
export interface StockReport {
  reportId: string | null
  analyzedAt: string
  fromCache: boolean
  result: AnalysisResult
}

export type VoteChoice = 'up' | 'down'

export interface VoteCounts {
  up: number
  down: number
}
