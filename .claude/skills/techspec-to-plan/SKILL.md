---
name: techspec-to-plan
description: |
  TECHSPEC 문서로부터 상세 TODO PLAN 문서를 생성합니다.
  사용 시점: (1) TECHSPEC 파일 경로가 주어지고 PLAN 생성을 요청받은 경우,
  (2) "PLAN 만들어줘", "구현 계획 작성", "TECHSPEC을 PLAN으로 변환" 같은 요청,
  (3) 리팩토링/기능 구현을 위한 상세 실행 계획이 필요한 경우.
  트리거 키워드: PLAN, 구현 계획, 실행 계획, TODO 문서, TECHSPEC 변환
---

# TECHSPEC → PLAN 변환기

TECHSPEC 문서를 분석하여 Milestone 기반의 상세 TODO PLAN 문서를 생성합니다.

## 워크플로우

1. TECHSPEC 문서 읽기
2. 언급된 모든 소스 파일 읽기
3. PLAN 문서 구조 설계
4. PLAN 문서 작성

### 1단계: TECHSPEC 문서 읽기

사용자가 제공한 TECHSPEC 파일 경로를 읽습니다.

### 2단계: 모든 소스 파일 읽기

**필수**: TECHSPEC에 언급된 **모든** 파일 경로를 추출하고 각 파일을 읽습니다.
- 새로 만들 파일 → 대상 위치에 이미 파일이 존재하는지 확인
- 수정할 파일 → 정확한 라인 번호와 코드 스니펫을 파악하기 위해 현재 코드 전체를 읽기
- 삭제할 파일 → 파일 존재 여부 확인 및 의존성 점검

### 3단계: PLAN 문서 구조 설계

TECHSPEC 내용을 바탕으로 Milestone과 Sub-task를 설계합니다.

### 4단계: PLAN 문서 작성

아래 템플릿을 따라 PLAN 문서를 작성합니다.

## 출력 형식

### 파일명 규칙

```
PLAN_{TECHSPEC_ 접두사를 제거한 TECHSPEC 파일명}.md
```

예시:
- 입력: `TECHSPEC_EDITOR_DIALOG_SYSTEM.md`
- 출력: `PLAN_EDITOR_DIALOG_SYSTEM.md`

### 출력 위치

TECHSPEC 파일과 동일한 폴더에 저장합니다.

### 문서 구조

```markdown
# PLAN: {제목}

**관련 문서**: [[TECHSPEC_{문서명}]]
**작성일**: {YYYY-MM-DD}
**예상 영향 파일**: {N}개 이상

---

## 마스터 체크리스트

### Milestone 1: {Milestone 제목} ({Breaking Change 여부})
- [ ] **M1.1** {작업 제목} → [§{섹션 번호}](#{anchor})
- [ ] **M1.2** {작업 제목} → [§{섹션 번호}](#{anchor})

### Milestone 2: {Milestone 제목}
- [ ] **M2.1** {작업 제목} → [§{섹션 번호}](#{anchor})
...

---

## 파일 변경 개요

### 새 파일
| 파일 경로 | 설명 | Milestone |
|-----------|------|-----------|
| `{경로}` | {설명} | M1.1 |

### 수정 파일
| 파일 경로 | 변경 내용 | Milestone |
|-----------|-----------|-----------|
| `{경로}` | {변경 내용} | M2.1 |

### 삭제 파일
| 파일 경로 | 사유 | Milestone |
|-----------|------|-----------|
| `{경로}` | {사유} | M4.1 |

---

## 상세 구현

---

### {섹션 번호} {작업 제목}

**파일**: `{파일 경로}`

**목적**: {이 작업의 목적}

**현재 상태**: {기존 코드 설명} (수정 파일의 경우)

**변경 후**: {수정 후 상태}

```typescript
// 변경 개요:

// 1. Import 변경
// 제거
- import { OldThing } from "...";

// 추가
+ import { NewThing } from "...";

// 2. Interface/Type 변경
// 제거
- interface OldProps {
-   oldProp: string;
- }

// 추가/수정
+ interface NewProps {
+   newProp: string;
+ }

// 3. 함수/컴포넌트 변경 (라인 {start}-{end})
// 변경 전
- const oldFunction = () => {
-   // 기존 구현
- };

// 변경 후
+ const newFunction = () => {
+   // 새 구현
+ };

// 4. JSX 변경 (라인 {start}-{end})
// 제거
- <OldComponent prop={value} />

// 추가
+ <NewComponent prop={value} />
```

**핵심 변경 사항**:
1. {변경 1}
2. {변경 2}
3. {변경 3}

**참조**: TECHSPEC §{섹션}

---

## 주의 사항

### {주제 1}

| 구분 | 설명 |
|------|------|
| {항목} | {설명} |

### {주제 2}

{설명}

---

## 롤백 계획

| 단계 | 롤백 방법 |
|------|-----------|
| M1 | {방법} |
| M2 | {방법} |

---

## 예상 작업 순서

1. **M1 완료** ({설명}) - {영향}
2. **M2.1-M2.4** ({설명})
...

---

**문서 끝**
```

## 코드 변경 표기법

코드 변경을 문서화할 때 아래 규칙을 따릅니다.

### 라인 번호 명시

실제 파일을 읽어 얻은 정확한 라인 번호를 포함합니다:
```typescript
// 변경 (라인 73-89)
- const oldCode = ...
+ const newCode = ...
```

### Diff 스타일

- `-` : 삭제할 코드
- `+` : 추가할 코드
- 변경이 없는 컨텍스트 코드는 `-`/`+` 접두사 없이 표기

### 상세 수준

각 변경은 반드시 다음을 포함해야 합니다:
1. **정확한 파일 경로**
2. **라인 번호 범위**
3. **변경 전 코드** (삭제/수정의 경우)
4. **변경 후 코드** (추가/수정의 경우)
5. **변경 사유** (핵심 변경 사항 섹션에)

## Milestone 설계 원칙

1. **Breaking Change 최소화**: Breaking이 없는 작업을 먼저 배치
2. **의존성 순서**: 선행 작업을 종속 작업보다 앞에 배치
3. **롤백 용이성**: 각 Milestone은 독립적으로 롤백 가능해야 함
4. **테스트 가능 단위**: 각 Milestone 완료 후 테스트 가능한 상태 유지

## Milestone 구조 예시

```
M1: 인프라 생성 (Breaking Change 없음)
├── M1.1 타입 정의 파일 생성
├── M1.2 Store/Service 생성
└── M1.3 export 파일 생성

M2: 컴포넌트 수정
├── M2.1 ComponentA → store 사용
├── M2.2 ComponentB → store 사용
└── M2.3 ComponentC → store 사용

M3: 트리거 지점 수정
├── M3.1 page.tsx 수정
├── M3.2 Hook A 수정
└── M3.3 Hook B 수정

M4: 정리 및 삭제
├── M4.1 레거시 파일 삭제
└── M4.2 불필요한 props 제거

M5: 테스트 및 검증
├── M5.1 단위 테스트 작성
└── M5.2 통합 테스트 실행
```
