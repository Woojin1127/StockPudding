/** 종목 검색 자동완성 (F1) — 입력 디바운스 후 엔진 /search 호출 */
import { useQuery } from '@tanstack/react-query'

import { searchStocks } from '@/api/engine'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

export function useStockSearch(rawQuery: string) {
  const query = useDebouncedValue(rawQuery.trim(), 250)

  const result = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchStocks(query),
    enabled: query.length >= 1,
    staleTime: 5 * 60_000, // 종목 마스터는 자주 안 변함
    retry: 1,
  })

  return { ...result, debouncedQuery: query }
}
