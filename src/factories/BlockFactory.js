/**
 * BlockFactory - Create block entities with Box2D static bodies
 */

import planck from 'planck-js';
import { PositionComponent } from '@components/PositionComponent.js';
import { SpriteComponent } from '@components/SpriteComponent.js';
import { BodyComponent } from '@components/BodyComponent.js';
import { HealthComponent } from '@components/HealthComponent.js';
import { BlockComponent } from '@components/BlockComponent.js';
import { BonusComponent } from '@components/BonusComponent.js';
import { TagComponent } from '@components/TagComponent.js';
import { BLOCK, BONUS, GRID, PHYSICS, BLOCK_TYPE } from '@config/constants.js';
import { COLLISION_LAYERS } from '@config/layers.js';

const { Vec2, Box } = planck;
const PHYSICS_SCALE = PHYSICS.SCALE;

export class BlockFactory {
  /**
   * Create a normal block
   * @param {EntityManager} entityManager
   * @param {planck.World} world
   * @param {number} gridX - Grid column index
   * @param {number} gridY - Grid row index
   * @param {number} health - Block health
   * @returns {Entity}
   */
  static createNormal(entityManager, world, gridX, gridY, health) {
    const x = gridX * GRID.CELL_WIDTH;
    const y = gridY * GRID.CELL_HEIGHT;
    const centerX = x + BLOCK.WIDTH / 2;
    const centerY = y + BLOCK.HEIGHT / 2;

    const entity = entityManager.createEntity();

    // Create Box2D static body
    const body = world.createBody({
      type: 'static',
      position: Vec2(centerX / PHYSICS_SCALE, centerY / PHYSICS_SCALE),
    });

    body.createFixture({
      shape: Box(BLOCK.WIDTH / 2 / PHYSICS_SCALE, BLOCK.HEIGHT / 2 / PHYSICS_SCALE),
      friction: 0.0,
      restitution: 1.0,
      filterCategoryBits: COLLISION_LAYERS.BLOCK,
      filterMaskBits: COLLISION_LAYERS.BALL,
    });

    body.setUserData({ entityId: entity.id, type: 'block' });

    // Add components (use center position for consistency with physics)
    const healthComp = new HealthComponent(health);
    const opacity = healthComp.getOpacity(BLOCK.OPACITY_MIN, BLOCK.OPACITY_MAX);

    entity
      .addComponent(new PositionComponent(centerX, centerY))
      .addComponent(
        new SpriteComponent('rect', BLOCK.COLOR, { width: BLOCK.WIDTH, height: BLOCK.HEIGHT }, 1)
      )
      .addComponent(new BodyComponent(body))
      .addComponent(healthComp)
      .addComponent(new BlockComponent(BLOCK_TYPE.NORMAL, gridX, gridY))
      .addComponent(new TagComponent('block'));

    // Set sprite opacity based on health
    const sprite = entity.getComponent('sprite');
    sprite.setOpacity(opacity);

    return entity;
  }

  /**
   * Create a bonus block (ball bonus) - Legacy: static bonus that moves with blocks
   * Legacy: Bonus doesn't get destroyed by balls, collected only at bottom row
   * @param {EntityManager} entityManager
   * @param {planck.World} _world - Not used (bonus has no physics body)
   * @param {number} gridX
   * @param {number} gridY
   * @returns {Entity}
   */
  static createBonusBall(entityManager, _world, gridX, gridY) {
    const x = gridX * GRID.CELL_WIDTH;
    const y = gridY * GRID.CELL_HEIGHT;
    const centerX = x + BLOCK.WIDTH / 2;
    const centerY = y + BLOCK.HEIGHT / 2;

    const entity = entityManager.createEntity();

    // Legacy: Bonus has NO collision with balls (balls pass through)
    // No Box2D body needed

    entity
      .addComponent(new PositionComponent(centerX, centerY))
      .addComponent(
        new SpriteComponent(
          'circle',
          BONUS.COLOR,
          BONUS.RADIUS,
          1
        )
      )
      .addComponent(new BlockComponent(BLOCK_TYPE.BONUS_BALL, gridX, gridY))
      .addComponent(new BonusComponent('extra_ball', 1))
      .addComponent(new TagComponent('bonus'));

    return entity;
  }

  /**
   * Create bonus blocks with special patterns
   * @param {EntityManager} entityManager
   * @param {planck.World} world
   * @param {number} gridX
   * @param {number} gridY
   * @param {number} health
   * @param {string} bonusType - 'bonus_cross' | 'bonus_horizontal' | 'bonus_vertical'
   * @returns {Entity}
   */
  static createBonusPattern(entityManager, world, gridX, gridY, health, bonusType) {
    const x = gridX * GRID.CELL_WIDTH;
    const y = gridY * GRID.CELL_HEIGHT;
    const centerX = x + BLOCK.WIDTH / 2;
    const centerY = y + BLOCK.HEIGHT / 2;

    const entity = entityManager.createEntity();

    // Create Box2D body
    const body = world.createBody({
      type: 'static',
      position: Vec2(centerX / PHYSICS_SCALE, centerY / PHYSICS_SCALE),
    });

    body.createFixture({
      shape: Box(BLOCK.WIDTH / 2 / PHYSICS_SCALE, BLOCK.HEIGHT / 2 / PHYSICS_SCALE),
      friction: 0.0,
      restitution: 1.0,
      filterCategoryBits: COLLISION_LAYERS.BLOCK,
      filterMaskBits: COLLISION_LAYERS.BALL,
    });

    body.setUserData({ entityId: entity.id, type: 'block' });

    const bonusHealth = Math.ceil(health * BONUS.HEALTH_MULTIPLIER);
    const healthComp = new HealthComponent(bonusHealth);
    const opacity = healthComp.getOpacity(BLOCK.OPACITY_MIN, BLOCK.OPACITY_MAX);

    entity
      .addComponent(new PositionComponent(centerX, centerY))
      .addComponent(
        new SpriteComponent(
          'rect',
          BONUS.COLOR,
          { width: BLOCK.WIDTH, height: BLOCK.HEIGHT },
          1
        )
      )
      .addComponent(new BodyComponent(body))
      .addComponent(healthComp)
      .addComponent(new BlockComponent(bonusType, gridX, gridY))
      .addComponent(new TagComponent('block'));

    const sprite = entity.getComponent('sprite');
    sprite.setOpacity(opacity);

    return entity;
  }

  /**
   * Update block opacity based on health
   * @param {Entity} blockEntity
   */
  static updateOpacity(blockEntity) {
    const health = blockEntity.getComponent('health');
    const sprite = blockEntity.getComponent('sprite');

    if (health && sprite) {
      const opacity = health.getOpacity(BLOCK.OPACITY_MIN, BLOCK.OPACITY_MAX);
      sprite.setOpacity(opacity);
    }
  }

  /**
   * Shift block position down by one row
   * @param {Entity} blockEntity
   */
  static shiftDown(blockEntity) {
    const block = blockEntity.getComponent('block');
    const pos = blockEntity.getComponent('position');
    const bodyComp = blockEntity.getComponent('body');

    if (block && pos) {
      block.shiftDown();
      const newY = block.gridY * GRID.CELL_HEIGHT;
      const newCenterY = newY + BLOCK.HEIGHT / 2;
      pos.y = newCenterY;

      // Update Box2D body position
      if (bodyComp?.body) {
        const currentPos = bodyComp.body.getPosition();
        bodyComp.body.setPosition(
          Vec2(currentPos.x, newCenterY / PHYSICS_SCALE)
        );
      }
    }
  }
}
