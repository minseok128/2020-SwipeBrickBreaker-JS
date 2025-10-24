/**
 * ParticleSystem - Particle effects (explosions, aura)
 * Priority: 50
 */

import { System } from '@core/System.js';
import { ParticleFactory } from '@factories/ParticleFactory.js';
import { PARTICLE } from '@config/constants.js';

export class ParticleSystem extends System {
  constructor() {
    super();
    this.requiredComponents = ['particle', 'position', 'sprite'];
    this.priority = 50;
  }

  /**
   * Process particles
   * @param {Entity[]} entities
   * @param {number} deltaTime
   */
  process(entities, deltaTime) {
    for (const particle of entities) {
      this.updateParticle(particle, deltaTime);
    }
  }

  /**
   * Update individual particle
   * @param {Entity} particle
   * @param {number} deltaTime
   */
  updateParticle(particle, deltaTime) {
    const particleComp = particle.getComponent('particle');
    const sprite = particle.getComponent('sprite');

    if (!particleComp) return;

    // Update particle (decay opacity)
    const isDead = particleComp.update(deltaTime);

    // Update sprite opacity
    if (sprite) {
      sprite.setOpacity(particleComp.opacity);
    }

    // Mark dead particles for removal
    if (isDead) {
      particle.destroy();
    }
  }

  /**
   * Create explosion effect
   * @param {EntityManager} entityManager
   * @param {number} x
   * @param {number} y
   * @param {string} color
   * @param {number} count
   */
  createExplosion(entityManager, x, y, color, count = 20) {
    ParticleFactory.createExplosion(entityManager, x, y, color, count);
  }

  /**
   * Create aura effect
   * @param {EntityManager} entityManager
   * @param {number} x
   * @param {number} y
   * @param {number} count
   */
  createAura(entityManager, x, y, count = 8) {
    ParticleFactory.createAura(entityManager, x, y, count);
  }

  /**
   * Cleanup
   */
  cleanup() {
    // Particles are automatically cleaned up by LifecycleSystem
  }
}
