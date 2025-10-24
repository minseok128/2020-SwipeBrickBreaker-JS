/**
 * BallFactory - Create ball entities with Box2D bodies
 */

import planck from 'planck-js';
import { PositionComponent } from '@components/PositionComponent.js';
import { VelocityComponent } from '@components/VelocityComponent.js';
import { SpriteComponent } from '@components/SpriteComponent.js';
import { BodyComponent } from '@components/BodyComponent.js';
import { LifecycleComponent } from '@components/LifecycleComponent.js';
import { BallComponent } from '@components/BallComponent.js';
import { TagComponent } from '@components/TagComponent.js';
import { BALL, PHYSICS } from '@config/constants.js';
import { COLLISION_LAYERS } from '@config/layers.js';

const { Vec2, Circle } = planck;
const PHYSICS_SCALE = PHYSICS.SCALE;

export class BallFactory {
  /**
   * Create a ball entity with Box2D body
   * @param {EntityManager} entityManager
   * @param {planck.World} world - Box2D World
   * @param {number} x - Position X (pixels)
   * @param {number} y - Position Y (pixels)
   * @param {number} id - Ball ID (for delayed spawning)
   * @returns {Entity}
   */
  static create(entityManager, world, x, y, id = 0) {
    const entity = entityManager.createEntity();

    // Create Box2D body
    const body = world.createBody({
      type: 'dynamic',
      position: Vec2(x / PHYSICS_SCALE, y / PHYSICS_SCALE),
      bullet: true, // Enable CCD (Continuous Collision Detection)
      fixedRotation: true, // No rotation
    });

    // Create fixture (shape)
    body.createFixture({
      shape: Circle(BALL.RADIUS / PHYSICS_SCALE),
      density: 1.0,
      friction: 0.0, // No friction
      restitution: 1.0, // Perfect elastic collision
      filterCategoryBits: COLLISION_LAYERS.BALL,
      filterMaskBits:
        COLLISION_LAYERS.BLOCK | COLLISION_LAYERS.WALL | COLLISION_LAYERS.BONUS,
    });

    // Store entity ID in Box2D body for reverse lookup
    body.setUserData({ entityId: entity.id, type: 'ball' });

    // Add components
    entity
      .addComponent(new PositionComponent(x, y))
      .addComponent(new VelocityComponent(0, 0))
      .addComponent(new SpriteComponent('circle', BALL.COLOR, BALL.RADIUS, 2))
      .addComponent(new BodyComponent(body))
      .addComponent(new LifecycleComponent('inactive'))
      .addComponent(new BallComponent(id))
      .addComponent(new TagComponent('ball'));

    return entity;
  }

  /**
   * Launch ball at angle
   * @param {Entity} ballEntity
   * @param {number} angle - Angle in radians
   * @param {number} speed - Speed magnitude
   */
  static launch(ballEntity, angle, speed = BALL.INITIAL_SPEED) {
    // Clamp angle to valid range
    angle = Math.max(BALL.MIN_LAUNCH_ANGLE, Math.min(BALL.MAX_LAUNCH_ANGLE, angle));

    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    // Set velocity in components
    const velComp = ballEntity.getComponent('velocity');
    if (velComp) {
      velComp.set(vx, vy);
    }

    // Set velocity in Box2D body
    const bodyComp = ballEntity.getComponent('body');
    if (bodyComp?.body) {
      bodyComp.body.setLinearVelocity(Vec2(vx, vy));
      bodyComp.body.setAwake(true);
    }

    // Update ball state
    const ballComp = ballEntity.getComponent('ball');
    if (ballComp) {
      ballComp.setState('active');
    }

    const lifecycleComp = ballEntity.getComponent('lifecycle');
    if (lifecycleComp) {
      lifecycleComp.setState('active');
    }
  }

  /**
   * Reset ball to position
   * @param {Entity} ballEntity
   * @param {number} x
   * @param {number} y
   */
  static reset(ballEntity, x, y) {
    // Reset position
    const posComp = ballEntity.getComponent('position');
    if (posComp) {
      posComp.set(x, y);
    }

    // Reset velocity
    const velComp = ballEntity.getComponent('velocity');
    if (velComp) {
      velComp.set(0, 0);
    }

    // Reset Box2D body
    const bodyComp = ballEntity.getComponent('body');
    if (bodyComp?.body) {
      bodyComp.body.setPosition(Vec2(x / PHYSICS_SCALE, y / PHYSICS_SCALE));
      bodyComp.body.setLinearVelocity(Vec2(0, 0));
      bodyComp.body.setAngularVelocity(0);
      bodyComp.body.setAwake(false);
    }

    // Reset ball component
    const ballComp = ballEntity.getComponent('ball');
    if (ballComp) {
      ballComp.reset();
    }

    // Reset lifecycle
    const lifecycleComp = ballEntity.getComponent('lifecycle');
    if (lifecycleComp) {
      lifecycleComp.setState('inactive');
    }
  }
}
