/**
 * LifecycleComponent - Entity lifecycle management
 */
export class LifecycleComponent {
  type = 'lifecycle';

  /**
   * @param {string} state - Initial state ('inactive' | 'waiting' | 'active' | 'dead')
   */
  constructor(state = 'active') {
    this.state = state;
    this.age = 0;
    this.maxAge = Infinity;
  }

  /**
   * Update age
   * @param {number} deltaTime - Time delta (ms)
   * @returns {boolean} - True if entity should be removed
   */
  update(deltaTime) {
    this.age += deltaTime;
    return this.age >= this.maxAge;
  }

  /**
   * Check if active
   * @returns {boolean}
   */
  isActive() {
    return this.state === 'active';
  }

  /**
   * Check if waiting
   * @returns {boolean}
   */
  isWaiting() {
    return this.state === 'waiting';
  }

  /**
   * Check if dead
   * @returns {boolean}
   */
  isDead() {
    return this.state === 'dead';
  }

  /**
   * Set state
   * @param {string} state
   */
  setState(state) {
    this.state = state;
  }

  /**
   * Mark as dead
   */
  kill() {
    this.state = 'dead';
  }

  /**
   * Set maximum age
   * @param {number} maxAge - Maximum age in ms
   */
  setMaxAge(maxAge) {
    this.maxAge = maxAge;
  }

  /**
   * Reset lifecycle
   */
  reset() {
    this.age = 0;
    this.state = 'active';
    this.maxAge = Infinity;
  }
}
