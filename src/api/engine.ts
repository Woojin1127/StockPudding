/** Python 엔진(FastAPI) 클라이언트 — 검색·분석 호출만 담당 */
import axios from 'axios'

import type { AnalysisResult, StockSearchResult } from '@/types/stock'

const engineClient = axios.create({
  baseURL: import.meta.env.VITE_ENGINE_URL ?? 'http://localhost:8000',
  timeout: 30_000, // 첫 분석은 pykrx 수집 때문에 수 초 걸릴 수 있음
})

interface SearchResponse {
  query: string
  results: StockSearchResult[]
}

export async function searchStocks(query: string): Promise<StockSearchResult[]> {
  const { data } = await engineClient.get<SearchResponse>('/search', {
    params: { q: query },
  })
  return data.results
}

export async function analyzeStock(code: string): Promise<AnalysisResult> {
  const { data } = await engineClient.get<AnalysisResult>(`/analyze/${code}`)
  return data
}
