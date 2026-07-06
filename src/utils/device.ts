/** 기기 단위 투표 중복 방지용 익명 ID (로그인 없는 MVP 대체 수단) */

const KEY = 'sp:device-id'

export function getDeviceId(): string {
  const existing = localStorage.getItem(KEY)
  if (existing) return existing
  const id =
    typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  localStorage.setItem(KEY, id)
  return id
}
