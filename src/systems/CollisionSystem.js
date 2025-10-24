/**
 * CollisionSystem - Box2D collision listener integration
 * Priority: 20 (after physics)
 */

import { System } from '@core/System.js';
import { BlockFactory } from '@factories/BlockFactory.js';
import { ParticleFactory } from '@factories/ParticleFactory.js';
import { BALL, BLOCK_TYPE } from '@config/constants.js';

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

    // Blocks pending destruction (after current physics step)
    this.blocksToDestroy = new Set();

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
    this.world.on('pre-solve', this.handlePreSolve.bind(this));
    this.world.on('post-solve', this.handlePostSolve.bind(this));
    this.world.on('end-contact', this.handleEndContact.bind(this));
  }

  /**
   * Process (collision handled by listeners)
   * @param {Entity[]} entities
   * @param {number} deltaTime
   */
  process(entities, deltaTime) {
    // All block collision detection handled by Box2D listeners
    // Legacy: Bonus items don't collide but trigger collection on overlap
    this.checkBonusTriggers(entities);

    // Destroy blocks marked for destruction (after physics step completes)
    if (this.blocksToDestroy.size > 0) {
      for (const block of this.blocksToDestroy) {
        this.performBlockDestruction(block);
      }
      this.blocksToDestroy.clear();
    }
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
   * Handle pre-solve (before collision response calculation)
   * This is where we disable contacts with destroyed entities
   * @param {planck.Contact} contact
   * @param {planck.Manifold} oldManifold
   */
  handlePreSolve(contact, oldManifold) {
    if (!this.entityManager) return;

    const fixtureA = contact.getFixtureA();
    const fixtureB = contact.getFixtureB();
    const bodyA = fixtureA.getBody();
    const bodyB = fixtureB.getBody();

    const dataA = bodyA.getUserData();
    const dataB = bodyB.getUserData();

    if (!dataA || !dataB) return;

    // Skip check for walls (they don't have entityId)
    const isWallA = dataA.type === 'wall';
    const isWallB = dataB.type === 'wall';

    // If either is a wall, allow collision (walls are always valid)
    if (isWallA || isWallB) return;

    // Both are entities - check if they exist and are valid
    const entityA = this.entityManager.getEntityById(dataA.entityId);
    const entityB = this.entityManager.getEntityById(dataB.entityId);

    // Disable contact if entity doesn't exist
    if (!entityA || !entityB) {
      contact.setEnabled(false);
      return;
    }

    // Disable contact if entity is already destroyed (from previous frames)
    // BUT allow contacts for blocks marked for destruction THIS frame
    const aMarkedThisFrame = this.blocksToDestroy.has(entityA);
    const bMarkedThisFrame = this.blocksToDestroy.has(entityB);

    if (!entityA.active && !aMarkedThisFrame) {
      contact.setEnabled(false);
      return;
    }

    if (!entityB.active && !bMarkedThisFrame) {
      contact.setEnabled(false);
      return;
    }
  }

  /**
   * Handle post-solve (after collision response)
   * Correct ball velocity to prevent shallow angles
   * @param {planck.Contact} contact
   * @param {planck.ContactImpulse} impulse
   */
  handlePostSolve(contact, impulse) {
    if (!this.entityManager) return;

    const fixtureA = contact.getFixtureA();
    const fixtureB = contact.getFixtureB();
    const bodyA = fixtureA.getBody();
    const bodyB = fixtureB.getBody();

    const dataA = bodyA.getUserData();
    const dataB = bodyB.getUserData();

    if (!dataA || !dataB) return;

    // Find the ball (if any)
    let ballBody = null;
    let ballEntity = null;

    if (dataA.type === 'ball') {
      ballBody = bodyA;
      ballEntity = this.entityManager.getEntityById(dataA.entityId);
    } else if (dataB.type === 'ball') {
      ballBody = bodyB;
      ballEntity = this.entityManager.getEntityById(dataB.entityId);
    }

    if (!ballBody || !ballEntity) return;

    // Only correct velocity for ball-block or ball-wall collisions
    const otherType = dataA.type === 'ball' ? dataB.type : dataA.type;
    if (otherType !== 'wall' && otherType !== 'block') return;

    // Check if ball is active
    const ballComp = ballEntity.getComponent('ball');
    if (!ballComp || !ballComp.isActive()) return;

    // Get current velocity
    const vel = ballBody.getLinearVelocity();
    const vx = vel.x;
    const vy = vel.y;

    // Calculate speed (magnitude)
    const speed = Math.sqrt(vx * vx + vy * vy);

    // If Y velocity is too small (too horizontal), correct it
    // Check for both upward and downward motion
    const MIN_Y_VEL = BALL.MIN_Y_VELOCITY;

    if (Math.abs(vy) < MIN_Y_VEL && speed > 0) {
      // Preserve direction (up or down) but ensure minimum Y magnitude
      const newVy = vy >= 0 ? MIN_Y_VEL : -MIN_Y_VEL;

      // Calculate new vx to maintain speed
      // speed^2 = vx^2 + vy^2
      // vx^2 = speed^2 - vy^2
      const newVxSquared = speed * speed - newVy * newVy;
      const newVx = newVxSquared > 0 ? Math.sqrt(newVxSquared) * Math.sign(vx) : vx;

      // Set corrected velocity
      ballBody.setLinearVelocity({ x: newVx, y: newVy });

      // Update velocity component
      const velComp = ballEntity.getComponent('velocity');
      if (velComp) {
        velComp.set(newVx, newVy);
      }
    }
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
    // Check if block is already destroyed or pending destruction
    if (!block.active || this.blocksToDestroy.has(block)) return;

    const health = block.getComponent('health');
    if (!health || !health.isAlive()) return;

    const bodyComp = block.getComponent('body');
    if (!bodyComp?.body) return; // Body already removed

    // Damage block
    const destroyed = health.takeDamage(1);

    if (destroyed) {
      // Mark for destruction after physics step completes
      this.blocksToDestroy.add(block);
    } else {
      // Update block opacity
      BlockFactory.updateOpacity(block);
    }
  }

  /**
   * Perform block destruction (called after physics step)
   * @param {Entity} block
   */
  performBlockDestruction(block) {
    // Skip if already destroyed
    if (!block.active) return;
    const pos = block.getComponent('position');
    const blockComp = block.getComponent('block');
    const sprite = block.getComponent('sprite');
    const bonusComp = block.getComponent('bonus');
    const health = block.getComponent('health');

    if (!pos) return;

    // Create explosion particles (pos.x, pos.y are already center coordinates)
    if (sprite) {
      ParticleFactory.createExplosion(
        this.entityManager,
        pos.x,
        pos.y,
        sprite.color,
        20
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
      score: health?.max ?? 0,
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

    // Destroy all blocks in pattern (immediate, already after physics step)
    for (const block of toDestroy) {
      const health = block.getComponent('health');
      if (health) {
        health.current = 0; // Force destroy
        this.performBlockDestruction(block);
      }
    }
  }

  /**
   * Check bonus trigger collection (no physics collision, just overlap detection)
   * Legacy: Balls pass through bonuses but trigger collection on overlap
   * @param {Entity[]} entities
   */
  checkBonusTriggers(entities) {
    const bonuses = entities.filter(e => e.hasComponent('bonus') && !e.hasComponent('body'));
    const balls = entities.filter(e => e.hasComponent('ball'));

    for (const bonus of bonuses) {
      const bonusPos = bonus.getComponent('position');
      const bonusComp = bonus.getComponent('bonus');
      const bonusSprite = bonus.getComponent('sprite');

      if (!bonusPos || !bonusComp || bonusComp.isCollected()) continue;

      // Legacy trigger area calculation (app.js:243-249)
      // Bonus is at center position, extend by ball radius * 2
      const ballRadius = BALL.RADIUS;
      const bonusRadius = bonusSprite?.size || 10;

      // Legacy: minX = bonus.x - ballRadius * 2
      //         maxX = bonus.x + bonusRadius + ballRadius
      const minX = bonusPos.x - ballRadius * 2;
      const maxX = bonusPos.x + bonusRadius + ballRadius;
      const minY = bonusPos.y - ballRadius * 2;
      const maxY = bonusPos.y + bonusRadius + ballRadius;

      // Check if any active ball overlaps
      for (const ball of balls) {
        const ballPos = ball.getComponent('position');
        const ballComp = ball.getComponent('ball');

        if (!ballPos || !ballComp) continue;
        if (!ballComp.isActive()) continue; // Only active balls trigger

        // Check overlap
        if (ballPos.x > minX && ballPos.x < maxX &&
            ballPos.y > minY && ballPos.y < maxY) {
          // Trigger collection
          this.collectBonus(bonus);
          break; // Only collect once
        }
      }
    }
  }

  /**
   * Collect bonus (trigger or bottom row)
   * @param {Entity} bonus
   */
  collectBonus(bonus) {
    const bonusComp = bonus.getComponent('bonus');
    if (!bonusComp || bonusComp.isCollected()) return;

    // Mark as collected
    bonusComp.collect();

    // Emit collection event
    this.eventBus.emit('bonus:collected', {
      bonusType: bonusComp.bonusType,
      value: bonusComp.getValue(),
    });

    // Remove bonus entity
    bonus.destroy();
  }

  /**
   * Cleanup
   */
  cleanup() {
    // Listeners are attached to world, will be cleaned up with world
  }
}
