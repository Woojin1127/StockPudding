import {
  AreaSeries,
  ColorType,
  createChart,
  HistogramSeries,
  LineSeries,
  type UTCTimestamp,
} from 'lightweight-charts'
import { useEffect, useRef, useState } from 'react'

import type { ChartSeries } from '@/types/stock'

interface Toggles {
  ma: boolean
  volume: boolean
  rsi: boolean
}

const MA_STYLE = [
  { key: 'ma20', label: '20일', color: '#F59E0B' },
  { key: 'ma60', label: '60일', color: '#0EA5E9' },
  { key: 'ma120', label: '120일', color: '#8B5CF6' },
] as const

// 한국 관례: 상승 빨강 / 하락 파랑 (거래량 막대)
const VOL_UP = 'rgba(239, 68, 68, 0.45)'
const VOL_DOWN = 'rgba(59, 130, 246, 0.45)'

function toTime(date: string): UTCTimestamp {
  return (new Date(`${date}T00:00:00Z`).getTime() / 1000) as UTCTimestamp
}

function linePoints(dates: string[], values: (number | null)[]) {
  return dates.flatMap((d, i) => {
    const v = values[i]
    return v === null || v === undefined ? [] : [{ time: toTime(d), value: v }]
  })
}

/** 1년 가격 차트 — 이평선/거래량/RSI 토글 (v2, lightweight-charts) */
export function PriceChart({ series }: { series: ChartSeries }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [toggles, setToggles] = useState<Toggles>({
    ma: true,
    volume: true,
    rsi: false,
  })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const chart = createChart(el, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9CA3AF',
        fontFamily: 'Pretendard, sans-serif',
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: '#F3F4F6' },
        horzLines: { color: '#F3F4F6' },
      },
      rightPriceScale: { borderColor: '#E5E7EB' },
      timeScale: { borderColor: '#E5E7EB' },
      crosshair: { horzLine: { labelBackgroundColor: '#6366F1' }, vertLine: { labelBackgroundColor: '#6366F1' } },
      localization: {
        priceFormatter: (p: number) => p.toLocaleString('ko-KR'),
      },
    })

    const close = chart.addSeries(AreaSeries, {
      lineColor: '#6366F1',
      lineWidth: 2,
      topColor: 'rgba(99, 102, 241, 0.2)',
      bottomColor: 'rgba(99, 102, 241, 0)',
      priceLineVisible: false,
    })
    close.setData(
      series.dates.map((d, i) => ({ time: toTime(d), value: series.close[i] })),
    )

    if (toggles.ma) {
      for (const { key, color } of MA_STYLE) {
        const line = chart.addSeries(LineSeries, {
          color,
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: false,
          crosshairMarkerVisible: false,
        })
        line.setData(linePoints(series.dates, series[key]))
      }
    }

    let nextPane = 1
    if (toggles.volume) {
      const volPane = nextPane++
      const volume = chart.addSeries(
        HistogramSeries,
        { priceFormat: { type: 'volume' }, priceLineVisible: false, lastValueVisible: false },
        volPane,
      )
      volume.setData(
        series.dates.map((d, i) => ({
          time: toTime(d),
          value: series.volume[i],
          color:
            series.close[i] >= (series.close[i - 1] ?? series.close[i])
              ? VOL_UP
              : VOL_DOWN,
        })),
      )
      chart.panes()[volPane]?.setHeight(70)
    }

    if (toggles.rsi) {
      const rsiPane = nextPane++
      const rsi = chart.addSeries(
        LineSeries,
        { color: '#EC4899', lineWidth: 1, priceLineVisible: false, lastValueVisible: false },
        rsiPane,
      )
      rsi.setData(linePoints(series.dates, series.rsi))
      rsi.createPriceLine({ price: 70, color: '#FCA5A5', lineStyle: 3, title: '과매수 70' })
      rsi.createPriceLine({ price: 30, color: '#93C5FD', lineStyle: 3, title: '과매도 30' })
      chart.panes()[rsiPane]?.setHeight(90)
    }

    // autoSize가 실제 컨테이너 폭을 잡은 뒤에 fit해야 전체 기간이 화면에 맞는다
    chart.timeScale().fitContent()
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => chart.timeScale().fitContent())
    })
    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
      chart.remove()
    }
  }, [series, toggles])

  const heightClass = {
    ff: 'h-72',
    tf: 'h-88',
    ft: 'h-96',
    tt: 'h-112',
  }[`${toggles.volume ? 't' : 'f'}${toggles.rsi ? 't' : 'f'}`]!

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1 text-xs font-medium transition ${
      active
        ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
    }`

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
          최근 1년 가격 흐름
        </h2>
        <div className="flex gap-1.5">
          <button
            type="button"
            aria-pressed={toggles.ma}
            onClick={() => setToggles((t) => ({ ...t, ma: !t.ma }))}
            className={chip(toggles.ma)}
          >
            이평선
          </button>
          <button
            type="button"
            aria-pressed={toggles.volume}
            onClick={() => setToggles((t) => ({ ...t, volume: !t.volume }))}
            className={chip(toggles.volume)}
          >
            거래량
          </button>
          <button
            type="button"
            aria-pressed={toggles.rsi}
            onClick={() => setToggles((t) => ({ ...t, rsi: !t.rsi }))}
            className={chip(toggles.rsi)}
          >
            RSI
          </button>
        </div>
      </div>

      {toggles.ma && (
        <div className="mt-2 flex gap-3">
          {MA_STYLE.map(({ key, label, color }) => (
            <span key={key} className="flex items-center gap-1 text-xs text-gray-500">
              <span
                className={`h-0.5 w-4 rounded ${
                  color === '#F59E0B'
                    ? 'bg-amber-500'
                    : color === '#0EA5E9'
                      ? 'bg-sky-500'
                      : 'bg-violet-500'
                }`}
              />
              {label}
            </span>
          ))}
        </div>
      )}

      <div ref={containerRef} className={`mt-3 w-full ${heightClass}`} />
      <p className="mt-2 text-right text-xs text-gray-400">
        드래그로 이동 · 휠로 확대/축소
      </p>
    </section>
  )
}
