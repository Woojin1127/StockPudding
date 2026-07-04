"""
PoC 보강 — PBR + 부채비율을 네이버 모바일 증권 API(JSON)로 확보 가능한지 검증.
KRX 펀더멘털 엔드포인트가 불안정해서 재무 데이터 소스를 네이버로 통일 시도.
"""
import sys, json
import requests

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

CODE = "005930"
H = {"User-Agent": "Mozilla/5.0", "Referer": "https://m.stock.naver.com/"}

def get(url):
    r = requests.get(url, headers=H, timeout=10)
    r.raise_for_status()
    return r.json()

print(f"종목 {CODE} — 네이버 모바일 증권 API 탐색\n")

# 1) integration: 현재가/PBR/PER 등 핵심 투자지표
print("[1] /integration (투자지표: PBR/PER 등)")
try:
    data = get(f"https://m.stock.naver.com/api/stock/{CODE}/integration")
    infos = {}
    for item in data.get("totalInfos", []):
        infos[item.get("key")] = item.get("value")
    print("   totalInfos keys:", list(infos.keys()))
    for k in ["PBR", "PER", "EPS", "BPS", "52주 최고", "52주 최저", "시총"]:
        if k in infos:
            print(f"     {k} = {infos[k]}")
except Exception as e:
    print("   실패:", e)

# 2) finance/annual: 재무제표 (부채비율 포함 여부)
print("\n[2] /finance/annual (재무비율: 부채비율)")
for path in ["finance/annual", "finance/quarter"]:
    try:
        data = get(f"https://m.stock.naver.com/api/stock/{CODE}/{path}")
        keys = list(data.keys()) if isinstance(data, dict) else "(list)"
        print(f"   /{path} top-keys: {keys}")
        txt = json.dumps(data, ensure_ascii=False)
        hit = [w for w in ["부채비율", "debtRatio", "부채", "유보율"] if w in txt]
        print(f"   재무비율 키워드 발견: {hit if hit else '없음'}")
        if "부채비율" in txt:
            idx = txt.find("부채비율")
            print("   근처:", txt[idx-20:idx+120])
        break
    except Exception as e:
        print(f"   /{path} 실패:", e)
