import { COLLISION_LAYERS } from '@config/layers.js';

/**
 * CollisionComponent - Collision metadata
 * Used for entities without Box2D bodies (like bonus items)
 */
export class CollisionComponent {
  type = 'collision';

  /**
   * @param {string} shape - 'circle' | 'aabb'
   * @param {number|Object} size - Radius for circle, {width, height} for aabb
   * @param {number} layer - Collision layer bitmask
   * @param {number} mask - What this can collide with (bitmask)
   */
  constructor(shape, size, layer = COLLISION_LAYERS.NONE, mask = COLLISION_LAYERS.ALL) {
    this.shape = shape;
    this.size = size;
    this.layer = layer;
    this.mask = mask;
    this.enabled = true;
  }

  /**
   * Check if can collide with another layer
   * @param {number} otherLayer
   * @returns {boolean}
   */
  canCollideWith(otherLayer) {
    return this.enabled && (this.mask & otherLayer) !== 0;
  }

  /**
   * Enable/disable collision
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Get AABB bounds
   * @param {number} x - Center X
   * @param {number} y - Center Y
   * @returns {{minX: number, minY: number, maxX: number, maxY: number}}
   */
  getBounds(x, y) {
    if (this.shape === 'circle') {
      const r = this.size;
      return {
        minX: x - r,
        minY: y - r,
        maxX: x + r,
        maxY: y + r,
      };
    } else {
      // aabb
      const hw = this.size.width / 2;
      const hh = this.size.height / 2;
      return {
        minX: x - hw,
        minY: y - hh,
        maxX: x + hw,
        maxY: y + hh,
      };
    }
  }
}
