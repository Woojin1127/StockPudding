import { describe, expect, it } from 'vitest'

import {
  formatBaseDate,
  formatKrw,
  formatMarket,
  formatRelativeTime,
  isStockCode,
} from '@/utils/format'

describe('formatKrw', () => {
  it('천 단위 콤마와 원 단위를 붙인다', () => {
    expect(formatKrw(61000)).toBe('61,000원')
    expect(formatKrw(900)).toBe('900원')
  })
})

describe('formatBaseDate', () => {
  it('ISO 날짜를 "n월 n일 기준"으로 바꾼다', () => {
    expect(formatBaseDate('2026-07-04')).toBe('7월 4일 기준')
    expect(formatBaseDate('2026-12-31')).toBe('12월 31일 기준')
  })

  it('형식이 다르면 원본을 그대로 반환한다', () => {
    expect(formatBaseDate('unknown')).toBe('unknown')
  })
})

describe('formatMarket', () => {
  it('영문 시장명을 한글로 바꾼다', () => {
    expect(formatMarket('KOSPI')).toBe('코스피')
    expect(formatMarket('KOSDAQ')).toBe('코스닥')
  })

  it('모르는 시장명은 그대로 둔다', () => {
    expect(formatMarket('NYSE')).toBe('NYSE')
  })
})

describe('formatRelativeTime', () => {
  const now = new Date('2026-07-06T12:00:00Z')

  it('분/시간/일 단위로 표시한다', () => {
    expect(formatRelativeTime('2026-07-06T11:59:40Z', now)).toBe('방금 전')
    expect(formatRelativeTime('2026-07-06T11:45:00Z', now)).toBe('15분 전')
    expect(formatRelativeTime('2026-07-06T09:00:00Z', now)).toBe('3시간 전')
    expect(formatRelativeTime('2026-07-04T12:00:00Z', now)).toBe('2일 전')
  })
})

describe('isStockCode', () => {
  it('6자리 숫자만 종목코드로 인정한다', () => {
    expect(isStockCode('005930')).toBe(true)
    expect(isStockCode(' 005930 ')).toBe(true)
    expect(isStockCode('5930')).toBe(false)
    expect(isStockCode('삼성전자')).toBe(false)
    expect(isStockCode('00593a')).toBe(false)
  })
})
