/** 시장 무버 (v3) — 엔진 /market/movers (급등/급락/거래대금 TOP) */
import axios from 'axios'

export interface MoverStock {
  code: string
  name: string
  market: string
  price: number
  change_pct: number
  amount: number
}

export interface MarketMovers {
  gainers: MoverStock[]
  losers: MoverStock[]
  most_traded: MoverStock[]
}

const engineClient = axios.create({
  baseURL: import.meta.env.VITE_ENGINE_URL ?? 'http://localhost:8000',
  timeout: 60_000, // 첫 호출은 전종목 스냅샷 로드로 수십 초 걸릴 수 있음
})

export async function fetchMovers(): Promise<MarketMovers> {
  const { data } = await engineClient.get<MarketMovers>('/market/movers')
  return data
}
