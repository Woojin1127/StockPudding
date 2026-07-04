# Stock Pudding — 작업 기록

> 무슨 작업을 했는지 간단히 남기는 로그. 최신이 위로.

## 전체 진행 상황

- [x] **1. 데이터 PoC** ← 완료. 6개 지표 원천 전부 확보 확인 (아래 데이터 소스 표 참고)
- [x] **2. 지표 엔진** ← 완료. 6개 지표 계산→점수화→신호등→규칙기반 진단, 3종목 검증
- [x] **3. engine API** ← 완료. FastAPI `/search`, `/analyze/{code}`, `/health` 동작 확인
- [ ] **4. web 기반** ← 다음: React+Vite 셋업 + Supabase(reports/votes/cache) + 엔진 연동
- [ ] 5. web P0 화면 (검색 → 결과 → 투표)
- [ ] 6. P1 (랭킹, 인기 검색어)

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
- 매매 권유 문구 없음(PRD 준수). 진단 끝에 "투자 판단은 직접 하세요" 고정.

## 나중에 개선할 점 (MVP 후 숙제)

- 종목목록 캐시(`get_listing`)가 서버 재시작 전까지 갱신 안 됨 → 하루 1회 TTL 재로드 필요
- RSI가 단순평균(SMA) 방식 → 정석 Wilder 지수평활로 바꿀지 검토
- 분석 결과 캐싱 미구현 → 4번 web에서 SQLite로 (PRD 6.4)
- `requests` 동기 호출이 async FastAPI 안에서 블로킹 → 트래픽 늘면 httpx 비동기로
- 테스트 코드 없음 (indicators는 순수함수라 붙이기 쉬움)

## 참고: 종목 수

- `fdr.StockListing('KRX')` = 2875개 (KOSDAQ 1772 / KOSPI 946 / KONEX 107 / KOSDAQ GLOBAL 50)
- 우선주·스팩 포함. 한국 시장 정상 규모(미국 ~5천, 일본 ~3.9천 대비)

## 로컬 환경

- Python: `C:\Users\Woojin\AppData\Local\Programs\Python\Python312\python.exe` (PATH 미등록 → 절대경로로 실행)
- 설치 패키지: pykrx 1.2.8, finance-datareader 0.9.202, requests

---

## 로그

### 2026-07-04
- 사고: 다른 세션에서 `create-vite --overwrite` 실행 → 프로젝트 폴더가 비워지며 engine/* 등 삭제됨
  - 문서(CLAUDE/PROGRESS/PRD)·requirements·.gitignore는 그 세션이 컨텍스트로 복원
  - engine 파이썬 파일 7종(data/indicators/scoring/analyze/main/poc/poc_naver)은 이 대화 컨텍스트에서 최종본으로 재작성 복원
  - 복원 검증: `analyze.py 005930` 정상(삼성 64🟡, 6카드), `main.py` 임포트 OK, 검색('삼','035') 정상
  - **교훈: 스캐폴딩 시 `--overwrite`/빈 디렉터리 요구 도구는 빈 폴더에서 실행할 것**

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
