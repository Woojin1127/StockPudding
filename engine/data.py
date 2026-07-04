"""
데이터 어댑터 — 외부 소스(pykrx, 네이버) 호출을 한 곳에 모은다.
비공식 API라 바뀔 수 있으므로 호출부를 여기로 격리해 교체를 쉽게 한다.
"""
import re
from datetime import datetime, timedelta
import requests

_NAVER_H = {"User-Agent": "Mozilla/5.0", "Referer": "https://m.stock.naver.com/"}


def get_ohlcv(code: str, days: int = 420):
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


_listing_cache = {"df": None}


def get_listing():
    """KRX 전종목(코드/종목명/시장) DataFrame. 프로세스 내 1회 로드 후 캐시."""
    if _listing_cache["df"] is None:
        import FinanceDataReader as fdr
        df = fdr.StockListing("KRX")[["Code", "Name", "Market"]]
        _listing_cache["df"] = df
    return _listing_cache["df"]


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
