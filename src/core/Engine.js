/**
 * Engine - Main game engine
 * Integrates all subsystems (ECS, Physics, Rendering, Input)
 */

import { EntityManager } from './EntityManager.js';
import { SystemManager } from './SystemManager.js';
import { GameLoop } from './GameLoop.js';
import { EventBus } from '@events/EventBus.js';
import { CanvasRenderer } from '@rendering/CanvasRenderer.js';
import { InputManager } from '@input/InputManager.js';
import { WorldManager } from '@physics/WorldManager.js';
import { StateManager } from '@/state/StateManager.js';
import { MenuState } from '@/state/states/MenuState.js';
import { PerformanceMonitor } from '@utils/PerformanceMonitor.js';

// Import systems
import { PhysicsSystem } from '@systems/PhysicsSystem.js';
import { CollisionSystem } from '@systems/CollisionSystem.js';
import { RenderSystem } from '@systems/RenderSystem.js';
import { BallSystem } from '@systems/BallSystem.js';
import { BlockSystem } from '@systems/BlockSystem.js';
import { ParticleSystem } from '@systems/ParticleSystem.js';
import { LifecycleSystem } from '@systems/LifecycleSystem.js';

export class Engine {
  /**
   * @param {HTMLCanvasElement} canvas - Canvas element
   */
  constructor(canvas) {
    // Core managers
    this.entityManager = new EntityManager();
    this.systemManager = new SystemManager();
    this.stateManager = new StateManager(this);

    // Subsystems
    this.eventBus = new EventBus();
    this.renderer = new CanvasRenderer(canvas);
    this.input = new InputManager(canvas);
    this.physics = new WorldManager();

    // Game loop
    this.gameLoop = new GameLoop(this.update.bind(this), this.render.bind(this));

    // Performance monitoring
    this.performanceMonitor = new PerformanceMonitor();

    // State
    this.running = false;

    // Setup
    this.setupSystems();
    this.setupInput();
  }

  /**
   * Setup all game systems
   */
  setupSystems() {
    // Add systems in priority order
    this.systemManager.addSystem(new PhysicsSystem(this.physics.world));
    this.systemManager.addSystem(new CollisionSystem(this.physics.world, this.eventBus));
    this.systemManager.addSystem(new BallSystem(this.eventBus));
    this.systemManager.addSystem(new BlockSystem(this.physics.world, this.eventBus));
    this.systemManager.addSystem(new ParticleSystem());
    this.systemManager.addSystem(new LifecycleSystem(this.physics.world));
    this.systemManager.addSystem(new RenderSystem(this.renderer));
  }

  /**
   * Setup input handlers
   */
  setupInput() {
    this.input.on('keydown', this.handleKeyDown.bind(this));
    this.input.on('mousedown', this.handleMouseDown.bind(this));
  }

  /**
   * Handle keydown event
   * @param {string} key
   */
  handleKeyDown(key) {
    this.stateManager.handleInput({ type: 'keydown', key });
  }

  /**
   * Handle mousedown event
   * @param {Object} data
   */
  handleMouseDown(data) {
    this.stateManager.handleInput({ type: 'mousedown', ...data });
  }

  /**
   * Start the engine
   */
  start() {
    if (this.running) return;

    this.running = true;

    // Initialize systems
    this.systemManager.init(this);

    // Initialize state manager with menu state
    this.stateManager.init(new MenuState());

    // Start game loop
    this.gameLoop.start();
  }

  /**
   * Stop the engine
   */
  stop() {
    if (!this.running) return;

    this.running = false;
    this.gameLoop.stop();
  }

  /**
   * Update (fixed timestep)
   * @param {number} deltaTime - Frame time (ms)
   */
  update(deltaTime) {
    // Update state
    this.stateManager.update(deltaTime);

    // Update systems (physics system handles Box2D step)
    const entities = this.entityManager.getAllActive();
    this.systemManager.update(entities, deltaTime);

    // Cleanup dead entities
    this.entityManager.cleanup();

    // Update performance metrics
    this.performanceMonitor.update();
    this.performanceMonitor.setEntityCount(entities.length);
  }

  /**
   * Render
   * @param {number} alpha - Interpolation factor
   */
  render(alpha) {
    // Clear canvas
    this.renderer.clear();

    // Render background
    this.renderer.drawRect(0, 0, 600, 700, '#161e38');

    // Render entities via RenderSystem
    const entities = this.entityManager.getAllActive();
    const renderSystem = this.systemManager.systems.find(s => s.constructor.name === 'RenderSystem');
    if (renderSystem) {
      renderSystem.process(entities, 0);
    }

    // Render state UI on top
    this.stateManager.render(this.renderer, alpha);

    // Show performance metrics for debugging
    const metrics = this.performanceMonitor.getMetrics();
    const memory = this.performanceMonitor.getMemoryUsage();

    this.renderer.drawText(`FPS: ${this.performanceMonitor.getFPS()}`, 550, 20, {
      font: '15px BM YEONSUNG OTF',
      color: '#ffffff',
      align: 'right',
    });

    if (memory) {
      this.renderer.drawText(`Mem: ${memory.usedMB}MB`, 550, 40, {
        font: '12px BM YEONSUNG OTF',
        color: '#aaaaaa',
        align: 'right',
      });
    }

    this.renderer.drawText(`Entities: ${metrics.entityCount}`, 550, 60, {
      font: '12px BM YEONSUNG OTF',
      color: '#aaaaaa',
      align: 'right',
    });
  }

  /**
   * Cleanup engine resources
   */
  cleanup() {
    this.stop();
    this.stateManager.cleanup();
    this.systemManager.cleanup();
    this.entityManager.clear();
    this.input.cleanup();
    this.physics.destroy();
  }

  /**
   * Get engine context (for systems)
   * @returns {Object}
   */
  getContext() {
    return {
      entityManager: this.entityManager,
      systemManager: this.systemManager,
      eventBus: this.eventBus,
      renderer: this.renderer,
      input: this.input,
      physics: this.physics,
    };
  }
}
