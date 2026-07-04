# Stock Pudding — 디자인 시스템

> 주린이를 위한 친근하고 신뢰할 수 있는 종목 분석 UI 가이드

**참고 레퍼런스**: StockScan.io · Investing.com KR  
**스택**: React + TypeScript + Vite + Tailwind CSS

---

## 1. 디자인 철학

### 핵심 원칙

| 원칙 | 설명 |
|------|------|
| **쉽게, 5초 안에** | 지표 용어를 모르는 사람도 화면을 보자마자 "지금 어떤 상태인지" 이해 |
| **신뢰하되 부담 없게** | 금융 앱의 신뢰감 + 초보자가 눌러보고 싶은 친근함 |
| **데이터가 먼저** | 장식보다 정보 밀도. 필요한 것만 크게, 보조 정보는 조용하게 |
| **권유 없이** | "사세요/파세요" 없음. 신호만 제시, 판단은 사용자 |

### 톤앤매너

- **StockScan**: 밀도 높은 정보, 전문가 느낌 → 참고: 데이터 계층 구조, 색상 코딩 방식
- **Investing.com**: 신뢰감, 중립적 팔레트, 테이블 중심 → 참고: 정보 계층, 레이아웃 패턴
- **Stock Pudding 방향**: 위 두 사이트보다 **한 단계 더 쉽고 가볍게**. 숫자보다 해석이 앞선다.

---

## 2. 색상 팔레트

### 2.1 기반 팔레트 (Tailwind 클래스 기준)

```
배경
  - Page BG:      bg-gray-50       (#F9FAFB)
  - Card BG:      bg-white         (#FFFFFF)
  - Section BG:   bg-gray-100      (#F3F4F6)

텍스트
  - Primary:      text-gray-900    (#111827)
  - Secondary:    text-gray-500    (#6B7280)
  - Muted:        text-gray-400    (#9CA3AF)
  - Inverse:      text-white       (#FFFFFF)

경계선
  - Default:      border-gray-200  (#E5E7EB)
  - Strong:       border-gray-300  (#D1D5DB)
```

### 2.2 브랜드 색상

```
Brand Primary:    #6366F1  (indigo-500)  — 로고, 주요 버튼, 링크 강조
Brand Secondary:  #A5B4FC  (indigo-300)  — 서브 강조, hover 상태
Brand Dark:       #4338CA  (indigo-700)  — 텍스트 on light BG
```

> 이유: 금융 앱의 딱딱함을 피하면서도 신뢰감을 주는 인디고 계열. 기존 금융 앱(파랑 계열)과 차별화.

### 2.3 시맨틱 색상 — 신호등 (Stock Pudding 고유)

신호등은 **종합 점수** 판정에만 사용. 주가 등락과 혼용 금지.

```
신호 GREEN  (점수 65+, 긍정 신호):
  bg:         bg-emerald-50    (#ECFDF5)
  text:       text-emerald-700 (#047857)
  border:     border-emerald-200
  badge:      bg-emerald-100 text-emerald-800

신호 YELLOW (점수 45~64, 주의):
  bg:         bg-amber-50      (#FFFBEB)
  text:       text-amber-700   (#B45309)
  border:     border-amber-200
  badge:      bg-amber-100 text-amber-800

신호 RED    (점수 45 미만, 위험):
  bg:         bg-red-50        (#FEF2F2)
  text:       text-red-700     (#B91C1C)
  border:     border-red-200
  badge:      bg-red-100 text-red-800
```

### 2.4 시맨틱 색상 — 주가 등락 (한국 증권 관례)

> **한국 관례 주의**: 한국 증권 시장은 **빨강 = 상승, 파랑 = 하락** (미국과 반대).  
> 주가 변동률 표시에만 사용. 신호등 색상과 혼용 금지.

```
주가 상승 (빨강):
  text:       text-red-500     (#EF4444)
  bg-subtle:  bg-red-50

주가 하락 (파랑):
  text:       text-blue-500    (#3B82F6)
  bg-subtle:  bg-blue-50

주가 보합:
  text:       text-gray-500    (#6B7280)
```

---

## 3. 타이포그래피

### 3.1 폰트 패밀리

```css
/* 한글 본문 */
font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;

/* 수치 데이터 (가격, 퍼센트) — 고정폭으로 흔들림 방지 */
font-family: 'Pretendard', 'Tabular Nums' variant;
font-variant-numeric: tabular-nums;
```

Tailwind 설정:
```js
// tailwind.config.js
fontFamily: {
  sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
}
```

### 3.2 타입 스케일

| 역할 | 클래스 | 크기 | 굵기 | 사용처 |
|------|--------|------|------|--------|
| Display | `text-3xl font-bold` | 30px | 700 | 종합 점수 숫자 |
| Heading 1 | `text-xl font-semibold` | 20px | 600 | 종목명, 섹션 제목 |
| Heading 2 | `text-base font-semibold` | 16px | 600 | 카드 제목, 지표명 |
| Body | `text-sm` | 14px | 400 | 본문, 설명 텍스트 |
| Caption | `text-xs` | 12px | 400 | 보조 정보, 타임스탬프 |
| Data Large | `text-2xl font-bold tabular-nums` | 24px | 700 | 주가, 점수 등 핵심 수치 |
| Data Small | `text-sm tabular-nums` | 14px | 500 | 지표 값 (RSI: 62.3) |

---

## 4. 간격 & 레이아웃

### 4.1 스페이싱 토큰

```
xs:   4px   (gap-1, p-1)   — 인라인 요소 간격
sm:   8px   (gap-2, p-2)   — 배지 내부 여백
md:   12px  (gap-3, p-3)   — 카드 내부 패딩 소
base: 16px  (gap-4, p-4)   — 카드 내부 패딩 기본
lg:   24px  (gap-6, p-6)   — 섹션 간격
xl:   32px  (gap-8, p-8)   — 페이지 여백
2xl:  48px  (gap-12)       — 대형 섹션 구분
```

### 4.2 페이지 레이아웃

```
최대 너비: max-w-2xl (672px) — 모바일 우선, 데스크탑도 좁게 집중
중앙 정렬: mx-auto
페이지 패딩: px-4 py-6

모바일 (< 640px): 단일 컬럼
태블릿+ (≥ 640px): 동일 단일 컬럼 (여백만 증가)
```

> Stock Pudding은 모바일에서 주로 사용됨. 와이드 레이아웃보다 세로 스크롤 중심.

### 4.3 카드 그리드 (지표 카드)

```
지표 카드 6개: grid grid-cols-1 gap-3 sm:grid-cols-2
```

---

## 5. 컴포넌트

### 5.1 검색바 (SearchBar)

```
구조:
  - 전체 너비 입력 필드 + 우측 검색 버튼 (또는 Enter)
  - 아이콘: 돋보기 (left icon inside input)

스타일:
  - input: w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base
           focus:outline-none focus:ring-2 focus:ring-indigo-500
  - placeholder: "종목명 또는 코드 입력 (예: 삼성전자, 005930)"
  - 버튼: bg-indigo-500 text-white rounded-xl px-5 py-3 font-semibold

상태:
  - Default: border-gray-200
  - Focus: ring-2 ring-indigo-500
  - Loading: 스피너 표시, 버튼 disabled
  - Error: border-red-400 + 하단 에러 메시지
```

### 5.2 종합 점수 카드 (ScoreCard)

```
구조:
  ┌─────────────────────────────────┐
  │  종목명 (Heading 1)  [신호 배지] │
  │  코드 · 시장                     │
  │                                 │
  │      [점수 게이지 바]            │
  │         68 / 100                │
  │    "지금은 비교적 안정적이에요"   │
  └─────────────────────────────────┘

스타일:
  - 카드: bg-white rounded-2xl border p-6 shadow-sm
  - 신호 배지: 신호등 색상 적용 (§2.3)
  - 점수 숫자: text-5xl font-bold (Display)
  - 게이지 바: h-3 rounded-full bg-gray-100, 내부 filled bar 신호등 색상
  - 한줄 진단: text-sm text-gray-600 mt-2
```

**게이지 바 채움 색상:**
- 65+: bg-emerald-400
- 45~64: bg-amber-400
- ~44: bg-red-400

### 5.3 신호 배지 (SignalBadge)

```
<span class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold">
  🟢 안정
  🟡 주의
  🔴 위험
</span>

색상 매핑: §2.3 신호등 색상 적용
크기: 기본 xs, 카드 내 sm도 가능
```

### 5.4 지표 카드 (IndicatorCard)

```
구조:
  ┌──────────────────────────────┐
  │  [신호 도트] 지표명   [값]   │
  │  ─────────────────────────  │
  │  쉬운 설명 한 줄             │
  │  "RSI 62 — 아직 과열 구간   │
  │   아니에요. 숨 고르는 중."  │
  └──────────────────────────────┘

스타일:
  - 카드: bg-white rounded-xl border p-4 shadow-sm
  - 지표명: text-xs text-gray-500 uppercase tracking-wide
  - 값: text-xl font-bold tabular-nums (신호 색상 적용)
  - 신호 도트: w-2 h-2 rounded-full (신호등 색상)
  - 설명: text-sm text-gray-600 mt-2 leading-relaxed
  - 좌측 border accent: border-l-4 (신호등 색상)
```

지표별 값 포맷:

| 지표 | 표시 형식 | 예시 |
|------|-----------|------|
| RSI | 소수점 1자리 | `62.3` |
| 52주 낙폭 | 퍼센트, 소수점 1자리 | `-9.1%` |
| 이평선 대비 | 상태 텍스트 | `20일 위 · 60일 위` |
| 거래량 | 배수 | `평균의 1.4배` |
| PBR | 소수점 2자리 + 배 | `1.23배` |
| 부채비율 | 퍼센트, 정수 | `154%` |

### 5.5 신호 요약 (SignalSummary)

```
눈에 띄는 신호만 2~3개 불릿으로 요약
예:
  ✅ RSI가 적정 구간에 있어요
  ⚠️  52주 최고가 대비 -30% 하락 중이에요
  ❌ 부채비율이 높아요 (200% 초과)

스타일:
  - 컨테이너: bg-gray-50 rounded-xl p-4
  - 항목: flex items-start gap-2 text-sm text-gray-700
  - 아이콘: 이모지 or Heroicons (신호 따라 선택)
```

### 5.6 투표 버튼 (VoteButtons)

```
구조:
  [👍 도움됐어요  124]    [👎 별로예요  38]

스타일:
  - 버튼: flex-1 rounded-xl border py-3 text-sm font-medium
           transition hover:scale-[1.02]
  - 미투표: bg-white border-gray-200 text-gray-600
  - 투표됨 (좋아요): bg-emerald-50 border-emerald-300 text-emerald-700
  - 투표됨 (싫어요): bg-red-50 border-red-300 text-red-700
  - 수치: ml-2 font-bold tabular-nums

행동:
  - 클릭 즉시 수치 반영 (낙관적 업데이트)
  - 기투표 상태에서 재클릭 → 취소
  - 타 기기 중복 방지 (기기 ID 기반)
```

### 5.7 버튼 (Button)

```
Primary:
  bg-indigo-500 text-white rounded-xl px-5 py-2.5 font-semibold
  hover:bg-indigo-600 active:bg-indigo-700
  disabled:opacity-50 disabled:cursor-not-allowed

Secondary (Outline):
  border border-indigo-500 text-indigo-600 rounded-xl px-5 py-2.5 font-semibold
  hover:bg-indigo-50

Ghost:
  text-gray-600 rounded-xl px-4 py-2
  hover:bg-gray-100
```

### 5.8 로딩 상태

```
Skeleton:
  - 카드 자리: animate-pulse bg-gray-200 rounded-xl
  - 높이는 실제 컴포넌트와 동일하게 맞춤

Spinner (인라인):
  - 검색 버튼 내 작은 스피너
  - w-4 h-4 animate-spin text-white

전체 분석 로딩:
  - 검색 후 결과 나오기 전: ScoreCard skeleton + 6개 IndicatorCard skeleton
```

### 5.9 에러 상태

```
종목 없음:
  - 아이콘 + "검색 결과가 없어요" + 보조 텍스트
  - bg-gray-50 rounded-xl p-8 text-center

분석 실패:
  - "잠시 데이터를 불러오지 못했어요. 다시 시도해주세요."
  - 재시도 버튼 (Ghost 스타일)

네트워크 오류:
  - bg-red-50 rounded-xl p-4 text-red-700 text-sm
```

---

## 6. 아이콘

- 라이브러리: **Heroicons** (React, outline 스타일 기본, solid는 강조시만)
- 크기: `w-4 h-4` (인라인), `w-5 h-5` (버튼), `w-6 h-6` (섹션 아이콘)
- 이모지 활용: 신호 요약 ✅⚠️❌, 투표 버튼 👍👎 — 친근함 강화 (과용 금지)

---

## 7. 그림자 & 경계

```
카드 기본: shadow-sm (0 1px 2px rgba(0,0,0,0.05))
카드 호버: shadow-md  (0 4px 6px rgba(0,0,0,0.07))
모달/드롭다운: shadow-lg

border-radius 규칙:
  - 페이지 최외곽 카드: rounded-2xl (16px)
  - 내부 카드, 버튼: rounded-xl (12px)
  - 배지, 태그, 도트: rounded-full
  - 인풋: rounded-xl
```

---

## 8. 반응형 전략

Stock Pudding은 **모바일 퍼스트**.

```
기본 (모바일, < 640px):
  - 단일 컬럼, px-4
  - 지표 카드: 1열
  - 투표 버튼: 나란히 배치 (flex)

sm (≥ 640px):
  - 지표 카드: 2열
  - 페이지 여백 증가 px-6

md (≥ 768px):
  - 콘텐츠 너비 상한 max-w-2xl 유지 (더 넓게 X)
  - 검색바 너비 제한
```

---

## 9. 카피/문구 가이드

### 9.1 지표 설명 텍스트 원칙

- 용어를 먼저 쓰고 뒤에 쉬운 말로 풀어준다
- 최대 2문장
- "사세요/파세요" 절대 금지
- 마지막 줄 고정 문구: "투자 판단은 직접 하세요."

### 9.2 신호등 문구

| 점수 | 신호 | 판정 문구 |
|------|------|-----------|
| 65+ | 🟢 | "지금은 비교적 안정적이에요" |
| 45~64 | 🟡 | "신중하게 살펴볼 필요가 있어요" |
| ~44 | 🔴 | "위험 신호가 여럿 켜져 있어요" |

### 9.3 지표별 신호 문구 템플릿

```
RSI:
  과매수(70+):  "RSI {값} — 단기 과열 구간이에요. 조금 뜨거운 상태예요."
  적정(30~70):  "RSI {값} — 과열도 침체도 아닌 적정 구간이에요."
  과매도(30↓):  "RSI {값} — 단기 침체 구간이에요. 많이 팔린 상태예요."

52주 낙폭:
  -10% 이내:   "52주 최고가에서 {값} 하락. 상단 근처에 있어요."
  -10~-30%:    "52주 최고가에서 {값} 하락. 조정을 받은 상태예요."
  -30% 초과:   "52주 최고가에서 {값} 하락. 많이 내려온 상태예요."
```

---

## 10. 접근성

- 색상만으로 정보를 전달하지 않는다: 색상 + 아이콘/텍스트 병행
- 최소 명도 대비: WCAG AA 기준 (4.5:1 이상)
- 버튼 최소 터치 영역: 44×44px
- focus ring: `focus-visible:ring-2 focus-visible:ring-indigo-500`
- `aria-label` 필수 위치: 아이콘만 있는 버튼, 투표 버튼 (수치 포함 명칭)

---

## 11. 구현 체크리스트

새 컴포넌트를 만들 때 확인:

- [ ] 신호등 색상과 주가 등락 색상 혼용 없음
- [ ] "사세요/파세요" 류 문구 없음
- [ ] 모바일 터치 영역 44px 이상
- [ ] 로딩 / 에러 상태 처리됨
- [ ] tabular-nums 적용 (숫자 흔들림 없음)
- [ ] Tailwind 클래스만 사용 (인라인 스타일 금지)
