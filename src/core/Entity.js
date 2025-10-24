/**
 * Entity - ECS pattern Entity
 * Container for components, identified by unique ID
 */
export class Entity {
  /**
   * @param {number} id - Unique identifier
   * @param {EntityManager} manager - Reference to entity manager
   */
  constructor(id, manager = null) {
    this.id = id;
    this.manager = manager;
    this.components = new Map();
    this.active = true;
  }

  /**
   * Add a component to this entity
   * @param {Object} component - Component to add
   * @returns {Entity} this (for chaining)
   */
  addComponent(component) {
    this.components.set(component.type, component);
    return this;
  }

  /**
   * Get a component by type
   * @param {string} type - Component type
   * @returns {Object|undefined}
   */
  getComponent(type) {
    return this.components.get(type);
  }

  /**
   * Check if entity has a component
   * @param {string} type - Component type
   * @returns {boolean}
   */
  hasComponent(type) {
    return this.components.has(type);
  }

  /**
   * Check if entity has all specified components
   * @param {...string} types - Component types
   * @returns {boolean}
   */
  hasComponents(...types) {
    return types.every(type => this.hasComponent(type));
  }

  /**
   * Remove a component
   * @param {string} type - Component type
   * @returns {Entity} this
   */
  removeComponent(type) {
    this.components.delete(type);
    return this;
  }

  /**
   * Remove all components
   */
  clearComponents() {
    this.components.clear();
  }

  /**
   * Set entity active/inactive
   * @param {boolean} active
   */
  setActive(active) {
    this.active = active;
  }

  /**
   * Destroy entity (mark as inactive and schedule removal)
   */
  destroy() {
    this.active = false;
    if (this.manager) {
      this.manager.removeEntity(this);
    }
  }
}
