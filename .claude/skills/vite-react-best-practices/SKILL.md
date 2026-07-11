---
name: vite-react-best-practices
description: Vite 기반 React SPA의 성능, 아키텍처, 배포에 대한 종합 가이드라인. Vite(SPA)로 만든 React 애플리케이션을 구축, 리뷰, 리팩토링할 때 사용. Vite 특화 빌드 설정, 정적 호스팅 요구사항, 핵심 React 성능 패턴을 다룸.
license: MIT
metadata:
  author: ant-gravity
  version: "1.1.0"
---

# Vite React 베스트 프랙티스

Vite로 프로덕션 수준의 React SPA(Single Page Application)를 구축하기 위한 시니어 레벨 가이드입니다.

## 적용 시점

다음 상황에서 이 가이드라인을 참조하세요:
- 새 Vite + React 프로젝트를 세팅할 때
- SPA용 빌드 파이프라인 및 CI/CD를 구성할 때
- 프로덕션 빌드 또는 캐싱 문제를 해결할 때
- 성능을 위해 React 컴포넌트를 리팩토링할 때

## 규칙 카테고리

### 1. Vite SPA 배포 (필수)

- [정적 리라이트](rules/vite-spa-rewrites.md) - 클라이언트 사이드 라우팅에 **필수**.
- [캐싱 전략](rules/vite-caching-strategy.md) - 불변 에셋, index.html은 no-cache.
- [빌드 검증](rules/vite-build-validation.md) - push 전에 preview로 확인.
- [환경 변수](rules/vite-env-vars.md) - `VITE_` 접두사와 보안.

### 2. React 핵심 성능

- [라우트 분할](rules/react-route-splitting.md) - 페이지 lazy load.
- [서버 상태](rules/react-server-state.md) - React Query/SWR 사용.
- [메모이제이션](rules/react-memoization.md) - useMemo/useCallback 사용 시점.
- [이미지 최적화](rules/react-image-optimization.md) - CLS 방지.

### 3. 아키텍처 및 정리

- [코로케이션(Colocation)](rules/react-colocation.md) - 기능 기반 구조.
- [안티패턴: Dist에서 import](rules/anti-import-dist.md) - 이중 번들링 회피.
- [트러블슈팅](rules/vite-troubleshooting.md) - 흔한 Vite 문제 해결.

## 전체 통합 문서

모든 규칙이 펼쳐진 완전한 가이드: `AGENTS.md`
