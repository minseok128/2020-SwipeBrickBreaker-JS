/**
 * SystemManager - Manages all systems
 * Controls execution order and lifecycle
 */
export class SystemManager {
  constructor() {
    this.systems = [];
  }

  /**
   * Add a system
   * @param {System} system
   */
  addSystem(system) {
    this.systems.push(system);
    // Sort by priority
    this.systems.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Remove a system
   * @param {System} system
   */
  removeSystem(system) {
    const index = this.systems.indexOf(system);
    if (index !== -1) {
      this.systems.splice(index, 1);
    }
  }

  /**
   * Initialize all systems
   * @param {Object} context - Game engine context
   */
  init(context) {
    this.systems.forEach(system => system.init(context));
  }

  /**
   * Update all systems
   * @param {Entity[]} entities
   * @param {number} deltaTime
   */
  update(entities, deltaTime) {
    this.systems.forEach(system => {
      if (system.enabled) {
        system.update(entities, deltaTime);
      }
    });
  }

  /**
   * Cleanup all systems
   */
  cleanup() {
    this.systems.forEach(system => system.cleanup());
  }

  /**
   * Get system by class
   * @param {Function} SystemClass
   * @returns {System|undefined}
   */
  getSystem(SystemClass) {
    return this.systems.find(s => s instanceof SystemClass);
  }

  /**
   * Clear all systems
   */
  clear() {
    this.cleanup();
    this.systems = [];
  }
}
