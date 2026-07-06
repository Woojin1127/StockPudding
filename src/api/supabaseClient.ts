/**
 * Supabase 클라이언트 — env 미설정이면 null.
 * 로컬 개발에서 Supabase 없이도 검색/분석이 동작하도록 모든 호출부는
 * null 체크 후 폴백(엔진 직접 호출, 투표 로컬 저장)으로 흘러간다.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null

export const isSupabaseConfigured = supabase !== null
