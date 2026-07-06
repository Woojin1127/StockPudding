/** 최근 본 종목 (F9) — 로그인 없이 localStorage 영속, 최대 8개 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface RecentStock {
  code: string
  name: string
}

const MAX_RECENT = 8

interface RecentStocksState {
  recent: RecentStock[]
  addRecent: (stock: RecentStock) => void
  clearRecent: () => void
}

export const useRecentStocks = create<RecentStocksState>()(
  persist(
    (set) => ({
      recent: [],
      addRecent: (stock) =>
        set((state) => ({
          recent: [
            stock,
            ...state.recent.filter((s) => s.code !== stock.code),
          ].slice(0, MAX_RECENT),
        })),
      clearRecent: () => set({ recent: [] }),
    }),
    { name: 'sp:recent-stocks' },
  ),
)
