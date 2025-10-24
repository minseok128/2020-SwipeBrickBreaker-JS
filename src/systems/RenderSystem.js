/**
 * RenderSystem - Layer-based entity rendering
 * Priority: 100 (runs last)
 */

import { System } from '@core/System.js';
import { BALL, BLOCK, COLORS, FONTS } from '@config/constants.js';

export class RenderSystem extends System {
  /**
   * @param {CanvasRenderer} renderer
   */
  constructor(renderer) {
    super();
    this.requiredComponents = ['position', 'sprite'];
    this.priority = 100;
    this.renderer = renderer;
    this.layers = new Map();
  }

  /**
   * Process rendering
   * @param {Entity[]} entities
   * @param {number} deltaTime
   */
  process(entities, deltaTime) {
    // Clear layers
    this.layers.clear();

    // Group entities by layer
    for (const entity of entities) {
      const sprite = entity.getComponent('sprite');
      if (!sprite || !sprite.visible) continue;

      const layer = sprite.layer || 0;
      if (!this.layers.has(layer)) {
        this.layers.set(layer, []);
      }
      this.layers.get(layer).push(entity);
    }

    // Render by layer order (ascending)
    const sortedLayers = Array.from(this.layers.keys()).sort((a, b) => a - b);

    for (const layer of sortedLayers) {
      const entities = this.layers.get(layer);
      for (const entity of entities) {
        this.renderEntity(entity);
      }
    }
  }

  /**
   * Render individual entity
   * @param {Entity} entity
   */
  renderEntity(entity) {
    const pos = entity.getComponent('position');
    const sprite = entity.getComponent('sprite');

    if (!pos || !sprite || !sprite.visible) return;

    // Set global alpha for opacity
    const ctx = this.renderer.ctx;
    const prevAlpha = ctx.globalAlpha;
    ctx.globalAlpha = sprite.opacity;

    // Render based on shape
    if (sprite.shape === 'circle') {
      this.renderCircle(pos, sprite, entity);
    } else if (sprite.shape === 'rect') {
      this.renderRect(pos, sprite, entity);
    }

    // Restore alpha
    ctx.globalAlpha = prevAlpha;
  }

  /**
   * Render circle
   * @param {PositionComponent} pos
   * @param {SpriteComponent} sprite
   * @param {Entity} entity
   */
  renderCircle(pos, sprite, entity) {
    // Check if this is a ball and adjust radius based on state (legacy behavior)
    let radius = sprite.size;
    const ballComp = entity.getComponent('ball');
    const bonusComp = entity.getComponent('bonus');

    if (ballComp) {
      // Legacy: ball renders with smaller radius (10) when inactive/waiting/landed
      // and full radius (11) when active
      if (ballComp.isActive()) {
        radius = BALL.VISUAL_RADIUS_ACTIVE;
      } else {
        radius = BALL.VISUAL_RADIUS_WAITING;
      }
    }

    // Draw main circle
    this.renderer.drawCircle(pos.x, pos.y, radius, sprite.color);

    // Draw bonus aura (yellow outline) - Legacy behavior
    if (bonusComp) {
      const ctx = this.renderer.ctx;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius + 5, 0, 2 * Math.PI);
      ctx.strokeStyle = COLORS.BONUS_GLOW;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.closePath();
    }
  }

  /**
   * Render rectangle
   * @param {PositionComponent} pos
   * @param {SpriteComponent} sprite
   * @param {Entity} entity
   */
  renderRect(pos, sprite, entity) {
    const { width, height } = sprite.size;

    // Draw rounded rectangle for blocks
    const block = entity.getComponent('block');
    const health = entity.getComponent('health');

    if (block) {
      // pos.x and pos.y are center coordinates, convert to top-left
      const x = pos.x - width / 2;
      const y = pos.y - height / 2;

      this.drawRoundedBlock(
        x + BLOCK.PADDING,
        y + BLOCK.PADDING,
        width - BLOCK.PADDING * 2,
        height - BLOCK.PADDING * 2,
        BLOCK.BORDER_RADIUS,
        sprite.color
      );

      // Draw health text (use center position)
      if (health) {
        this.renderer.drawText(
          health.current.toString(),
          pos.x,
          pos.y + 5,
          {
            font: `${FONTS.SIZE_SMALL} ${FONTS.FAMILY}`,
            color: COLORS.TEXT_SECONDARY,
            align: 'center',
          }
        );
      }

      // Draw aura for bonus blocks (use center position)
      const bonusComp = entity.getComponent('bonus');
      if (bonusComp) {
        this.drawBonusAura(pos.x, pos.y);
      }
    } else {
      // Regular rectangle (assume top-left position)
      this.renderer.drawRect(pos.x, pos.y, width, height, sprite.color);
    }
  }

  /**
   * Draw rounded block
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {number} radius
   * @param {string} color
   */
  drawRoundedBlock(x, y, width, height, radius, color) {
    const ctx = this.renderer.ctx;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  }

  /**
   * Draw bonus block aura effect
   * @param {number} cx - Center X
   * @param {number} cy - Center Y
   */
  drawBonusAura(cx, cy) {
    const ctx = this.renderer.ctx;
    const time = Date.now() / 1000;
    const pulseScale = 1 + Math.sin(time * 3) * 0.1;

    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = COLORS.BONUS_GLOW;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(cx, cy, 30 * pulseScale, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Cleanup
   */
  cleanup() {
    this.layers.clear();
  }
}
