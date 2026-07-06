import type { Light } from '@/types/stock'
import { LIGHT_META } from '@/utils/signal'

export function SignalBadge({ light }: { light: Light }) {
  const meta = LIGHT_META[light]
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${meta.badge}`}
    >
      {meta.emoji} {meta.label}
    </span>
  )
}
