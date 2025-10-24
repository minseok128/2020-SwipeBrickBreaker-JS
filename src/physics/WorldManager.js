/**
 * WorldManager - Box2D World initialization and management
 * Manages physics simulation using Planck.js (Box2D for JavaScript)
 */

import planck from 'planck-js';
import { CANVAS, PHYSICS } from '@config/constants.js';
import { COLLISION_LAYERS } from '@config/layers.js';

export class WorldManager {
  constructor() {
    // Create Box2D World (no gravity for brick breaker)
    this.world = planck.World({
      gravity: planck.Vec2(0, 0),
    });

    // Physics scale: 100 pixels = 1 meter
    this.scale = PHYSICS.SCALE;

    // Create boundaries
    this.createBoundaries();
  }

  /**
   * Create static walls around the canvas
   */
  createBoundaries() {
    const canvasWidth = CANVAS.WIDTH;
    const canvasHeight = CANVAS.HEIGHT;
    const wallThickness = 10;

    // Left wall
    this.createWall(0, 0, wallThickness, canvasHeight, 'left');

    // Right wall
    this.createWall(canvasWidth - wallThickness, 0, wallThickness, canvasHeight, 'right');

    // Top wall
    this.createWall(0, 0, canvasWidth, wallThickness, 'top');

    // No bottom wall (balls fall through)
  }

  /**
   * Create a static wall body
   * @param {number} x - X position (pixels)
   * @param {number} y - Y position (pixels)
   * @param {number} width - Width (pixels)
   * @param {number} height - Height (pixels)
   * @param {string} name - Wall identifier
   * @returns {planck.Body}
   */
  createWall(x, y, width, height, name) {
    const body = this.world.createBody({
      type: 'static',
      position: planck.Vec2(
        (x + width / 2) / this.scale,
        (y + height / 2) / this.scale
      ),
    });

    body.createFixture({
      shape: planck.Box(width / 2 / this.scale, height / 2 / this.scale),
      friction: 0.0,
      restitution: 1.0, // Perfect elasticity
      filterCategoryBits: COLLISION_LAYERS.WALL,
      filterMaskBits: COLLISION_LAYERS.BALL,
    });

    body.setUserData({ type: 'wall', name });

    return body;
  }

  /**
   * Create a dynamic circle body (for balls)
   * @param {number} x - X position (pixels)
   * @param {number} y - Y position (pixels)
   * @param {number} radius - Radius (pixels)
   * @param {Object} userData - Custom data to attach
   * @returns {planck.Body}
   */
  createCircleBody(x, y, radius, userData = {}) {
    const body = this.world.createBody({
      type: 'dynamic',
      position: planck.Vec2(x / this.scale, y / this.scale),
      bullet: true, // Enable CCD (continuous collision detection)
    });

    body.createFixture({
      shape: planck.Circle(radius / this.scale),
      density: 1.0,
      friction: 0.0,
      restitution: 1.0,
    });

    body.setUserData(userData);

    return body;
  }

  /**
   * Create a static box body (for blocks)
   * @param {number} x - X position (pixels)
   * @param {number} y - Y position (pixels)
   * @param {number} width - Width (pixels)
   * @param {number} height - Height (pixels)
   * @param {Object} userData - Custom data to attach
   * @returns {planck.Body}
   */
  createBoxBody(x, y, width, height, userData = {}) {
    const body = this.world.createBody({
      type: 'static',
      position: planck.Vec2(
        (x + width / 2) / this.scale,
        (y + height / 2) / this.scale
      ),
    });

    body.createFixture({
      shape: planck.Box(width / 2 / this.scale, height / 2 / this.scale),
      friction: 0.0,
      restitution: 1.0,
    });

    body.setUserData(userData);

    return body;
  }

  /**
   * Simulate physics (fixed timestep: 1/60s)
   * @param {number} deltaTime - Time step (ms) - not used, always 1/60s
   */
  step(deltaTime) {
    const timeStep = 1 / 60; // Fixed timestep
    const velocityIterations = 8; // Accuracy
    const positionIterations = 3; // Accuracy

    this.world.step(timeStep, velocityIterations, positionIterations);
  }

  /**
   * Destroy all bodies in the world
   */
  destroy() {
    let body = this.world.getBodyList();
    while (body) {
      const next = body.getNext();
      this.world.destroyBody(body);
      body = next;
    }
  }

  /**
   * Get the Box2D world instance
   * @returns {planck.World}
   */
  getWorld() {
    return this.world;
  }
}
