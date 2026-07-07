"""
engine API — FastAPI로 analyze_stock과 검색을 HTTP로 노출.
React(web)가 여기를 호출한다. (캐싱/DB는 Supabase 담당)

실행: uvicorn main:app --reload --port 8000   (engine 디렉터리에서)
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import data
from analyze import analyze_stock

app = FastAPI(title="Stock Pudding Engine", version="0.1")

# 로컬 개발용: Vite dev 서버(React)에서 호출 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"ok": True}


@app.get("/search")
def search(q: str):
    """종목명/코드 검색 -> [{code, name, market}]"""
    return {"query": q, "results": data.search_stocks(q)}


@app.get("/market/movers")
def market_movers():
    """급등/급락/거래대금 TOP5 (최근 거래일 종가 기준, 10분 캐시)."""
    try:
        return data.get_movers()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"시장 데이터 조회 실패: {e}")


@app.get("/analyze/{code}")
def analyze(code: str):
    """종목 분석 결과(점수/신호등/지표카드/진단)."""
    if not (code.isdigit() and len(code) == 6):
        raise HTTPException(status_code=400, detail="종목코드는 6자리 숫자여야 해요.")
    try:
        return analyze_stock(code)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"분석 실패: {e}")
