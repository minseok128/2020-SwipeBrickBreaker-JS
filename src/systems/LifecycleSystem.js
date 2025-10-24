/**
 * LifecycleSystem - Entity lifecycle management (cleanup dead entities)
 * Priority: 90 (before rendering)
 */

import { System } from '@core/System.js';

export class LifecycleSystem extends System {
  /**
   * @param {planck.World} world - Box2D World for body cleanup
   */
  constructor(world) {
    super();
    this.requiredComponents = ['lifecycle'];
    this.priority = 90;
    this.world = world;
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
   * Process lifecycle
   * @param {Entity[]} entities
   * @param {number} deltaTime
   */
  process(entities, deltaTime) {
    for (const entity of entities) {
      this.processEntity(entity, deltaTime);
    }
  }

  /**
   * Process individual entity
   * @param {Entity} entity
   * @param {number} deltaTime
   */
  processEntity(entity, deltaTime) {
    const lifecycle = entity.getComponent('lifecycle');
    if (!lifecycle) return;

    // Update age
    const expired = lifecycle.update(deltaTime);

    // Mark expired entities as dead
    if (expired) {
      lifecycle.kill();
    }

    // Clean up dead entities
    if (lifecycle.isDead() || !entity.active) {
      this.removeEntity(entity);
    }
  }

  /**
   * Remove entity and cleanup resources
   * @param {Entity} entity
   */
  removeEntity(entity) {
    // Destroy Box2D body if exists
    const bodyComp = entity.getComponent('body');
    if (bodyComp?.isValid() && bodyComp.body) {
      try {
        this.world.destroyBody(bodyComp.body);
        bodyComp.body = null;
      } catch (error) {
        console.warn('Failed to destroy Box2D body:', error);
      }
    }

    // Mark entity for removal
    if (this.entityManager) {
      this.entityManager.removeEntity(entity);
    }
  }

  /**
   * Cleanup
   */
  cleanup() {
    // EntityManager handles cleanup
  }
}
