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


def composite(cards):
    """카드 리스트 -> 종합점수(0~100) + 신호등 + 한줄 진단."""
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

    diagnosis = _diagnose(cards, light)
    signals = _signal_summary(cards)
    return {"score": total, "light": light, "verdict": verdict,
            "diagnosis": diagnosis, "signals": signals}


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
    """규칙기반 한줄 진단 — 나쁜 신호 우선으로 엮는다."""
    bad = [c for c in cards if c["signal"] == "bad"]
    good = [c for c in cards if c["signal"] == "good"]
    head = {"green": "전반적으로 무난해요.",
            "yellow": "나쁘지 않지만 신경 쓸 부분이 있어요.",
            "red": "지금은 위험 신호가 보여요."}[light]
    # 면책 문구는 화면 공통 푸터가 담당 — 진단 텍스트에서 반복하지 않는다
    parts = [head]
    if bad:
        parts.append("특히 " + ", ".join(c["label"].split(" (")[0] for c in bad) + " 쪽이 약해요.")
    elif good:
        parts.append(", ".join(c["label"].split(" (")[0] for c in good) + " 는 괜찮아요.")
    return " ".join(parts)
