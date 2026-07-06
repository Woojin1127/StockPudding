import type { SignalSummaryItem } from '@/types/stock'
import { SIGNAL_META } from '@/utils/signal'

/** 눈에 띄는 신호 요약 (DesignSystem.md §5.5) */
export function SignalSummary({ signals }: { signals: SignalSummaryItem[] }) {
  if (signals.length === 0) return null

  return (
    <section className="rounded-xl bg-gray-50 p-4">
      <h2 className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
        눈에 띄는 신호
      </h2>
      <ul className="mt-2 space-y-1.5">
        {signals.map((signal) => (
          <li
            key={signal.text}
            className="flex items-start gap-2 text-sm text-gray-700"
          >
            <span aria-hidden="true">{SIGNAL_META[signal.type].icon}</span>
            <span>{signal.text}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
