import { useState } from 'react'
import { Link } from 'react-router-dom'

import {
  useMovers,
  useTodayPopular,
  useTopReports,
} from '@/hooks/useLandingData'
import type { MoverStock } from '@/api/market'
import { formatAmount, formatChangePct } from '@/utils/format'
import { LIGHT_META } from '@/utils/signal'

/** 주가 등락 색 — 한국 관례 (상승 빨강/하락 파랑, DesignSystem §2.4) */
function changeColor(pct: number): string {
  if (pct > 0) return 'text-red-500'
  if (pct < 0) return 'text-blue-500'
  return 'text-gray-500'
}

function SectionCard({
  title,
  emoji,
  children,
  action,
}: {
  title: string
  emoji: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-900">
          {emoji} {title}
        </h3>
        {action}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  )
}

function RowSkeleton() {
  return (
    <ul className="animate-pulse space-y-2 py-1" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <li key={i} className="h-8 rounded-lg bg-gray-100" />
      ))}
    </ul>
  )
}

function MoverRow({ stock, rank }: { stock: MoverStock; rank: number }) {
  return (
    <li>
      <Link
        to={`/stock/${stock.code}`}
        className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 transition hover:bg-indigo-50/60"
      >
        <span className="w-4 shrink-0 text-center text-xs font-bold text-gray-300 tabular-nums">
          {rank}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800">
          {stock.name}
        </span>
        <span className="text-xs text-gray-400 tabular-nums">
          {stock.price.toLocaleString('ko-KR')}
        </span>
        <span
          className={`w-16 shrink-0 text-right text-sm font-bold tabular-nums ${changeColor(stock.change_pct)}`}
        >
          {formatChangePct(stock.change_pct)}
        </span>
      </Link>
    </li>
  )
}

/** 랜딩 콘텐츠 그리드 (v3) — 급등락 · 거래대금 · 오늘 많이 본 · 도움된 분석 */
export function MarketSections() {
  const [moverTab, setMoverTab] = useState<'gainers' | 'losers'>('gainers')
  const movers = useMovers()
  const popular = useTodayPopular()
  const topReports = useTopReports()

  const moverList = movers.data?.[moverTab] ?? []

  return (
    <section className="px-4 pb-4">
      <div className="mx-auto grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
        {/* 오늘의 급등락 (엔진) */}
        <SectionCard
          title="오늘의 급등락"
          emoji="⚡"
          action={
            <div className="flex overflow-hidden rounded-lg border border-gray-200">
              {(
                [
                  ['gainers', '급등'],
                  ['losers', '급락'],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={moverTab === key}
                  onClick={() => setMoverTab(key)}
                  className={`px-2.5 py-1 text-xs font-medium transition ${
                    moverTab === key
                      ? key === 'gainers'
                        ? 'bg-red-500 text-white'
                        : 'bg-blue-500 text-white'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          }
        >
          {movers.isPending && <RowSkeleton />}
          {movers.isError && (
            <p className="py-3 text-sm text-gray-400">
              시장 데이터를 불러오지 못했어요
            </p>
          )}
          <ul>
            {moverList.map((stock, i) => (
              <MoverRow key={stock.code} stock={stock} rank={i + 1} />
            ))}
          </ul>
        </SectionCard>

        {/* 거래대금 TOP (엔진) */}
        <SectionCard title="돈이 몰린 곳 (거래대금)" emoji="💰">
          {movers.isPending && <RowSkeleton />}
          {movers.isError && (
            <p className="py-3 text-sm text-gray-400">
              시장 데이터를 불러오지 못했어요
            </p>
          )}
          <ul>
            {(movers.data?.most_traded ?? []).map((stock, i) => (
              <li key={stock.code}>
                <Link
                  to={`/stock/${stock.code}`}
                  className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 transition hover:bg-indigo-50/60"
                >
                  <span className="w-4 shrink-0 text-center text-xs font-bold text-gray-300 tabular-nums">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800">
                    {stock.name}
                  </span>
                  <span className="text-xs font-semibold text-gray-500 tabular-nums">
                    {formatAmount(stock.amount)}
                  </span>
                  <span
                    className={`w-16 shrink-0 text-right text-sm font-bold tabular-nums ${changeColor(stock.change_pct)}`}
                  >
                    {formatChangePct(stock.change_pct)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* 오늘 많이 본 종목 (DB) — 데이터 없으면 안내 문구 */}
        <SectionCard title="오늘 많이 본 종목" emoji="👀">
          {popular.isPending && <RowSkeleton />}
          {popular.data && popular.data.length === 0 && (
            <p className="py-3 text-sm text-gray-400">
              아직 오늘 조회 기록이 없어요. 첫 번째로 검색해보세요!
            </p>
          )}
          <ul>
            {(popular.data ?? []).map((stock, i) => (
              <li key={stock.code}>
                <Link
                  to={`/stock/${stock.code}`}
                  className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 transition hover:bg-indigo-50/60"
                >
                  <span className="w-4 shrink-0 text-center text-xs font-bold text-gray-300 tabular-nums">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800">
                    {stock.name}
                  </span>
                  <span className="text-xs text-gray-400 tabular-nums">
                    {stock.views}회 조회
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* 도움된 분석 TOP (DB) */}
        <SectionCard title="도움된 분석 TOP" emoji="🏆">
          {topReports.isPending && <RowSkeleton />}
          {topReports.data && topReports.data.length === 0 && (
            <p className="py-3 text-sm text-gray-400">
              아직 투표가 없어요. 분석이 도움됐다면 👍 를 눌러주세요!
            </p>
          )}
          <ul>
            {(topReports.data ?? []).map((report, i) => (
              <li key={report.code}>
                <Link
                  to={`/stock/${report.code}`}
                  className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 transition hover:bg-indigo-50/60"
                >
                  <span className="w-4 shrink-0 text-center text-xs font-bold text-gray-300 tabular-nums">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800">
                    {report.name}
                  </span>
                  <span className="text-xs tabular-nums">
                    {LIGHT_META[report.light].emoji} {report.score}점
                  </span>
                  <span className="w-12 shrink-0 text-right text-sm font-semibold text-emerald-600 tabular-nums">
                    👍 {report.up}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
      <p className="mx-auto mt-2 max-w-2xl px-1 text-right text-xs text-gray-400">
        시장 데이터는 최근 거래일 종가 기준이에요
      </p>
    </section>
  )
}
