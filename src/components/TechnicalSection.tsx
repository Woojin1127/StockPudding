import { useState } from 'react'

import type { IndicatorCardData, TechSummary } from '@/types/stock'
import { INDICATOR_HELP } from '@/utils/indicatorHelp'
import { SIGNAL_META } from '@/utils/signal'

/** 기술적 지표 확장 섹션 (v2) — 신호 집계 + 지표별 행, 접었다 펼치기 */
export function TechnicalSection({
  technicals,
  summary,
}: {
  technicals: IndicatorCardData[]
  summary: TechSummary
}) {
  const [expanded, setExpanded] = useState(false)
  const [helpKey, setHelpKey] = useState<string | null>(null)

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div>
          <h2 className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
            기술적 지표 더 보기
          </h2>
          <p className="mt-1 text-sm font-medium text-gray-700">
            {summary.verdict}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex gap-1 text-xs tabular-nums">
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
              🟢 {summary.good}
            </span>
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-700">
              🟡 {summary.neutral}
            </span>
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-red-700">
              🔴 {summary.bad}
            </span>
          </span>
          <svg
            className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </button>

      {expanded && (
        <ul className="mt-4 divide-y divide-gray-100">
          {technicals.map((tech) => {
            const meta = SIGNAL_META[tech.signal]
            const help = INDICATOR_HELP[tech.key]
            return (
              <li key={tech.key} className="py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${meta.dot}`} />
                    {tech.label}
                    {help && (
                      <button
                        type="button"
                        onClick={() =>
                          setHelpKey((k) => (k === tech.key ? null : tech.key))
                        }
                        aria-label={`${tech.label} 설명 보기`}
                        aria-expanded={helpKey === tech.key}
                        className="rounded-full bg-gray-100 px-1.5 text-xs text-gray-400 transition hover:bg-indigo-50 hover:text-indigo-500"
                      >
                        ?
                      </button>
                    )}
                  </span>
                  <span className={`text-sm font-bold tabular-nums ${meta.text}`}>
                    {tech.value}
                  </span>
                </div>
                <p className="mt-1 pl-4 text-sm text-gray-500">{tech.comment}</p>
                {helpKey === tech.key && help && (
                  <p className="mt-2 ml-4 rounded-lg bg-indigo-50/60 p-3 text-xs leading-relaxed text-gray-600">
                    {help}
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
