# Swipe Brick Breaker 2.0 - 리팩토링 문서

> 2020년 공군에서 탄생한 벽돌깨기 게임을 Box2D 물리 엔진 기반의 현대적 아키텍처로 재탄생시키는 완전한 가이드
> **핵심 전략**: Clean Architecture + ECS + Planck.js (Box2D)

---

## 📚 문서 구성

### 1. [리팩토링 계획서](./REFACTORING_PLAN.md)
**필독 문서** - 프로젝트 전체 개요

- Executive Summary
- 현재 상태 분석
- 문제점 식별 (아키텍처, 코드 품질, 성능)
- 리팩토링 목표 및 전략 (**Box2D 통합**)
- 타임라인 (**8주** - Box2D로 3주 단축)
- 리스크 관리

**읽어야 하는 경우**:
- 프로젝트를 처음 접하는 경우
- 왜 Box2D를 도입했는지 이해하고 싶은 경우
- 전체 일정과 범위를 파악하고 싶은 경우

---

### 2. [아키텍처 설계](./ARCHITECTURE.md)
**기술 문서** - 시스템 설계 상세

- Clean Architecture + ECS + **Box2D** 패턴
- 계층 구조 (Presentation → Application → Domain → Infrastructure)
- Entity-Component-System 설계
- **Box2D World와 ECS 통합** (Adapter Pattern)
- 디자인 패턴 (State, Object Pool, Factory, Observer, Adapter)
- 모듈 구조 및 디렉토리 구조
- 핵심 시스템 설계 (**PhysicsSystem: Box2D 래퍼**, **CollisionSystem: Box2D 리스너**)
- 성능 최적화 전략 (**Box2D 최적화**, Object Pooling)

**읽어야 하는 경우**:
- 시스템 아키텍처를 이해하고 싶은 경우
- ECS 패턴을 처음 접하는 경우
- 각 레이어의 책임과 역할을 파악하고 싶은 경우
- 디자인 패턴 적용 방법을 알고 싶은 경우

---

### 3. [구현 가이드](./IMPLEMENTATION_GUIDE.md)
**실무 가이드** - 실제 코드 작성 방법

- 개발 환경 설정 (Node.js, Vite, Vitest, **Planck.js**)
- 프로젝트 구조 생성 (**physics/ 디렉토리**)
- 상수 정의 (모든 Magic Number 제거)
- 코어 시스템 구현 (Entity, System, GameLoop, **WorldManager**)
- 컴포넌트 구현 (**BodyComponent** 포함)
- 시스템 구현 (**PhysicsSystem, CollisionSystem** with Box2D)
- **Box2D World 초기화** 가이드
- 테스트 작성 (단위, 통합, E2E)
- 빌드 및 배포

**읽어야 하는 경우**:
- 실제로 코드를 작성하기 시작할 때
- 개발 환경을 세팅하는 경우
- 특정 클래스 구현 방법을 찾는 경우
- 테스트 작성 방법을 알고 싶은 경우

---

### 4. [마이그레이션 전략](./MIGRATION_STRATEGY.md)
**실행 계획** - 단계별 작업 가이드

- Strangler Fig Pattern 적용
- Phase별 상세 계획 (7단계, **총 8주**)
  - Phase 0: 준비 작업 (1주) - **Planck.js 설치**
  - Phase 1: 인프라 구축 (1주)
  - Phase 2: 코어 시스템 (1.5주) - **Box2D World 초기화**
  - Phase 3: 컴포넌트 마이그레이션 (1주) - **BodyComponent**
  - Phase 4: 시스템 마이그레이션 (**1주** - Box2D로 단축)
  - Phase 5: 상태 관리 (0.5주)
  - Phase 6: UI & Input (1주)
  - Phase 7: 검증 및 최적화 (**2주** - Box2D로 단축)
- 기능 동일성 검증 방법
- 롤백 전략
- 체크리스트

**읽어야 하는 경우**:
- 작업 순서를 계획하는 경우
- 각 Phase에서 무엇을 해야 하는지 알고 싶은 경우
- 기존 코드와 새 코드의 동일성을 검증하고 싶은 경우
- 프로젝트 진행 상황을 추적하고 싶은 경우

---

## 🎯 빠른 시작 가이드

### 프로젝트를 처음 접하는 경우

```
1. REFACTORING_PLAN.md 읽기 (30분)
   └─> 프로젝트 전체 이해

2. ARCHITECTURE.md 읽기 (1시간)
   └─> 기술 스택과 설계 이해

3. IMPLEMENTATION_GUIDE.md > 개발 환경 설정 (30분)
   └─> 실제 개발 준비

4. MIGRATION_STRATEGY.md > Phase 0 시작 (1주)
   └─> 실전 돌입
```

### 특정 주제를 찾는 경우

| 궁금한 내용 | 문서 | 섹션 |
|------------|------|------|
| 왜 리팩토링하나? | REFACTORING_PLAN.md | 문제점 식별 |
| ECS가 뭔가? | ARCHITECTURE.md | Entity-Component-System |
| 어떻게 시작하나? | IMPLEMENTATION_GUIDE.md | 개발 환경 설정 |
| 일정은 어떻게 되나? | MIGRATION_STRATEGY.md | Phase별 상세 계획 |
| 성능은 어떻게 개선하나? | ARCHITECTURE.md | 성능 최적화 |
| 테스트는 어떻게 작성하나? | IMPLEMENTATION_GUIDE.md | 테스트 작성 |
| 기존 코드와 비교하려면? | MIGRATION_STRATEGY.md | 기능 동일성 검증 |

---

## 📖 문서 읽기 순서 (권장)

### 초급자 (JavaScript/게임 개발 경험 적음)

```
Day 1: REFACTORING_PLAN.md (전체 읽기)
Day 2: ARCHITECTURE.md > ECS 개념만
Day 3: IMPLEMENTATION_GUIDE.md > 개발 환경 설정
Day 4: 간단한 예제 따라하기
Day 5: MIGRATION_STRATEGY.md > Phase 0-1
```

### 중급자 (JavaScript 익숙, 게임 개발 경험 있음)

```
1시간: REFACTORING_PLAN.md 훑어보기
2시간: ARCHITECTURE.md 정독
1시간: IMPLEMENTATION_GUIDE.md > 핵심 부분
바로 시작: MIGRATION_STRATEGY.md 따라 Phase 1부터
```

### 고급자 (아키텍처 설계 경험 있음)

```
30분: REFACTORING_PLAN.md > 목표/전략만
1시간: ARCHITECTURE.md > 다이어그램 중심
바로 시작: IMPLEMENTATION_GUIDE.md 참고하며 구현
필요시: MIGRATION_STRATEGY.md > 검증 방법만
```

---

## 🔑 핵심 개념

### Clean Architecture

```
Presentation Layer  → UI, Input, Rendering
Application Layer   → Game Engine, Orchestration
Domain Layer        → Entities, Components, Systems
Infrastructure      → Storage, Config, Utils
```

**의존성 방향**: 외부 → 내부 (항상 안쪽으로)

### Entity-Component-System (ECS)

- **Entity**: ID만 가진 컨테이너
- **Component**: 순수 데이터 (Position, Velocity, Sprite...)
- **System**: 로직 처리 (PhysicsSystem, CollisionSystem...)

```javascript
// 예시
const ball = entityManager.createEntity();
ball.addComponent(new PositionComponent(x, y));
ball.addComponent(new VelocityComponent(vx, vy));

physicsSystem.update([ball], deltaTime);  // 위치 업데이트
```

### 주요 디자인 패턴

1. **State Pattern**: 게임 상태 관리 (Menu, Play, GameOver)
2. **Object Pool**: 파티클 성능 최적화
3. **Factory**: 엔티티 생성
4. **Observer**: 이벤트 시스템
5. **Strategy**: 충돌 처리

---

## 📊 프로젝트 지표

### 코드 품질

| 항목 | Before | After (목표) |
|------|--------|-------------|
| 파일 수 | 1 | 30+ |
| 코드 라인 | 974 | ~1800 (모듈+문서) |
| Magic Numbers | 100+ | 0 |
| 테스트 커버리지 | 0% | >90% |
| **물리 엔진** | **수동 구현** | **Planck.js (Box2D)** |

### 성능

| 항목 | Before | After (목표) |
|------|--------|-------------|
| FPS (평균) | ~45 | 60 (안정) |
| 메모리 사용량 | ~50MB | ~30MB |
| 로딩 시간 | ~500ms | ~200ms |
| 번들 크기 | N/A | **<100KB (gzip)** |
| **개발 기간** | **N/A** | **8주 (3주 단축)** |

### 일정 (Box2D 도입으로 단축)

| Phase | 기간 | 내용 |
|-------|------|------|
| Phase 0 | 1주 | 준비 + **Planck.js 설치** |
| Phase 1 | 1주 | 인프라 구축 |
| Phase 2 | 1.5주 | 코어 + **Box2D World** |
| Phase 3 | 1주 | 컴포넌트 + **BodyComponent** |
| Phase 4 | **1주** | 시스템 (**Box2D 통합**) |
| Phase 5 | 0.5주 | 상태 관리 |
| Phase 6 | 1주 | UI & Input |
| Phase 7 | **2주** | 검증 & 최적화 |
| **총계** | **8주** | **(Box2D로 3주 단축)** |

---

## 🛠️ 기술 스택

### 코어
- **언어**: JavaScript (ES2015+)
- **런타임**: Browser (ES6 Modules)
- **물리 엔진**: **Planck.js** (Box2D for JavaScript, TypeScript 네이티브 지원)

### 개발 도구
- **빌드**: Vite
- **테스트**: Vitest (단위/통합), Playwright (E2E)
- **린트**: ESLint + Prettier

### 아키텍처 패턴
- Clean Architecture
- Entity-Component-System (ECS)
- **Box2D World 통합** (Adapter Pattern)
- State Pattern
- Object Pool Pattern
- Factory Pattern
- Observer Pattern

---

## 📝 문서 작성 원칙

이 문서들은 다음 원칙으로 작성되었습니다:

1. **실행 가능성**: 이론만이 아닌 실제 구현 가능한 가이드
2. **완전성**: 처음부터 끝까지 모든 단계 포함
3. **명확성**: 애매한 표현 배제, 구체적인 예시 제공
4. **검증 가능성**: 각 단계마다 검증 방법 제시

---

## 🤝 기여 가이드

### 문서 개선

이 문서에 오류나 개선점을 발견하셨나요?

1. 이슈 등록
2. 수정 제안 (Pull Request)
3. 질문 (Discussions)

### 피드백

- 이해하기 어려운 부분이 있나요?
- 더 자세한 설명이 필요한 부분이 있나요?
- 실제 구현 중 막히는 부분이 있나요?

언제든 피드백 환영합니다!

---

## 📚 추가 자료

### 참고 서적
- **"Game Programming Patterns"** - Robert Nystrom
  - 게임 개발 디자인 패턴
- **"Clean Architecture"** - Robert C. Martin
  - 소프트웨어 아키텍처 설계
- **"Refactoring"** - Martin Fowler
  - 리팩토링 기법

### 온라인 리소스
- [Entity Component System FAQ](http://t-machine.org/index.php/2007/09/03/entity-systems-are-the-future-of-mmog-development-part-1/)
- [Fix Your Timestep!](https://gafferongames.com/post/fix_your_timestep/)
- [Game Loop Patterns](http://gameprogrammingpatterns.com/game-loop.html)

---

## 🎮 원본 게임 정보

**제목**: Swipe Brick Breaker
**개발 시기**: 2020년
**개발 환경**: 공군 폐쇄망, Notepad++
**개발자**: SAUP819
**버전**: 0.1.4

> **📁 레거시 코드 위치**: 기존 2020년 원본 프로젝트는 `/legacy` 디렉토리로 이동되었습니다.
>
> 레거시 코드 구조:
> ```
> legacy/
> ├── asset/
> │   ├── app.js          (974 lines - 원본 게임 로직)
> │   ├── style.css
> │   └── [이미지/폰트]
> ├── readme/             (스크린샷 및 자료)
> ├── index.html
> └── README.md
> ```

자세한 스토리는 [메인 README.md](../README.md)를 참조하세요.

---

## ⚖️ 라이선스

이 문서는 원본 게임의 정신을 이어받아 자유롭게 참고하고 개선할 수 있습니다.

```
Copyleft 2025
Made with ❤️ for better code
```

---

## 🗺️ 로드맵

### v2.0.0 (**8주** 후 - Box2D로 단축)
- ✅ 기능 동일성 100%
- ✅ Clean Architecture + ECS + **Box2D**
- ✅ 60 FPS 안정화
- ✅ 테스트 커버리지 >90%
- ✅ **빠른 개발 가능한 코드베이스**

### v2.1.0 (미래 - Box2D 활용)
- **회전하는 블록** (Box2D 각운동량)
- **조인트/체인 장애물** (Box2D Joints)
- **다각형 블록** (Box2D Polygon Shape)
- 사운드 시스템
- 파워업 시스템
- 레벨 에디터
- 멀티플랫폼 (PWA)

---

## 📞 연락처

**프로젝트 관련 문의**:
- GitHub Issues
- Email: [your-email]
- Discord: [your-discord]

**긴급 기술 지원**:
- 문서 관련: REFACTORING_PLAN.md → 참고 문서 섹션
- 구현 관련: IMPLEMENTATION_GUIDE.md → 해당 섹션
- 문제 해결: MIGRATION_STRATEGY.md → 롤백 전략

---

**문서 버전**: 1.0
**최종 업데이트**: 2025-10-24
**작성**: Claude Code
**검토**: 확정

---

## 마치며

이 문서들은 단순한 리팩토링 가이드를 넘어,
**레거시 코드를 현대적 아키텍처로 전환하는 완전한 여정**을 담고 있습니다.

2020년 공군 일병의 열정으로 탄생한 게임을,
2025년 전문 소프트웨어 엔지니어링 원칙으로 재탄생시키는 과정.

이 여정이 여러분의 프로젝트에도 영감이 되길 바랍니다.

**Happy Coding! 🚀**
