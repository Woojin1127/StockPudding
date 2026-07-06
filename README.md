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

```bash
# 1) 분석 엔진 (engine/ 폴더에서)
pip install -r requirements.txt
python -m uvicorn main:app --port 8000

# 2) 프론트 (루트에서)
pnpm install
pnpm dev          # http://localhost:5173
```

Supabase(리포트 저장·투표·캐싱)는 선택입니다 — 미설정이어도 검색·분석은 동작해요.
연결 방법은 [docs/SupabaseSetup.md](docs/SupabaseSetup.md) 참고.

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
