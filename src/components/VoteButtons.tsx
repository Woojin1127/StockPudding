import { useVotes } from '@/hooks/useVotes'

/** 도움됐어요/별로예요 투표 (DesignSystem.md §5.6) — 낙관적 업데이트, 재클릭 취소 */
export function VoteButtons({
  reportId,
  stockCode,
}: {
  reportId: string | null
  stockCode: string
}) {
  const { counts, myVote, toggleVote } = useVotes(reportId, stockCode)

  return (
    <section>
      <p className="text-center text-sm text-gray-500">이 분석이 도움됐나요?</p>
      <div className="mt-3 flex gap-3">
        <button
          type="button"
          onClick={() => toggleVote('up')}
          aria-pressed={myVote === 'up'}
          aria-label={`도움됐어요, 현재 ${counts.up}표`}
          className={`flex-1 rounded-xl border py-3 text-sm font-medium transition hover:scale-[1.02] ${
            myVote === 'up'
              ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
              : 'border-gray-200 bg-white text-gray-600'
          }`}
        >
          👍 도움됐어요
          <span className="ml-2 font-bold tabular-nums">{counts.up}</span>
        </button>
        <button
          type="button"
          onClick={() => toggleVote('down')}
          aria-pressed={myVote === 'down'}
          aria-label={`별로예요, 현재 ${counts.down}표`}
          className={`flex-1 rounded-xl border py-3 text-sm font-medium transition hover:scale-[1.02] ${
            myVote === 'down'
              ? 'border-red-300 bg-red-50 text-red-700'
              : 'border-gray-200 bg-white text-gray-600'
          }`}
        >
          👎 별로예요
          <span className="ml-2 font-bold tabular-nums">{counts.down}</span>
        </button>
      </div>
    </section>
  )
}
