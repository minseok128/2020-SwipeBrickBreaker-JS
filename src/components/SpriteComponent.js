/**
 * SpriteComponent - Visual representation data
 */
export class SpriteComponent {
  type = 'sprite';

  /**
   * @param {string} shape - 'circle' | 'rect' | 'image'
   * @param {string} color - Color code (e.g., '#fdd700')
   * @param {number|Object} size - Radius for circle, {width, height} for rect
   * @param {number} layer - Render layer (default: 0)
   */
  constructor(shape, color, size, layer = 0) {
    this.shape = shape;
    this.color = color;
    this.size = size;
    this.layer = layer;
    this.opacity = 1.0;
    this.visible = true;
  }

  /**
   * Set opacity
   * @param {number} opacity - 0.0 to 1.0
   */
  setOpacity(opacity) {
    this.opacity = Math.max(0, Math.min(1, opacity));
  }

  /**
   * Set visibility
   * @param {boolean} visible
   */
  setVisible(visible) {
    this.visible = visible;
  }

  /**
   * Clone sprite component
   * @returns {SpriteComponent}
   */
  clone() {
    const sprite = new SpriteComponent(this.shape, this.color, this.size, this.layer);
    sprite.opacity = this.opacity;
    sprite.visible = this.visible;
    return sprite;
  }
}
