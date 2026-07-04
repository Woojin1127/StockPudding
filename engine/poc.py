"""
데이터 PoC — 종목 1개(삼성전자 005930)로 6개 지표의 원천 데이터가
pykrx + FinanceDataReader 로 실제로 받아지는지 검증한다.

검증 대상:
  1. RSI                 ← 종가 시계열
  2. 52주 고점 대비 낙폭   ← 1년 고가 시계열 + 현재가
  3. 이평선 대비 현재가     ← 종가 시계열 (20/60/120일)
  4. 거래량(평균 대비)      ← 거래량 시계열
  5. PBR                ← pykrx 펀더멘털
  6. 부채비율             ← (확인 필요 — 가장 불확실)
"""
import sys
from datetime import datetime, timedelta

# Windows 콘솔 cp949 회피: stdout/stderr를 utf-8로 강제
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

CODE = "005930"  # 삼성전자

def line(label, ok, detail=""):
    mark = "OK " if ok else "!! "
    print(f"  [{mark}] {label}: {detail}")

def main():
    today = datetime.now()
    fromdate = (today - timedelta(days=420)).strftime("%Y%m%d")
    todate = today.strftime("%Y%m%d")
    print(f"종목 {CODE} / 기간 {fromdate}~{todate}\n")

    # ---- 시세 (OHLCV) : pykrx ----
    print("[A] 시세 시계열 (pykrx get_market_ohlcv)")
    ohlcv = None
    try:
        from pykrx import stock
        ohlcv = stock.get_market_ohlcv(fromdate, todate, CODE)
        line("OHLCV rows", len(ohlcv) > 200, f"{len(ohlcv)} 행, 컬럼={list(ohlcv.columns)}")
        last = ohlcv.iloc[-1]
        cur_price = int(last["종가"])
        line("현재가(최근 종가)", True, f"{cur_price:,}원 ({ohlcv.index[-1].date()})")

        # 1. RSI 원천 = 종가
        line("1. RSI 원천(종가 시계열)", len(ohlcv["종가"]) >= 15, f"{len(ohlcv['종가'])}개 종가 확보")
        # 2. 52주 낙폭
        hi52 = int(ohlcv["고가"].tail(250).max())
        drop = (cur_price - hi52) / hi52 * 100
        line("2. 52주 고점 대비 낙폭", True, f"고점 {hi52:,} → 현재 낙폭 {drop:.1f}%")
        # 3. 이평선
        ma20 = ohlcv["종가"].tail(20).mean()
        ma60 = ohlcv["종가"].tail(60).mean()
        ma120 = ohlcv["종가"].tail(120).mean()
        line("3. 이평선 대비 현재가", True,
             f"MA20={ma20:,.0f} MA60={ma60:,.0f} MA120={ma120:,.0f}")
        # 4. 거래량
        vol_today = int(last["거래량"])
        vol_avg20 = ohlcv["거래량"].tail(20).mean()
        line("4. 거래량 평균 대비", True,
             f"오늘 {vol_today:,} vs 20일평균 {vol_avg20:,.0f} ({vol_today/vol_avg20*100:.0f}%)")
    except Exception as e:
        line("OHLCV", False, f"실패: {e}")

    # ---- 펀더멘털 (PBR) : pykrx ----
    print("\n[B] 펀더멘털 (pykrx get_market_fundamental — 일자별 전종목 스냅샷)")
    try:
        from pykrx import stock
        row = None
        used_day = None
        # 최근 영업일부터 거슬러 올라가며 데이터 있는 날 탐색
        for back in range(0, 10):
            d = (today - timedelta(days=back)).strftime("%Y%m%d")
            snap = stock.get_market_fundamental(d)  # 그 날짜 전종목
            if snap is not None and len(snap) > 0 and CODE in snap.index:
                row = snap.loc[CODE]
                used_day = d
                break
        if row is not None:
            line("5. PBR", row["PBR"] > 0,
                 f"PBR={row['PBR']} (참고 PER={row.get('PER')}, BPS={row.get('BPS')}) @{used_day}")
        else:
            line("5. PBR", False, "최근 10일 내 펀더멘털 응답 없음")
    except Exception as e:
        line("5. PBR", False, f"실패: {e}")

    # ---- 종목명 조회 (검색 기능에 필요) ----
    print("\n[C] 종목명 <-> 코드 (검색 기능)")
    try:
        from pykrx import stock
        name = stock.get_market_ticker_name(CODE)
        line("코드->종목명", bool(name), f"{CODE} = {name}")
    except Exception as e:
        line("종목명", False, f"실패: {e}")

    # ---- 부채비율 : 가장 불확실. 여러 경로 시도 ----
    print("\n[D] 6. 부채비율 (원천 불확실 — 경로 탐색)")
    found = False
    # 시도 1: FinanceDataReader SnapDataReader (재무)
    try:
        import FinanceDataReader as fdr
        snap = fdr.SnapDataReader(f"NAVER/financial/{CODE}")
        line("FDR SnapDataReader 재무", snap is not None,
             f"shape={getattr(snap,'shape',None)} idx={list(getattr(snap,'index',[]))[:8]}")
        found = True
    except Exception as e:
        line("FDR SnapDataReader 재무", False, f"미지원/실패: {e}")
    if not found:
        print("     -> 부채비율은 별도 재무제표 소스 필요(네이버/FnGuide 스크래핑 등). 2번 단계에서 확정.")

if __name__ == "__main__":
    main()
