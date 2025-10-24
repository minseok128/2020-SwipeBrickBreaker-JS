# 마이그레이션 전략

> **Swipe Brick Breaker 2.0 Migration Strategy**
> **버전**: 2.0.0 (Box2D Integration)
> **최종 업데이트**: 2025-10-24
> **총 기간**: 8주 (Box2D로 3주 단축)

---

## 목차

1. [마이그레이션 개요](#마이그레이션-개요)
2. [Phase별 상세 계획](#phase별-상세-계획)
3. [기능 동일성 검증](#기능-동일성-검증)
4. [롤백 전략](#롤백-전략)
5. [체크리스트](#체크리스트)

---

## 마이그레이션 개요

### 전략: Strangler Fig Pattern

점진적으로 구 시스템을 대체하면서, 항상 작동하는 상태를 유지합니다.

```
Old System (app.js)  →  Gradual Migration  →  New System (ECS)
      ↓                        ↓                      ↓
   Working              Always Working            Working
```

### 마이그레이션 원칙

1. **기능 우선**: 새 기능보다 기존 기능 재현 우선
2. **점진적 전환**: 한 번에 하나의 모듈만 마이그레이션
3. **지속적 검증**: 매 단계마다 테스트
4. **롤백 가능**: 언제든 이전 상태로 복귀 가능

---

## Phase별 상세 계획

### Phase 0: 준비 작업 (1주)

#### 목표
- 개발 환경 구축
- 원본 코드 분석 및 문서화
- 테스트 환경 구축

#### 작업 항목

##### 1. 개발 환경 설정
```bash
# 프로젝트 생성
mkdir swipe-brick-breaker-refactored
cd swipe-brick-breaker-refactored

# Git 초기화
git init
git remote add origin <your-repo>

# 의존성 설치
npm init -y
npm install --save-dev vite vitest @playwright/test eslint prettier eslint-config-prettier terser
npm install planck-js  # Box2D 물리 엔진
npx playwright install --with-deps
```

##### 2. 원본 코드 백업
```bash
export PROJECT_ROOT="/absolute/path/to/2020-SwipeBrickBreaker-JS"
mkdir -p old
cp -r "$PROJECT_ROOT"/* ./old/
```

##### 3. 프로젝트 구조 생성
```bash
# 디렉토리 생성 (Box2D 통합 버전)
mkdir -p src/{config,core,components,systems,factories,state/states,rendering,physics,storage,input,events,utils}
mkdir -p tests/{unit,integration,e2e}
mkdir -p assets/{fonts,images}

# 주의: physics/strategies 제거 (Box2D가 충돌 처리)
```

##### 4. 문서 작성
- [ ] 기능 목록 작성
- [ ] 물리 파라미터 문서화
- [ ] 게임 로직 플로우 차트

#### 완료 조건
- ✅ 개발 환경 구축 완료
- ✅ 원본 코드 분석 완료
- ✅ 프로젝트 구조 생성 완료

---

### Phase 1: 인프라 구축 (1주)

#### 목표
- 상수 정의
- 빌드 시스템
- 테스트 프레임워크

#### 작업 항목

##### 1. 상수 추출 및 정의
```javascript
// src/config/constants.js
// 기존 app.js의 모든 magic number 추출

// Before: app.js
this.canvas.width = 600;
this.canvas.height = 700;

// After: constants.js
export const CANVAS = {
  WIDTH: 600,
  HEIGHT: 700,
};
```

**작업 순서**:
1. app.js에서 모든 숫자 리터럴 찾기
2. 의미별로 그룹화
3. constants.js에 정의
4. 네이밍 규칙 적용

##### 2. 빌드 시스템 설정
```javascript
// vite.config.js 작성
// package.json scripts 설정
```

##### 3. 테스트 환경 구축
```javascript
// vitest 설정
// 첫 테스트 작성
import { describe, it, expect } from 'vitest';

describe('Constants', () => {
  it('should define canvas size', () => {
    expect(CANVAS.WIDTH).toBe(600);
    expect(CANVAS.HEIGHT).toBe(700);
  });
});
```

#### 완료 조건
- ✅ 모든 상수 정의 완료
- ✅ `npm run dev` 실행 가능
- ✅ `npm run test` 실행 가능

---

### Phase 2: 코어 시스템 (1.5주)

#### 목표
- ECS 프레임워크 구현
- GameLoop 구현
- EventBus 구현
- **Box2D World 초기화**

#### 작업 항목

##### Week 1: ECS 기본 (5일)

1. **Entity 클래스** (1일)
```javascript
// src/core/Entity.js
// 테스트 작성 → 구현 → 검증
```

2. **EntityManager** (1일)
```javascript
// src/core/EntityManager.js
// 테스트 작성 → 구현 → 검증
```

3. **System 기본 클래스** (1일)
```javascript
// src/core/System.js
// 테스트 작성 → 구현 → 검증
```

4. **SystemManager** (1일)
```javascript
// src/core/SystemManager.js
// 테스트 작성 → 구현 → 검증
```

5. **Box2D World 초기화** (1일)
```javascript
// src/physics/WorldManager.js
import planck from 'planck-js';

const world = planck.World({ gravity: Vec2(0, 0) });
// 벽 생성, World 설정
```

##### Week 2: GameLoop & EventBus (2-3일)

1. **GameLoop** (1일)
```javascript
// src/core/GameLoop.js
// Fixed timestep 구현
// requestAnimationFrame 사용
```

2. **EventBus** (1일)
```javascript
// src/events/EventBus.js
// pub/sub 패턴 구현
```

3. **Engine 통합** (1일)
```javascript
// src/core/Engine.js
// 모든 코어 컴포넌트 통합 + Box2D World 주입
```

#### 검증 방법

##### 단위 테스트
```javascript
describe('Entity', () => {
  it('should add and get component', () => {
    const entity = new Entity(1);
    const pos = new PositionComponent(10, 20);
    entity.addComponent(pos);

    expect(entity.getComponent('position')).toBe(pos);
  });
});
```

##### 통합 테스트
```javascript
describe('ECS Integration', () => {
  it('should create entity with components and process by system', () => {
    const manager = new EntityManager();
    const entity = manager.createEntity();
    entity.addComponent(new PositionComponent(0, 0));
    entity.addComponent(new VelocityComponent(10, 0));

    const system = new PhysicsSystem();
    system.update([entity], 16); // 1 frame at 60fps

    const pos = entity.getComponent('position');
    expect(pos.x).toBe(10);
  });
});
```

#### 완료 조건
- ✅ 모든 코어 클래스 구현
- ✅ 단위 테스트 >90%
- ✅ GameLoop 60 FPS 안정

---

### Phase 3: 컴포넌트 마이그레이션 (1주)

#### 목표
- 기존 클래스를 컴포넌트로 분해
- 모든 게임 데이터를 컴포넌트로 표현

#### 기존 클래스 → 컴포넌트 매핑

##### Ball 클래스 분해
```javascript
// Before: Ball class
class Ball {
  constructor(canvasWidth, canvasHeight, x, y, speed, radius, id) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.radius = radius;
    this.id = id;
    this.state = 0;
  }
}

// After: Components
entity
  .addComponent(new PositionComponent(x, y))
  .addComponent(new VelocityComponent(0, 0))
  .addComponent(new SpriteComponent('circle', '#fdd700', radius))
  .addComponent(new CollisionComponent('circle', radius))
  .addComponent(new BallComponent(id))
  .addComponent(new LifecycleComponent('inactive'));
```

##### Block 클래스 분해
```javascript
// Before: Block class
class Block {
  constructor(xId, level) {
    this.xId = xId;
    this.yId = 0;
    this.x = this.xId * 100;
    this.y = this.yId * 50;
    this.level = level;
    this.width = 100;
    this.height = 50;
  }
}

// After: Components
entity
  .addComponent(new PositionComponent(xId * 100, yId * 50))
  .addComponent(new SpriteComponent('rect', color, { width: 100, height: 50 }))
  .addComponent(new HealthComponent(level))
  .addComponent(new BlockComponent(xId, yId))
  .addComponent(new CollisionComponent('aabb', { width: 100, height: 50 }));
```

#### 작업 순서

1. **컴포넌트 정의** (1일)
   - PositionComponent
   - VelocityComponent
   - SpriteComponent
   - CollisionComponent
   - HealthComponent
   - LifecycleComponent
   - PhysicsComponent
   - BallComponent
   - BlockComponent

2. **팩토리 패턴 구현** (2일)
```javascript
// src/factories/BallFactory.js
export class BallFactory {
  static create(manager, x, y, id = 0) {
    const entity = manager.createEntity();
    // ... add components
    return entity;
  }
}

// src/factories/BlockFactory.js
export class BlockFactory {
  static createNormal(manager, x, y, health) { }
  static createBonus(manager, x, y, health, type) { }
}
```

3. **테스트 작성** (2일)
```javascript
describe('BallFactory', () => {
  it('should create ball entity with all components', () => {
    const manager = new EntityManager();
    const ball = BallFactory.create(manager, 300, 650);

    expect(ball.hasComponent('position')).toBe(true);
    expect(ball.hasComponent('velocity')).toBe(true);
    expect(ball.hasComponent('sprite')).toBe(true);
  });
});
```

#### 완료 조건
- ✅ 모든 컴포넌트 정의 완료
- ✅ 팩토리 구현 완료
- ✅ 컴포넌트 테스트 >95%

---

### Phase 4: 시스템 마이그레이션 (**1주** - Box2D로 단축)

#### 목표
- 게임 로직을 시스템으로 재구현 (Box2D 활용)
- 기존 로직 100% 재현

#### 작업 순서

##### 1. PhysicsSystem (Box2D 통합) - 2일
```javascript
// Box2D World 래퍼
class PhysicsSystem extends System {
  constructor(world) {
    super();
    this.world = world;
    this.requiredComponents = ['body', 'position'];
  }

  process(entities, deltaTime) {
    // Box2D 시뮬레이션
    this.world.step(1 / 60, 8, 3);

    // Body → Component 동기화
    entities.forEach(entity => {
      const body = entity.getComponent('body').body;
      const pos = entity.getComponent('position');

      const bodyPos = body.getPosition();
      pos.x = bodyPos.x * PHYSICS_SCALE;
      pos.y = bodyPos.y * PHYSICS_SCALE;
    });
  }
}
```

**검증**:
```javascript
// Box2D 파라미터 튜닝으로 기존 물리 재현
// restitution=1.0, friction=0.0 확인
```

##### 2. CollisionSystem (Box2D 리스너) - 2일
```javascript
// Box2D 충돌 리스너 활용
class CollisionSystem extends System {
  constructor(world, eventBus) {
    super();
    this.world = world;

    // Box2D 충돌 리스너
    this.world.on('begin-contact', this.handleCollision.bind(this));
  }

  handleCollision(contact) {
    const bodyA = contact.getFixtureA().getBody();
    const bodyB = contact.getFixtureB().getBody();

    // UserData에서 Entity ID 가져오기
    const entityA = this.getEntityFromBody(bodyA);
    const entityB = this.getEntityFromBody(bodyB);

    // 충돌 처리 (Ball-Block, Ball-Wall 등)
    this.resolveCollision(entityA, entityB);
  }
}
```

**장점**:
- ✅ Spatial Hashing 불필요 (Box2D 자체 broad-phase)
- ✅ CCD 지원 (빠른 공 감지)
- ✅ 검증된 알고리즘

##### 3. RenderSystem - 1일
```javascript
// 기존 코드
Ball.draw(ctx, ...) {
  ctx.fillStyle = "#fdd700";
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
  ctx.fill();
}

// 새 시스템
class RenderSystem extends System {
  process(entities, deltaTime) {
    entities.forEach(entity => {
      const pos = entity.getComponent('position');
      const sprite = entity.getComponent('sprite');

      if (sprite.shape === 'circle') {
        this.renderer.drawCircle(pos.x, pos.y, sprite.size, sprite.color);
      }
    });
  }
}
```

**검증**:
- 픽셀 단위 렌더링 비교
- 스크린샷 비교 테스트

##### 4. BallSystem, BlockSystem - 1일
```javascript
// 게임별 특화 로직
class BallSystem extends System {
  process(entities, deltaTime) {
    entities.forEach(entity => {
      const ball = entity.getComponent('ball');
      const lifecycle = entity.getComponent('lifecycle');

      // 발사 딜레이 처리 (기존 app.js:165)
      if (lifecycle.state === 'waiting') {
        if (currentTime - ball.startTime >= BALL.LAUNCH_DELAY_FRAMES * ball.id) {
          lifecycle.state = 'active';
        }
      }
    });
  }
}
```

##### 5. ParticleSystem - 1일 (Box2D 미사용)
```javascript
// 파티클 생명주기 관리
class ParticleSystem extends System {
  constructor(particlePool) {
    super();
    this.requiredComponents = ['particle', 'position', 'velocity'];
    this.priority = 50;
    this.particlePool = particlePool;
  }

  process(entities, deltaTime) {
    entities.forEach(entity => {
      const particle = entity.getComponent('particle');
      const lifecycle = entity.getComponent('lifecycle');

      // Opacity 감소
      particle.opacity -= PARTICLE.OPACITY_DECAY * deltaTime;

      // 투명도가 0 이하면 제거
      if (particle.opacity <= 0) {
        lifecycle.state = 'dead';
        this.particlePool.release(entity);  // 풀로 반환
      }
    });
  }
}
```

##### 6. LifecycleSystem - 1일
```javascript
// 엔티티 생명주기 관리
class LifecycleSystem extends System {
  constructor() {
    super();
    this.requiredComponents = ['lifecycle'];
    this.priority = 90;  // 가장 마지막에 실행
  }

  process(entities, deltaTime) {
    entities.forEach(entity => {
      const lifecycle = entity.getComponent('lifecycle');

      // 죽은 엔티티 정리
      if (lifecycle.state === 'dead') {
        entity.destroy();
      }

      // 엔티티 나이 증가
      lifecycle.age += deltaTime;
    });
  }
}
```

#### 완료 조건
- ✅ 모든 시스템 구현 완료
- ✅ Box2D 통합 완료 (물리/충돌)
- ✅ 기능 동일성 검증 통과
- ✅ 성능 테스트 통과 (60 FPS 안정)

---

### Phase 5: 상태 관리 (0.5주)

#### 목표
- State Pattern 적용
- 모든 게임 상태 구현

#### 기존 상태 → State Pattern

```javascript
// Before: Magic numbers
if (this.game.state == 0) { /* 메뉴 */ }
else if (this.game.state == 1) { /* 플레이 */ }
else if (this.game.state == 2) { /* 게임오버 */ }

// After: State Pattern
class MenuState extends GameState { }
class PlayState extends GameState { }
class GameOverState extends GameState { }

stateManager.setState(new MenuState());
```

#### 작업 순서

1. **GameState 기본 클래스** (1일)
```javascript
class GameState {
  enter(context) {}
  exit(context) {}
  update(context, deltaTime) {}
  render(context, renderer) {}
  handleInput(context, input) {}
}
```

2. **각 상태 구현** (3일)
- MenuState
- PlayState
- PauseState
- GameOverState
- ManualState

3. **StateManager** (1일)
```javascript
class StateManager {
  setState(newState) {
    this.currentState.exit(this.context);
    this.currentState = newState;
    this.currentState.enter(this.context);
  }
}
```

#### 검증
```javascript
describe('State Transitions', () => {
  it('should transition from menu to play on R key', () => {
    const engine = new Engine(canvas);
    expect(engine.stateManager.currentState).toBeInstanceOf(MenuState);

    engine.input.emit('keydown', 'r');

    expect(engine.stateManager.currentState).toBeInstanceOf(PlayState);
  });
});
```

#### 완료 조건
- ✅ 모든 상태 구현
- ✅ 상태 전환 테스트 통과
- ✅ 기존 동작 재현

---

### Phase 6: UI & Input (1주)

#### 목표
- 입력 처리 추상화
- UI 시스템 구현

#### 작업 항목

##### 1. InputManager
```javascript
// Before: 직접 이벤트 리스너
document.addEventListener('keydown', (e) => {
  switch (e.keyCode) {
    case 82: // R
      // ...
  }
});

// After: InputManager
class InputManager {
  constructor() {
    this.setupListeners();
  }

  on(event, callback) {
    // EventBus 패턴
  }
}

// 사용
engine.input.on('keydown', (key) => {
  if (key === KEYS.RESTART) {
    // ...
  }
});
```

##### 2. UIManager
```javascript
class UIManager {
  renderScore(renderer, score) { }
  renderBallCount(renderer, count) { }
  renderLeaderboard(renderer, scores) { }
}
```

#### 완료 조건
- ✅ 모든 입력 처리 동작
- ✅ UI 렌더링 동일

---

### Phase 7: 검증 및 최적화 (2주 - Box2D로 단축)

#### Week 1: 기능 동일성 검증

##### 자동화 테스트
```javascript
// 병렬 실행 비교
describe('Functional Equivalence', () => {
  it('should produce same ball physics', () => {
    const oldResult = runOldCode(input);
    const newResult = runNewCode(input);
    expect(newResult).toEqual(oldResult);
  });
});
```

##### E2E 테스트
```javascript
// tests/e2e/gameplay.spec.js
test('full game session', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // R 키 눌러 게임 시작
  await page.keyboard.press('r');

  // 공 발사
  await page.locator('canvas').click({ position: { x: 300, y: 200 } });

  // 2초 대기
  await page.waitForTimeout(2000);

  // 스크린샷 비교
  await expect(page).toHaveScreenshot('game-state.png');
});
```

##### 수동 테스트 체크리스트
- [ ] 공 발사 각도 제한
- [ ] 블록 충돌 정확도
- [ ] 보너스 블록 십자 파괴
- [ ] 파티클 효과
- [ ] 점수 계산
- [ ] 리더보드 저장/로드

#### Week 2: 성능 프로파일링

##### 측정 항목
```javascript
class PerformanceMonitor {
  measure() {
    return {
      fps: this.getFPS(),
      memory: performance.memory.usedJSHeapSize,
      entityCount: entityManager.entities.size,
      systemTime: this.getSystemTimes(),
    };
  }
}
```

##### 목표
| 항목 | 목표 | 실제 |
|------|------|------|
| FPS | 60 | ? |
| Memory | <30MB | ? |
| Entity Count (max) | 500+ | ? |

##### 최적화 작업
- Object Pooling 적용 (파티클)
- **Box2D 파라미터 튜닝** (restitution, friction, iterations)
- 렌더링 배칭
- 불필요한 계산 제거

#### Week 3: 최종 검증

##### 체크리스트
- [ ] 모든 단위 테스트 통과
- [ ] 모든 통합 테스트 통과
- [ ] E2E 테스트 통과
- [ ] 성능 목표 달성
- [ ] 모든 브라우저 호환성 확인
- [ ] 문서 완성
- [ ] 코드 리뷰 완료

#### 완료 조건
- ✅ 테스트 커버리지 >90%
- ✅ 성능 목표 달성
- ✅ 모든 기능 동작

---

## 기능 동일성 검증

### 검증 전략

#### 1. 단위 테스트
```javascript
describe('Ball Physics', () => {
  it('should match original velocity calculation', () => {
    // Given: 발사 각도 theta = 1.0
    const theta = 1.0;
    const speed = BALL.INITIAL_SPEED;

    // When: 속도 계산
    const vx = Math.round(speed * 100 * Math.cos(theta)) / 100;
    const vy = Math.abs(Math.round(speed * 100 * Math.sin(theta)) / 100) * -1;

    // Then: 기존 코드와 동일
    expect(vx).toBeCloseTo(1.89, 2);
    expect(vy).toBeCloseTo(-2.95, 2);
  });
});
```

#### 2. 통합 테스트
```javascript
describe('Game Session', () => {
  it('should complete one round correctly', () => {
    const engine = new Engine(canvas);
    engine.start();

    // 게임 시작
    engine.input.emit('keydown', 'r');

    // 공 발사
    engine.input.emit('mousedown', { x: 300, y: 200 });

    // 프레임 진행 (60fps * 3초 = 180 frames)
    for (let i = 0; i < 180; i++) {
      engine.update(16.67);
    }

    // 검증
    const balls = engine.entityManager.getEntitiesWithTag('ball');
    expect(balls.every(b => b.getComponent('lifecycle').state === 'landed')).toBe(true);
  });
});
```

#### 3. 픽셀 단위 비교
```javascript
test('rendering should match pixel-perfect', async ({ page }) => {
  await page.goto('http://localhost:3000/old');
  const oldScreenshot = await page.screenshot();

  await page.goto('http://localhost:3000/new');
  const newScreenshot = await page.screenshot();

  // 픽셀 차이 비교
  const diff = compareScreenshots(oldScreenshot, newScreenshot);
  expect(diff).toBeLessThan(0.01); // 1% 이하 차이
});
```

---

## 롤백 전략

### Git 브랜치 전략

```
main
  ├─ phase-1-infrastructure
  ├─ phase-2-core
  ├─ phase-3-components
  ├─ phase-4-systems
  ├─ phase-5-state
  ├─ phase-6-ui
  └─ phase-7-optimization
```

### 각 Phase별 태그
```bash
git tag -a v2.0.0-phase1 -m "Phase 1: Infrastructure complete"
git tag -a v2.0.0-phase2 -m "Phase 2: Core systems complete"
# ...
```

### 롤백 절차
```bash
# 문제 발생 시
git checkout v2.0.0-phase3  # 이전 안정 버전으로

# 또는 특정 브랜치로
git checkout phase-3-components
```

---

## 체크리스트

### Phase 0: 준비 (1주)
- [ ] 개발 환경 설정
- [ ] **Planck.js 설치 확인**
- [ ] 원본 코드 백업
- [ ] 프로젝트 구조 생성
- [ ] 기능 목록 작성

### Phase 1: 인프라 (1주)
- [ ] 상수 정의 완료
- [ ] 빌드 시스템 구축
- [ ] 테스트 환경 구축
- [ ] 첫 테스트 통과

### Phase 2: 코어 (1.5주)
- [ ] Entity 구현
- [ ] EntityManager 구현
- [ ] System 구현
- [ ] SystemManager 구현
- [ ] **Box2D World 초기화**
- [ ] GameLoop 구현
- [ ] EventBus 구현
- [ ] Engine 통합
- [ ] 60 FPS 안정

### Phase 3: 컴포넌트 (1주)
- [ ] 모든 컴포넌트 정의
- [ ] **BodyComponent 구현**
- [ ] 팩토리 구현 (Box2D Body 생성)
- [ ] 컴포넌트 테스트 >95%

### Phase 4: 시스템 (1주 - Box2D로 단축)
- [ ] **PhysicsSystem (Box2D World 래퍼)**
- [ ] **CollisionSystem (Box2D 리스너)**
- [ ] RenderSystem
- [ ] BallSystem
- [ ] BlockSystem
- [ ] ParticleSystem
- [ ] 기능 동일성 검증

### Phase 5: 상태 (0.5주)
- [ ] GameState 기본 클래스
- [ ] 모든 상태 구현
- [ ] StateManager
- [ ] 상태 전환 테스트

### Phase 6: UI & Input (1주)
- [ ] InputManager
- [ ] UIManager
- [ ] 모든 입력 동작
- [ ] UI 렌더링 동일

### Phase 7: 검증 (2주 - Box2D로 단축)
- [ ] 자동화 테스트 >90%
- [ ] E2E 테스트 통과
- [ ] **Box2D 파라미터 튜닝**
- [ ] 성능 목표 달성 (60 FPS)
- [ ] 번들 크기 확인 (<100KB)
- [ ] 브라우저 호환성
- [ ] 문서 완성

**총 기간: 8주** (기존 11주 → Box2D로 3주 단축)

---

**이전 문서**: [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
**관련 문서**: [REFACTORING_PLAN.md](./REFACTORING_PLAN.md)
