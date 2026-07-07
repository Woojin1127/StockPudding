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


# ── v2: 기술적 지표 확장 (investing.com 기술 분석 벤치마크) ──────────


def williams_r(highs, lows, closes, period: int = 14) -> float:
    """Williams %R (-100~0). -20 위 과매수, -80 아래 과매도."""
    hh = float(highs.tail(period).max())
    ll = float(lows.tail(period).min())
    if hh == ll:
        return -50.0
    return round((hh - float(closes.iloc[-1])) / (hh - ll) * -100, 1)


def stochastic(highs, lows, closes, k_period: int = 14, d_period: int = 3) -> dict:
    """스토캐스틱 슬로우 %K/%D (0~100)."""
    hh = highs.rolling(k_period).max()
    ll = lows.rolling(k_period).min()
    fast_k = (closes - ll) / (hh - ll) * 100
    slow_k = fast_k.rolling(d_period).mean()
    slow_d = slow_k.rolling(d_period).mean()
    return {"k": round(float(slow_k.iloc[-1]), 1), "d": round(float(slow_d.iloc[-1]), 1)}


def macd(closes, fast: int = 12, slow: int = 26, signal: int = 9) -> dict:
    """MACD 라인/시그널/히스토그램."""
    ema_fast = closes.ewm(span=fast, adjust=False).mean()
    ema_slow = closes.ewm(span=slow, adjust=False).mean()
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal, adjust=False).mean()
    hist = macd_line - signal_line
    price = float(closes.iloc[-1])
    return {
        "macd": round(float(macd_line.iloc[-1]), 1),
        "signal": round(float(signal_line.iloc[-1]), 1),
        "hist": round(float(hist.iloc[-1]), 1),
        # 원 단위는 종목 간 비교가 안 되므로 가격 대비 %도 제공 (표시용)
        "hist_pct": round(float(hist.iloc[-1]) / price * 100, 2) if price else 0.0,
    }


def roc(closes, period: int = 12) -> float:
    """ROC — period일 전 대비 등락률(%)."""
    past = float(closes.iloc[-period - 1])
    if past == 0:
        return 0.0
    return round((float(closes.iloc[-1]) - past) / past * 100, 1)


def atr_pct(highs, lows, closes, period: int = 14) -> float:
    """ATR을 현재가 대비 %로 — 하루 평균 출렁임 크기."""
    prev_close = closes.shift(1)
    tr = (highs - lows).combine((highs - prev_close).abs(), max).combine(
        (lows - prev_close).abs(), max
    )
    atr = float(tr.rolling(period).mean().iloc[-1])
    price = float(closes.iloc[-1])
    return round(atr / price * 100, 1) if price else 0.0


def bollinger_pct_b(closes, period: int = 20, mult: float = 2.0) -> float:
    """볼린저 밴드 내 위치 %B (0=하단, 1=상단)."""
    tail = closes.tail(period)
    mid = float(tail.mean())
    std = float(tail.std())
    if std == 0:
        return 0.5
    upper, lower = mid + mult * std, mid - mult * std
    return round((float(closes.iloc[-1]) - lower) / (upper - lower), 2)


# ── v2: 차트용 시계열 (프론트 렌더링 전용, 계산은 여기서 끝냄) ──────


def rsi_series(closes, period: int = 14):
    """RSI 전체 시계열 (차트 보조 패널용)."""
    delta = closes.diff()
    gain = delta.clip(lower=0).rolling(period).mean()
    loss = -delta.clip(upper=0).rolling(period).mean()
    rs = gain / loss.replace(0, float("nan"))
    return (100 - 100 / (1 + rs)).round(1)


def chart_series(df, days: int = 760) -> dict:
    """최근 days 영업일(약 3년)의 종가/거래량/이평선/RSI 시계열. NaN은 None으로."""
    closes = df["종가"]
    ma = {n: closes.rolling(n).mean().round(0) for n in (20, 60, 120)}
    rsi_s = rsi_series(closes)
    tail = df.tail(days)
    idx = tail.index

    def pick(series):
        vals = series.reindex(idx)
        return [None if v != v else float(v) for v in vals]  # NaN 체크

    return {
        "dates": [d.strftime("%Y-%m-%d") for d in idx],
        "close": [int(v) for v in tail["종가"]],
        "volume": [int(v) for v in tail["거래량"]],
        "ma20": pick(ma[20]),
        "ma60": pick(ma[60]),
        "ma120": pick(ma[120]),
        "rsi": pick(rsi_s),
    }
