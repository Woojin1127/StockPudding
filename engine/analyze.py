"""
종목 분석 파이프라인 — 코드 입력 -> 데이터 수집 -> 지표 계산 -> 점수/신호/진단.
engine의 진입점. FastAPI에서 analyze_stock()을 호출하게 된다.
"""
import sys

import data
import indicators as ind
import scoring as sc


def analyze_stock(code: str) -> dict:
    name = data.get_name(code)
    df = data.get_ohlcv(code)
    closes, highs, volumes = df["종가"], df["고가"], df["거래량"]
    current = int(closes.iloc[-1])
    fund = data.get_fundamentals(code)

    # 지표 계산
    rsi_val = ind.rsi(closes)
    drop = ind.drop_from_52w_high(highs, current)
    ma = ind.moving_averages(closes, current)
    vol = ind.volume_ratio(volumes)

    # 점수화 (None인 재무지표는 제외)
    cards = [
        sc.score_rsi(rsi_val),
        sc.score_drop(drop["drop_pct"]),
        sc.score_ma(ma, current),
        sc.score_volume(vol),
    ]
    cards += [c for c in (sc.score_pbr(fund["pbr"]), sc.score_debt(fund["debt_ratio"])) if c]

    result = sc.composite(cards)
    return {
        "code": code,
        "name": name,
        "price": current,
        "date": str(df.index[-1].date()),
        "score": result["score"],
        "light": result["light"],
        "verdict": result["verdict"],
        "diagnosis": result["diagnosis"],
        "signals": result["signals"],
        "cards": cards,
    }


_LIGHT = {"green": "🟢", "yellow": "🟡", "red": "🔴"}
_SIG = {"good": "🟢", "neutral": "🟡", "bad": "🔴"}


def _print(r):
    print(f"\n{'='*50}")
    print(f" {r['name']} ({r['code']})  {r['price']:,}원  [{r['date']}]")
    print(f"{'='*50}")
    print(f" 종합점수 {r['score']}/100   {_LIGHT[r['light']]} {r['verdict']}")
    print(f"\n 한줄 진단: {r['diagnosis']}")
    print(f"\n [지표별]")
    for c in r["cards"]:
        print(f"  {_SIG[c['signal']]} {c['label']:<22} {c['value']}")
        print(f"       └ {c['comment']}")
    if r["signals"]:
        print(f"\n [눈에 띄는 신호]")
        for s in r["signals"]:
            print(f"  {_SIG[s['type']]} {s['text']}")
    print()


if __name__ == "__main__":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    code = sys.argv[1] if len(sys.argv) > 1 else "005930"
    _print(analyze_stock(code))
