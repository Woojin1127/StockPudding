/** 투표 상태 + 낙관적 업데이트 (F5) — 클릭 즉시 수치 반영, 재클릭 시 취소 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { castVote, fetchVoteState } from '@/api/votes'
import type { VoteChoice, VoteCounts } from '@/types/stock'

interface VoteState {
  counts: VoteCounts
  myVote: VoteChoice | null
}

export function useVotes(reportId: string | null, fallbackKey: string) {
  const queryClient = useQueryClient()
  const queryKey = ['votes', reportId ?? `local:${fallbackKey}`]

  const { data } = useQuery({
    queryKey,
    queryFn: () => fetchVoteState(reportId, fallbackKey),
    staleTime: 30_000,
  })

  const state: VoteState = data ?? { counts: { up: 0, down: 0 }, myVote: null }

  const mutation = useMutation({
    mutationFn: (choice: VoteChoice | null) =>
      castVote(reportId, fallbackKey, choice),
    onMutate: async (choice) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<VoteState>(queryKey)
      queryClient.setQueryData<VoteState>(queryKey, (old) => {
        const base = old ?? { counts: { up: 0, down: 0 }, myVote: null }
        const counts = { ...base.counts }
        if (base.myVote) counts[base.myVote] = Math.max(0, counts[base.myVote] - 1)
        if (choice) counts[choice] += 1
        return { counts, myVote: choice }
      })
      return { previous }
    },
    onError: (_err, _choice, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous)
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })

  const toggleVote = (choice: VoteChoice) => {
    mutation.mutate(state.myVote === choice ? null : choice)
  }

  return { counts: state.counts, myVote: state.myVote, toggleVote }
}
