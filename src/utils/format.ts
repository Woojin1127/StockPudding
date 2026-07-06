/** 표시용 포맷 헬퍼 — 계산 로직 금지, 문자열 변환만. */

export function formatKrw(price: number): string {
  return `${price.toLocaleString('ko-KR')}원`
}

/** '2026-07-04' -> '7월 4일 기준' */
export function formatBaseDate(isoDate: string): string {
  const [, m, d] = isoDate.split('-').map(Number)
  if (!m || !d) return isoDate
  return `${m}월 ${d}일 기준`
}

/** 시장 코드 표시명 (KOSPI -> 코스피) */
export function formatMarket(market: string): string {
  const map: Record<string, string> = {
    KOSPI: '코스피',
    KOSDAQ: '코스닥',
    'KOSDAQ GLOBAL': '코스닥 글로벌',
    KONEX: '코넥스',
  }
  return map[market.toUpperCase()] ?? market
}

/** 상대 시각 — 캐시 안내용 ('3분 전 분석') */
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const diffMs = now.getTime() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전`
  return `${Math.floor(hours / 24)}일 전`
}

/** 6자리 숫자 종목코드인지 */
export function isStockCode(input: string): boolean {
  return /^\d{6}$/.test(input.trim())
}
