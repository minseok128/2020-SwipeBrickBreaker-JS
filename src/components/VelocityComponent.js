/**
 * VelocityComponent - 2D velocity data
 */
export class VelocityComponent {
  type = 'velocity';

  /**
   * @param {number} vx - X velocity
   * @param {number} vy - Y velocity
   */
  constructor(vx = 0, vy = 0) {
    this.vx = vx;
    this.vy = vy;
  }

  /**
   * Set velocity
   * @param {number} vx
   * @param {number} vy
   */
  set(vx, vy) {
    this.vx = vx;
    this.vy = vy;
  }

  /**
   * Get velocity magnitude
   * @returns {number}
   */
  magnitude() {
    return Math.sqrt(this.vx * this.vx + this.vy * this.vy);
  }

  /**
   * Normalize velocity (make unit vector)
   */
  normalize() {
    const mag = this.magnitude();
    if (mag > 0) {
      this.vx /= mag;
      this.vy /= mag;
    }
  }

  /**
   * Scale velocity
   * @param {number} scale
   */
  scale(scale) {
    this.vx *= scale;
    this.vy *= scale;
  }

  /**
   * Set velocity from angle and speed
   * @param {number} angle - Angle in radians
   * @param {number} speed - Speed magnitude
   */
  setFromAngle(angle, speed) {
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
  }

  /**
   * Get angle in radians
   * @returns {number}
   */
  getAngle() {
    return Math.atan2(this.vy, this.vx);
  }
}
