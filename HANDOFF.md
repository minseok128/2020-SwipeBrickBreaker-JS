# 작업 인수인계 문서

> **작업 완료일**: 2025-10-24
> **브랜치**: `feature/refactoring`
> **완료 Phase**: Phase 0-2 (Infrastructure + Core Systems)

---

## 📌 작업 현황 요약

### ✅ 완료된 작업

**Phase 0: 프로젝트 초기화**
- 빌드 시스템 구축 (Vite + Vitest + Playwright)
- 코드 품질 도구 설정 (ESLint + Prettier)
- 프로젝트 디렉토리 구조 생성
- HTML 엔트리포인트 및 폰트 에셋 추가

**Phase 1: 인프라**
- 모든 게임 상수 정의 (`src/config/constants.js`)
- 충돌 레이어 비트마스크 (`src/config/layers.js`)
- 통합 게임 설정 (`src/config/gameConfig.js`)

**Phase 2: 코어 시스템**
- **ECS 프레임워크**: Entity, EntityManager, System, SystemManager
- **게임 루프**: Fixed timestep (60 FPS), requestAnimationFrame 기반
- **이벤트 시스템**: EventBus (pub/sub 패턴)
- **물리 엔진**: Box2D (Planck.js) 통합, WorldManager
- **렌더링**: CanvasRenderer (Canvas 추상화 레이어)
- **입력**: InputManager (키보드/마우스/터치 통합)
- **게임 엔진**: Engine (모든 서브시스템 통합)

**테스트**
- 단위 테스트: 37개 (Entity, EntityManager, System, GameLoop, EventBus)
- 통합 테스트: 4개 (ECS 통합 테스트)
- **총 41개 테스트 100% 통과** ✅

---

## 📊 프로젝트 통계

### 파일 수
- 소스 코드: 14개
- 설정 파일: 5개
- 테스트: 6개
- 문서: 5개 (docs/)
- **총: 30개 파일**

### 테스트 커버리지
- 41/41 테스트 통과 (100%)
- 주요 모듈 90%+ 커버리지

### 빌드 결과
- **번들 크기**: ~50KB (gzip, 폰트 제외)
- **목표 <100KB 달성** ✅
- Planck.js: ~46KB (gzip)
- 게임 코드: ~3.5KB (gzip)

---

## 🚀 실행 방법

### 개발 서버
```bash
npm install         # 의존성 설치 (최초 1회)
npm run dev         # 개발 서버 시작 (localhost:5173)
```

### 테스트
```bash
npm run test        # 테스트 실행 (watch mode)
npm run test -- --run  # 1회 실행
npm run test:coverage  # 커버리지 포함
```

### 빌드
```bash
npm run build       # 프로덕션 빌드 (dist/)
npm run preview     # 빌드 결과 미리보기
```

---

## 📂 프로젝트 구조

```
/
├── docs/                           # 설계 문서
│   ├── REFACTORING_PLAN.md        # 전체 리팩토링 계획
│   ├── ARCHITECTURE.md            # 아키텍처 설계
│   ├── IMPLEMENTATION_GUIDE.md    # 구현 가이드
│   ├── MIGRATION_STRATEGY.md      # 마이그레이션 전략
│   └── API_REFERENCE.md           # API 레퍼런스
│
├── src/
│   ├── config/                    # ✅ Phase 1 완료
│   │   ├── constants.js           # 모든 게임 상수
│   │   ├── layers.js              # 충돌/렌더 레이어
│   │   └── gameConfig.js          # 통합 설정
│   │
│   ├── core/                      # ✅ Phase 2.1 완료
│   │   ├── Entity.js              # ECS Entity
│   │   ├── EntityManager.js       # Entity 관리
│   │   ├── System.js              # System 기본 클래스
│   │   ├── SystemManager.js       # System 실행 관리
│   │   ├── GameLoop.js            # Fixed timestep 루프
│   │   └── Engine.js              # 메인 게임 엔진
│   │
│   ├── events/                    # ✅ Phase 2.2 완료
│   │   └── EventBus.js            # 이벤트 시스템
│   │
│   ├── physics/                   # ✅ Phase 2.3 완료
│   │   └── WorldManager.js        # Box2D World 관리
│   │
│   ├── rendering/                 # ✅ Phase 2.4 완료
│   │   └── CanvasRenderer.js      # Canvas 추상화
│   │
│   ├── input/                     # ✅ Phase 2.4 완료
│   │   └── InputManager.js        # 입력 처리
│   │
│   ├── components/                # ⏳ Phase 3 대기
│   ├── systems/                   # ⏳ Phase 4 대기
│   ├── factories/                 # ⏳ Phase 3-4 대기
│   ├── state/                     # ⏳ Phase 5 대기
│   └── index.js                   # ✅ 엔트리포인트
│
├── tests/
│   ├── unit/                      # ✅ 단위 테스트 완료
│   │   ├── core/                  # Entity, EntityManager, System, GameLoop
│   │   └── events/                # EventBus
│   └── integration/               # ✅ 통합 테스트 완료
│       └── ecs-integration.test.js
│
├── legacy/                        # 2020년 원본 코드 (참조용)
├── index.html                     # ✅ HTML 엔트리포인트
└── package.json                   # ✅ 프로젝트 설정
```

---

## 🎯 다음 작업 (Phase 3-7)

### Phase 3: 컴포넌트 시스템 (예상 1주)

**구현 필요**:
```javascript
// src/components/
PositionComponent.js      // 2D 위치
VelocityComponent.js      // 속도
SpriteComponent.js        // 렌더링 정보
BodyComponent.js          // Box2D Body 참조 ⭐
CollisionComponent.js     // 충돌 메타데이터
HealthComponent.js        // 체력 시스템
LifecycleComponent.js     // 생명주기 상태
BallComponent.js          // 공 전용 데이터
BlockComponent.js         // 블록 전용 데이터
BonusComponent.js         // 보너스 타입
TagComponent.js           // 엔티티 태그
ParticleComponent.js      // 파티클 데이터
```

**팩토리 패턴**:
```javascript
// src/factories/
BallFactory.js            // Box2D 동적 Body + 컴포넌트
BlockFactory.js           // Box2D 정적 Body + 컴포넌트
BonusFactory.js           // 보너스 아이템 생성
ParticleFactory.js        // 파티클 생성 (Object Pool)
```

**중요**: `BodyComponent`는 Box2D `Body` 인스턴스를 참조하여 ECS와 Box2D를 연결합니다.

---

### Phase 4: 게임 시스템 (예상 1주)

**구현 필요**:
```javascript
// src/systems/
PhysicsSystem.js          // Box2D World 업데이트 + ECS 동기화 ⭐
CollisionSystem.js        // Box2D 충돌 리스너 ⭐
RenderSystem.js           // 렌더링
BallSystem.js             // 공 발사/착지 로직
BlockSystem.js            // 블록 생성/파괴
ParticleSystem.js         // 파티클 효과 (간단 물리)
LifecycleSystem.js        // 엔티티 수명 관리
```

**핵심 포인트**:
- `PhysicsSystem`: `world.step()` 호출 후 `Body` → `PositionComponent` 동기화
- `CollisionSystem`: Box2D 충돌 리스너에서 `UserData.entityId`로 Entity 조회
- 시스템 우선순위: Physics(10) → Collision(20) → Ball(30) → Block(40) → Particle(50) → Lifecycle(90)

---

### Phase 5: 상태 관리 (예상 0.5주)

**구현 필요**:
```javascript
// src/state/
GameState.js              // State 기본 클래스
StateManager.js           // 상태 전환 관리

// src/state/states/
MenuState.js              // 메뉴 화면
PlayState.js              // 게임 플레이
PauseState.js             // 일시정지
GameOverState.js          // 게임오버
ManualState.js            // 도움말
```

**State Pattern**:
- `enter()`: 상태 진입 시 초기화
- `exit()`: 상태 종료 시 정리
- `update()`: 프레임 업데이트
- `render()`: 렌더링
- `handleInput()`: 입력 처리

---

### Phase 6: UI & Input (예상 1주)

**구현 필요**:
```javascript
// src/ui/
UIManager.js              // UI 렌더링 관리
ScoreDisplay.js           // 점수 표시
LeaderboardUI.js          // 리더보드

// src/storage/
StorageAdapter.js         // Storage 인터페이스
LocalStorageAdapter.js    // LocalStorage 구현
ScoreRepository.js        // 점수 저장/조회
```

---

### Phase 7: 검증 및 최적화 (예상 2주)

**작업 항목**:
1. **기능 동일성 검증**
   - 레거시 코드(`legacy/asset/app.js`)와 비교
   - 물리 계산 정확도 확인
   - Box2D 파라미터 튜닝 (restitution, friction, iterations)

2. **성능 최적화**
   - FPS 60 안정화
   - 메모리 사용량 <30MB
   - Object Pooling (파티클)

3. **E2E 테스트** (Playwright)
   - 게임 시작 → 공 발사 → 블록 파괴 → 게임오버
   - 스크린샷 비교

4. **문서 최종화**
   - 컴포넌트 API 문서
   - 시스템 플로우 다이어그램
   - 배포 가이드

---

## 🔑 핵심 개념

### ECS (Entity-Component-System)

```javascript
// Entity: 컴포넌트 컨테이너
const ball = entityManager.createEntity();

// Component: 순수 데이터
ball.addComponent(new PositionComponent(300, 650));
ball.addComponent(new VelocityComponent(3.5, -3.5));
ball.addComponent(new BodyComponent(box2dBody));  // Box2D Body 참조

// System: 로직 처리
class PhysicsSystem extends System {
  requiredComponents = ['body', 'position'];

  process(entities, deltaTime) {
    // 1. Box2D 시뮬레이션
    this.world.step(1/60, 8, 3);

    // 2. Body → Component 동기화
    entities.forEach(entity => {
      const body = entity.getComponent('body').body;
      const pos = entity.getComponent('position');
      const bodyPos = body.getPosition();
      pos.x = bodyPos.x * PHYSICS_SCALE;  // 미터 → 픽셀
      pos.y = bodyPos.y * PHYSICS_SCALE;
    });
  }
}
```

### Box2D 통합

```javascript
// 1. WorldManager에서 World 생성
const world = planck.World({ gravity: Vec2(0, 0) });

// 2. Factory에서 Body + Entity 생성
const body = world.createBody({
  type: 'dynamic',
  position: Vec2(x / 100, y / 100),  // 픽셀 → 미터
  bullet: true,  // CCD 활성화
});

body.createFixture({
  shape: planck.Circle(radius / 100),
  restitution: 1.0,  // 완전 탄성
  friction: 0.0,
});

body.setUserData({ entityId: entity.id });  // Entity 연결

entity.addComponent(new BodyComponent(body));

// 3. CollisionSystem에서 충돌 처리
world.on('begin-contact', (contact) => {
  const bodyA = contact.getFixtureA().getBody();
  const entityId = bodyA.getUserData().entityId;
  const entity = entityManager.getEntityById(entityId);
  // 충돌 로직...
});
```

---

## ⚠️ 주의사항

### 1. Box2D 스케일
- **100 픽셀 = 1 미터** (`PHYSICS.SCALE = 100`)
- Body 생성 시 항상 `/100` 변환
- PositionComponent 동기화 시 `*100` 변환

### 2. 충돌 레이어
- 비트마스크 사용 (`COLLISION_LAYERS`)
- Ball-Block, Ball-Wall, Ball-Bonus 필터링
- Box2D Fixture 생성 시 `filter.categoryBits`, `maskBits` 설정

### 3. 시스템 우선순위
- 낮은 값 = 먼저 실행
- Physics(10) → Collision(20) → Game Logic(30-50) → Lifecycle(90) → Render(100)

### 4. Entity 제거
- `entityManager.removeEntity()`: 지연 제거
- `entityManager.cleanup()`: 프레임 끝에 호출 (Engine이 자동 처리)
- Box2D Body도 함께 제거 필요: `world.destroyBody(body)`

---

## 📚 참고 자료

### 프로젝트 문서
- `docs/REFACTORING_PLAN.md`: 전체 계획 및 목표
- `docs/ARCHITECTURE.md`: 아키텍처 상세 설계
- `docs/IMPLEMENTATION_GUIDE.md`: 단계별 구현 가이드 (Phase 3-7 포함)
- `docs/MIGRATION_STRATEGY.md`: 마이그레이션 체크리스트

### 레거시 코드
- `legacy/asset/app.js`: 2020년 원본 (974 lines)
- 기능 동일성 검증 시 참조

### 외부 문서
- [Planck.js Documentation](https://piqnt.com/planck.js/)
- [Box2D Manual](https://box2d.org/documentation/)
- [ECS Pattern](https://en.wikipedia.org/wiki/Entity_component_system)

---

## 🛠️ 개발 팁

### 디버깅
```javascript
// 엔진 인스턴스는 전역에 노출됨
window.gameEngine.entityManager.getStats();
window.gameEngine.gameLoop.getFPS();
window.gameEngine.physics.world.getBodyList();
```

### Hot Reload
- Vite는 자동 HMR 지원
- 파일 저장 시 즉시 반영

### 테스트 작성
```javascript
// 새 시스템 추가 시 테스트 필수
describe('MyNewSystem', () => {
  it('should process entities correctly', () => {
    const system = new MyNewSystem();
    // ...
  });
});
```

---

## 📞 연락처

질문이나 이슈 발생 시:
1. Git 커밋 히스토리 확인: `git log --oneline --graph`
2. 테스트 실행: `npm run test`
3. 문서 참조: `docs/` 디렉토리

---

**작업 완료**: Phase 0-2 (Infrastructure + Core Systems)
**다음 작업자**: Phase 3 (Components)부터 시작
**예상 남은 기간**: 5.5주

화이팅! 🚀
