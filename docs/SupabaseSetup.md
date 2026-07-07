# Supabase 셋업 가이드

> 리포트 저장(F4)·투표(F5)·캐싱(F6)을 켜려면 아래 5분 셋업이 필요합니다.
> **셋업 없이도 앱은 동작합니다** — 검색·분석은 엔진 직접 호출, 투표는 기기 로컬 저장으로 폴백돼요.

## 1. 프로젝트 만들기

1. [supabase.com](https://supabase.com) 가입 → `New project` (무료 플랜 OK)
2. Region은 `Northeast Asia (Seoul)` 권장

## 2. 스키마 적용

1. 대시보드 → `SQL Editor` → `New query`
2. [`supabase/schema.sql`](../supabase/schema.sql) 내용 전체를 붙여넣고 실행
3. `Table Editor`에서 `reports`, `votes` 테이블 생성 확인

## 3. 키 연결

1. 대시보드 → `Settings` → `API`
2. 프로젝트 루트에 `.env` 생성 (`.env.example` 복사):

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...   ← "anon public" 키
```

3. dev 서버 재시작 (`pnpm dev`)

⚠️ `service_role` 키는 절대 넣지 마세요. `VITE_` 변수는 빌드 결과물에 그대로 노출됩니다.

## 업데이트 마이그레이션

- **v3 (2026-07-08)**: "오늘 많이 본 종목"용 `stock_views` 테이블 추가.
  이미 스키마를 적용한 프로젝트라면 [`supabase/migration_v3.sql`](../supabase/migration_v3.sql)을 SQL Editor에서 1회 실행하세요.
  (신규 설치는 `schema.sql`에 이미 포함)

## 동작 방식

- **캐싱**: 프론트가 `reports`에서 같은 종목의 30분 내 리포트를 먼저 찾고, 없을 때만 엔진을 호출 후 저장 (`src/api/reports.ts`의 `CACHE_TTL_MINUTES`)
- **투표**: `votes`의 기본키 `(report_id, device_id)`로 기기당 1표. 재클릭 시 삭제(취소), 반대표 클릭 시 upsert(교체)
- **공유**: 저장된 리포트는 `/report/{id}`로 재접근 가능

## 보안 메모 (MVP 한계)

로그인이 없어서 RLS는 "누구나 읽기/쓰기" 수준입니다. `device_id`는 클라이언트가 만든 값이라 악의적 위조는 막지 못해요. P2에서 로그인 도입 시 `auth.uid()` 기반 정책으로 강화하는 것이 전제입니다.
