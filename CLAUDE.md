# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# 프로젝트: 스톡 푸딩 (Stock Pudding)

주린이(투자 경력 0~2년 초보 투자자)를 위한 한국 주식 종목 분석 서비스입니다. 어려운 주식 지표를 쉬운 말로 풀어줘 "지금 이 종목이 어떤 상태인지"를 5초 만에 이해하게 합니다.

기술 스택 (프론트엔드): React + TypeScript + Vite
상태 관리: Zustand
스타일링: Tailwind CSS
패키지 매니저: pnpm

데이터 분석 엔진: Python + FastAPI (별도 서비스, pykrx·pandas·requests)
데이터베이스: Supabase (Postgres) — 리포트 저장·투표·캐싱·랭킹 담당

> 이 서비스는 **두 개의 프로세스**로 나뉩니다: ① React 프론트(화면) ② Python 엔진(주식 데이터 수집 + 지표 계산). DB는 Supabase가 맡고, 프론트가 supabase-js로 직접 읽고 씁니다. 지표 계산은 브라우저가 아니라 **Python 엔진에서** 수행합니다 (한국 주식 데이터는 pykrx 등 파이썬 라이브러리로만 받을 수 있기 때문).

## 코드 스타일

- TypeScript strict 모드 사용, `any` 타입 금지 (불가피하면 `unknown` 사용 후 좁히기)
- default export 대신 named export 사용 (단, 페이지/라우트 컴포넌트는 예외 가능)
- 함수형 컴포넌트와 Hook만 사용, 클래스 컴포넌트 금지
- 컴포넌트 파일명은 PascalCase (`UserCard.tsx`), 그 외 유틸/훅은 camelCase
- 커스텀 훅은 반드시 `use` 접두사로 시작
- import 순서: 외부 라이브러리 → 내부 절대경로 → 상대경로 순으로 정리
- 절대경로 alias 사용 (`@/components/...`), 깊은 상대경로(`../../../`) 금지
- console.log 금지, 디버깅 로그를 커밋에 남기지 말 것
- Tailwind 유틸리티 클래스 우선 사용, 인라인 스타일·커스텀 CSS 최소화

## 명령어

- `pnpm dev`: 개발 서버 시작 (Vite, 포트 5173)
- `pnpm build`: 프로덕션 빌드 (`tsc` 타입 체크 후 `vite build`)
- `pnpm preview`: 빌드 결과물 로컬 미리보기
- `pnpm lint`: oxlint 검사
- `pnpm format`: Prettier 포맷팅
- `pnpm test`: Vitest 실행
- 배포: {프론트 미정 — Vercel 또는 Netlify 예정 / 엔진은 별도 호스팅 필요}

### Python 엔진 (별도 프로세스, `engine/` 폴더)

- 실행: `engine`에서 `python -m uvicorn main:app --port 8000`
  - 이 PC는 Python이 PATH에 없음 → `C:\Users\Woojin\AppData\Local\Programs\Python\Python312\python.exe`로 실행
- 의존성: `engine/requirements.txt` (pykrx, finance-datareader, requests, fastapi, uvicorn)
- 프론트 개발 시 엔진도 같이 띄워야 검색·분석이 동작함 (총 터미널 2개 — 상세는 README.md 실행 섹션)

## 아키텍처

### 시스템 구성 (두 서비스 + DB)

```
[React + Vite]  ──분석/검색──▶  [Python FastAPI 엔진]  ──▶  pykrx(시세) · 네이버(재무)
      │                              (:8000)
      └──저장/투표/랭킹/캐싱──▶  [Supabase (Postgres)]
                                  supabase-js로 직접 호출
```

- **Python 엔진**: `GET /search?q=`(종목검색), `GET /analyze/{code}`(6개 지표 분석). 상태 없음.
- **Supabase**: 리포트(고유 ID)·투표(기기 단위 중복 방지)·분석 캐시(TTL)·랭킹 집계.
- 캐싱 흐름: 프론트가 Supabase 캐시 확인 → 없으면 엔진 호출 → 결과를 Supabase에 저장.

### 프론트엔드 디렉터리

```
src/
├── assets/        # 이미지, 폰트 등 정적 리소스
├── components/    # 재사용 가능한 공통 UI 컴포넌트
├── pages/         # 라우트 단위 페이지 컴포넌트
├── hooks/         # 커스텀 훅
├── store/         # 전역 상태 관리 (Zustand)
├── api/           # API 호출 함수 (엔진 axios 클라이언트 + supabase 클라이언트)
├── types/         # 공유 타입 정의
├── utils/         # 순수 유틸 함수 (점수→색상 변환, 숫자 포맷 등 표시용)
└── styles/        # 전역 스타일 / 테마
```

- 라우팅: React Router v6
- API 통신: 엔진은 axios 인스턴스 + React Query, DB는 supabase-js 클라이언트
- **지표 계산 로직은 프론트에 두지 않습니다.** 계산은 Python 엔진 담당, 프론트 `utils/`는 표시용 헬퍼만.
- 환경 변수 (`VITE_` 접두사만 클라이언트 노출, `import.meta.env.VITE_*`):
  - `VITE_ENGINE_URL` — Python 엔진 주소 (예: `http://localhost:8000`)
  - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — Supabase 연결 (anon 키는 노출 OK)

## 도메인 지식 — 주식 지표

MVP에서 사용하는 지표 6종:

| 지표 | 설명 |
|------|------|
| RSI | 과매수(70↑) / 과매도(30↓) 판단 |
| 52주 고점 대비 낙폭 | 현재가가 52주 최고가에서 얼마나 빠졌는지 |
| 이평선 대비 현재가 | 20일/60일/120일 이동평균선 대비 현재가 위치 |
| 거래량 (평균 대비) | 최근 거래량이 평균 대비 급증/급감 여부 |
| PBR | 주가순자산비율 — 1 미만이면 자산 대비 저평가 신호 |
| 부채비율 | 총부채 / 자기자본 — 높을수록 재무 리스크 |

지표 해석 텍스트는 **반드시 규칙 기반으로 작성**. LLM 생성 텍스트 금지 (PRD 명시).

## 핵심 기능 범위

**P0 (MVP):** 종목 검색 & 분석, 리포트 DB 저장(고유 ID), 좋아요/싫어요 투표(기기 단위 중복 방지), 캐싱

**P1 (첫 배포 후):** 인기 분석 랭킹(투표 순), 오늘 많이 본 종목(DB 집계), 최근 검색(로컬 저장)

**P2 (다음 버전):** 로그인, 관심 종목, 알림, 정확도 검증

## 중요 사항

- **`.env` 파일은 절대 커밋하지 마세요.** `VITE_` 접두사 변수는 빌드 결과물에 그대로 노출되므로 비밀 키를 넣지 말 것
- **Supabase 키 주의**: `anon` 키는 클라이언트 노출 전제라 `VITE_`로 OK. 단 `service_role` 키는 절대 프론트/커밋 금지. 데이터 보호는 Supabase RLS(Row Level Security)로 처리
- **"지금 사세요/파세요" 같은 매매 권유 문구 절대 금지** — 신호 제시만 (PRD 명시)
- 한국 주식(코스피, 코스닥)만 지원, 해외 주식 기능 추가 금지 (P2 이후 검토)
- 투표 중복 방지는 기기 단위 (MVP는 로그인 없음)
- 새 의존성을 추가하기 전에 먼저 알려주세요 (번들 크기 영향 검토)
- 커밋 전 `pnpm lint`와 빌드가 통과하는지 확인하세요

## 참고 문서

문서는 `docs/` 폴더에 모아 관리합니다 (CLAUDE.md·README.md만 루트 유지).

- 제품 요구사항 전체 스펙은 @docs/StockPudding_PRD.md 참고
- 기능 단위 스펙·구현 상태는 @docs/FeatureSpec.md 참고
- UI 디자인 가이드는 @docs/DesignSystem.md 참고
- 진행 상황·데이터 소스·엔진 구조는 @docs/PROGRESS.md 참고
- v2(차트·기술지표·시나리오 진단) 계획·원칙은 docs/V2_Plan.md 참고
- Supabase 프로젝트 연결 방법은 docs/SupabaseSetup.md 참고 (스키마: supabase/schema.sql)
- 사용 가능한 스크립트는 @package.json 참고 (프론트 셋업 후 생성됨)
