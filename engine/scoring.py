"""
점수화 + 신호 + 규칙기반 해석 — 표준 기준.
각 지표를 0~100 점수와 신호(good/neutral/bad)로 바꾸고,
쉬운 한국어 설명을 붙인다. (AI 생성 아님, 전부 규칙 기반)

점수 컨벤션: 높을수록 '지표상 건강/안정'. 매매 권유는 하지 않는다.
"""

# 종합점수 가중치 (없는 지표는 빼고 재정규화)
WEIGHTS = {"rsi": 0.15, "drop": 0.15, "ma": 0.20, "volume": 0.10, "pbr": 0.20, "debt": 0.20}


def _card(key, label, value, score, signal, comment):
    return {"key": key, "label": label, "value": value,
            "score": score, "signal": signal, "comment": comment}


def score_rsi(rsi_val):
    if rsi_val >= 70:
        return _card("rsi", "RSI (과매수·과매도)", f"{rsi_val}", 25, "bad",
                     "단기 과열 구간이에요. 너무 많이 올라 쉬어갈(조정) 가능성에 주의하세요.")
    if rsi_val >= 60:
        return _card("rsi", "RSI (과매수·과매도)", f"{rsi_val}", 45, "neutral",
                     "과열 쪽으로 다가가고 있어요.")
    if rsi_val >= 40:
        return _card("rsi", "RSI (과매수·과매도)", f"{rsi_val}", 75, "good",
                     "과열도 침체도 아닌 안정 구간이에요.")
    if rsi_val >= 30:
        return _card("rsi", "RSI (과매수·과매도)", f"{rsi_val}", 60, "neutral",
                     "약간 침체 쪽이에요.")
    return _card("rsi", "RSI (과매수·과매도)", f"{rsi_val}", 55, "neutral",
                 "단기 과매도(많이 빠짐) 구간이에요. 반등 여지는 있지만 그만큼 약세란 뜻이에요.")


def score_drop(drop_pct):
    label, key = "52주 고점 대비 낙폭", "drop"
    val = f"{drop_pct}%"
    if drop_pct >= -5:
        return _card(key, label, val, 50, "neutral",
                     "52주 고점 근처예요. 많이 오른 상태라 고점 부담이 있을 수 있어요.")
    if drop_pct >= -25:
        return _card(key, label, val, 75, "good",
                     "고점에서 적당히 내려온 자리예요.")
    if drop_pct >= -50:
        return _card(key, label, val, 55, "neutral",
                     "고점 대비 많이 빠졌어요. 싸 보일 수 있지만 그만큼 약세이기도 해요.")
    return _card(key, label, val, 30, "bad",
                 "고점 대비 반토막 이상 빠졌어요. 하락이 깊어 위험 신호예요.")


def score_ma(ma_info, current_price):
    # 값은 짧은 상태 텍스트로, 어느 선 위/아래인지는 설명에서 풀어준다 (DesignSystem §5.4)
    key, label = "ma", "이동평균선 대비 현재가"
    names = {"gap20": "20일", "gap60": "60일", "gap120": "120일"}
    gaps = [g for g in ("gap20", "gap60", "gap120") if g in ma_info]
    above = [names[g] for g in gaps if ma_info[g] > 0]
    below = [names[g] for g in gaps if ma_info[g] <= 0]
    total = len(gaps)
    if total == 0:
        return _card(key, label, "-", 50, "neutral", "이평선 계산에 필요한 데이터가 부족해요.")
    ratio = len(above) / total
    if ratio == 1:
        return _card(key, label, "모두 위", 80, "good",
                     "현재가가 단기·중기·장기 이평선을 모두 웃돌아요. 상승 흐름이에요.")
    if ratio >= 0.5:
        return _card(key, label, f"{'·'.join(above)}선 위", 60, "neutral",
                     f"{'·'.join(above)}선 위, {'·'.join(below)}선 아래예요. 방향을 잡아가는 중이에요.")
    if ratio > 0:
        return _card(key, label, f"{'·'.join(above)}선만 위", 45, "neutral",
                     f"{'·'.join(below)}선 아래에 있어요. 힘이 약한 편이에요.")
    return _card(key, label, "모두 아래", 30, "bad",
                 "모든 이평선 아래에 있어요. 하락 흐름이에요.")


def score_volume(vol_info):
    key, label = "volume", "거래량 (평균 대비)"
    ratio = vol_info["ratio"]
    val = f"평균의 {int(ratio*100)}%"
    if ratio >= 2:
        return _card(key, label, val, 60, "neutral",
                     "거래량이 평소의 2배 넘게 터졌어요. 시장의 관심이 쏠렸다는 신호예요.")
    if ratio >= 1.2:
        return _card(key, label, val, 65, "good", "거래량이 평소보다 활발해요.")
    if ratio >= 0.7:
        return _card(key, label, val, 60, "neutral", "거래량은 평소 수준이에요.")
    return _card(key, label, val, 50, "neutral", "거래가 한산해요. 관심이 식은 상태예요.")


def score_pbr(pbr):
    key, label = "pbr", "PBR (자산 대비 주가)"
    if pbr is None:
        return None
    val = f"{pbr}"
    if pbr < 1:
        return _card(key, label, val, 85, "good",
                     "순자산보다 싸게 거래돼요. 저평가 가능성이 있어요.")
    if pbr < 2:
        return _card(key, label, val, 65, "neutral", "자산 대비 적정~약간 비싼 수준이에요.")
    if pbr < 3:
        return _card(key, label, val, 45, "neutral", "자산 대비 다소 비싼 편이에요.")
    return _card(key, label, val, 30, "bad",
                 "자산 대비 비싸게 거래돼요(고평가 주의). 단, 성장주는 높을 수 있어요.")


def score_debt(debt_ratio):
    key, label = "debt", "부채비율 (재무 안정성)"
    if debt_ratio is None:
        return None
    val = f"{debt_ratio}%"
    if debt_ratio < 100:
        return _card(key, label, val, 85, "good", "빚이 자본보다 적어요. 재무가 안정적이에요.")
    if debt_ratio < 200:
        return _card(key, label, val, 55, "neutral", "빚이 자본보다 조금 많아요. 보통 수준이에요.")
    return _card(key, label, val, 30, "bad",
                 "빚이 자본의 2배 이상이에요. 재무 부담이 큰 편이에요.")


def composite(cards, ctx=None):
    """카드 리스트 -> 종합점수(0~100) + 신호등 + 한줄 진단.
    ctx(지표 원값 dict)가 있으면 시나리오 사전 기반 진단을 우선 시도한다."""
    num = den = 0.0
    for c in cards:
        w = WEIGHTS.get(c["key"], 0)
        num += c["score"] * w
        den += w
    total = round(num / den) if den else 50

    if total >= 65:
        light, verdict = "green", "비교적 안정적인 상태예요"
    elif total >= 45:
        light, verdict = "yellow", "조심스럽게 봐야 할 때예요"
    else:
        light, verdict = "red", "지금은 조심할 때예요"

    diagnosis = (_diagnose_scenario(ctx) if ctx else None) or _diagnose(cards, light)
    signals = _signal_summary(cards)
    return {"score": total, "light": light, "verdict": verdict,
            "diagnosis": diagnosis, "signals": signals}


def _diagnose_scenario(ctx):
    """지표 조합 시나리오 사전 — 종목 상태에 따라 다른 이야기를 들려준다.
    위에서부터 첫 매칭이 선택된다(구체적 조합 -> 단일 지표 순). 매칭 없으면 None.
    수치를 문장에 박아 같은 시나리오라도 종목마다 다르게 읽히게 한다."""
    rsi = ctx.get("rsi")
    drop = ctx.get("drop")          # 음수 (예: -49.2)
    above = ctx.get("above")        # 이평선 위 비율 0~1, 계산불가면 None
    vol = ctx.get("vol")            # 평균 대비 배수
    pbr = ctx.get("pbr")
    debt = ctx.get("debt")
    fall = abs(drop) if drop is not None else None

    if above == 1 and rsi >= 70:
        return (f"모든 이평선 위에서 RSI {rsi}까지 달아올랐어요. 추세는 강하지만 "
                f"단기 과열권이라, 잠깐 쉬어가는 조정이 나와도 이상하지 않은 자리예요.")
    if above == 1 and vol >= 2:
        return (f"상승 흐름(이평선 전부 위)에 거래량까지 평소의 {vol}배로 붙었어요. "
                f"시장의 시선이 모여 있는 종목이에요.")
    if above == 1 and drop >= -5:
        return (f"52주 고점 코앞({drop}%)에 모든 이평선 위 — 전형적인 신고가 도전 "
                f"구간이에요. 여기서 뚫리느냐 막히느냐로 분위기가 갈려요.")
    if above == 1:
        return ("단기·중기·장기 이평선을 모두 웃도는 정배열 흐름이에요. 추세 자체는 "
                "건강한 편이지만, 이미 오른 가격이라는 점도 함께 봐야 해요.")
    if above == 0 and debt is not None and debt >= 200:
        return (f"주가는 모든 이평선 아래, 부채비율은 {debt}% — 추세와 재무가 동시에 "
                f"무거운 상태예요. 위험 신호가 겹쳐 있어요.")
    if above == 0 and rsi <= 30 and vol >= 1.5:
        return (f"깊은 침체(RSI {rsi}) 속에 거래량이 평소의 {vol}배로 늘었어요. "
                f"바닥권에서 손바뀜이 일어나는 중일 수 있어, 방향이 정해지는 길목이에요.")
    if above == 0 and rsi <= 30:
        return (f"모든 이평선 아래 + RSI {rsi} — 아직 파는 힘이 우세해요. 많이 "
                f"빠졌다는 것과 바닥이라는 건 다른 얘기라, 반등 신호가 나오는지가 관건이에요.")
    if above == 0 and pbr is not None and pbr < 1:
        return (f"주가는 하락 흐름인데 PBR {pbr}배로 순자산보다 싸요. '싼 데는 이유가 "
                f"있다'와 '기회'가 갈리는 자리 — 왜 싸졌는지가 핵심이에요.")
    if above == 0:
        return (f"모든 이평선 아래로 내려온 하락 흐름이에요. 고점 대비 {fall}% 빠진 "
                f"상태라 지표 대부분이 무겁게 나와요.")
    if drop <= -40 and vol >= 1.5:
        return (f"고점 대비 {fall}%나 빠진 자리에 거래량이 평소의 {vol}배 — 크게 "
                f"눌린 종목에 관심이 다시 붙는 모습이에요.")
    if drop <= -40:
        return (f"52주 고점에서 {fall}% 내려왔어요. 가격은 확실히 낮아졌지만, 하락이 "
                f"깊었던 만큼 회복에도 시간이 필요한 유형이에요.")
    if drop >= -5 and rsi >= 65:
        return (f"52주 고점 근처({drop}%)에 RSI {rsi} — 열기가 있는 구간이에요. "
                f"고점 돌파 기대와 고점 부담이 맞붙는 자리예요.")
    if pbr is not None and debt is not None and pbr < 1 and debt < 100:
        return (f"PBR {pbr}배에 부채비율 {debt}% — 자산보다 싸게 거래되면서 재무도 "
                f"탄탄한 조합이에요. 화려하진 않지만 기본기가 좋은 유형이에요.")
    if debt is not None and debt >= 200:
        return (f"부채비율이 {debt}%로 자본의 두 배가 넘어요. 다른 지표가 나쁘지 "
                f"않아도 이 무게는 계속 따라다니는 리스크예요.")
    if vol >= 2.5:
        return (f"거래량이 평소의 {vol}배로 튀었어요. 가격보다 거래량이 먼저 "
                f"움직였다는 건 무언가 재료가 있다는 신호일 때가 많아요.")
    if rsi >= 70:
        return (f"RSI {rsi} — 단기 과열권이에요. 다만 이평선 배열은 엇갈려 있어서 "
                f"힘이 온전히 실린 상승은 아직 아니에요.")
    return None


def _signal_summary(cards):
    """눈에 띄는 신호(좋음/나쁨)만 모아 요약 리스트로."""
    out = []
    for c in cards:
        if c["signal"] == "good":
            out.append({"type": "good", "text": f"{c['label']}: 긍정적"})
        elif c["signal"] == "bad":
            out.append({"type": "bad", "text": f"{c['label']}: 주의"})
    return out


def _diagnose(cards, light):
    """폴백 진단 — 시나리오 미매칭 시. 최고/최저 지표를 수치와 함께 엮는다."""
    # 면책 문구는 화면 공통 푸터가 담당 — 진단 텍스트에서 반복하지 않는다
    bad = [c for c in cards if c["signal"] == "bad"]
    good = [c for c in cards if c["signal"] == "good"]

    def short(c):
        return f"{c['label'].split(' (')[0]}({c['value']})"

    if good and bad:
        best = max(good, key=lambda c: c["score"])
        worst = min(bad, key=lambda c: c["score"])
        return (f"지표들이 서로 다른 방향을 봐요. {short(best)}은 든든한데 "
                f"{short(worst)}이 발목을 잡는 그림이에요.")
    if good:
        best = max(good, key=lambda c: c["score"])
        return f"크게 튀는 위험 신호 없이 고른 편이에요. 특히 {short(best)}가 든든해요."
    if bad:
        worst = min(bad, key=lambda c: c["score"])
        return f"좋은 신호가 보이지 않는 구간이에요. {short(worst)}부터 무거워요."
    return "모든 지표가 중간 지대예요. 방향을 정하지 못하고 힘을 모으는 구간이에요."


# ── v2: 기술적 지표 확장 카드 (보조 섹션 — 종합점수에는 미반영) ──────


def score_williams(wr):
    key, label = "williams", "Williams %R"
    val = f"{wr}"
    if wr >= -20:
        return _card(key, label, val, 40, "bad", "과매수권이에요. 단기적으로 뜨거운 상태예요.")
    if wr <= -80:
        return _card(key, label, val, 55, "neutral", "과매도권 — 최근 2주 기준 많이 눌려 있어요.")
    return _card(key, label, val, 70, "good", "과열도 침체도 아닌 구간이에요.")


def score_stochastic(st):
    key, label = "stoch", "스토캐스틱"
    val = f"K {st['k']} · D {st['d']}"
    if st["k"] >= 80:
        return _card(key, label, val, 40, "bad", "과매수권이에요. 단기 열기가 높아요.")
    if st["k"] <= 20:
        return _card(key, label, val, 55, "neutral", "과매도권 — 바닥권에서 눌려 있어요.")
    if st["k"] > st["d"]:
        return _card(key, label, val, 70, "good", "%K가 %D 위 — 단기 흐름이 위쪽을 향해요.")
    return _card(key, label, val, 55, "neutral", "%K가 %D 아래 — 단기 흐름이 아래쪽이에요.")


def score_macd(m):
    key, label = "macd", "MACD"
    val = f"히스토그램 {m['hist_pct']:+.2f}%"
    if m["hist"] > 0 and m["macd"] > 0:
        return _card(key, label, val, 75, "good", "상승 모멘텀이 살아 있어요.")
    if m["hist"] > 0:
        return _card(key, label, val, 65, "good", "하락에서 상승 쪽으로 힘이 기우는 중이에요.")
    if m["macd"] < 0:
        return _card(key, label, val, 35, "bad", "하락 모멘텀 구간이에요.")
    return _card(key, label, val, 50, "neutral", "상승 힘이 식어가는 중이에요.")


def score_roc(v):
    key, label = "roc", "ROC (12일 등락)"
    val = f"{v:+.1f}%"
    if v >= 5:
        return _card(key, label, val, 70, "good", "최근 12거래일 새 상승 탄력이 붙었어요.")
    if v <= -5:
        return _card(key, label, val, 40, "bad", "최근 12거래일 새 하락 탄력이 붙었어요.")
    return _card(key, label, val, 60, "neutral", "최근 2주 남짓은 큰 방향 없이 보합이에요.")


def score_atr(v):
    key, label = "atr", "ATR (하루 변동폭)"
    val = f"±{v}%"
    if v <= 2:
        return _card(key, label, val, 70, "good", "하루 출렁임이 작은 잔잔한 종목이에요.")
    if v <= 5:
        return _card(key, label, val, 60, "neutral", "보통 수준의 변동성이에요.")
    return _card(key, label, val, 40, "bad", f"하루에도 평균 {v}%씩 출렁여요. 흔들림에 약하면 부담스러운 유형이에요.")


def score_bollinger(b):
    key, label = "bb", "볼린저밴드 위치"
    val = f"%B {b}"
    if b >= 1:
        return _card(key, label, val, 40, "bad", "밴드 상단을 뚫었어요 — 통계적으로 과열 신호예요.")
    if b >= 0.8:
        return _card(key, label, val, 55, "neutral", "밴드 상단 근처예요. 열기가 있어요.")
    if b < 0:
        return _card(key, label, val, 40, "bad", "밴드 하단을 이탈했어요 — 하락 압력이 강해요.")
    if b <= 0.2:
        return _card(key, label, val, 55, "neutral", "밴드 하단 근처 — 눌려 있는 자리예요.")
    return _card(key, label, val, 70, "good", "밴드 중간 — 통계적으로 안정적인 위치예요.")


def tech_summary(techs):
    """기술 지표 신호 집계 -> 한줄 요약 (매수/매도 아님 — 신호 우세만 말한다)."""
    good = sum(1 for t in techs if t["signal"] == "good")
    bad = sum(1 for t in techs if t["signal"] == "bad")
    neutral = len(techs) - good - bad
    if good >= bad + 2:
        verdict = f"긍정 우세 — {len(techs)}개 중 {good}개가 좋은 신호예요"
    elif bad >= good + 2:
        verdict = f"부정 우세 — {len(techs)}개 중 {bad}개가 주의 신호예요"
    else:
        verdict = f"긍정 {good} · 부정 {bad}로 팽팽한 중립이에요"
    return {"good": good, "neutral": neutral, "bad": bad, "verdict": verdict}
