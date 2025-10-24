/**
 * ParticleFactory - Create particle entities with object pooling
 */

import { PositionComponent } from '@components/PositionComponent.js';
import { VelocityComponent } from '@components/VelocityComponent.js';
import { SpriteComponent } from '@components/SpriteComponent.js';
import { ParticleComponent } from '@components/ParticleComponent.js';
import { LifecycleComponent } from '@components/LifecycleComponent.js';
import { TagComponent } from '@components/TagComponent.js';
import { PARTICLE, BONUS } from '@config/constants.js';

export class ParticleFactory {
  /**
   * Create explosion particles (for block destruction)
   * @param {EntityManager} entityManager
   * @param {number} x - Center X
   * @param {number} y - Center Y
   * @param {string} color - Particle color
   * @param {number} count - Number of particles
   * @returns {Entity[]}
   */
  static createExplosion(entityManager, x, y, color, count = 20) {
    const particles = [];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = PARTICLE.EXPLOSION_POWER * (0.5 + Math.random() * 0.5);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      const entity = entityManager.createEntity();

      entity
        .addComponent(new PositionComponent(x, y))
        .addComponent(new VelocityComponent(vx, vy))
        .addComponent(new SpriteComponent('circle', color, PARTICLE.SIZE, 3))
        .addComponent(new ParticleComponent('explosion', 1.0, PARTICLE.OPACITY_DECAY))
        .addComponent(new LifecycleComponent('active'))
        .addComponent(new TagComponent('particle'));

      particles.push(entity);
    }

    return particles;
  }

  /**
   * Create aura particles (for bonus blocks)
   * @param {EntityManager} entityManager
   * @param {number} x - Center X
   * @param {number} y - Center Y
   * @param {number} count - Number of particles
   * @returns {Entity[]}
   */
  static createAura(entityManager, x, y, count = 8) {
    const particles = [];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const distance = 30 + Math.random() * 10;
      const px = x + Math.cos(angle) * distance;
      const py = y + Math.sin(angle) * distance;

      const entity = entityManager.createEntity();

      entity
        .addComponent(new PositionComponent(px, py))
        .addComponent(new VelocityComponent(0, 0))
        .addComponent(new SpriteComponent('circle', BONUS.AURA_COLOR, PARTICLE.SIZE / 2, 3))
        .addComponent(new ParticleComponent('aura', 0.6, PARTICLE.AURA_OPACITY_DECAY))
        .addComponent(new LifecycleComponent('active'))
        .addComponent(new TagComponent('particle'));

      particles.push(entity);
    }

    return particles;
  }

  /**
   * Update particle (decay opacity, apply simple physics)
   * @param {Entity} particleEntity
   * @param {number} deltaTime
   * @returns {boolean} - True if particle should be removed
   */
  static update(particleEntity, deltaTime) {
    const particleComp = particleEntity.getComponent('particle');
    const pos = particleEntity.getComponent('position');
    const vel = particleEntity.getComponent('velocity');
    const sprite = particleEntity.getComponent('sprite');

    if (!particleComp || !pos || !vel) return true;

    // Update particle opacity
    const isDead = particleComp.update(deltaTime);
    if (isDead) return true;

    // Update sprite opacity
    if (sprite) {
      sprite.setOpacity(particleComp.opacity);
    }

    // Apply physics (for explosion particles)
    if (particleComp.isExplosion()) {
      vel.vy += 0.05 * deltaTime; // Gravity
      vel.vx *= 0.99; // Friction
      vel.vy *= 0.99;

      pos.x += vel.vx * deltaTime;
      pos.y += vel.vy * deltaTime;
    }

    // Aura particles expand slowly
    if (particleComp.isAura()) {
      // Aura particles stay near their original position
      // (expansion logic handled by AuraSystem if needed)
    }

    return false;
  }

  /**
   * Reset particle for reuse (object pooling)
   * @param {Entity} particleEntity
   * @param {string} type - 'explosion' | 'aura'
   * @param {number} x
   * @param {number} y
   * @param {number} vx
   * @param {number} vy
   * @param {string} color
   * @param {number} size
   */
  static reset(particleEntity, type, x, y, vx, vy, color, size) {
    const pos = particleEntity.getComponent('position');
    const vel = particleEntity.getComponent('velocity');
    const sprite = particleEntity.getComponent('sprite');
    const particleComp = particleEntity.getComponent('particle');
    const lifecycle = particleEntity.getComponent('lifecycle');

    if (pos) pos.set(x, y);
    if (vel) vel.set(vx, vy);
    if (sprite) {
      sprite.color = color;
      sprite.size = size;
      sprite.setOpacity(1.0);
    }
    if (particleComp) {
      particleComp.particleType = type;
      particleComp.reset(1.0);
      particleComp.setDecayRate(
        type === 'aura' ? PARTICLE.AURA_OPACITY_DECAY : PARTICLE.OPACITY_DECAY
      );
    }
    if (lifecycle) {
      lifecycle.reset();
    }
  }

  /**
   * Check if particle is ready for pooling (dead)
   * @param {Entity} particleEntity
   * @returns {boolean}
   */
  static isPoolable(particleEntity) {
    const particleComp = particleEntity.getComponent('particle');
    return particleComp?.isDead() ?? true;
  }
}
