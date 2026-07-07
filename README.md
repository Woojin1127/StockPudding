# 🍮 스톡푸딩 (Stock Pudding)

> 어려운 주식 지표를 주린이도 떠먹기 쉽게 풀어주는 한국 주식 종목 분석 서비스

종목을 검색하면 6가지 지표(RSI · 52주 낙폭 · 이평선 · 거래량 · PBR · 부채비율)를 계산해
**종합 점수 하나, 신호등(🟢🟡🔴) 하나, 한줄 진단 하나**로 보여줍니다.
매매 권유는 하지 않습니다 — 신호만 제시하고, 판단은 사용자가 합니다.

## 구성

```
[React + Vite]  ──검색/분석──▶  [Python FastAPI 엔진 :8000]  ──▶  pykrx · 네이버(재무)
      │
      └──리포트 저장/투표/캐싱──▶  [Supabase (Postgres)]
```

| 폴더 | 역할 |
|------|------|
| `src/` | React 프론트 (TypeScript, Tailwind v4, React Query, Zustand) |
| `engine/` | Python 분석 엔진 (FastAPI, pykrx, FinanceDataReader) |
| `supabase/` | DB 스키마 (`schema.sql`) |
| `docs/` | PRD · 기능명세 · 디자인 시스템 · 작업 로그 · Supabase 셋업 |

## 실행

**터미널 2개**가 필요합니다 — ① Python 엔진, ② 프론트 dev 서버. (Supabase는 클라우드라 띄울 것 없음)

```bash
# ── 터미널 1: 분석 엔진 ──
cd engine
python -m uvicorn main:app --port 8000
# 이 PC(Woojin)는 Python이 PATH에 없어서 절대경로로:
# C:\Users\Woojin\AppData\Local\Programs\Python\Python312\python.exe -m uvicorn main:app --port 8000
# 처음이라면 먼저: pip install -r requirements.txt

# ── 터미널 2: 프론트 ──
pnpm install      # 처음 1회
pnpm dev          # → 브라우저에서 http://localhost:5173
```

체크리스트:
1. 엔진 확인: http://localhost:8000/health 가 `{"ok":true}` 이면 성공
2. 프론트는 엔진이 떠 있어야 검색·분석이 동작함 (엔진 없이 켜면 검색 시 에러)
3. `.env`에 Supabase URL/키가 있으면 저장·투표·캐싱까지 동작 — 없어도 검색·분석은 OK
   - ⚠️ `VITE_SUPABASE_URL`은 **베이스 URL만** (`https://xxxx.supabase.co`) — 뒤에 `/rest/v1/` 붙이면 안 됨
   - 셋업 방법: [docs/SupabaseSetup.md](docs/SupabaseSetup.md)

## 스크립트

| 명령 | 설명 |
|------|------|
| `pnpm dev` | 개발 서버 (5173) |
| `pnpm build` | 타입체크 + 프로덕션 빌드 |
| `pnpm lint` | oxlint 검사 |
| `pnpm test` | Vitest 실행 |
| `pnpm format` | Prettier 포맷팅 |

## 문서

- [제품 요구사항 (PRD)](docs/StockPudding_PRD.md)
- [기능명세서](docs/FeatureSpec.md)
- [디자인 시스템](docs/DesignSystem.md)
- [작업 로그](docs/PROGRESS.md)

---

⚠️ 스톡푸딩의 모든 정보는 참고용입니다. 투자 판단과 책임은 본인에게 있어요.
