/**
 * GameLoop - Fixed timestep game loop
 * Based on requestAnimationFrame for stable 60 FPS
 */

import { ANIMATION } from '@config/constants.js';

export class GameLoop {
  /**
   * @param {Function} updateFn - Update callback
   * @param {Function} renderFn - Render callback
   * @param {number} targetFPS - Target FPS (default: 60)
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

    // Bind loop to maintain context
    this.boundLoop = this.loop.bind(this);
  }

  /**
   * Start the game loop
   */
  start() {
    if (this.running) return;

    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.boundLoop);
  }

  /**
   * Stop the game loop
   */
  stop() {
    this.running = false;
  }

  /**
   * Main loop (fixed timestep)
   * @param {number} currentTime
   */
  loop(currentTime) {
    if (!this.running) return;

    // Calculate delta time
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Accumulate time
    this.accumulator += deltaTime;

    // Fixed timestep updates
    while (this.accumulator >= this.frameTime) {
      this.update(this.frameTime);
      this.accumulator -= this.frameTime;
    }

    // Render with interpolation factor
    const alpha = this.accumulator / this.frameTime;
    this.render(alpha);

    // Update FPS counter
    this.updateFPS(currentTime);

    // Request next frame
    requestAnimationFrame(this.boundLoop);
  }

  /**
   * Update FPS counter
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
   * Get current FPS
   * @returns {number}
   */
  getFPS() {
    return this.currentFPS;
  }
}
