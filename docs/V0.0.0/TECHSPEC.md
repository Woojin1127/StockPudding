# TECHSPEC: V0.0.0 랜딩 다듬기 (애니메이션 · 문구)

**관련 문서**: [[QA]]
**작성일**: 2026-07-11
**범위**: `src/pages/LandingPage.tsx` 및 관련 컴포넌트

---

## 1. 배경

`docs/V0.0.0/QA.md`에 정리된 2건의 다듬기 요청을 기술 명세로 구체화한다.

1. 애니메이션 추가
2. AI 티 나는 문장 및 효과 수정 — 상단 "주린이를 위한 종목 분석" 문구 제거

---

## 2. 현재 상태 분석

### 2.1 기존 애니메이션 인벤토리

| 위치 | 애니메이션 | 정의 |
|------|-----------|------|
| 히어로 섹션 요소 6종(배지·타이틀·설명·검색바·칩) | `animate-fade-up` (등장 시 0.55s fade+slide) | `src/index.css:8` |
| `ScoreGauge` | 마운트 시 0→점수 stroke-dashoffset 전환 (1s ease-out) | `src/components/ScoreGauge.tsx:39` |
| `PuddingBadge` | 🟢 `pudding-boing`(2.4s 무한), 🟡 `pudding-wobble`(1.6s 무한), 🔴 없음 | `src/index.css:9-10`, `src/components/PuddingBadge.tsx:8,14,20` |

히어로 아래 섹션들(`MarketSections`, 3단계 안내, 특징 카드, CTA)은 등장 애니메이션이 전혀 없고, 카드 hover에 `shadow-md` 전환만 있다(`LandingPage.tsx:150`).

### 2.2 "주린이를 위한 종목 분석" 배지

`src/pages/LandingPage.tsx:76-78`

```tsx
<span className="animate-fade-up rounded-full border border-indigo-200 bg-white/70 px-3 py-1 text-xs font-semibold text-indigo-600">
  주린이를 위한 종목 분석
</span>
```

히어로 최상단에 위치한 유일한 배지로, 제거 시 타이틀(`이 종목, 지금 어떤 상태일까요?`)이 히어로의 첫 요소가 된다.

### 2.3 타당성 검토

- 두 요청 모두 기존 코드베이스 구조(Tailwind 유틸리티, `@theme`의 커스텀 `--animate-*` 토큰 방식)와 충돌 없이 적용 가능
- CLAUDE.md 코드 스타일(인라인 스타일 금지, Tailwind 우선) 준수 가능
- DesignSystem.md에 히어로 배지 관련 규정은 없어 제거해도 스펙 위반 없음

---

## 3. 변경 대상 A — 히어로 상단 배지 제거

**파일**: `src/pages/LandingPage.tsx`

**현재 상태**: 76~78번째 줄에 "주린이를 위한 종목 분석" 배지가 히어로 최상단에 렌더링됨.

**변경 후**: 해당 `<span>` 블록 삭제. 히어로는 타이틀 → 설명 → 검색바 → 칩 순서로 시작.

```tsx
// 변경 (라인 75-78)
<div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6 px-4 pt-14 pb-12 text-center">
- <span className="animate-fade-up rounded-full border border-indigo-200 bg-white/70 px-3 py-1 text-xs font-semibold text-indigo-600">
-   주린이를 위한 종목 분석
- </span>
  <h1 className="animate-fade-up max-w-lg text-3xl leading-snug font-bold text-gray-900 sm:text-4xl">
```

**핵심 변경 사항**:
1. 배지 요소 삭제 (문구 자체가 "설명충" 느낌의 AI 생성 톤이라는 피드백)
2. 나머지 `animate-fade-up` 요소들의 등장 순서는 자연스럽게 한 칸씩 앞당겨짐 (별도 수정 불필요)

---

## 4. 변경 대상 B — 애니메이션 추가

QA.md 원문이 "애니메이션 추가"로만 되어 있어 대상 범위가 불명확함. 현재 인벤토리(§2.1) 기준 애니메이션이 없는 영역은 아래 3곳이며, 우선순위 순으로 제안한다.

| 후보 | 현재 상태 | 제안 |
|------|-----------|------|
| B1. `MarketSections` 4카드 그리드 | 등장 애니메이션 없음, hover 없음 | 카드별 순차 `fade-up` (stagger) |
| B2. 3단계 안내 / 특징 카드 섹션 | 등장 애니메이션 없음 | 스크롤 진입 시 `fade-up` (Intersection Observer 필요 — 신규 훅) |
| B3. `IndicatorCard` (분석 결과 화면) | 등장 애니메이션 없음, `ScoreGauge`만 애니메이션 보유 | 카드 순차 `fade-up` |

B1은 기존 `animate-fade-up` 토큰을 재사용해 CSS만으로 가능(신규 의존성 없음). B2는 스크롤 트리거가 필요해 `IntersectionObserver` 기반 커스텀 훅(`useInViewOnce` 등) 신규 작성이 필요함 — 신규 의존성은 아니지만 새 훅 파일이 추가되는 작업.

---

## 5. 열린 질문

1. **§4 애니메이션 범위**: B1(마켓 섹션 카드) / B2(스크롤 진입) / B3(지표 카드) 중 이번 V0.0.0에서 어디까지 포함할지 확정 필요
2. **§2.2 배지 제거 후 대체 문구 여부**: 배지 자리를 비워둘지, 다른 간결한 문구로 대체할지
3. **"AI 티 나는 문장"의 추가 사례**: 코드베이스 전체 검색(완벽/최적화/혁신적 등 상투어) 결과 히어로 배지 외 뚜렷한 후보는 발견되지 않음. 사용자가 염두에 둔 다른 문구가 있다면 위치 지정 필요

---

**문서 끝**
