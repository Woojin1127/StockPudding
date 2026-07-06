import { describe, expect, it } from 'vitest'

import { LIGHT_META, SIGNAL_META, lightFromScore } from '@/utils/signal'

describe('lightFromScore', () => {
  it('엔진(scoring.py)과 동일한 경계값으로 신호등을 나눈다', () => {
    expect(lightFromScore(100)).toBe('green')
    expect(lightFromScore(65)).toBe('green')
    expect(lightFromScore(64)).toBe('yellow')
    expect(lightFromScore(45)).toBe('yellow')
    expect(lightFromScore(44)).toBe('red')
    expect(lightFromScore(0)).toBe('red')
  })
})

describe('신호 메타 매핑', () => {
  it('세 신호등 모두 라벨과 스타일을 가진다', () => {
    for (const light of ['green', 'yellow', 'red'] as const) {
      expect(LIGHT_META[light].label).toBeTruthy()
      expect(LIGHT_META[light].badge).toContain('bg-')
    }
  })

  it('세 신호 모두 아이콘을 가진다', () => {
    for (const signal of ['good', 'neutral', 'bad'] as const) {
      expect(SIGNAL_META[signal].icon).toBeTruthy()
    }
  })
})
