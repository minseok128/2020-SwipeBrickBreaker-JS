/**
 * CanvasRenderer - Canvas abstraction layer
 * Provides drawing primitives for the game
 */

import { CANVAS } from '@config/constants.js';

export class CanvasRenderer {
  /**
   * @param {HTMLCanvasElement} canvas - Canvas element
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.images = new Map();

    // Set canvas size
    this.canvas.width = CANVAS.WIDTH;
    this.canvas.height = CANVAS.HEIGHT;
  }

  /**
   * Clear the canvas
   */
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draw a circle
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} radius - Circle radius
   * @param {string} color - Fill color
   */
  drawCircle(x, y, radius, color) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /**
   * Draw a rectangle
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Rectangle width
   * @param {number} height - Rectangle height
   * @param {string} color - Fill color
   */
  drawRect(x, y, width, height, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, width, height);
  }

  /**
   * Draw a rounded rectangle
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Rectangle width
   * @param {number} height - Rectangle height
   * @param {number} radius - Corner radius
   * @param {string} color - Fill color
   */
  drawRoundedRect(x, y, width, height, radius, color) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
    this.ctx.fill();
  }

  /**
   * Draw text
   * @param {string} text - Text to draw
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {Object} options - Text options
   */
  drawText(text, x, y, options = {}) {
    const {
      font = '25px sans-serif',
      color = '#ffffff',
      align = 'center',
      baseline = 'middle',
    } = options;

    this.ctx.font = font;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = baseline;
    this.ctx.fillText(text, x, y);
  }

  /**
   * Load an image
   * @param {string} key - Image key
   * @param {string} src - Image source path
   * @returns {Promise<void>}
   */
  async loadImage(key, src) {
    const img = new Image();
    img.src = src;
    await img.decode();
    this.images.set(key, img);
  }

  /**
   * Draw an image
   * @param {string} keyOrPath - Image key or path
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {Object} options - Draw options
   */
  drawImage(keyOrPath, x, y, options = {}) {
    const img = this.images.get(keyOrPath);
    if (!img) {
      return;
    }

    const { width, height } = options;
    if (width !== undefined && height !== undefined) {
      this.ctx.drawImage(img, x, y, width, height);
    } else {
      this.ctx.drawImage(img, x, y);
    }
  }

  /**
   * Set global alpha
   * @param {number} alpha - Alpha value (0-1)
   */
  setAlpha(alpha) {
    this.ctx.globalAlpha = alpha;
  }

  /**
   * Reset global alpha
   */
  resetAlpha() {
    this.ctx.globalAlpha = 1.0;
  }

  /**
   * Get canvas context
   * @returns {CanvasRenderingContext2D}
   */
  getContext() {
    return this.ctx;
  }

  /**
   * Get canvas element
   * @returns {HTMLCanvasElement}
   */
  getCanvas() {
    return this.canvas;
  }
}
