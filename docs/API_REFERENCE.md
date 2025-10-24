# API 레퍼런스

> Swipe Brick Breaker 2.0 Public API Reference
> 버전: 2.0.0 (Box2D Integration)
> 최종 업데이트: 2025-10-24
> 물리 엔진: Planck.js

---

## 목차

1. 엔트리포인트 (`src/index.js`)
2. 코어 (`@core`)
3. 컴포넌트 (`@components`)
4. 시스템 (`@systems`)
5. 상태 (`@/state`)
6. 렌더링 (`@/rendering`)
7. 입력 (`@/input`)
8. 이벤트 (`@/events`)
9. 설정 (`@/config`)
10. 유틸리티 (`@/utils`)

---

## 엔트리포인트

### Engine

- 생성자: `new Engine(canvas: HTMLCanvasElement)`
- 메서드:
  - `start(): void`
  - `stop(): void`
  - `update(deltaTime: number): void`
  - `render(alpha: number): void`
- 프로퍼티:
  - `entityManager: EntityManager`
  - `systemManager: SystemManager`
  - `stateManager: StateManager`
  - `renderer: CanvasRenderer`
  - `input: InputManager`

---

## 코어

### Entity
- 생성자: `new Entity(id: number)`
- 주요 메서드: `addComponent(c)`, `getComponent(type)`, `hasComponent(type)`, `removeComponent(type)`, `destroy()`

### EntityManager
- `createEntity()` → `Entity`
- `getEntitiesWith(...types)` → `Entity[]`
- `getEntitiesWithTag(tag)` → `Entity[]`
- `cleanup()`, `clear()`

### System / SystemManager / GameLoop
- `System.update(entities, deltaTime)`
- `SystemManager.addSystem(system)` / `update(entities, deltaTime)`
- `GameLoop.start()` / `stop()`

---

## 컴포넌트

- `PositionComponent(x, y)` - 렌더링용 위치 (픽셀)
- `VelocityComponent(vx, vy)` - 초기 속도 설정
- `SpriteComponent(shape, color, size)` - 렌더링 정보
- **`BodyComponent(body)`** - Box2D Body 참조 (물리 시뮬레이션)
- `HealthComponent(max)` - 체력 관리
- `LifecycleComponent(initialState)` - 생명주기 상태
- `BallComponent(id)` - 공 식별자
- `BlockComponent(xId, yId)` - 블록 위치
- `TagComponent(value)` - 엔티티 태그

---

## 시스템

- **`PhysicsSystem(world)`** - Box2D World 업데이트 및 동기화
- **`CollisionSystem(world, eventBus)`** - Box2D 충돌 리스너
- `RenderSystem(renderer)` - Canvas 렌더링
- `BallSystem` - 공 특화 로직
- `BlockSystem` - 블록 특화 로직
- `ParticleSystem(pool)` - 파티클 효과 (간단 물리)
- `LifecycleSystem` - 엔티티 생명주기 관리

---

## 상태

- `GameState` (추상)
- `MenuState`, `PlayState`, `PauseState`, `GameOverState`, `ManualState`
- `StateManager.setState(newState)`

---

## 렌더링

### CanvasRenderer
- `clear()`
- `drawCircle(x, y, radius, color)`
- `drawRect(x, y, width, height, color)`
- `drawText(text, x, y, options)`
- `drawImage(keyOrPath, x, y, options)`

---

## 입력

### InputManager
- 이벤트: `keydown`, `keyup`, `mousedown`, `mouseup`, `mousemove`
- `on(event, handler)` / `off(event, handler)`

---

## 이벤트

### EventBus
- `on(event, handler)` / `once(event, handler)` / `off(event, handler)` / `emit(event, data)`

---

## 설정

### constants.js
- `CANVAS`, `GRID`, `BALL`, `BLOCK`, `BONUS`, `PHYSICS`, `PARTICLE`, `ANIMATION`, `GAME_STATE`, `BALL_STATE`, `BLOCK_TYPE`, `KEYS`, `STORAGE_KEYS`, `STAGE_THRESHOLDS`, `DIFFICULTY_TABLES`, `COLORS`, `FONTS`

### layers.js
- `COLLISION_LAYERS`, `RENDER_LAYERS`

---

## 유틸리티

- `ObjectPool`, `PerformanceMonitor`, `Logger`, `MathUtils` 등

---

## 관련 문서

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
- [MIGRATION_STRATEGY.md](./MIGRATION_STRATEGY.md)
- [REFACTORING_PLAN.md](./REFACTORING_PLAN.md)


