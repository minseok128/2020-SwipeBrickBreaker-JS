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

export class Engine {
  /**
   * @param {HTMLCanvasElement} canvas - Canvas element
   */
  constructor(canvas) {
    // Core managers
    this.entityManager = new EntityManager();
    this.systemManager = new SystemManager();

    // Subsystems
    this.eventBus = new EventBus();
    this.renderer = new CanvasRenderer(canvas);
    this.input = new InputManager(canvas);
    this.physics = new WorldManager();

    // Game loop
    this.gameLoop = new GameLoop(this.update.bind(this), this.render.bind(this));

    // State (will be managed by StateManager in future phases)
    this.running = false;

    // Setup
    this.setupInput();
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
    // State-specific input handling will be added in Phase 5
    // For now, just emit to event bus
    this.eventBus.emit('input:keydown', key);
  }

  /**
   * Handle mousedown event
   * @param {Object} data
   */
  handleMouseDown(data) {
    // State-specific input handling will be added in Phase 5
    this.eventBus.emit('input:mousedown', data);
  }

  /**
   * Start the engine
   */
  start() {
    if (this.running) return;

    this.running = true;

    // Initialize systems
    this.systemManager.init(this);

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
    // Update physics
    this.physics.step(deltaTime);

    // Update systems
    const entities = this.entityManager.getAllActive();
    this.systemManager.update(entities, deltaTime);

    // Cleanup dead entities
    this.entityManager.cleanup();
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

    // Render entities (systems will handle this in Phase 4)
    // For now, just show a test message
    this.renderer.drawText('Swipe Brick Breaker 2.0', 300, 350, {
      font: '40px BM YEONSUNG OTF',
      color: '#fdd700',
    });

    this.renderer.drawText('Engine Initialized', 300, 400, {
      font: '20px BM YEONSUNG OTF',
      color: '#ffffff',
    });

    this.renderer.drawText(`FPS: ${this.gameLoop.getFPS()}`, 300, 450, {
      font: '15px BM YEONSUNG OTF',
      color: '#ffffff',
    });
  }

  /**
   * Cleanup engine resources
   */
  cleanup() {
    this.stop();
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
