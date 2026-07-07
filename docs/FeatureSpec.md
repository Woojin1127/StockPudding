# Stock Pudding — 기능명세서

> 기능 단위로 "무엇을 만들지 / 어디까지 됐는지"만 관리하는 문서.
> 배경·타겟·유저저니는 `StockPudding_PRD.md`, UI 스타일은 `DesignSystem.md`, 날짜별 작업 로그는 `PROGRESS.md` 참고.
> 기능이 추가/변경/완료될 때마다 이 문서만 갱신한다.

## 상태 범례

`완료` · `진행중` · `대기` · `설계 전`(P2, 아직 상세 정의 안 함)

## 전체 기능 목록

| ID | 기능 | 우선순위 | 상태 | 담당/파일 |
|----|------|----------|------|-----------|
| F1 | 종목 검색 | P0 | 완료 | `engine/main.py` `GET /search`, `src/components/SearchBar.tsx`, `src/hooks/useStockSearch.ts` |
| F2 | 종목 분석 (6개 지표) | P0 | 완료 | `engine/indicators.py`, `scoring.py`, `analyze.py` |
| F3 | 분석 결과 화면 | P0 | 완료 | `src/pages/StockPage.tsx`, `src/components/AnalysisView.tsx` |
| F4 | 리포트 저장 | P0 | 코드 완료 · 프로젝트 연결 대기* | `src/api/reports.ts`, `supabase/schema.sql`, `/report/:id` |
| F5 | 좋아요/싫어요 투표 | P0 | 코드 완료 · 프로젝트 연결 대기* | `src/api/votes.ts`, `src/hooks/useVotes.ts`, `src/components/VoteButtons.tsx` |
| F6 | 분석 결과 캐싱 | P0 | 코드 완료 · 프로젝트 연결 대기* | `src/api/reports.ts` (TTL 30분) |
| F7 | 인기 분석 랭킹 | P1 | 대기 | - |
| F8 | 오늘 많이 본 종목 | P1 | 대기 | - |
| F9 | 최근 검색 (로컬) | P1 | 완료 | `src/store/recentStocks.ts` (랜딩에 칩 노출, 최대 8개) |
| F10 | 로그인 & 관심 종목 | P2 | 설계 전 | - |
| F11 | 알림 | P2 | 설계 전 | - |
| F12 | 시간대별 정확도 검증 | P2 | 설계 전 | - |
| F13 | 랜딩 페이지 | 부가 | 완료 (2026-07-06 리디자인) | `src/pages/LandingPage.tsx`, `src/components/SearchBar.tsx` |
| F14 | 인터랙티브 가격 차트 | v2 | 완료 | `src/components/PriceChart.tsx`, `engine/indicators.py chart_series` |
| F15 | 기술 지표 확장 (6종+요약) | v2 | 완료 | `engine/indicators.py`, `scoring.py`, `src/components/TechnicalSection.tsx` |
| F16 | 시나리오 진단 사전 | v2 | 완료 | `engine/scoring.py _diagnose_scenario` (17개 시나리오 + 폴백) |
| F17 | 지표 용어 도움말 | v2 | 완료 | `src/utils/indicatorHelp.ts` (12종 "?" 토글) |

\* F4~F6: 프론트 코드·SQL 스키마·미설정 폴백까지 구현 완료. **실제 Supabase 프로젝트 생성 + `.env` 키 입력만 남음** — [SupabaseSetup.md](SupabaseSetup.md)의 5분 셋업 참고. 미설정 상태에서는 엔진 직접 호출 + 투표 로컬 저장으로 자동 폴백되어 앱은 정상 동작.

---

## P0 상세

### F1. 종목 검색
- 입력: 종목명(한글) 또는 종목코드(숫자) 문자열
- 출력: `{code, name, market}[]`
- 완료 기준: 프론트 검색바 입력 → 엔진 `/search` 호출 → 결과 리스트 표시 → 클릭 시 F3로 이동 ✅
- 구현: 250ms 디바운스 자동완성 드롭다운(React Query 캐싱), 키보드 탐색(↑↓/Enter/Esc), 정확 일치 최상단, 6자리 코드 직접 입력 시 바로 이동. 헤더용 compact 변형 포함.

### F2. 종목 분석 (6개 지표)
- 지표: RSI, 52주 고점 대비 낙폭, 이평선(20/60/120일) 대비 현재가, 거래량(평균 대비), PBR, 부채비율
- 출력: 종합점수(0~100) + 신호등(🟢/🟡/🔴) + 지표별 값/신호/설명 + 한줄 진단
- 완료 기준: `/analyze/{code}` 호출 → 6개 지표 전부 값 존재, 매매 권유 문구 없음 ✅ (면책 고지는 진단 텍스트가 아니라 화면 공통 푸터가 담당 — 2026-07-07 변경)

### F3. 분석 결과 화면
- 구성: ScoreCard(종합점수 반원 게이지+신호등) + IndicatorCard×6 + SignalSummary + 한줄 진단 + VoteButtons
- 완료 기준: F1에서 종목 선택 시 F2 결과를 DesignSystem.md §5.2~5.6 스펙대로 렌더링, 로딩(스켈레톤)/에러(재시도) 상태 포함 ✅
- 라우트: `/stock/:code`. 잘못된 코드는 홈으로 리다이렉트. 카카오(035720) 실데이터로 E2E 검증됨.

### F4. 리포트 저장
- 완료 기준: 분석 결과가 고유 ID로 Supabase에 저장되고, 그 ID로 재접근 가능(공유 링크 대비)
- 구현: `reports` 테이블(id·code·score·light·result jsonb), `/report/:id` 라우트로 재조회. 저장 실패해도 분석 결과 표시는 유지(저장은 부가).

### F5. 좋아요/싫어요 투표
- 완료 기준: 투표 클릭 시 즉시 수치 반영(낙관적 업데이트), 같은 기기에서 중복 투표 방지, 재클릭 시 취소 ✅ (로컬 폴백으로 검증)
- 구현: `votes` 테이블 PK `(report_id, device_id)` — 기기당 1표, 반대표는 upsert 교체. device_id는 localStorage UUID. 실패 시 롤백.

### F6. 분석 결과 캐싱
- 완료 기준: 같은 종목을 짧은 시간 내 재검색하면 Supabase 저장값 재사용, TTL 경과 후 자동 갱신
- 구현: `fetchReport()`가 30분 내 최신 리포트 조회 → 없으면 엔진 호출 후 저장. 화면에 "n분 전 분석 결과" 표기. React Query staleTime 5분으로 브라우저 단 캐시도 병행.

## P1 상세

- F7 인기 분석 랭킹: 좋아요 순 "도움된 분석 TOP", 싫어요 순 "별로였던 분석 TOP" — 종목명/점수/투표수 노출
- F8 오늘 많이 본 종목: Supabase 집계 기반 (`reports` 생성 로그로 집계 가능)
- F9 최근 검색: ✅ zustand persist(localStorage), 랜딩 히어로에 칩 + 지우기 버튼

F7·F8 세부 완료 기준은 Supabase 프로젝트 연결 후 정의.

## P2 (설계 전)

- F10 로그인 & 관심 종목, F11 알림, F12 정확도 검증 — PRD 6장 기준 이름만 확정, 상세 스펙은 P0/P1 완료 후 작성.
