/**
 * PhysicsSystem - Box2D World integration
 * Priority: 10 (runs first)
 */

import { System } from '@core/System.js';
import { PHYSICS } from '@config/constants.js';

const PHYSICS_SCALE = PHYSICS.SCALE;

export class PhysicsSystem extends System {
  /**
   * @param {planck.World} world - Box2D World instance
   */
  constructor(world) {
    super();
    this.requiredComponents = []; // Process all entities
    this.priority = 10;
    this.world = world;
  }

  /**
   * Process physics update
   * @param {Entity[]} entities
   * @param {number} deltaTime - Time in ms
   */
  process(entities, deltaTime) {
    // Step Box2D simulation (fixed timestep 1/60 second)
    const timeStep = 1 / 60;
    const velocityIterations = 8;
    const positionIterations = 3;

    this.world.step(timeStep, velocityIterations, positionIterations);

    // Sync Box2D bodies → ECS components
    this.syncBodiesToComponents(entities);

    // Update particles (simple physics, no Box2D)
    this.updateParticles(entities, deltaTime);
  }

  /**
   * Sync Box2D body positions to PositionComponent
   * @param {Entity[]} entities
   */
  syncBodiesToComponents(entities) {
    for (const entity of entities) {
      const bodyComp = entity.getComponent('body');
      const posComp = entity.getComponent('position');

      if (!bodyComp?.isValid() || !posComp) continue;

      const bodyPos = bodyComp.body.getPosition();

      // Meters → Pixels
      posComp.x = bodyPos.x * PHYSICS_SCALE;
      posComp.y = bodyPos.y * PHYSICS_SCALE;

      // Also sync velocity component if exists
      const velComp = entity.getComponent('velocity');
      if (velComp) {
        const bodyVel = bodyComp.body.getLinearVelocity();
        velComp.vx = bodyVel.x;
        velComp.vy = bodyVel.y;
      }
    }
  }

  /**
   * Update particles with simple physics (no Box2D)
   * @param {Entity[]} entities
   * @param {number} deltaTime
   */
  updateParticles(entities, deltaTime) {
    const particles = entities.filter(e => e.hasComponent('particle'));

    for (const particle of particles) {
      const pos = particle.getComponent('position');
      const vel = particle.getComponent('velocity');
      const particleComp = particle.getComponent('particle');

      if (!pos || !vel || !particleComp) continue;

      // Skip aura particles (they don't move)
      if (particleComp.isAura()) continue;

      // Apply gravity and friction
      vel.vy += PHYSICS.GRAVITY * deltaTime;
      vel.vx *= PHYSICS.FRICTION;
      vel.vy *= PHYSICS.FRICTION;

      // Update position
      pos.x += vel.vx * deltaTime;
      pos.y += vel.vy * deltaTime;
    }
  }

  /**
   * Cleanup
   */
  cleanup() {
    // Don't destroy the world here - WorldManager handles that
  }
}
