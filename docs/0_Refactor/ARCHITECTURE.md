# 아키텍처 설계 문서

> **Swipe Brick Breaker 2.0 Architecture Design**
> **버전**: 2.0.0 (Box2D Integration)
> **최종 업데이트**: 2025-10-24
> **물리 엔진**: Planck.js (Box2D for JavaScript)

---

## 목차

1. [아키텍처 개요](#아키텍처-개요)
2. [Clean Architecture](#clean-architecture)
3. [Entity-Component-System (ECS)](#entity-component-system-ecs)
4. [디자인 패턴](#디자인-패턴)
5. [모듈 구조](#모듈-구조)
6. [핵심 시스템](#핵심-시스템)
7. [데이터 플로우](#데이터-플로우)
8. [성능 최적화](#성능-최적화)

---

## 아키텍처 개요

### 핵심 원칙

1. **관심사의 분리 (Separation of Concerns)**
   - 렌더링 ↔ 게임 로직 ↔ 데이터 저장 완전 분리

2. **의존성 역전 (Dependency Inversion)**
   - 고수준 모듈이 저수준 모듈에 의존하지 않음
   - 추상화에 의존

3. **단일 책임 (Single Responsibility)**
   - 각 클래스/모듈은 하나의 명확한 책임

4. **개방-폐쇄 (Open-Closed)**
   - 확장에는 열려있고, 수정에는 닫혀있음

5. **인터페이스 분리 (Interface Segregation)**
   - 클라이언트는 사용하지 않는 인터페이스에 의존하지 않음

### 아키텍처 다이어그램

```
┌──────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │  Canvas    │  │   Input    │  │     UI     │             │
│  │  Renderer  │  │  Handler   │  │   Manager  │             │
│  └────────────┘  └────────────┘  └────────────┘             │
└──────────────────────────────────────────────────────────────┘
                           ↓ ↑
┌──────────────────────────────────────────────────────────────┐
│                   Application Layer                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                  Game Engine                         │   │
│  │   ┌────────────┐  ┌────────────┐  ┌────────────┐    │   │
│  │   │  System    │  │  Entity    │  │   State    │    │   │
│  │   │  Manager   │  │  Manager   │  │  Manager   │    │   │
│  │   └────────────┘  └────────────┘  └────────────┘    │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
                           ↓ ↑
┌──────────────────────────────────────────────────────────────┐
│                     Domain Layer                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │  Entities  │  │  Systems   │  │ Components │             │
│  │            │  │            │  │            │             │
│  │  - Ball    │  │ - Physics  │  │ - Position │             │
│  │  - Block   │  │ - Render   │  │ - Velocity │             │
│  │  - Bonus   │  │ -Collision │  │ - Sprite   │             │
│  └────────────┘  └────────────┘  └────────────┘             │
└──────────────────────────────────────────────────────────────┘
                           ↓ ↑
┌──────────────────────────────────────────────────────────────┐
│                Infrastructure Layer                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │  Storage   │  │   Config   │  │   Utils    │             │
│  │  Manager   │  │   Loader   │  │            │             │
│  └────────────┘  └────────────┘  └────────────┘             │
└──────────────────────────────────────────────────────────────┘
```

---

## Clean Architecture

### 계층 구조

#### 1. Presentation Layer (표현 계층)

**책임**: 사용자 인터페이스, 입력 처리, 렌더링

```javascript
// CanvasRenderer.js
class CanvasRenderer {
  constructor(canvas) {
    this.ctx = canvas.getContext('2d');
    this.canvas = canvas;
    this.images = new Map();
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawCircle(x, y, radius, color) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawRect(x, y, width, height, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, width, height);
  }

  drawText(text, x, y, options = {}) {
    const { font = '25px sans-serif', color = '#ffffff', align = 'center' } = options;
    this.ctx.font = font;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = align;
    this.ctx.fillText(text, x, y);
  }

  async loadImage(key, src) {
    const img = new Image();
    img.src = src;
    await img.decode();
    this.images.set(key, img);
  }

  drawImage(keyOrPath, x, y, options = {}) {
    const img = this.images.get(keyOrPath);
    if (!img) {
      console.warn(`Image not found: ${keyOrPath}`);
      return;
    }

    const { width, height } = options;
    if (width !== undefined && height !== undefined) {
      this.ctx.drawImage(img, x, y, width, height);
    } else {
      this.ctx.drawImage(img, x, y);
    }
  }
}

// InputHandler.js
class InputHandler {
  constructor() {
    this.listeners = new Map();
    this.setupListeners();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  emit(event, data) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(cb => cb(data));
  }
}
```

#### 2. Application Layer (애플리케이션 계층)

**책임**: 비즈니스 로직 조율, 사용 사례 구현

```javascript
// Engine.js
class Engine {
  constructor(canvas) {
    this.entityManager = new EntityManager();
    this.systemManager = new SystemManager();
    this.stateManager = new StateManager();
    this.renderer = new CanvasRenderer(canvas);
    this.input = new InputHandler();

    this.setupSystems();
    this.setupInput();
  }

  setupSystems() {
    this.systemManager.addSystem(new PhysicsSystem());
    this.systemManager.addSystem(new CollisionSystem());
    this.systemManager.addSystem(new RenderSystem(this.renderer));
    this.systemManager.addSystem(new BallSystem());
    this.systemManager.addSystem(new BlockSystem());
  }

  update(deltaTime) {
    this.stateManager.currentState.update(this, deltaTime);
    this.systemManager.update(this.entityManager.entities, deltaTime);
  }

  render() {
    this.renderer.clear();
    this.stateManager.currentState.render(this, this.renderer);
    this.systemManager.render(this.entityManager.entities, this.renderer);
  }
}
```

#### 3. Domain Layer (도메인 계층)

**책임**: 핵심 비즈니스 로직, 엔티티, 컴포넌트

```javascript
// Entity.js
class Entity {
  constructor(id) {
    this.id = id;
    this.components = new Map();
  }

  addComponent(component) {
    this.components.set(component.type, component);
    return this;
  }

  getComponent(type) {
    return this.components.get(type);
  }

  hasComponent(type) {
    return this.components.has(type);
  }

  removeComponent(type) {
    this.components.delete(type);
    return this;
  }
}

// Components
class PositionComponent {
  type = 'position';
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class VelocityComponent {
  type = 'velocity';
  constructor(vx, vy) {
    this.vx = vx;
    this.vy = vy;
  }
}

class SpriteComponent {
  type = 'sprite';
  constructor(shape, color, size) {
    this.shape = shape;  // 'circle' | 'rect'
    this.color = color;
    this.size = size;    // radius or {width, height}
    this.layer = 0;
  }
}
```

#### 4. Infrastructure Layer (인프라 계층)

**책임**: 외부 리소스, 설정, 유틸리티

```javascript
// StorageAdapter.js
class LocalStorageAdapter {
  get(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  }

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  }
}

// ConfigLoader.js
class ConfigLoader {
  static load() {
    return {
      canvas: CANVAS,
      ball: BALL,
      block: BLOCK,
      physics: PHYSICS,
      // ... from constants.js
    };
  }
}
```

---

## Entity-Component-System (ECS)

### ECS 개념

#### Entity (엔티티)
- ID만 가진 컨테이너
- 게임 오브젝트의 추상화
- 데이터나 로직을 직접 가지지 않음

#### Component (컴포넌트)
- 순수 데이터 구조
- 로직 없음
- 재사용 가능

#### System (시스템)
- 특정 컴포넌트 조합을 가진 엔티티 처리
- 게임 로직 포함
- 프레임마다 실행

### ECS 구현

```javascript
// EntityManager.js
class EntityManager {
  constructor() {
    this.entities = new Set();
    this.nextId = 0;
  }

  createEntity() {
    const entity = new Entity(this.nextId++);
    this.entities.add(entity);
    return entity;
  }

  removeEntity(entity) {
    this.entities.delete(entity);
  }

  getEntitiesWith(...componentTypes) {
    return Array.from(this.entities).filter(entity =>
      componentTypes.every(type => entity.hasComponent(type))
    );
  }
}

// System.js (Base Class)
class System {
  constructor() {
    this.requiredComponents = [];
    this.priority = 0;
  }

  update(entities, deltaTime) {
    const validEntities = entities.filter(entity =>
      this.requiredComponents.every(type => entity.hasComponent(type))
    );
    this.process(validEntities, deltaTime);
  }

  process(entities, deltaTime) {
    // Override in subclass
  }
}

// PhysicsSystem.js (Concrete System)
class PhysicsSystem extends System {
  constructor() {
    super();
    this.requiredComponents = ['position', 'velocity'];
    this.priority = 10;
  }

  process(entities, deltaTime) {
    entities.forEach(entity => {
      const pos = entity.getComponent('position');
      const vel = entity.getComponent('velocity');

      pos.x += vel.vx * deltaTime;
      pos.y += vel.vy * deltaTime;
    });
  }
}
```

### 컴포넌트 설계

```javascript
// PositionComponent.js
class PositionComponent {
  type = 'position';
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}

// VelocityComponent.js
class VelocityComponent {
  type = 'velocity';
  constructor(vx = 0, vy = 0) {
    this.vx = vx;
    this.vy = vy;
  }
}

// BodyComponent.js - Box2D Body 참조
class BodyComponent {
  type = 'body';
  constructor(body = null) {
    this.body = body;  // planck.Body instance
  }
}

// CollisionComponent.js
class CollisionComponent {
  type = 'collision';
  constructor(shape, size, layer = 0) {
    this.shape = shape;  // 'circle' | 'aabb'
    this.size = size;    // radius or {width, height}
    this.layer = layer;  // Collision layer (bitmask)
    this.mask = 0xFFFF;  // What can it collide with
  }
}

// HealthComponent.js
class HealthComponent {
  type = 'health';
  constructor(max) {
    this.max = max;
    this.current = max;
  }

  takeDamage(amount) {
    this.current = Math.max(0, this.current - amount);
    return this.current === 0;
  }
}

// LifecycleComponent.js
class LifecycleComponent {
  type = 'lifecycle';
  constructor(initialState = 'active') {
    this.state = initialState;  // 'inactive' | 'active' | 'dead'
    this.age = 0;
  }
}
```

### 엔티티 팩토리

```javascript
// BallFactory.js - Box2D 통합
class BallFactory {
  static create(entityManager, world, x, y, id = 0) {
    const entity = entityManager.createEntity();

    // Box2D Body 생성
    const body = world.createBody({
      type: 'dynamic',
      position: Vec2(x / PHYSICS_SCALE, y / PHYSICS_SCALE),
      bullet: true,  // CCD 활성화
    });
    body.createFixture({
      shape: planck.Circle(BALL.RADIUS / PHYSICS_SCALE),
      density: 1.0,
      friction: 0.0,
      restitution: 1.0,  // 완전 탄성
    });
    body.setUserData({ entityId: entity.id });

    entity
      .addComponent(new PositionComponent(x, y))
      .addComponent(new VelocityComponent(0, 0))
      .addComponent(new SpriteComponent('circle', BALL.COLOR, BALL.RADIUS))
      .addComponent(new BodyComponent(body))
      .addComponent(new LifecycleComponent('inactive'))
      .addComponent(new BallComponent(id));

    return entity;
  }
}

// BlockFactory.js - Box2D 통합
class BlockFactory {
  static createNormal(entityManager, world, x, y, health) {
    const entity = entityManager.createEntity();

    // Box2D Static Body
    const body = world.createBody({
      type: 'static',
      position: Vec2(
        (x + BLOCK.WIDTH / 2) / PHYSICS_SCALE,
        (y + BLOCK.HEIGHT / 2) / PHYSICS_SCALE
      ),
    });
    body.createFixture({
      shape: planck.Box(
        BLOCK.WIDTH / 2 / PHYSICS_SCALE,
        BLOCK.HEIGHT / 2 / PHYSICS_SCALE
      ),
      friction: 0.0,
      restitution: 1.0,
    });
    body.setUserData({ entityId: entity.id });

    entity
      .addComponent(new PositionComponent(x, y))
      .addComponent(new SpriteComponent('rect', BLOCK.COLOR, {
        width: BLOCK.WIDTH,
        height: BLOCK.HEIGHT
      }))
      .addComponent(new BodyComponent(body))
      .addComponent(new HealthComponent(health))
      .addComponent(new BlockComponent('normal'));

    return entity;
  }

  static createBonus(entityManager, x, y, health, bonusType) {
    const entity = entityManager.createEntity();

    entity
      .addComponent(new PositionComponent(x, y))
      .addComponent(new SpriteComponent('rect', BONUS.COLOR, {
        width: BLOCK.WIDTH,
        height: BLOCK.HEIGHT
      }))
      .addComponent(new CollisionComponent('aabb', {
        width: BLOCK.WIDTH,
        height: BLOCK.HEIGHT
      }, COLLISION_LAYERS.BLOCK))
      .addComponent(new HealthComponent(health * BONUS.HEALTH_MULTIPLIER))
      .addComponent(new BlockComponent('bonus'))
      .addComponent(new BonusComponent(bonusType));

    return entity;
  }
}
```

---

## 디자인 패턴

### 1. State Pattern (게임 상태)

```javascript
// GameState.js (Abstract)
class GameState {
  constructor(name) {
    this.name = name;
  }

  enter(context) {
    console.log(`Entering ${this.name} state`);
  }

  exit(context) {
    console.log(`Exiting ${this.name} state`);
  }

  update(context, deltaTime) {}
  render(context, renderer) {}
  handleInput(context, input) {}
}

// MenuState.js
class MenuState extends GameState {
  constructor() {
    super('menu');
    this.fontSize = 15;
  }

  update(context, deltaTime) {
    // 애니메이션 효과
    this.fontSize += Math.sin(Date.now() / 100) * 0.02;
  }

  render(context, renderer) {
    // 메뉴 렌더링
    renderer.drawImage('title', 0, 0);
    renderer.drawText('Press R to Start', 300, 350, this.fontSize);
  }

  handleInput(context, input) {
    if (input.key === KEYS.RESTART) {
      context.stateManager.setState(new PlayState());
    } else if (input.key === KEYS.MANUAL) {
      context.stateManager.setState(new ManualState());
    }
  }
}

// PlayState.js
class PlayState extends GameState {
  constructor() {
    super('play');
  }

  enter(context) {
    super.enter(context);
    // 게임 초기화
    this.spawnBalls(context);
    this.spawnBlocks(context);
  }

  update(context, deltaTime) {
    // 게임 로직은 시스템에서 처리
  }

  handleInput(context, input) {
    if (input.type === 'mousedown') {
      this.shootBalls(context, input.x, input.y);
    } else if (input.key === KEYS.DEBUG) {
      context.stateManager.setState(new PauseState());
    }
  }
}

// StateManager.js
class StateManager {
  constructor() {
    this.currentState = new MenuState();
    this.previousState = null;
  }

  setState(newState) {
    this.previousState = this.currentState;
    this.currentState.exit(this.context);
    this.currentState = newState;
    this.currentState.enter(this.context);
  }

  revertToPrevious() {
    if (this.previousState) {
      this.setState(this.previousState);
    }
  }
}
```

### 2. Object Pool Pattern (성능 최적화)

```javascript
// ObjectPool.js
class ObjectPool {
  constructor(factory, initialSize = 100) {
    this.factory = factory;
    this.available = [];
    this.inUse = new Set();

    // Pre-allocate objects
    for (let i = 0; i < initialSize; i++) {
      this.available.push(this.factory());
    }
  }

  acquire() {
    let obj;

    if (this.available.length > 0) {
      obj = this.available.pop();
    } else {
      obj = this.factory();
      console.warn('Pool exhausted, creating new object');
    }

    this.inUse.add(obj);
    return obj;
  }

  release(obj) {
    if (this.inUse.has(obj)) {
      this.inUse.delete(obj);
      obj.reset();  // 객체 초기화
      this.available.push(obj);
    }
  }

  clear() {
    this.available = [];
    this.inUse.clear();
  }

  getStats() {
    return {
      available: this.available.length,
      inUse: this.inUse.size,
      total: this.available.length + this.inUse.size
    };
  }
}

// Particle with reset
class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.opacity = 1;
    this.color = '';
    this.size = 0;
  }

  init(x, y, vx, vy, color, size) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.size = size;
    this.opacity = 1;
  }
}

// Usage
const particlePool = new ObjectPool(() => new Particle(), 200);

// Acquire
const particle = particlePool.acquire();
particle.init(100, 100, 5, -10, '#ff384e', 6);

// Release when done
if (particle.opacity <= 0) {
  particlePool.release(particle);
}
```

### 3. Factory Pattern (엔티티 생성)

```javascript
// EntityFactory.js
class EntityFactory {
  static createBall(manager, x, y, config) {
    const entity = manager.createEntity();

    entity
      .addComponent(new PositionComponent(x, y))
      .addComponent(new VelocityComponent(0, 0))
      .addComponent(new SpriteComponent('circle', config.color, config.radius))
      .addComponent(new CollisionComponent('circle', config.radius))
      .addComponent(new TagComponent('ball'));

    return entity;
  }

  static createBlock(manager, x, y, health) {
    const entity = manager.createEntity();

    entity
      .addComponent(new PositionComponent(x, y))
      .addComponent(new SpriteComponent('rect', BLOCK.COLOR, {
        width: BLOCK.WIDTH,
        height: BLOCK.HEIGHT
      }))
      .addComponent(new CollisionComponent('aabb', {
        width: BLOCK.WIDTH,
        height: BLOCK.HEIGHT
      }))
      .addComponent(new HealthComponent(health))
      .addComponent(new TagComponent('block'));

    return entity;
  }
}
```

### 4. Observer Pattern (이벤트 시스템)

```javascript
// EventBus.js
class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(event, callback, context = null) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    this.listeners.get(event).push({ callback, context });

    // Unsubscribe function
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;

    const listeners = this.listeners.get(event);
    const index = listeners.findIndex(l => l.callback === callback);

    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }

  emit(event, data) {
    if (!this.listeners.has(event)) return;

    const listeners = this.listeners.get(event);
    listeners.forEach(({ callback, context }) => {
      if (context) {
        callback.call(context, data);
      } else {
        callback(data);
      }
    });
  }

  once(event, callback, context = null) {
    const wrapper = (data) => {
      callback.call(context, data);
      this.off(event, wrapper);
    };
    this.on(event, wrapper, context);
  }
}

// Usage
const eventBus = new EventBus();

// Subscribe
eventBus.on('block:destroyed', ({ blockId, score }) => {
  console.log(`Block ${blockId} destroyed! +${score}`);
  // Spawn particles
  // Update score
  // Play sound
});

eventBus.on('ball:landed', ({ x, y }) => {
  // Reset ball positions
  // Add new line of blocks
});

// Emit
eventBus.emit('block:destroyed', { blockId: 123, score: 10 });
```

### 5. Strategy Pattern (충돌 해결)

```javascript
// CollisionStrategy.js
class CollisionStrategy {
  resolve(entity1, entity2, collision) {
    throw new Error('Must implement resolve()');
  }
}

// BallBlockCollision.js
class BallBlockCollision extends CollisionStrategy {
  resolve(ball, block, collision) {
    const ballVel = ball.getComponent('velocity');
    const blockHealth = block.getComponent('health');

    // Determine bounce direction
    const { normal } = collision;

    if (Math.abs(normal.x) > Math.abs(normal.y)) {
      ballVel.vx *= -1;
    } else {
      ballVel.vy *= -1;
    }

    // Damage block
    const destroyed = blockHealth.takeDamage(1);

    if (destroyed) {
      eventBus.emit('block:destroyed', { block });
    }
  }
}

// BallWallCollision.js
class BallWallCollision extends CollisionStrategy {
  resolve(ball, wall, collision) {
    const ballVel = ball.getComponent('velocity');
    const ballPos = ball.getComponent('position');

    if (wall.type === 'horizontal') {
      ballVel.vy *= -1;
      ballPos.y += ballVel.vy * 2;
    } else {
      ballVel.vx *= -1;
      ballPos.x += ballVel.vx * 2;
    }
  }
}

// CollisionResolver.js
class CollisionResolver {
  constructor() {
    this.strategies = new Map([
      ['ball-block', new BallBlockCollision()],
      ['ball-wall', new BallWallCollision()],
      ['ball-bonus', new BallBonusCollision()],
    ]);
  }

  resolve(collision) {
    const { entity1, entity2 } = collision;
    const type1 = this.getEntityType(entity1);
    const type2 = this.getEntityType(entity2);
    const key = `${type1}-${type2}`;

    const strategy = this.strategies.get(key);
    if (strategy) {
      strategy.resolve(entity1, entity2, collision);
    }
  }

  getEntityType(entity) {
    const tag = entity.getComponent('tag');
    return tag ? tag.value : 'unknown';
  }
}
```

---

## 모듈 구조

### 디렉토리 구조

```
src/
├── index.js                    # Entry point
├── config/
│   ├── constants.js            # 모든 상수
│   ├── gameConfig.js           # 게임 설정
│   └── layers.js               # 충돌 레이어
├── core/
│   ├── Engine.js               # 메인 게임 엔진
│   ├── GameLoop.js             # 애니메이션 루프
│   ├── Entity.js               # 엔티티 기본 클래스
│   ├── EntityManager.js        # 엔티티 관리
│   ├── System.js               # 시스템 기본 클래스
│   └── SystemManager.js        # 시스템 관리
├── components/
│   ├── PositionComponent.js
│   ├── VelocityComponent.js
│   ├── SpriteComponent.js
│   ├── CollisionComponent.js
│   ├── HealthComponent.js
│   ├── LifecycleComponent.js
│   ├── BallComponent.js        # Ball-specific
│   ├── BlockComponent.js       # Block-specific
│   └── TagComponent.js
├── systems/
│   ├── PhysicsSystem.js        # 물리 시뮬레이션
│   ├── CollisionSystem.js      # 충돌 감지 및 처리
│   ├── RenderSystem.js         # 렌더링
│   ├── BallSystem.js           # 공 특화 로직
│   ├── BlockSystem.js          # 블록 특화 로직
│   ├── ParticleSystem.js       # 파티클 효과
│   └── LifecycleSystem.js      # 엔티티 수명 관리
├── factories/
│   ├── BallFactory.js
│   ├── BlockFactory.js
│   ├── BonusFactory.js
│   └── ParticleFactory.js
├── state/
│   ├── GameState.js            # State 기본 클래스
│   ├── StateManager.js
│   └── states/
│       ├── MenuState.js
│       ├── PlayState.js
│       ├── PauseState.js
│       ├── GameOverState.js
│       └── ManualState.js
├── rendering/
│   ├── CanvasRenderer.js       # Canvas 추상화
│   ├── LayerManager.js         # 레이어 관리
│   └── SpriteRenderer.js       # 스프라이트 렌더링
├── physics/
│   ├── CollisionDetector.js    # 충돌 감지
│   ├── SpatialHash.js          # Spatial Hashing
│   ├── CollisionResolver.js    # 충돌 해결
│   └── strategies/
│       ├── BallBlockCollision.js
│       ├── BallWallCollision.js
│       └── BallBonusCollision.js
├── storage/
│   ├── StorageAdapter.js       # Storage 인터페이스
│   ├── LocalStorageAdapter.js
│   └── ScoreRepository.js
├── input/
│   ├── InputManager.js
│   ├── MouseHandler.js
│   └── KeyboardHandler.js
├── events/
│   └── EventBus.js
└── utils/
    ├── MathUtils.js
    ├── ArrayUtils.js
    ├── ObjectPool.js
    ├── Logger.js
    └── PerformanceMonitor.js
```

---

## 핵심 시스템

### 1. PhysicsSystem - Box2D 통합

```javascript
import planck from 'planck-js';

const PHYSICS_SCALE = 100;  // 픽셀 → 미터 변환 (Box2D는 미터 단위)

class PhysicsSystem extends System {
  constructor(world) {
    super();
    this.requiredComponents = ['body'];
    this.priority = 10;
    this.world = world;

    // Box2D World 설정
    this.world.setGravity(Vec2(0, 0));  // 중력 없음 (벽돌깨기)
  }

  process(entities, deltaTime) {
    // Box2D 시뮬레이션 (고정 타임스텝)
    this.world.step(deltaTime / 1000, 8, 3);

    // Body → PositionComponent 동기화
    entities.forEach(entity => {
      const bodyComp = entity.getComponent('body');
      const posComp = entity.getComponent('position');

      if (bodyComp?.body && posComp) {
        const bodyPos = bodyComp.body.getPosition();
        posComp.x = bodyPos.x * PHYSICS_SCALE;
        posComp.y = bodyPos.y * PHYSICS_SCALE;
      }
    });
  }

  // 파티클용 간단 물리 (Box2D 미사용)
  updateParticle(particle, deltaTime) {
    particle.vy += PHYSICS.GRAVITY * deltaTime;
    particle.vx *= PHYSICS.FRICTION;
    particle.vy *= PHYSICS.FRICTION;
    particle.x += particle.vx * deltaTime;
    particle.y += particle.vy * deltaTime;
  }
}
```

### 2. CollisionSystem - Box2D 리스너

```javascript
class CollisionSystem extends System {
  constructor(world, eventBus) {
    super();
    this.requiredComponents = [];  // 모든 엔티티
    this.priority = 20;
    this.world = world;
    this.eventBus = eventBus;
    this.entityManager = null;

    // Box2D 충돌 리스너 등록
    this.world.on('begin-contact', this.handleBeginContact.bind(this));
    this.world.on('end-contact', this.handleEndContact.bind(this));
  }

  init(context) {
    super.init(context);
    this.entityManager = context.entityManager;
  }

  process(entities, deltaTime) {
    // Box2D가 자동으로 충돌 감지
    // 리스너에서 처리하므로 여기서는 아무것도 하지 않음
  }

  handleBeginContact(contact) {
    const fixtureA = contact.getFixtureA();
    const fixtureB = contact.getFixtureB();

    const bodyA = fixtureA.getBody();
    const bodyB = fixtureB.getBody();

    const entityIdA = bodyA.getUserData()?.entityId;
    const entityIdB = bodyB.getUserData()?.entityId;

    if (entityIdA == null || entityIdB == null) return;

    const entityA = this.entityManager.getEntityById(entityIdA);
    const entityB = this.entityManager.getEntityById(entityIdB);

    if (!entityA || !entityB) return;

    // 충돌 타입 확인 및 처리
    this.resolveCollision(entityA, entityB, contact);
  }

  handleEndContact(contact) {
    // 필요시 구현
  }

  resolveCollision(entityA, entityB, contact) {
    const tagA = entityA.getComponent('tag')?.value;
    const tagB = entityB.getComponent('tag')?.value;

    // Ball-Block 충돌
    if ((tagA === 'ball' && tagB === 'block') ||
        (tagA === 'block' && tagB === 'ball')) {
      const ball = tagA === 'ball' ? entityA : entityB;
      const block = tagA === 'block' ? entityA : entityB;

      this.handleBallBlockCollision(ball, block, contact);
    }

    // Ball-Wall 충돌
    else if ((tagA === 'ball' && tagB === 'wall') ||
             (tagA === 'wall' && tagB === 'ball')) {
      // Box2D가 자동으로 반사 처리
    }
  }

  handleBallBlockCollision(ball, block, contact) {
    const health = block.getComponent('health');

    if (health) {
      const destroyed = health.takeDamage(1);

      if (destroyed) {
        this.eventBus.emit('block:destroyed', {
          block,
          position: block.getComponent('position')
        });

        // Box2D Body 제거
        const bodyComp = block.getComponent('body');
        if (bodyComp?.body) {
          this.world.destroyBody(bodyComp.body);
          bodyComp.body = null;
        }

        block.destroy();
      }
    }
  }
}
```

**Box2D 충돌 감지 장점:**
- ✅ Broad-phase: Dynamic AABB Tree (자동 최적화)
- ✅ Narrow-phase: SAT (Separating Axis Theorem)
- ✅ CCD (Continuous Collision Detection) - 빠른 공도 놓치지 않음
- ✅ 검증된 알고리즘 - 수동 구현 불필요

### 3. RenderSystem

```javascript
class RenderSystem extends System {
  constructor(renderer) {
    super();
    this.requiredComponents = ['position', 'sprite'];
    this.priority = 100;
    this.renderer = renderer;
    this.layers = new Map();
  }

  process(entities, deltaTime) {
    // Sort entities by layer
    this.layers.clear();

    entities.forEach(entity => {
      const sprite = entity.getComponent('sprite');
      const layer = sprite.layer || 0;

      if (!this.layers.has(layer)) {
        this.layers.set(layer, []);
      }

      this.layers.get(layer).push(entity);
    });

    // Render by layer order
    const sortedLayers = Array.from(this.layers.keys()).sort((a, b) => a - b);

    sortedLayers.forEach(layer => {
      const entities = this.layers.get(layer);
      entities.forEach(entity => this.renderEntity(entity));
    });
  }

  renderEntity(entity) {
    const pos = entity.getComponent('position');
    const sprite = entity.getComponent('sprite');

    if (sprite.shape === 'circle') {
      this.renderer.drawCircle(pos.x, pos.y, sprite.size, sprite.color);
    } else if (sprite.shape === 'rect') {
      this.renderer.drawRect(
        pos.x,
        pos.y,
        sprite.size.width,
        sprite.size.height,
        sprite.color
      );
    }
  }
}
```

---

## 데이터 플로우

### 게임 루프 플로우

```
┌─────────────────────────────────────────┐
│         Game Loop (60 FPS)              │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│       1. Input Processing               │
│  - Mouse/Keyboard events                │
│  - State-specific input handling        │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│       2. State Update                   │
│  - Current state logic                  │
│  - State transitions                    │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│       3. System Update (순서대로)        │
│  - PhysicsSystem (priority: 10)         │
│  - CollisionSystem (priority: 20)       │
│  - BallSystem (priority: 30)            │
│  - BlockSystem (priority: 40)           │
│  - ParticleSystem (priority: 50)        │
│  - LifecycleSystem (priority: 90)       │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│       4. Rendering                      │
│  - Clear canvas                         │
│  - State render                         │
│  - RenderSystem (priority: 100)         │
│  - UI overlay                           │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│       5. Cleanup                        │
│  - Remove dead entities                 │
│  - Release pooled objects               │
└─────────────────────────────────────────┘
```

### 이벤트 플로우

```
User Input → InputManager → EventBus → State/Systems
                                ↓
                        Event Handlers
                        (Score, Sound, Effects)
                                ↓
                        State Changes
```

---

## 성능 최적화

### 1. Box2D World 초기화

```javascript
// src/physics/WorldManager.js
import planck from 'planck-js';

const PHYSICS_SCALE = 100;  // 100 픽셀 = 1 미터

class WorldManager {
  constructor() {
    // Box2D World 생성
    this.world = planck.World({
      gravity: planck.Vec2(0, 0)  // 중력 없음
    });

    // 벽 생성 (Static Bodies)
    this.createWalls();
  }

  createWalls() {
    const canvasWidth = CANVAS.WIDTH;
    const canvasHeight = CANVAS.HEIGHT;

    // 왼쪽 벽
    this.createWall(0, 0, 10, canvasHeight);

    // 오른쪽 벽
    this.createWall(canvasWidth - 10, 0, 10, canvasHeight);

    // 위쪽 벽
    this.createWall(0, 0, canvasWidth, 10);

    // 아래쪽은 벽 없음 (공이 떨어지는 영역)
  }

  createWall(x, y, width, height) {
    const body = this.world.createBody({
      type: 'static',
      position: planck.Vec2(
        (x + width / 2) / PHYSICS_SCALE,
        (y + height / 2) / PHYSICS_SCALE
      )
    });

    body.createFixture({
      shape: planck.Box(
        width / 2 / PHYSICS_SCALE,
        height / 2 / PHYSICS_SCALE
      ),
      friction: 0.0,
      restitution: 1.0  // 완전 탄성
    });

    body.setUserData({ type: 'wall' });

    return body;
  }

  step(deltaTime) {
    // Box2D 권장: 고정 타임스텝 1/60초
    const timeStep = 1 / 60;
    const velocityIterations = 8;  // 속도 반복 (정확도)
    const positionIterations = 3;  // 위치 반복

    this.world.step(timeStep, velocityIterations, positionIterations);
  }

  destroy() {
    // 모든 Body 제거
    let body = this.world.getBodyList();
    while (body) {
      const next = body.getNext();
      this.world.destroyBody(body);
      body = next;
    }
  }
}
```

### 2. Object Pooling

전역 풀 관리:
```javascript
class PoolManager {
  constructor() {
    this.pools = new Map();
  }

  createPool(name, factory, size) {
    this.pools.set(name, new ObjectPool(factory, size));
  }

  acquire(name) {
    return this.pools.get(name).acquire();
  }

  release(name, obj) {
    this.pools.get(name).release(obj);
  }
}

// Global instance
const poolManager = new PoolManager();
poolManager.createPool('particles', () => new Particle(), 200);
```

### 3. Fixed Timestep

```javascript
class GameLoop {
  constructor(updateFn, renderFn) {
    this.update = updateFn;
    this.render = renderFn;
    this.targetFPS = 60;
    this.frameTime = 1000 / this.targetFPS;
    this.lastTime = 0;
    this.accumulator = 0;
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  loop(currentTime) {
    if (!this.running) return;

    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    this.accumulator += deltaTime;

    // Fixed timestep updates
    while (this.accumulator >= this.frameTime) {
      this.update(this.frameTime);
      this.accumulator -= this.frameTime;
    }

    // Render with interpolation factor
    const alpha = this.accumulator / this.frameTime;
    this.render(alpha);

    requestAnimationFrame(this.loop.bind(this));
  }
}
```

---

## 확장성 고려사항

### 플러그인 시스템

```javascript
class PluginManager {
  constructor(engine) {
    this.engine = engine;
    this.plugins = new Map();
  }

  register(name, plugin) {
    plugin.install(this.engine);
    this.plugins.set(name, plugin);
  }

  unregister(name) {
    const plugin = this.plugins.get(name);
    if (plugin && plugin.uninstall) {
      plugin.uninstall(this.engine);
    }
    this.plugins.delete(name);
  }
}

// Example Plugin
class SoundPlugin {
  install(engine) {
    this.audio = new AudioContext();
    engine.eventBus.on('block:destroyed', this.playExplosion.bind(this));
  }

  playExplosion() {
    // Play sound
  }

  uninstall(engine) {
    engine.eventBus.off('block:destroyed', this.playExplosion);
  }
}
```

---

**문서 버전**: 1.0
**작성일**: 2025-10-24
**다음 문서**: [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
