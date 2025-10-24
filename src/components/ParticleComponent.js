import { PARTICLE } from '@config/constants.js';

/**
 * ParticleComponent - Particle-specific data
 */
export class ParticleComponent {
  type = 'particle';

  /**
   * @param {string} particleType - 'explosion' | 'aura'
   * @param {number} opacity - Initial opacity
   * @param {number} decayRate - Opacity decay rate
   */
  constructor(particleType = 'explosion', opacity = 1.0, decayRate = PARTICLE.OPACITY_DECAY) {
    this.particleType = particleType;
    this.opacity = opacity;
    this.decayRate = decayRate;
    this.size = PARTICLE.SIZE;
  }

  /**
   * Update particle (decay opacity)
   * @param {number} deltaTime - Time delta (ms)
   * @returns {boolean} - True if particle is dead (opacity <= 0)
   */
  update(deltaTime) {
    this.opacity -= this.decayRate * deltaTime;
    return this.opacity <= 0;
  }

  /**
   * Check if explosion particle
   * @returns {boolean}
   */
  isExplosion() {
    return this.particleType === 'explosion';
  }

  /**
   * Check if aura particle
   * @returns {boolean}
   */
  isAura() {
    return this.particleType === 'aura';
  }

  /**
   * Check if dead
   * @returns {boolean}
   */
  isDead() {
    return this.opacity <= 0;
  }

  /**
   * Reset particle
   * @param {number} opacity
   */
  reset(opacity = 1.0) {
    this.opacity = opacity;
  }

  /**
   * Set decay rate
   * @param {number} rate
   */
  setDecayRate(rate) {
    this.decayRate = rate;
  }
}
