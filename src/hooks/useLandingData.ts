/** 랜딩 콘텐츠 데이터 (v3) — 시장 무버 + 커뮤니티 집계 */
import { useQuery } from '@tanstack/react-query'

import { fetchTodayPopular, fetchTopReports } from '@/api/community'
import { fetchMovers } from '@/api/market'

export function useMovers() {
  return useQuery({
    queryKey: ['market-movers'],
    queryFn: fetchMovers,
    staleTime: 5 * 60_000,
    retry: 1,
  })
}

export function useTodayPopular() {
  return useQuery({
    queryKey: ['today-popular'],
    queryFn: () => fetchTodayPopular(),
    staleTime: 60_000,
  })
}

export function useTopReports() {
  return useQuery({
    queryKey: ['top-reports'],
    queryFn: () => fetchTopReports(),
    staleTime: 60_000,
  })
}
