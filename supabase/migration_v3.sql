-- v3 마이그레이션 — "오늘 많이 본 종목"(F8)용 조회 기록
-- 기존 스키마가 이미 적용된 프로젝트에서 이 파일만 SQL Editor에서 1회 실행하세요.
-- (신규 설치는 schema.sql 하나로 충분 — 동일 내용 포함)

create table if not exists public.stock_views (
  id        bigint generated always as identity primary key,
  code      text not null,
  name      text not null,
  viewed_at timestamptz not null default now()
);

-- 오늘 집계 조회용
create index if not exists stock_views_viewed_idx
  on public.stock_views (viewed_at desc);

alter table public.stock_views enable row level security;

create policy "stock_views: 누구나 읽기"
  on public.stock_views for select using (true);

create policy "stock_views: 누구나 생성"
  on public.stock_views for insert with check (true);

-- update/delete 정책 없음 → 불변 로그
