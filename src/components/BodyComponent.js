/**
 * BodyComponent - Box2D Body reference
 * Links ECS Entity to Box2D physics body
 */
export class BodyComponent {
  type = 'body';

  /**
   * @param {planck.Body|null} body - Box2D Body instance
   */
  constructor(body = null) {
    this.body = body;
  }

  /**
   * Check if body is valid
   * @returns {boolean}
   */
  isValid() {
    return this.body !== null && this.body !== undefined;
  }

  /**
   * Get body position in pixels
   * @param {number} scale - Physics scale (pixels per meter)
   * @returns {{x: number, y: number}|null}
   */
  getPosition(scale = 100) {
    if (!this.isValid()) return null;

    const pos = this.body.getPosition();
    return {
      x: pos.x * scale,
      y: pos.y * scale,
    };
  }

  /**
   * Get body velocity
   * @returns {{x: number, y: number}|null}
   */
  getVelocity() {
    if (!this.isValid()) return null;

    const vel = this.body.getLinearVelocity();
    return {
      x: vel.x,
      y: vel.y,
    };
  }

  /**
   * Set body velocity
   * @param {number} vx
   * @param {number} vy
   */
  setVelocity(vx, vy) {
    if (!this.isValid()) return;

    this.body.setLinearVelocity({ x: vx, y: vy });
  }
}
