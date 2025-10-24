/**
 * PerformanceMonitor - Track game performance metrics
 */

export class PerformanceMonitor {
  constructor() {
    this.fps = 0;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fpsUpdateTime = 0;

    this.frameTimes = [];
    this.maxSamples = 60;

    this.entityCount = 0;
    this.systemTimes = new Map();
  }

  /**
   * Update FPS calculation
   */
  update() {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Store frame time
    this.frameTimes.push(deltaTime);
    if (this.frameTimes.length > this.maxSamples) {
      this.frameTimes.shift();
    }

    // Calculate FPS every second
    this.frameCount++;
    if (currentTime >= this.fpsUpdateTime + 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsUpdateTime = currentTime;
    }
  }

  /**
   * Get current FPS
   * @returns {number}
   */
  getFPS() {
    return this.fps;
  }

  /**
   * Get average frame time
   * @returns {number} in milliseconds
   */
  getAverageFrameTime() {
    if (this.frameTimes.length === 0) return 0;
    const sum = this.frameTimes.reduce((a, b) => a + b, 0);
    return sum / this.frameTimes.length;
  }

  /**
   * Get minimum frame time (best performance)
   * @returns {number} in milliseconds
   */
  getMinFrameTime() {
    if (this.frameTimes.length === 0) return 0;
    return Math.min(...this.frameTimes);
  }

  /**
   * Get maximum frame time (worst performance)
   * @returns {number} in milliseconds
   */
  getMaxFrameTime() {
    if (this.frameTimes.length === 0) return 0;
    return Math.max(...this.frameTimes);
  }

  /**
   * Get memory usage (if available)
   * @returns {Object|null}
   */
  getMemoryUsage() {
    if (performance.memory) {
      return {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        usedMB: (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2),
        totalMB: (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2),
        limitMB: (performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2),
      };
    }
    return null;
  }

  /**
   * Set entity count
   * @param {number} count
   */
  setEntityCount(count) {
    this.entityCount = count;
  }

  /**
   * Record system execution time
   * @param {string} systemName
   * @param {number} time in milliseconds
   */
  recordSystemTime(systemName, time) {
    if (!this.systemTimes.has(systemName)) {
      this.systemTimes.set(systemName, []);
    }
    const times = this.systemTimes.get(systemName);
    times.push(time);
    if (times.length > 60) {
      times.shift();
    }
  }

  /**
   * Get average system execution time
   * @param {string} systemName
   * @returns {number} in milliseconds
   */
  getAverageSystemTime(systemName) {
    const times = this.systemTimes.get(systemName);
    if (!times || times.length === 0) return 0;
    const sum = times.reduce((a, b) => a + b, 0);
    return sum / times.length;
  }

  /**
   * Get all performance metrics
   * @returns {Object}
   */
  getMetrics() {
    const metrics = {
      fps: this.fps,
      avgFrameTime: this.getAverageFrameTime().toFixed(2),
      minFrameTime: this.getMinFrameTime().toFixed(2),
      maxFrameTime: this.getMaxFrameTime().toFixed(2),
      entityCount: this.entityCount,
      systemTimes: {},
    };

    // Add system times
    for (const [name, times] of this.systemTimes.entries()) {
      if (times.length > 0) {
        const sum = times.reduce((a, b) => a + b, 0);
        metrics.systemTimes[name] = (sum / times.length).toFixed(3);
      }
    }

    // Add memory if available
    const memory = this.getMemoryUsage();
    if (memory) {
      metrics.memory = memory;
    }

    return metrics;
  }

  /**
   * Print metrics to console
   */
  printMetrics() {
    console.log('=== Performance Metrics ===');
    console.log(`FPS: ${this.fps}`);
    console.log(`Avg Frame Time: ${this.getAverageFrameTime().toFixed(2)}ms`);
    console.log(`Min Frame Time: ${this.getMinFrameTime().toFixed(2)}ms`);
    console.log(`Max Frame Time: ${this.getMaxFrameTime().toFixed(2)}ms`);
    console.log(`Entity Count: ${this.entityCount}`);

    console.log('\nSystem Times:');
    for (const [name, times] of this.systemTimes.entries()) {
      if (times.length > 0) {
        const sum = times.reduce((a, b) => a + b, 0);
        console.log(`  ${name}: ${(sum / times.length).toFixed(3)}ms`);
      }
    }

    const memory = this.getMemoryUsage();
    if (memory) {
      console.log('\nMemory Usage:');
      console.log(`  Used: ${memory.usedMB} MB`);
      console.log(`  Total: ${memory.totalMB} MB`);
      console.log(`  Limit: ${memory.limitMB} MB`);
    }

    console.log('========================\n');
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.fps = 0;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fpsUpdateTime = 0;
    this.frameTimes = [];
    this.entityCount = 0;
    this.systemTimes.clear();
  }
}
