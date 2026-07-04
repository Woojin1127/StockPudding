"""
지표 계산 — 순수 함수. OHLCV 시계열에서 기술적 지표를 뽑는다.
입력은 pandas Series/DataFrame, 외부 호출 없음(테스트 쉬움).
"""


def rsi(closes, period: int = 14) -> float:
    """RSI(0~100). 종가 Series 입력."""
    delta = closes.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = gain.rolling(period).mean().iloc[-1]
    avg_loss = loss.rolling(period).mean().iloc[-1]
    if avg_loss == 0:
        return 100.0
    rs = avg_gain / avg_loss
    return round(100 - (100 / (1 + rs)), 1)


def drop_from_52w_high(highs, current_price: float) -> dict:
    """52주(약 250영업일) 고점 대비 현재가 낙폭(%)."""
    high52 = float(highs.tail(250).max())
    drop_pct = (current_price - high52) / high52 * 100
    return {"high52": int(high52), "drop_pct": round(drop_pct, 1)}


def moving_averages(closes, current_price: float) -> dict:
    """20/60/120일 이평선과 현재가의 이격(%)."""
    out = {}
    for n in (20, 60, 120):
        if len(closes) >= n:
            ma = float(closes.tail(n).mean())
            out[f"ma{n}"] = int(ma)
            out[f"gap{n}"] = round((current_price - ma) / ma * 100, 1)
    return out


def volume_ratio(volumes, window: int = 20) -> dict:
    """당일 거래량 / 최근 평균 거래량."""
    today = int(volumes.iloc[-1])
    avg = float(volumes.tail(window).mean())
    ratio = today / avg if avg else 0
    return {"today": today, "avg": int(avg), "ratio": round(ratio, 2)}
