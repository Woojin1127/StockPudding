"""
데이터 어댑터 — 외부 소스(pykrx, 네이버) 호출을 한 곳에 모은다.
비공식 API라 바뀔 수 있으므로 호출부를 여기로 격리해 교체를 쉽게 한다.
"""
import re
from datetime import datetime, timedelta
import requests

_NAVER_H = {"User-Agent": "Mozilla/5.0", "Referer": "https://m.stock.naver.com/"}


def get_ohlcv(code: str, days: int = 1150):  # 약 3년 (차트용) — 지표 계산은 tail()이라 영향 없음
    """pykrx로 일봉 OHLCV(시가/고가/저가/종가/거래량) DataFrame 반환."""
    from pykrx import stock
    today = datetime.now()
    fromdate = (today - timedelta(days=days)).strftime("%Y%m%d")
    todate = today.strftime("%Y%m%d")
    df = stock.get_market_ohlcv(fromdate, todate, code)
    if df is None or len(df) == 0:
        raise ValueError(f"OHLCV 데이터 없음: {code}")
    return df


def get_name(code: str) -> str:
    """코드 -> 종목명."""
    from pykrx import stock
    return stock.get_market_ticker_name(code)


_listing_cache = {"df": None, "ts": 0.0}
_LISTING_TTL = 600  # 10분 — 시세 스냅샷·종목 목록 겸용이라 주기 갱신


def _load_listing():
    """KRX 전종목 스냅샷 (FDR). 종가/등락률/거래대금/시총 포함, TTL 캐시."""
    import time
    now = time.time()
    if _listing_cache["df"] is None or now - _listing_cache["ts"] > _LISTING_TTL:
        import FinanceDataReader as fdr
        _listing_cache["df"] = fdr.StockListing("KRX")
        _listing_cache["ts"] = now
    return _listing_cache["df"]


def get_listing():
    """검색용 (코드/종목명/시장)."""
    return _load_listing()[["Code", "Name", "Market"]]


def get_movers(top: int = 5) -> dict:
    """급등/급락/거래대금 TOP — 최근 거래일 종가 스냅샷 기준.
    잡주 도배 방지: 코스피·코스닥, 시총 1000억↑, 거래 있음, 스팩 제외."""
    df = _load_listing()
    base = df[
        df["Market"].isin(["KOSPI", "KOSDAQ"])
        & (df["Volume"] > 0)
        & (df["Marcap"] >= 100_000_000_000)
        & ~df["Name"].str.contains("스팩", na=False)
    ]

    def rows(d):
        return [
            {
                "code": r.Code,
                "name": r.Name,
                "market": r.Market,
                "price": int(r.Close),
                "change_pct": round(float(r.ChagesRatio), 2),
                "amount": int(r.Amount),
            }
            for r in d.itertuples()
        ]

    return {
        "gainers": rows(base.sort_values("ChagesRatio", ascending=False).head(top)),
        "losers": rows(base.sort_values("ChagesRatio").head(top)),
        "most_traded": rows(base.sort_values("Amount", ascending=False).head(top)),
    }


def search_stocks(q: str, limit: int = 10):
    """종목명(한글 부분일치) 또는 코드(숫자 접두) 검색."""
    q = (q or "").strip()
    if not q:
        return []
    df = get_listing()
    if q.isdigit():
        hit = df[df["Code"].str.startswith(q)]
    else:
        hit = df[df["Name"].str.contains(q, case=False, na=False)]
        # 정확히 일치하는 종목을 위로
        hit = hit.assign(_exact=(hit["Name"] == q)).sort_values("_exact", ascending=False)
    rows = hit.head(limit)
    return [{"code": r.Code, "name": r.Name, "market": r.Market}
            for r in rows.itertuples()]


def _to_float(s):
    """문자열에서 숫자만 추출 ('4.74배'->4.74, '71,907원'->71907, '29.94%'->29.94)."""
    if s is None:
        return None
    s = str(s).replace(",", "").strip()
    if s in ("", "-", "N/A"):
        return None
    m = re.search(r"-?\d+(?:\.\d+)?", s)
    return float(m.group()) if m else None


def get_fundamentals(code: str) -> dict:
    """네이버 모바일 API에서 PBR, 부채비율 등 재무지표 반환."""
    out = {"pbr": None, "per": None, "bps": None, "debt_ratio": None}

    # 투자지표 (PBR/PER/BPS)
    r = requests.get(
        f"https://m.stock.naver.com/api/stock/{code}/integration",
        headers=_NAVER_H, timeout=10,
    )
    r.raise_for_status()
    for item in r.json().get("totalInfos", []):
        key, val = item.get("key"), item.get("value")
        if key == "PBR":
            out["pbr"] = _to_float(val)
        elif key == "PER":
            out["per"] = _to_float(val)
        elif key == "BPS":
            out["bps"] = _to_float(val)

    # 재무비율 (부채비율) — financeInfo 트리에서 title=='부채비율' 최신 컬럼값
    r2 = requests.get(
        f"https://m.stock.naver.com/api/stock/{code}/finance/annual",
        headers=_NAVER_H, timeout=10,
    )
    r2.raise_for_status()
    out["debt_ratio"] = _find_latest_ratio(r2.json(), "부채비율")
    return out


def _find_latest_ratio(node, title):
    """중첩 JSON에서 {'title': title, 'columns': {...}} 찾아 최신 연도 값 반환."""
    if isinstance(node, dict):
        if node.get("title") == title and isinstance(node.get("columns"), dict):
            cols = node["columns"]
            for period in sorted(cols.keys(), reverse=True):  # 최신 연도 우선
                v = _to_float(cols[period].get("value"))
                if v is not None:
                    return v
        for v in node.values():
            found = _find_latest_ratio(v, title)
            if found is not None:
                return found
    elif isinstance(node, list):
        for v in node:
            found = _find_latest_ratio(v, title)
            if found is not None:
                return found
    return None
