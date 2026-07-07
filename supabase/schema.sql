-- Stock Pudding — Supabase 스키마 (신규 프로젝트: 이 파일 1회 실행)
-- 기존 프로젝트에 v3 기능만 추가하려면 migration_v3.sql 참고.
-- reports:     분석 리포트 저장 + 캐싱 (PRD 6.2, 6.4)
-- votes:       좋아요/싫어요, 기기 단위 1표 (PRD 6.3)
-- stock_views: 종목 조회 기록 — "오늘 많이 본 종목" 집계 (F8, v3)

create table if not exists public.reports (
  id         uuid primary key default gen_random_uuid(),
  code       text not null,
  name       text not null,
  score      int  not null check (score between 0 and 100),
  light      text not null check (light in ('green', 'yellow', 'red')),
  result     jsonb not null,          -- 엔진 /analyze 응답 원본
  created_at timestamptz not null default now()
);

-- 캐시 조회용: 종목별 최신 리포트
create index if not exists reports_code_created_idx
  on public.reports (code, created_at desc);

create table if not exists public.votes (
  report_id  uuid not null references public.reports (id) on delete cascade,
  device_id  text not null,
  vote       text not null check (vote in ('up', 'down')),
  created_at timestamptz not null default now(),
  primary key (report_id, device_id)   -- 기기당 1표 (재투표는 upsert로 교체)
);

-- ── RLS ──────────────────────────────────────────────────────────
-- 로그인 없는 MVP: anon 키로 읽기/쓰기 허용하되 update/delete 범위를 제한.
-- (기기 위조까지 막는 건 로그인(P2) 이후 auth.uid() 기반으로 강화)

alter table public.reports enable row level security;
alter table public.votes   enable row level security;

create policy "reports: 누구나 읽기"
  on public.reports for select using (true);

create policy "reports: 누구나 생성"
  on public.reports for insert with check (true);

-- reports는 update/delete 정책 없음 → 불변

create policy "votes: 누구나 읽기"
  on public.votes for select using (true);

create policy "votes: 누구나 생성"
  on public.votes for insert with check (true);

create policy "votes: 갱신 허용(재투표)"
  on public.votes for update using (true) with check (true);

create policy "votes: 삭제 허용(투표 취소)"
  on public.votes for delete using (true);

-- ── v3: 조회 기록 ─────────────────────────────────────────────────

create table if not exists public.stock_views (
  id        bigint generated always as identity primary key,
  code      text not null,
  name      text not null,
  viewed_at timestamptz not null default now()
);

create index if not exists stock_views_viewed_idx
  on public.stock_views (viewed_at desc);

alter table public.stock_views enable row level security;

create policy "stock_views: 누구나 읽기"
  on public.stock_views for select using (true);

create policy "stock_views: 누구나 생성"
  on public.stock_views for insert with check (true);

-- update/delete 정책 없음 → 불변 로그
