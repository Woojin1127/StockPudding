# Stock Pudding — 작업 기록

> 무슨 작업을 했는지 간단히 남기는 로그. 최신이 위로.

## 전체 진행 상황

- [x] **1. 데이터 PoC** ← 완료. 6개 지표 원천 전부 확보 확인 (아래 데이터 소스 표 참고)
- [x] **2. 지표 엔진** ← 완료. 6개 지표 계산→점수화→신호등→규칙기반 진단, 3종목 검증
- [x] **3. engine API** ← 완료. FastAPI `/search`, `/analyze/{code}`, `/health` 동작 확인
- [x] **4. web 기반** ← 완료. Tailwind + 랜딩 + 라우팅/쿼리/스토어 뼈대
- [x] **5. web P0 화면** ← 완료 (2026-07-06). 검색 자동완성 → `/stock/:code` 분석 화면 → 투표. Supabase 코드·스키마 완료, **실 프로젝트 생성 + .env 키 입력만 남음** (docs/SupabaseSetup.md)
- [ ] 6. P1 (F7 랭킹, F8 오늘 많이 본 종목 — F9 최근 검색은 완료)
- [ ] 7. 배포 (프론트 Vercel/Netlify + 엔진 호스팅 + Supabase 프로젝트 생성)

## 확정된 결정

- **데이터 소스**: pykrx + FinanceDataReader (무료, API키 불필요)
- **스택**: React+Vite+TS(프론트) / Python FastAPI(지표 엔진) / Supabase(DB)
  - ※ 2026-06-24 변경: 기존 "Next.js 풀스택+SQLite" → CLAUDE.md 반영해 "React+Vite / Supabase"로 확정
  - 지표 계산은 Python 엔진 유지(프론트 아님). DB는 Supabase가 서버 역할(프론트에서 supabase-js 직접 호출)
- **배포**: 나중에 (프론트 Vercel/Netlify, 엔진 별도 호스팅)
- **대상 지표(6개)**: RSI, 52주 고점 대비 낙폭, 이평선 대비 현재가, 거래량(평균 대비), PBR, 부채비율

## 데이터 소스 (PoC로 확정)

| 지표 | 원천 | 소스 |
|------|------|------|
| RSI / 52주 낙폭 / 이평선 / 거래량 | OHLCV 시계열 | **pykrx** `get_market_ohlcv` (정상, ~279행/1년) |
| 종목명 ↔ 코드 (검색) | 종목 마스터 | **pykrx** `get_market_ticker_name` |
| PBR | 투자지표 | **네이버 모바일 API** `/api/stock/{code}/integration` |
| 부채비율 | 재무비율 | **네이버 모바일 API** `/api/stock/{code}/finance/annual` |

- 주의: pykrx `get_market_fundamental`(PBR)은 빈 응답 발생 → 재무는 네이버로 통일.
- 네이버 API는 비공식이라 추후 변동 가능 → engine에서 호출부 분리(어댑터)해 교체 쉽게.

## engine 구조 (2번에서 만듦)

| 파일 | 역할 |
|------|------|
| `engine/data.py` | 데이터 어댑터 — pykrx(시세/종목명) + 네이버(PBR/부채비율). 외부호출 격리 |
| `engine/indicators.py` | 순수 계산 — RSI, 52주낙폭, 이평선, 거래량비 |
| `engine/scoring.py` | 점수화 0~100 + 신호등 + 규칙기반 진단. 가중치/임계값 표준 |
| `engine/analyze.py` | 진입점 `analyze_stock(code)` → 결과 dict. CLI 데모 겸용 |
| `engine/main.py` | FastAPI 앱 (3번에서 만듦) |
| `engine/requirements.txt` | 의존성 |

## engine API (3번)

- 엔드포인트:
  - `GET /health` → `{ok:true}`
  - `GET /search?q=삼성전자` (또는 `?q=035`) → `{query, results:[{code,name,market}]}`
  - `GET /analyze/{code}` → 분석 결과 dict (6자리 숫자 검증)
- 검색 소스: FDR `StockListing('KRX')` 전종목 2875개를 프로세스 내 1회 캐싱
- CORS: `localhost:5173`(Vite dev) 허용 ← 스택 변경으로 3000에서 수정
- 실행: `engine` 폴더에서 `python -m uvicorn main:app --port 8000`
- 검증: 삼성전자/035 검색 정확 매칭, analyze JSON UTF-8 정상(6카드)
- 참고: PowerShell 콘솔은 한글 깨져 보이나 JSON 자체는 정상(파일로 확인함)

- 점수 규칙(표준): RSI 70↑위험/30↓침체, PBR 1↓저평가·3↑고평가, 부채 100↓안정·200↑주의,
  낙폭 -50%↓위험, 이평 전부상회=상승. 가중치 RSI0.15·낙폭0.15·이평0.20·거래0.10·PBR0.20·부채0.20
- 신호등: 종합 65↑🟢 / 45~65🟡 / 45↓🔴
- 실행: `python engine/analyze.py 005930`
- 검증 결과: 삼성 68🟢 / 카카오 54🟡 / SK하이닉스 68🟢 (종목별로 잘 구분됨)
- 매매 권유 문구 없음(PRD 준수). 면책 고지는 화면 공통 푸터 담당(2026-07-07부터 진단 텍스트에서 제거).

## 프론트엔드 구조 (5번까지 반영, 2026-07-06)

```
src/
├── api/         engine.ts(axios) · supabaseClient.ts(env 없으면 null) · reports.ts(캐시→엔진→저장) · votes.ts
├── components/  Layout · SearchBar(자동완성) · ScoreCard · ScoreGauge · SignalBadge
│                IndicatorCard · SignalSummary · VoteButtons · AnalysisView · AnalysisSkeleton · ErrorState
├── hooks/       useStockSearch · useReport · useVotes · useDebouncedValue
├── pages/       LandingPage · StockPage(/stock/:code) · ReportPage(/report/:id) · NotFoundPage
├── store/       recentStocks.ts (zustand persist, 최근 본 종목 8개)
├── types/       stock.ts (엔진 응답·리포트·투표 타입)
└── utils/       format.ts · signal.ts(신호등→클래스 매핑) · device.ts(투표용 기기 ID)
```

- 라우팅: `/` 랜딩 → 검색/칩 → `/stock/:code` 분석 → 투표. `/report/:id`는 저장본 공유용
- 데이터 흐름: React Query 캐시(5분) → Supabase `reports` 캐시(30분 TTL) → 엔진 `/analyze`
- Supabase 미설정 시 폴백: 엔진 직접 호출(reportId=null) + 투표 localStorage — 로컬 개발은 엔진만 있으면 됨
- 검증: `pnpm build`(tsc+vite)·`pnpm lint`·`pnpm test`(10개) 통과, Claude Preview로 랜딩/자동완성/분석(카카오 59🟡 실데이터)/투표 토글/모바일 뷰 확인, 콘솔 에러 없음

## 나중에 개선할 점 (MVP 후 숙제)

- 종목목록 캐시(`get_listing`)가 서버 재시작 전까지 갱신 안 됨 → 하루 1회 TTL 재로드 필요
- RSI가 단순평균(SMA) 방식 → 정석 Wilder 지수평활로 바꿀지 검토
- `requests` 동기 호출이 async FastAPI 안에서 블로킹 → 트래픽 늘면 httpx 비동기로
- engine 테스트 코드 없음 (indicators는 순수함수라 붙이기 쉬움) — 프론트 utils는 Vitest 10개 있음
- Pretendard를 CDN(jsdelivr)으로 불러오는 중 → 배포 전 로컬 번들/자체 호스팅 전환 검토
- 투표 수치는 votes 전체 행을 읽어 세는 방식 → 트래픽 늘면 집계 뷰/RPC로 전환
- Supabase RLS가 anon 전면 허용(로그인 없는 MVP 한계) → P2 로그인 도입 시 auth.uid() 기반으로 강화

## 참고: 종목 수

- `fdr.StockListing('KRX')` = 2875개 (KOSDAQ 1772 / KOSPI 946 / KONEX 107 / KOSDAQ GLOBAL 50)
- 우선주·스팩 포함. 한국 시장 정상 규모(미국 ~5천, 일본 ~3.9천 대비)

## 로컬 환경

- Python: `C:\Users\Woojin\AppData\Local\Programs\Python\Python312\python.exe` (PATH 미등록 → 절대경로로 실행)
- 설치 패키지: pykrx 1.2.8, finance-datareader 0.9.202, requests

---

## 로그

### 2026-07-08 — v2 다듬기: 3년 차트·기간 선택, 툴팁, 패치노트 (`feat/web-v2`)

사용자 피드백 3건 반영:
- **차트 3년으로 확장 + 기간 선택**: 성능 문제 없음(pykrx 1회 호출, JSON ~45KB) → `get_ohlcv` 1150일, `chart_series` 760영업일. 차트에 3달/1년/3년 세그먼트 버튼(기본 1년, 3년은 fitContent). 검증: 엔진 응답 760일(2023-05→2026-07), 축 전환 확인
- **핵심 6지표 "?"를 클릭 토글 → 호버 툴팁으로**: 토글이 카드 높이를 바꿔 그리드 옆 카드가 밀리던 문제 해결. peer-hover/peer-focus CSS만으로 다크 툴팁 오버레이(JS 상태 제거). 기술 지표 섹션은 세로 리스트라 토글 유지
- **패치노트**: `/patches` 페이지 + 헤더 우측 링크(모바일은 아이콘만). 내용은 `src/data/patchNotes.ts`에서 관리 — 커밋 단위가 아니라 큰 변화 단위로 기록(현재 web 1, web 2)
- 참고: v1 캐시 리포트는 250일 시계열이라 TTL(30분) 만료 후 자연스럽게 3년치로 교체됨

### 2026-07-07 (밤) — v2 M1: 차트 + 기술지표 + 시나리오 진단 (`feat/web-v2`)

**배경**: "모든 종목에 똑같은 진단, 차트 없음, 버려지는 데이터" 피드백 → 인베스팅닷컴을 벤치마크로 개념을 가져오되 스톡푸딩 톤으로 (docs/V2_Plan.md).

**무엇을/어떻게**:
- **인터랙티브 차트** (`PriceChart.tsx`): lightweight-charts v5 신규 의존성(gzip ~56KB, 분석 페이지 lazy 로드로 격리). 1년 종가 에어리어 + 이평선 3종 + 거래량 패널(한국 관례 빨강/파랑) + RSI 패널(70/30 기준선), 토글 칩. 엔진이 어차피 받아오던 OHLCV를 `chart_series()`로 응답에 포함 — 버려지던 데이터 재활용
- **기술 지표 6종 추가** (indicators/scoring): MACD(가격 대비 % 정규화), 스토캐스틱, Williams %R, ROC, 볼린저 %B, ATR. 종합점수엔 미반영(보조 섹션), 긍정/부정 집계 요약 제공 — 매수/매도 단어는 안 씀
- **시나리오 진단 사전** (`_diagnose_scenario`): 지표 조합 17개 시나리오, 구체적 조합 우선 매칭 + 수치 삽입. 폴백도 최고/최저 지표를 수치와 엮게 개선 → 삼성/카카오/NAVER 3종목이 전부 다른 진단 확인
- **용어 도움말**: 12개 지표 전부 "?" 토글 (`indicatorHelp.ts`, 생활 언어 비유)
- 검증: build/lint/test 통과, 브라우저에서 차트 토글·기술 섹션 펼침·도움말·시나리오 진단 확인, 콘솔 에러 0. autoSize 이전에 fitContent가 실행돼 차트가 쏠리는 버그 → rAF 2회 후 재-fit으로 수정
- Supabase 실연동 확인: 사용자가 프로젝트 생성 완료. `.env`의 URL에 `/rest/v1/`가 붙어 있던 것 수정(베이스 URL만), REST로 reports 조회 200 확인

### 2026-07-07 — 사용자 피드백 반영 (표시 다듬기)

- **이평선 카드 값 압축**: "20일 -3.9% / 60일 -16.2% / 120일 -26.7%" 나열이 카드 디자인을 해침 → 값은 짧은 상태 텍스트("모두 위"/"20일·60일선 위"/"모두 아래")로, 어느 선 위·아래인지는 설명 문장에서 (engine/scoring.py `score_ma`)
- **진단 속 면책 문구 제거**: 푸터에 이미 공통 고지가 있는데 한줄 진단마다 "투자 판단은 직접 하세요" 반복 → 거슬린다는 피드백으로 삭제. 면책은 Layout 푸터가 단독 담당 (DesignSystem §9.1, FeatureSpec F2 기준도 갱신)
- Supabase 신형 키(`sb_publishable_...`) 안내 반영: `.env.example` 문구 갱신. 신형 publishable = 구형 anon과 동일하게 클라이언트 노출 OK, `sb_secret_`은 금지

### 2026-07-06 — web P0 완성 (검색→분석→투표 E2E)

작업 브랜치: `feat/web-v1`

**무엇을**: P0 프론트 전체(F1 검색 연동, F3 분석 화면, F4~F6 Supabase 저장·투표·캐싱 코드/스키마) + 랜딩 v2 리디자인 + F9 최근 검색.

**왜/어떻게** (핵심 결정):
- **Supabase 폴백 설계**: 아직 Supabase 프로젝트가 없어도 개발·시연이 가능해야 함 → `supabaseClient`가 env 없으면 null, 리포트는 엔진 직접 호출(reportId=null), 투표는 localStorage 폴백. 실제 연결은 `docs/SupabaseSetup.md` 5분 셋업 + `supabase/schema.sql` 1회 실행이면 끝 (코드 수정 불필요)
- **캐싱을 프론트 주도로**(CLAUDE.md 구조 준수): `fetchReport()`가 reports 테이블에서 30분 내 리포트 조회 → miss면 엔진 → insert. 저장 실패해도 결과 표시는 유지
- **투표 무결성**: votes PK `(report_id, device_id)`로 기기당 1표를 DB 레벨에서 보장. 취소=delete, 반대표=upsert. React Query 낙관적 업데이트 + 실패 롤백
- **점수 게이지를 바(§5.2)에서 반원 SVG로 변경**: 신호등 색 + 차오르는 애니메이션이 "5초 이해" 목표에 더 부합 (DesignSystem §5.2에 반영)
- **검색 UX**: 250ms 디바운스 자동완성(정확 일치 최상단은 엔진이 처리), 키보드 탐색, 6자리 코드는 검색 없이 바로 이동. 분석 페이지 헤더에도 compact 검색바 → 연속 검색 동선
- **tsconfig에 `strict: true` 추가**: CLAUDE.md는 strict 요구였는데 스캐폴드에 빠져 있었음. 전체 코드 strict 통과
- 사소한 버그 수정: 랜딩 fade-up 애니메이션이 stacking context를 만들어 검색 드롭다운이 인기 종목 칩 뒤로 깔림 → 검색바 래퍼에 `relative z-20`

**검증**: build/lint/test 통과 · Claude Preview로 랜딩(데스크탑/모바일)·자동완성(카카오)·분석 페이지(035720 실데이터, 59점 🟡 6카드)·투표 토글/취소·최근 본 종목 칩 확인, 콘솔 에러 0
**문서**: FeatureSpec 상태 갱신, README 실제 프로젝트 소개로 교체, SupabaseSetup.md 신규, .env.example 추가
**남은 것**: Supabase 실 프로젝트 생성(5분 셋업) → F4~F6 실연동 확인 → P1(F7/F8) → 배포

### 2026-07-04
- 사고: 다른 세션에서 `create-vite --overwrite` 실행 → 프로젝트 폴더가 비워지며 engine/* 등 삭제됨
  - 문서(CLAUDE/PROGRESS/PRD)·requirements·.gitignore는 그 세션이 컨텍스트로 복원
  - engine 파이썬 파일 7종(data/indicators/scoring/analyze/main/poc/poc_naver)은 이 대화 컨텍스트에서 최종본으로 재작성 복원
  - 복원 검증: `analyze.py 005930` 정상(삼성 64🟡, 6카드), `main.py` 임포트 OK, 검색('삼','035') 정상
  - **교훈: 스캐폴딩 시 `--overwrite`/빈 디렉터리 요구 도구는 빈 폴더에서 실행할 것**
- 4번 web 기반 착수: DesignSystem.md 기준 랜딩 페이지 구현
  - Tailwind v4는 devDependency로만 있고 `vite.config.ts`에 미연결 상태 → `@tailwindcss/vite` 플러그인 추가, `@/` 경로 alias 설정(`vite.config.ts` + `tsconfig.app.json`)
  - Pretendard 폰트 CDN 연결(`index.html`), Vite 스캐폴드 잔재 제거(`App.css`, react/vite 로고, `icons.svg`)
  - React Router 뼈대: `App.tsx` → `/` 라우트에 `LandingPage`
  - `SearchBar`(§5.1), `LandingPage`(히어로+검색바+특징3종+예시 분석 카드+푸터) 작성 — 신호등 색상·타이포 스케일 DesignSystem.md 그대로 반영
  - 검증: lint/build 통과, Playwright(시스템 Chrome)로 모바일/데스크탑/검색 제출 스크린샷 확인, 콘솔 에러 없음
  - **다음은 Supabase 연동 + 실제 검색→분석 결과 페이지(P0 6.1~6.4)**

### 2026-06-24
- PRD 분석 → 아키텍처/작업순서 설계 확정
- 1번 데이터 PoC 착수. 로컬에 Python 미설치 → winget으로 Python 3.12.10 설치, pykrx/FDR/requests 설치
- PoC 검증 완료 (삼성전자 005930):
  - pykrx OHLCV로 RSI·52주낙폭(-9.1%)·이평(MA20/60/120)·거래량(140%) 원천 OK
  - PBR·부채비율은 KRX 펀더멘털 실패 → 네이버 모바일 API로 확보 성공 (PBR, 부채비율 29.94%)
  - **결론: 6개 지표 전부 데이터 확보 가능. 다음은 지표 엔진(2번).**
- 파일: `engine/poc.py`(pykrx 시세·펀더멘털), `engine/poc_naver.py`(네이버 재무)
- 2번 지표 엔진 완성: data/indicators/scoring/analyze 모듈 작성
  - 네이버 값 단위(`4.74배`,`71,907원`) 파싱 버그 → 숫자만 추출하도록 수정
  - 삼성/카카오/SK하이닉스 3종목 end-to-end 검증 통과
  - **다음은 engine API(3번): FastAPI로 analyze_stock 감싸기**
- 3번 engine API 완성: `engine/main.py` (FastAPI)
  - `/search`(FDR 전종목 캐싱), `/analyze/{code}`, `/health`
  - 로컬 가동→검색·분석 모두 정상 확인(JSON UTF-8 깨끗). fastapi/uvicorn 설치
  - **다음은 web 기반(4번)**
- 스택 결정 변경(CLAUDE.md 반영): 프론트 Next.js→**React+Vite**, DB SQLite→**Supabase**
  - 지표 계산은 Python 엔진 유지, DB는 프론트가 supabase-js로 직접
  - 반영 수정: `CLAUDE.md`(엔진/Supabase 구조·env·유틸 역할 명시), `engine/main.py` CORS 3000→5173
  - **다음은 web 기반(4번): React+Vite 셋업 + Supabase 연동**
