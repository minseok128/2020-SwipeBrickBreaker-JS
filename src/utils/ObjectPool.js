/**
 * ObjectPool - Object pooling for performance optimization
 * Reuses objects instead of creating/destroying them
 */

export class ObjectPool {
  /**
   * @param {Function} factory - Factory function to create new objects
   * @param {number} initialSize - Initial pool size
   */
  constructor(factory, initialSize = 100) {
    this.factory = factory;
    this.available = [];
    this.inUse = new Set();

    // Pre-allocate objects
    for (let i = 0; i < initialSize; i++) {
      this.available.push(this.factory());
    }
  }

  /**
   * Acquire an object from the pool
   * @returns {*}
   */
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

  /**
   * Release an object back to the pool
   * @param {*} obj
   */
  release(obj) {
    if (this.inUse.has(obj)) {
      this.inUse.delete(obj);

      // Reset object if it has a reset method
      if (typeof obj.reset === 'function') {
        obj.reset();
      }

      this.available.push(obj);
    }
  }

  /**
   * Clear the pool
   */
  clear() {
    this.available = [];
    this.inUse.clear();
  }

  /**
   * Get pool statistics
   * @returns {{available: number, inUse: number, total: number}}
   */
  getStats() {
    return {
      available: this.available.length,
      inUse: this.inUse.size,
      total: this.available.length + this.inUse.size,
    };
  }
}
