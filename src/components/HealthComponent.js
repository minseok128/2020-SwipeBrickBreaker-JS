/**
 * HealthComponent - Health/damage system
 */
export class HealthComponent {
  type = 'health';

  /**
   * @param {number} max - Maximum health
   */
  constructor(max) {
    this.max = max;
    this.current = max;
  }

  /**
   * Take damage
   * @param {number} amount - Damage amount
   * @returns {boolean} - True if entity is destroyed (health <= 0)
   */
  takeDamage(amount) {
    this.current = Math.max(0, this.current - amount);
    return this.current <= 0;
  }

  /**
   * Heal
   * @param {number} amount
   */
  heal(amount) {
    this.current = Math.min(this.max, this.current + amount);
  }

  /**
   * Set health to max
   */
  reset() {
    this.current = this.max;
  }

  /**
   * Check if alive
   * @returns {boolean}
   */
  isAlive() {
    return this.current > 0;
  }

  /**
   * Get health percentage
   * @returns {number} - 0.0 to 1.0
   */
  getPercentage() {
    return this.max > 0 ? this.current / this.max : 0;
  }

  /**
   * Get opacity based on health (legacy formula)
   * Legacy: opacity = (current / (max - 1)) * 0.9 + 0.1
   * @param {number} min - Minimum opacity
   * @param {number} max - Maximum opacity
   * @returns {number}
   */
  getOpacity(min = 0.1, max = 0.9) {
    // Legacy formula: (current / (max - 1)) * 0.9 + 0.1
    // Handle edge case where max <= 1
    if (this.max <= 1) {
      return 1.0; // Full opacity for single-hit blocks
    }

    const opacity = (this.current / (this.max - 1)) * 0.9 + 0.1;
    return Math.min(1.0, Math.max(min, opacity));
  }
}
