/**
 * CollisionSystem - Box2D collision listener integration
 * Priority: 20 (after physics)
 */

import { System } from '@core/System.js';
import { BlockFactory } from '@factories/BlockFactory.js';
import { BonusFactory as BonusItemFactory } from '@factories/BonusFactory.js';
import { ParticleFactory } from '@factories/ParticleFactory.js';
import { BLOCK_TYPE, GRID, CANVAS } from '@config/constants.js';

export class CollisionSystem extends System {
  /**
   * @param {planck.World} world - Box2D World
   * @param {EventBus} eventBus - Event bus for notifications
   */
  constructor(world, eventBus) {
    super();
    this.requiredComponents = []; // No filtering needed
    this.priority = 20;
    this.world = world;
    this.eventBus = eventBus;
    this.entityManager = null;

    // Register Box2D collision listeners
    this.setupCollisionListeners();
  }

  /**
   * Initialize system
   * @param {Object} context
   */
  init(context) {
    super.init(context);
    this.entityManager = context.entityManager;
  }

  /**
   * Setup Box2D collision listeners
   */
  setupCollisionListeners() {
    this.world.on('begin-contact', this.handleBeginContact.bind(this));
    this.world.on('end-contact', this.handleEndContact.bind(this));
  }

  /**
   * Process (collision handled by listeners)
   * @param {Entity[]} entities
   * @param {number} deltaTime
   */
  process(entities, deltaTime) {
    // Check bonus item collisions (not handled by Box2D)
    this.checkBonusCollisions(entities);
  }

  /**
   * Handle collision start
   * @param {planck.Contact} contact
   */
  handleBeginContact(contact) {
    if (!this.entityManager) return;

    const fixtureA = contact.getFixtureA();
    const fixtureB = contact.getFixtureB();
    const bodyA = fixtureA.getBody();
    const bodyB = fixtureB.getBody();

    const dataA = bodyA.getUserData();
    const dataB = bodyB.getUserData();

    if (!dataA || !dataB) return;

    const entityA = this.entityManager.getEntityById(dataA.entityId);
    const entityB = this.entityManager.getEntityById(dataB.entityId);

    if (!entityA || !entityB) return;

    // Determine collision type
    this.resolveCollision(entityA, entityB, contact);
  }

  /**
   * Handle collision end
   * @param {planck.Contact} contact
   */
  handleEndContact(contact) {
    // Not needed for this game
  }

  /**
   * Resolve collision based on entity types
   * @param {Entity} entityA
   * @param {Entity} entityB
   * @param {planck.Contact} contact
   */
  resolveCollision(entityA, entityB, contact) {
    const tagA = entityA.getComponent('tag')?.value;
    const tagB = entityB.getComponent('tag')?.value;

    // Ball-Block collision
    if ((tagA === 'ball' && tagB === 'block') || (tagA === 'block' && tagB === 'ball')) {
      const ball = tagA === 'ball' ? entityA : entityB;
      const block = tagA === 'block' ? entityA : entityB;
      this.handleBallBlockCollision(ball, block, contact);
    }
    // Ball-Wall collision (handled by Box2D automatically)
  }

  /**
   * Handle ball-block collision
   * @param {Entity} ball
   * @param {Entity} block
   * @param {planck.Contact} contact
   */
  handleBallBlockCollision(ball, block, contact) {
    const health = block.getComponent('health');
    if (!health) return;

    // Damage block
    const destroyed = health.takeDamage(1);

    if (destroyed) {
      this.destroyBlock(block);
    } else {
      // Update block opacity
      BlockFactory.updateOpacity(block);
    }
  }

  /**
   * Destroy block and handle special effects
   * @param {Entity} block
   */
  destroyBlock(block) {
    const pos = block.getComponent('position');
    const blockComp = block.getComponent('block');
    const sprite = block.getComponent('sprite');
    const bonusComp = block.getComponent('bonus');

    if (!pos) return;

    // Create explosion particles
    if (sprite) {
      ParticleFactory.createExplosion(
        this.entityManager,
        pos.x + 50,
        pos.y + 25,
        sprite.color,
        20
      );
    }

    // Drop bonus item if this is a bonus ball block
    if (bonusComp?.isExtraBall()) {
      BonusItemFactory.createExtraBall(
        this.entityManager,
        pos.x + 50,
        pos.y + 25,
        bonusComp.getValue()
      );
    }

    // Handle special destruction patterns
    if (blockComp) {
      this.handleSpecialDestruction(blockComp);
    }

    // Emit event
    this.eventBus.emit('block:destroyed', {
      block,
      position: pos,
      score: health.max,
    });

    // Destroy Box2D body
    const bodyComp = block.getComponent('body');
    if (bodyComp?.body) {
      this.world.destroyBody(bodyComp.body);
      bodyComp.body = null;
    }

    // Mark entity for removal
    block.destroy();
  }

  /**
   * Handle special block destruction patterns
   * @param {BlockComponent} blockComp
   */
  handleSpecialDestruction(blockComp) {
    if (!this.entityManager) return;

    const { gridX, gridY } = blockComp.getGridPosition();
    const blocks = this.entityManager.getEntitiesWithTag('block');

    let toDestroy = [];

    // Cross pattern (2)
    if (blockComp.isCross()) {
      toDestroy = blocks.filter(b => {
        const bc = b.getComponent('block');
        if (!bc) return false;
        const pos = bc.getGridPosition();
        return (pos.x === gridX || pos.y === gridY) && b !== blockComp;
      });
    }

    // Horizontal pattern (3)
    if (blockComp.isHorizontal()) {
      toDestroy = blocks.filter(b => {
        const bc = b.getComponent('block');
        if (!bc) return false;
        const pos = bc.getGridPosition();
        return pos.y === gridY && b !== blockComp;
      });
    }

    // Vertical pattern (4)
    if (blockComp.isVertical()) {
      toDestroy = blocks.filter(b => {
        const bc = b.getComponent('block');
        if (!bc) return false;
        const pos = bc.getGridPosition();
        return pos.x === gridX && b !== blockComp;
      });
    }

    // Destroy all blocks in pattern
    for (const block of toDestroy) {
      const health = block.getComponent('health');
      if (health) {
        health.current = 0; // Force destroy
        this.destroyBlock(block);
      }
    }
  }

  /**
   * Check bonus item collisions (not handled by Box2D)
   * @param {Entity[]} entities
   */
  checkBonusCollisions(entities) {
    const bonuses = entities.filter(e => e.hasComponent('bonus') && e.hasComponent('collision'));
    const balls = entities.filter(e => e.hasComponent('ball'));

    for (const bonus of bonuses) {
      const bonusComp = bonus.getComponent('bonus');
      if (bonusComp?.isCollected()) continue;

      // Check collision with balls
      const collidedBall = BonusItemFactory.checkCollision(bonus, balls);
      if (collidedBall) {
        this.handleBonusCollection(bonus);
      }

      // Check if out of bounds
      if (BonusItemFactory.isOutOfBounds(bonus, CANVAS.HEIGHT)) {
        bonus.destroy();
      }
    }
  }

  /**
   * Handle bonus collection
   * @param {Entity} bonus
   */
  handleBonusCollection(bonus) {
    const bonusComp = bonus.getComponent('bonus');
    if (!bonusComp) return;

    // Mark as collected
    BonusItemFactory.collect(bonus);

    // Emit event
    this.eventBus.emit('bonus:collected', {
      bonusType: bonusComp.bonusType,
      value: bonusComp.getValue(),
    });

    // Mark for removal
    bonus.destroy();
  }

  /**
   * Cleanup
   */
  cleanup() {
    // Listeners are attached to world, will be cleaned up with world
  }
}
