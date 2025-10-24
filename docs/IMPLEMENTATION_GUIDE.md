# 구현 가이드

> **Swipe Brick Breaker 2.0 Implementation Guide**
> **버전**: 2.0.0
> **최종 업데이트**: 2025-10-24

---

## 목차

1. [개발 환경 설정](#개발-환경-설정)
2. [프로젝트 구조 생성](#프로젝트-구조-생성)
3. [상수 정의](#상수-정의)
4. [코어 시스템 구현](#코어-시스템-구현)
5. [컴포넌트 구현](#컴포넌트-구현)
6. [시스템 구현](#시스템-구현)
7. [상태 관리 구현](#상태-관리-구현)
8. [테스트 작성](#테스트-작성)
9. [빌드 및 배포](#빌드-및-배포)

---

## 개발 환경 설정

### 필수 도구

```bash
# Node.js 설치 확인
node --version  # v18.0.0 이상

# npm 설치 확인
npm --version   # v9.0.0 이상
```

### 프로젝트 초기화

> **📁 레거시 코드 참조**:
> 이 가이드는 새로운 리팩토링 프로젝트를 위한 것입니다.
> 2020년 원본 프로젝트는 `/legacy` 디렉토리에 보관되어 있습니다.
>
> 기능 분석 및 테스트 시 레거시 코드(`legacy/asset/app.js`)를 참조하세요.

```bash
# 프로젝트 디렉토리 생성
mkdir swipe-brick-breaker-refactored
cd swipe-brick-breaker-refactored

# npm 초기화
npm init -y

# Git 초기화
git init
echo "node_modules\ndist\n.DS_Store" > .gitignore
```

### 의존성 설치

```bash
# 개발 도구
npm install --save-dev vite
npm install --save-dev vitest
npm install --save-dev @playwright/test
npx playwright install --with-deps
npm install --save-dev eslint prettier
npm install --save-dev eslint-config-prettier

# 최소화기(terser) 사용 시
npm install --save-dev terser

# TypeScript (선택적)
npm install --save-dev typescript
npm install --save-dev @types/node

# 물리 엔진 (필수)
npm install planck-js
```

### package.json 설정

```json
{
  "name": "swipe-brick-breaker-refactored",
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "lint": "eslint src --ext .js",
    "format": "prettier --write \"src/**/*.js\"",
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "vitest": "^1.0.0",
    "@playwright/test": "^1.40.0",
    "eslint": "^8.55.0",
    "prettier": "^3.1.0",
    "eslint-config-prettier": "^9.1.0"
  }
}
```

### ESLint 설정

```javascript
// .eslintrc.cjs
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ['eslint:recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
};
```

### Prettier 설정

`.prettierrc` 내용:

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "avoid"
}
```

### Vite 설정

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@core': path.resolve(__dirname, './src/core'),
      '@components': path.resolve(__dirname, './src/components'),
      '@systems': path.resolve(__dirname, './src/systems'),
      '@config': path.resolve(__dirname, './src/config'),
    },
  },
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
```

---

## 프로젝트 구조 생성

### 디렉토리 생성

```bash
mkdir -p src/{config,core,components,systems,factories,state/states,rendering,physics/strategies,storage,input,events,utils}
mkdir -p tests/{unit,integration,e2e}
mkdir -p assets/{fonts,images}
mkdir -p docs
```

### 파일 생성

```bash
# 설정 파일
touch src/config/{constants.js,gameConfig.js,layers.js}

# 코어
touch src/core/{Engine.js,GameLoop.js,Entity.js,EntityManager.js,System.js,SystemManager.js}

# 컴포넌트
touch src/components/{PositionComponent.js,VelocityComponent.js,SpriteComponent.js,CollisionComponent.js,HealthComponent.js,LifecycleComponent.js,PhysicsComponent.js,BallComponent.js,BlockComponent.js,TagComponent.js}

# 시스템
touch src/systems/{PhysicsSystem.js,CollisionSystem.js,RenderSystem.js,BallSystem.js,BlockSystem.js,ParticleSystem.js,LifecycleSystem.js}

# 상태
touch src/state/{GameState.js,StateManager.js}
touch src/state/states/{MenuState.js,PlayState.js,PauseState.js,GameOverState.js,ManualState.js}

# 팩토리
touch src/factories/{BallFactory.js,BlockFactory.js,BonusFactory.js,ParticleFactory.js}

# 기타
touch src/rendering/{CanvasRenderer.js,LayerManager.js}
touch src/physics/{WorldManager.js,PhysicsAdapter.js}
touch src/storage/{StorageAdapter.js,LocalStorageAdapter.js,ScoreRepository.js}
touch src/input/{InputManager.js,MouseHandler.js,KeyboardHandler.js}
touch src/events/EventBus.js
touch src/utils/{MathUtils.js,ArrayUtils.js,ObjectPool.js,Logger.js,PerformanceMonitor.js}

# Entry point
touch src/index.js
touch index.html
```

**주요 변경사항 (Box2D 통합):**
- ❌ 제거: `CollisionDetector.js`, `SpatialHash.js`, `CollisionResolver.js`, `strategies/`
- ✅ 추가: `WorldManager.js` (Box2D World 관리), `PhysicsAdapter.js` (ECS ↔ Box2D 브릿지)

---

## 상수 정의

### src/config/constants.js

```javascript
/**
 * 게임 상수 정의
 * 모든 magic number를 여기에 정의
 */

export const CANVAS = {
  WIDTH: 600,
  HEIGHT: 700,
};

export const GRID = {
  COLS: 6,
  ROWS: 13,
  CELL_WIDTH: 100,
  CELL_HEIGHT: 50,
};

export const BALL = {
  RADIUS: 11,
  INITIAL_SPEED: 3.5,
  LAUNCH_DELAY_FRAMES: 6,
  COLOR: '#fdd700',
  MIN_LAUNCH_ANGLE: 0.17, // radians (~10도)
  MAX_LAUNCH_ANGLE: 2.96, // radians (~170도)
};

export const BLOCK = {
  WIDTH: 100,
  HEIGHT: 50,
  PADDING: 2,
  BORDER_RADIUS: 5,
  COLOR: '#ff384e',
  OPACITY_MIN: 0.1,
  OPACITY_MAX: 0.9,
};

export const BONUS = {
  COLOR: '#32b16c',
  AURA_COLOR: '#fdd700',
  RADIUS: 10,
  HEALTH_MULTIPLIER: 1.5,
};

export const PHYSICS = {
  GRAVITY: 0.05,
  FRICTION: 0.99,
};

export const PARTICLE = {
  MAX_COUNT: 200,
  SIZE: 6,
  EXPLOSION_POWER: 20,
  OPACITY_DECAY: 0.004,
  AURA_OPACITY_DECAY: 0.007,
  AURA_EXPANSION_SPEED: 50,
};

export const ANIMATION = {
  TARGET_FPS: 60,
  FRAME_TIME: 1000 / 60,
};

export const GAME_STATE = {
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'game_over',
  MANUAL: 'manual',
};

export const BALL_STATE = {
  INACTIVE: 'inactive',
  WAITING: 'waiting',
  ACTIVE: 'active',
  LANDED: 'landed',
};

export const BLOCK_TYPE = {
  NORMAL: 'normal',
  BONUS_BALL: 'bonus_ball',
  BONUS_CROSS: 'bonus_cross',
  BONUS_HORIZONTAL: 'bonus_horizontal',
  BONUS_VERTICAL: 'bonus_vertical',
};

export const KEYS = {
  RESTART: 'r',
  DEBUG: 'd',
  KILL_BALLS: 'k',
  INIT: 'i',
  MANUAL: 'm',
  BACK: 'b',
};

export const STORAGE_KEYS = {
  LEADERBOARD: 'sbb_leaderboard_v2',
  SETTINGS: 'sbb_settings_v2',
};

export const STAGE_THRESHOLDS = [11, 31, 61, 101, 201, 301];

export const DIFFICULTY_TABLES = [
  [1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4],
  [1, 1, 1, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5],
  [1, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
  [1, 2, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
  [1, 2, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
  [1, 2, 3, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
  [1, 2, 3, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
];

export const COLORS = {
  BACKGROUND: '#161e38',
  BALL: '#fdd700',
  BLOCK: '#ff384e',
  BONUS: '#32b16c',
  BONUS_GLOW: '#fdd700',
  TEXT_PRIMARY: '#fdd700',
  TEXT_SECONDARY: '#ffffff',
  SHADOW: '#f384ae',
};

export const FONTS = {
  FAMILY: 'BM YEONSUNG OTF',
  SIZE_HUGE: '100px',
  SIZE_LARGE: '40px',
  SIZE_MEDIUM: '25px',
  SIZE_SMALL: '20px',
  SIZE_TINY: '15px',
};
```

### src/config/layers.js

```javascript
/**
 * 충돌 레이어 정의 (비트마스크)
 */

export const COLLISION_LAYERS = {
  NONE: 0,
  BALL: 1 << 0, // 0001
  BLOCK: 1 << 1, // 0010
  BONUS: 1 << 2, // 0100
  WALL: 1 << 3, // 1000
  ALL: 0xffff,
};

export const RENDER_LAYERS = {
  BACKGROUND: 0,
  BLOCKS: 1,
  BALLS: 2,
  PARTICLES: 3,
  UI: 4,
};
```

---

## 코어 시스템 구현

### 1. Entity 클래스

```javascript
// src/core/Entity.js

/**
 * Entity - ECS 패턴의 기본 엔티티
 * ID만 가지며, 컴포넌트의 컨테이너 역할
 */
export class Entity {
  /**
   * @param {number} id - 고유 식별자
   */
  constructor(id) {
    this.id = id;
    this.components = new Map();
    this.active = true;
  }

  /**
   * 컴포넌트 추가
   * @param {Object} component - 추가할 컴포넌트
   * @returns {Entity} 체이닝을 위한 this
   */
  addComponent(component) {
    this.components.set(component.type, component);
    return this;
  }

  /**
   * 컴포넌트 조회
   * @param {string} type - 컴포넌트 타입
   * @returns {Object|undefined}
   */
  getComponent(type) {
    return this.components.get(type);
  }

  /**
   * 컴포넌트 소유 여부 확인
   * @param {string} type - 컴포넌트 타입
   * @returns {boolean}
   */
  hasComponent(type) {
    return this.components.has(type);
  }

  /**
   * 여러 컴포넌트 소유 여부 확인
   * @param {...string} types - 컴포넌트 타입들
   * @returns {boolean}
   */
  hasComponents(...types) {
    return types.every(type => this.hasComponent(type));
  }

  /**
   * 컴포넌트 제거
   * @param {string} type - 컴포넌트 타입
   * @returns {Entity}
   */
  removeComponent(type) {
    this.components.delete(type);
    return this;
  }

  /**
   * 모든 컴포넌트 제거
   */
  clearComponents() {
    this.components.clear();
  }

  /**
   * 엔티티 활성화/비활성화
   * @param {boolean} active
   */
  setActive(active) {
    this.active = active;
  }

  /**
   * 엔티티 파괴 (비활성화)
   */
  destroy() {
    this.active = false;
  }
}
```

### 2. EntityManager 클래스

```javascript
// src/core/EntityManager.js

import { Entity } from './Entity.js';

/**
 * EntityManager - 모든 엔티티 관리
 */
export class EntityManager {
  constructor() {
    this.entities = new Set();
    this.nextId = 0;
    this.entitiesToRemove = new Set();
  }

  /**
   * 새 엔티티 생성
   * @returns {Entity}
   */
  createEntity() {
    const entity = new Entity(this.nextId++);
    this.entities.add(entity);
    return entity;
  }

  /**
   * 엔티티 제거 (지연 제거)
   * @param {Entity} entity
   */
  removeEntity(entity) {
    this.entitiesToRemove.add(entity);
  }

  /**
   * ID로 엔티티 찾기
   * @param {number} id
   * @returns {Entity|undefined}
   */
  getEntityById(id) {
    return Array.from(this.entities).find(e => e.id === id);
  }

  /**
   * 특정 컴포넌트를 가진 엔티티들 조회
   * @param {...string} componentTypes
   * @returns {Entity[]}
   */
  getEntitiesWith(...componentTypes) {
    return Array.from(this.entities).filter(
      entity => entity.active && componentTypes.every(type => entity.hasComponent(type))
    );
  }

  /**
   * 태그로 엔티티 찾기
   * @param {string} tag
   * @returns {Entity[]}
   */
  getEntitiesWithTag(tag) {
    return Array.from(this.entities).filter(entity => {
      const tagComp = entity.getComponent('tag');
      return tagComp && tagComp.value === tag;
    });
  }

  /**
   * 모든 활성 엔티티 조회
   * @returns {Entity[]}
   */
  getAllActive() {
    return Array.from(this.entities).filter(e => e.active);
  }

  /**
   * 지연 제거 처리
   */
  cleanup() {
    this.entitiesToRemove.forEach(entity => {
      entity.clearComponents();
      this.entities.delete(entity);
    });
    this.entitiesToRemove.clear();
  }

  /**
   * 모든 엔티티 제거
   */
  clear() {
    this.entities.forEach(entity => entity.clearComponents());
    this.entities.clear();
    this.entitiesToRemove.clear();
    this.nextId = 0;
  }

  /**
   * 통계 정보
   * @returns {Object}
   */
  getStats() {
    return {
      total: this.entities.size,
      active: this.getAllActive().length,
      pending_removal: this.entitiesToRemove.size,
    };
  }
}
```

### 3. System 기본 클래스

```javascript
// src/core/System.js

/**
 * System - ECS 패턴의 시스템 기본 클래스
 * 특정 컴포넌트 조합을 가진 엔티티들을 처리
 */
export class System {
  constructor() {
    /** @type {string[]} 필요한 컴포넌트 타입들 */
    this.requiredComponents = [];

    /** @type {number} 실행 우선순위 (낮을수록 먼저 실행) */
    this.priority = 0;

    /** @type {boolean} 시스템 활성화 여부 */
    this.enabled = true;
  }

  /**
   * 시스템 초기화
   * @param {Object} context - 게임 엔진 컨텍스트
   */
  init(context) {
    this.context = context;
  }

  /**
   * 시스템 업데이트 (매 프레임)
   * @param {Entity[]} entities - 모든 엔티티
   * @param {number} deltaTime - 프레임 시간 (ms)
   */
  update(entities, deltaTime) {
    if (!this.enabled) return;

    // 필요한 컴포넌트를 가진 엔티티만 필터링
    const validEntities = this.filterEntities(entities);

    // 실제 처리
    this.process(validEntities, deltaTime);
  }

  /**
   * 엔티티 필터링
   * @param {Entity[]} entities
   * @returns {Entity[]}
   */
  filterEntities(entities) {
    if (this.requiredComponents.length === 0) {
      return entities;
    }

    return entities.filter(entity =>
      this.requiredComponents.every(type => entity.hasComponent(type))
    );
  }

  /**
   * 실제 로직 처리 (서브클래스에서 구현)
   * @param {Entity[]} entities
   * @param {number} deltaTime
   */
  process(entities, deltaTime) {
    throw new Error('System.process() must be implemented by subclass');
  }

  /**
   * 시스템 활성화/비활성화
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * 시스템 정리
   */
  cleanup() {
    // Override if needed
  }
}
```

### 4. SystemManager 클래스

```javascript
// src/core/SystemManager.js

/**
 * SystemManager - 모든 시스템 관리 및 실행 순서 제어
 */
export class SystemManager {
  constructor() {
    this.systems = [];
  }

  /**
   * 시스템 추가
   * @param {System} system
   */
  addSystem(system) {
    this.systems.push(system);
    // 우선순위로 정렬
    this.systems.sort((a, b) => a.priority - b.priority);
  }

  /**
   * 시스템 제거
   * @param {System} system
   */
  removeSystem(system) {
    const index = this.systems.indexOf(system);
    if (index !== -1) {
      this.systems.splice(index, 1);
    }
  }

  /**
   * 모든 시스템 초기화
   * @param {Object} context
   */
  init(context) {
    this.systems.forEach(system => system.init(context));
  }

  /**
   * 모든 시스템 업데이트
   * @param {Entity[]} entities
   * @param {number} deltaTime
   */
  update(entities, deltaTime) {
    this.systems.forEach(system => {
      if (system.enabled) {
        system.update(entities, deltaTime);
      }
    });
  }

  /**
   * 모든 시스템 정리
   */
  cleanup() {
    this.systems.forEach(system => system.cleanup());
  }

  /**
   * 특정 타입의 시스템 찾기
   * @param {Function} SystemClass
   * @returns {System|undefined}
   */
  getSystem(SystemClass) {
    return this.systems.find(s => s instanceof SystemClass);
  }

  /**
   * 모든 시스템 제거
   */
  clear() {
    this.cleanup();
    this.systems = [];
  }
}
```

### 5. GameLoop 클래스

```javascript
// src/core/GameLoop.js

import { ANIMATION } from '@config/constants.js';

/**
 * GameLoop - Fixed timestep game loop
 * requestAnimationFrame 기반 안정적인 게임 루프
 */
export class GameLoop {
  /**
   * @param {Function} updateFn - 업데이트 함수
   * @param {Function} renderFn - 렌더 함수
   * @param {number} targetFPS - 목표 FPS (기본: 60)
   */
  constructor(updateFn, renderFn, targetFPS = ANIMATION.TARGET_FPS) {
    this.update = updateFn;
    this.render = renderFn;

    this.targetFPS = targetFPS;
    this.frameTime = 1000 / targetFPS;

    this.running = false;
    this.lastTime = 0;
    this.accumulator = 0;

    this.frameCount = 0;
    this.fpsUpdateTime = 0;
    this.currentFPS = 0;
  }

  /**
   * 게임 루프 시작
   */
  start() {
    if (this.running) return;

    this.running = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  /**
   * 게임 루프 정지
   */
  stop() {
    this.running = false;
  }

  /**
   * 메인 루프
   * @param {number} currentTime
   */
  loop(currentTime) {
    if (!this.running) return;

    // 델타 타임 계산
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Fixed timestep updates
    this.accumulator += deltaTime;

    while (this.accumulator >= this.frameTime) {
      this.update(this.frameTime);
      this.accumulator -= this.frameTime;
    }

    // Render with interpolation factor
    const alpha = this.accumulator / this.frameTime;
    this.render(alpha);

    // FPS 계산
    this.updateFPS(currentTime);

    // 다음 프레임 요청
    requestAnimationFrame(this.loop.bind(this));
  }

  /**
   * FPS 계산
   * @param {number} currentTime
   */
  updateFPS(currentTime) {
    this.frameCount++;

    if (currentTime >= this.fpsUpdateTime + 1000) {
      this.currentFPS = this.frameCount;
      this.frameCount = 0;
      this.fpsUpdateTime = currentTime;
    }
  }

  /**
   * 현재 FPS 조회
   * @returns {number}
   */
  getFPS() {
    return this.currentFPS;
  }
}
```

### 6. Engine 클래스

```javascript
// src/core/Engine.js

import { EntityManager } from './EntityManager.js';
import { SystemManager } from './SystemManager.js';
import { GameLoop } from './GameLoop.js';
import { StateManager } from '@/state/StateManager.js';
import { EventBus } from '@/events/EventBus.js';
import { CanvasRenderer } from '@/rendering/CanvasRenderer.js';
import { InputManager } from '@/input/InputManager.js';

/**
 * Engine - 메인 게임 엔진
 * 모든 서브시스템을 통합 관리
 */
export class Engine {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    // 코어 매니저
    this.entityManager = new EntityManager();
    this.systemManager = new SystemManager();
    this.stateManager = new StateManager(this);

    // 서브시스템
    this.eventBus = new EventBus();
    this.renderer = new CanvasRenderer(canvas);
    this.input = new InputManager(canvas);

    // 게임 루프
    this.gameLoop = new GameLoop(
      this.update.bind(this),
      this.render.bind(this)
    );

    // 초기화
    this.setupSystems();
    this.setupInput();
  }

  /**
   * 시스템들 설정
   */
  setupSystems() {
    // 시스템 추가는 Implementation Guide에서 상세히 다룹니다
    // this.systemManager.addSystem(new PhysicsSystem());
    // ...
  }

  /**
   * 입력 설정
   */
  setupInput() {
    this.input.on('keydown', this.handleKeyDown.bind(this));
    this.input.on('mousedown', this.handleMouseDown.bind(this));
  }

  /**
   * 키보드 입력 처리
   * @param {string} key
   */
  handleKeyDown(key) {
    this.stateManager.currentState.handleInput(this, { type: 'keydown', key });
  }

  /**
   * 마우스 입력 처리
   * @param {Object} data
   */
  handleMouseDown(data) {
    this.stateManager.currentState.handleInput(this, { type: 'mousedown', ...data });
  }

  /**
   * 엔진 시작
   */
  start() {
    this.systemManager.init(this);
    this.stateManager.init();
    this.gameLoop.start();
  }

  /**
   * 엔진 정지
   */
  stop() {
    this.gameLoop.stop();
  }

  /**
   * 업데이트 (Fixed timestep)
   * @param {number} deltaTime
   */
  update(deltaTime) {
    // 상태 업데이트
    this.stateManager.currentState.update(this, deltaTime);

    // 시스템 업데이트
    const entities = this.entityManager.getAllActive();
    this.systemManager.update(entities, deltaTime);

    // 엔티티 정리
    this.entityManager.cleanup();
  }

  /**
   * 렌더링
   * @param {number} alpha - 보간 계수
   */
  render(alpha) {
    this.renderer.clear();

    // 상태 렌더링
    this.stateManager.currentState.render(this, this.renderer, alpha);
  }

  /**
   * 엔진 정리
   */
  cleanup() {
    this.stop();
    this.systemManager.cleanup();
    this.entityManager.clear();
    this.input.cleanup();
  }
}
```

---

## 컴포넌트 구현

### 예시: PositionComponent

```javascript
// src/components/PositionComponent.js

/**
 * PositionComponent - 2D 위치 정보
 */
export class PositionComponent {
  type = 'position';

  /**
   * @param {number} x
   * @param {number} y
   */
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  /**
   * 위치 설정
   * @param {number} x
   * @param {number} y
   */
  set(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * 다른 위치로부터 복사
   * @param {PositionComponent} other
   */
  copy(other) {
    this.x = other.x;
    this.y = other.y;
  }

  /**
   * 거리 계산
   * @param {PositionComponent} other
   * @returns {number}
   */
  distanceTo(other) {
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
```

### 예시: VelocityComponent

```javascript
// src/components/VelocityComponent.js

/**
 * VelocityComponent - 속도 정보
 */
export class VelocityComponent {
  type = 'velocity';

  /**
   * @param {number} vx - X축 속도
   * @param {number} vy - Y축 속도
   */
  constructor(vx = 0, vy = 0) {
    this.vx = vx;
    this.vy = vy;
  }

  /**
   * 속도 설정
   * @param {number} vx
   * @param {number} vy
   */
  set(vx, vy) {
    this.vx = vx;
    this.vy = vy;
  }

  /**
   * 속도 크기 계산
   * @returns {number}
   */
  magnitude() {
    return Math.sqrt(this.vx * this.vx + this.vy * this.vy);
  }

  /**
   * 정규화
   */
  normalize() {
    const mag = this.magnitude();
    if (mag > 0) {
      this.vx /= mag;
      this.vy /= mag;
    }
  }

  /**
   * 스케일 조정
   * @param {number} scale
   */
  scale(scale) {
    this.vx *= scale;
    this.vy *= scale;
  }
}
```

### 예시: BodyComponent (Box2D 통합)

```javascript
// src/components/BodyComponent.js

/**
 * BodyComponent - Box2D Body 참조
 */
export class BodyComponent {
  type = 'body';

  /**
   * @param {planck.Body|null} body - Box2D Body 인스턴스
   */
  constructor(body = null) {
    this.body = body;
  }
}
```

**사용 예시**:
```javascript
import planck from 'planck-js';

// Box2D Body 생성 후 BodyComponent로 래핑
const body = world.createBody({
  type: 'dynamic',
  position: planck.Vec2(x / 100, y / 100)
});

body.createFixture({
  shape: planck.Circle(radius / 100),
  density: 1.0,
  restitution: 1.0
});

entity.addComponent(new BodyComponent(body));
```

나머지 컴포넌트들도 유사한 패턴으로 구현합니다.

---

## 시스템 구현

### 예시: PhysicsSystem (Box2D 통합)

```javascript
// src/systems/PhysicsSystem.js

import { System } from '@core/System.js';
import { PHYSICS } from '@config/constants.js';

const PHYSICS_SCALE = 100;  // 픽셀 → 미터 변환

/**
 * PhysicsSystem - Box2D World 업데이트 및 동기화
 */
export class PhysicsSystem extends System {
  constructor(world) {
    super();
    this.requiredComponents = ['body', 'position'];
    this.priority = 10;
    this.world = world;
  }

  process(entities, deltaTime) {
    // Box2D 시뮬레이션 스텝 (고정 1/60초)
    const timeStep = 1 / 60;
    const velocityIterations = 8;
    const positionIterations = 3;

    this.world.step(timeStep, velocityIterations, positionIterations);

    // Box2D Body → ECS PositionComponent 동기화
    entities.forEach(entity => {
      const bodyComp = entity.getComponent('body');
      const posComp = entity.getComponent('position');

      if (bodyComp?.body && posComp) {
        const bodyPos = bodyComp.body.getPosition();

        // 미터 → 픽셀 변환
        posComp.x = bodyPos.x * PHYSICS_SCALE;
        posComp.y = bodyPos.y * PHYSICS_SCALE;
      }
    });

    // 파티클 업데이트 (Box2D 미사용, 간단 물리)
    this.updateParticles(entities, deltaTime);
  }

  updateParticles(entities, deltaTime) {
    entities
      .filter(e => e.hasComponent('particle'))
      .forEach(entity => {
        const pos = entity.getComponent('position');
        const vel = entity.getComponent('velocity');

        // 간단한 중력/마찰 적용
        vel.vy += PHYSICS.GRAVITY * deltaTime;
        vel.vx *= PHYSICS.FRICTION;
        vel.vy *= PHYSICS.FRICTION;

        pos.x += vel.vx * deltaTime;
        pos.y += vel.vy * deltaTime;
      });
  }
}
```

**Box2D 통합 장점:**
- ✅ 검증된 물리 엔진 (안정성)
- ✅ CCD (빠른 공도 놓치지 않음)
- ✅ 최적화된 충돌 감지 (broad-phase)
- ✅ 개발 시간 단축

---

## 테스트 작성

### 단위 테스트 예시

```javascript
// tests/unit/Entity.test.js

import { describe, it, expect, beforeEach } from 'vitest';
import { Entity } from '@core/Entity.js';
import { PositionComponent } from '@components/PositionComponent.js';

describe('Entity', () => {
  let entity;

  beforeEach(() => {
    entity = new Entity(1);
  });

  it('should create entity with id', () => {
    expect(entity.id).toBe(1);
    expect(entity.active).toBe(true);
  });

  it('should add component', () => {
    const pos = new PositionComponent(10, 20);
    entity.addComponent(pos);

    expect(entity.hasComponent('position')).toBe(true);
    expect(entity.getComponent('position')).toBe(pos);
  });

  it('should support method chaining', () => {
    entity
      .addComponent(new PositionComponent(10, 20))
      .removeComponent('position');

    expect(entity.hasComponent('position')).toBe(false);
  });
});
```

---

## Box2D World 초기화

### WorldManager 구현

```javascript
// src/physics/WorldManager.js

import planck from 'planck-js';
import { CANVAS } from '@config/constants.js';

const PHYSICS_SCALE = 100;

export class WorldManager {
  constructor() {
    // Box2D World 생성
    this.world = planck.World({
      gravity: planck.Vec2(0, 0)  // 중력 없음
    });

    // 충돌 리스너 등록 (CollisionSystem에서 사용)
    this.contactListeners = [];

    // 벽 생성
    this.createBoundaries();
  }

  createBoundaries() {
    // 왼쪽 벽
    this.createWall(0, 0, 10, CANVAS.HEIGHT, 'left');

    // 오른쪽 벽
    this.createWall(CANVAS.WIDTH - 10, 0, 10, CANVAS.HEIGHT, 'right');

    // 위쪽 벽
    this.createWall(0, 0, CANVAS.WIDTH, 10, 'top');

    // 아래쪽은 벽 없음 (공이 떨어지는 영역)
  }

  createWall(x, y, width, height, name) {
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
      restitution: 1.0
    });

    body.setUserData({ type: 'wall', name });

    return body;
  }

  step(deltaTime) {
    this.world.step(1 / 60, 8, 3);
  }

  destroy() {
    let body = this.world.getBodyList();
    while (body) {
      const next = body.getNext();
      this.world.destroyBody(body);
      body = next;
    }
  }
}
```

---

## 빌드 및 배포

### 개발 서버 실행

```bash
npm run dev
```

### 프로덕션 빌드

```bash
npm run build
```

### 테스트 실행

```bash
npm run test
```

### 번들 분석

```bash
npm run build -- --mode analyze
```

**Planck.js 번들 크기:**
- Uncompressed: ~70KB
- Gzip: ~20KB
- 목표 100KB 내 충분히 수용 가능

---

**다음 문서**: [API_REFERENCE.md](./API_REFERENCE.md)
**이전 문서**: [ARCHITECTURE.md](./ARCHITECTURE.md)
