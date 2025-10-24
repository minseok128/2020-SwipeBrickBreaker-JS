/**
 * PositionComponent - 2D position data
 */
export class PositionComponent {
  type = 'position';

  /**
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  /**
   * Set position
   * @param {number} x
   * @param {number} y
   */
  set(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * Copy from another PositionComponent
   * @param {PositionComponent} other
   */
  copy(other) {
    this.x = other.x;
    this.y = other.y;
  }

  /**
   * Calculate distance to another position
   * @param {PositionComponent} other
   * @returns {number}
   */
  distanceTo(other) {
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Add offset
   * @param {number} dx
   * @param {number} dy
   */
  add(dx, dy) {
    this.x += dx;
    this.y += dy;
  }
}
