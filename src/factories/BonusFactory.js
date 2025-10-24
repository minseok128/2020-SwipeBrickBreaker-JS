/**
 * BonusFactory - Create falling bonus item entities (no Box2D body)
 */

import { PositionComponent } from '@components/PositionComponent.js';
import { VelocityComponent } from '@components/VelocityComponent.js';
import { SpriteComponent } from '@components/SpriteComponent.js';
import { CollisionComponent } from '@components/CollisionComponent.js';
import { BonusComponent } from '@components/BonusComponent.js';
import { LifecycleComponent } from '@components/LifecycleComponent.js';
import { TagComponent } from '@components/TagComponent.js';
import { BONUS, PHYSICS } from '@config/constants.js';
import { COLLISION_LAYERS } from '@config/layers.js';

export class BonusFactory {
  /**
   * Create a falling bonus item (extra ball)
   * @param {EntityManager} entityManager
   * @param {number} x - Starting X position
   * @param {number} y - Starting Y position
   * @param {number} value - Number of extra balls (default: 1)
   * @returns {Entity}
   */
  static createExtraBall(entityManager, x, y, value = 1) {
    const entity = entityManager.createEntity();

    // Falling speed (using simple physics, not Box2D)
    const fallSpeed = 2.0; // pixels per frame

    entity
      .addComponent(new PositionComponent(x, y))
      .addComponent(new VelocityComponent(0, fallSpeed))
      .addComponent(new SpriteComponent('circle', BONUS.COLOR, BONUS.RADIUS, 2))
      .addComponent(
        new CollisionComponent('circle', BONUS.RADIUS, COLLISION_LAYERS.BONUS, COLLISION_LAYERS.BALL)
      )
      .addComponent(new BonusComponent('extra_ball', value))
      .addComponent(new LifecycleComponent('active'))
      .addComponent(new TagComponent('bonus'));

    return entity;
  }

  /**
   * Update bonus position (simple gravity)
   * @param {Entity} bonusEntity
   * @param {number} deltaTime
   */
  static update(bonusEntity, deltaTime) {
    const pos = bonusEntity.getComponent('position');
    const vel = bonusEntity.getComponent('velocity');

    if (pos && vel) {
      // Apply gravity (simple physics)
      vel.vy += PHYSICS.GRAVITY * deltaTime;

      // Update position
      pos.x += vel.vx * deltaTime;
      pos.y += vel.vy * deltaTime;
    }
  }

  /**
   * Check if bonus should be removed (out of bounds)
   * @param {Entity} bonusEntity
   * @param {number} canvasHeight
   * @returns {boolean}
   */
  static isOutOfBounds(bonusEntity, canvasHeight) {
    const pos = bonusEntity.getComponent('position');
    return pos && pos.y > canvasHeight;
  }

  /**
   * Check collision with balls
   * @param {Entity} bonusEntity
   * @param {Entity[]} ballEntities
   * @returns {Entity|null} - Collided ball entity, or null
   */
  static checkCollision(bonusEntity, ballEntities) {
    const bonusPos = bonusEntity.getComponent('position');
    const bonusCol = bonusEntity.getComponent('collision');
    const bonusComp = bonusEntity.getComponent('bonus');

    if (!bonusPos || !bonusCol || !bonusComp || bonusComp.isCollected()) {
      return null;
    }

    const bonusBounds = bonusCol.getBounds(bonusPos.x, bonusPos.y);

    for (const ball of ballEntities) {
      const ballPos = ball.getComponent('position');
      const ballTag = ball.getComponent('tag');
      const ballComp = ball.getComponent('ball');

      // Only collide with active balls
      if (!ballTag?.is('ball') || !ballComp?.isActive()) continue;
      if (!ballPos) continue;

      // Simple circle-circle collision
      const dx = ballPos.x - bonusPos.x;
      const dy = ballPos.y - bonusPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const combinedRadius = BONUS.RADIUS + 11; // Ball radius = 11

      if (distance < combinedRadius) {
        return ball;
      }
    }

    return null;
  }

  /**
   * Collect bonus
   * @param {Entity} bonusEntity
   */
  static collect(bonusEntity) {
    const bonusComp = bonusEntity.getComponent('bonus');
    if (bonusComp) {
      bonusComp.collect();
    }

    const lifecycle = bonusEntity.getComponent('lifecycle');
    if (lifecycle) {
      lifecycle.kill();
    }
  }
}
