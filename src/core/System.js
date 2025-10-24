/**
 * System - ECS pattern System base class
 * Processes entities with specific component combinations
 */
export class System {
  constructor() {
    /** @type {string[]} Required component types */
    this.requiredComponents = [];

    /** @type {number} Execution priority (lower = earlier) */
    this.priority = 0;

    /** @type {boolean} System enabled state */
    this.enabled = true;

    /** @type {Object} Game engine context */
    this.context = null;
  }

  /**
   * Initialize system with engine context
   * @param {Object} context - Game engine context
   */
  init(context) {
    this.context = context;
  }

  /**
   * Update system (called every frame)
   * @param {Entity[]} entities - All entities
   * @param {number} deltaTime - Frame time (ms)
   */
  update(entities, deltaTime) {
    if (!this.enabled) return;

    // Filter entities with required components
    const validEntities = this.filterEntities(entities);

    // Process entities
    this.process(validEntities, deltaTime);
  }

  /**
   * Filter entities by required components
   * @param {Entity[]} entities
   * @returns {Entity[]}
   */
  filterEntities(entities) {
    if (this.requiredComponents.length === 0) {
      return entities;
    }

    return entities.filter(entity =>
      this.requiredComponents.every(type => entity.hasComponent(type))
    );
  }

  /**
   * Process entities (override in subclass)
   * @param {Entity[]} entities - Filtered entities
   * @param {number} deltaTime - Frame time (ms)
   */
  process(entities, deltaTime) {
    throw new Error('System.process() must be implemented by subclass');
  }

  /**
   * Enable/disable system
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Cleanup system resources
   */
  cleanup() {
    // Override if needed
  }
}
