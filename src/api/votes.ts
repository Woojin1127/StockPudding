/**
 * 좋아요/싫어요 투표 (PRD 6.3) — 기기 단위 중복 방지.
 * Supabase votes 테이블에 (report_id, device_id) 기본키로 1기기 1표.
 * Supabase 미설정이거나 reportId가 없으면 localStorage 폴백 (내 표만 기억).
 */
import { supabase } from '@/api/supabaseClient'
import type { VoteChoice, VoteCounts } from '@/types/stock'
import { getDeviceId } from '@/utils/device'

const LOCAL_KEY = 'sp:local-votes'

interface VoteState {
  counts: VoteCounts
  myVote: VoteChoice | null
}

function readLocalVotes(): Record<string, VoteChoice> {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '{}') as Record<
      string,
      VoteChoice
    >
  } catch {
    return {}
  }
}

function localState(key: string): VoteState {
  const mine = readLocalVotes()[key] ?? null
  return {
    counts: { up: mine === 'up' ? 1 : 0, down: mine === 'down' ? 1 : 0 },
    myVote: mine,
  }
}

/** 투표 현황 + 내 투표 조회. key: reportId 또는 (폴백 시) 종목코드 */
export async function fetchVoteState(
  reportId: string | null,
  fallbackKey: string,
): Promise<VoteState> {
  if (!supabase || !reportId) return localState(fallbackKey)

  const deviceId = getDeviceId()
  const { data: rows } = await supabase
    .from('votes')
    .select('device_id, vote')
    .eq('report_id', reportId)

  const counts: VoteCounts = { up: 0, down: 0 }
  let myVote: VoteChoice | null = null
  for (const row of rows ?? []) {
    const vote = row.vote as VoteChoice
    counts[vote] += 1
    if (row.device_id === deviceId) myVote = vote
  }
  return { counts, myVote }
}

/** 투표 반영. choice가 null이면 취소. 폴백 시 localStorage에만 기록. */
export async function castVote(
  reportId: string | null,
  fallbackKey: string,
  choice: VoteChoice | null,
): Promise<void> {
  if (!supabase || !reportId) {
    const all = readLocalVotes()
    if (choice) all[fallbackKey] = choice
    else delete all[fallbackKey]
    localStorage.setItem(LOCAL_KEY, JSON.stringify(all))
    return
  }

  const deviceId = getDeviceId()
  if (choice) {
    await supabase
      .from('votes')
      .upsert(
        { report_id: reportId, device_id: deviceId, vote: choice },
        { onConflict: 'report_id,device_id' },
      )
  } else {
    await supabase
      .from('votes')
      .delete()
      .eq('report_id', reportId)
      .eq('device_id', deviceId)
  }
}
