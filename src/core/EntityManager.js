/**
 * EntityManager - Manages all entities
 * Handles creation, deletion, and querying of entities
 */

import { Entity } from './Entity.js';

export class EntityManager {
  constructor() {
    this.entities = new Set();
    this.nextId = 0;
    this.entitiesToRemove = new Set();
  }

  /**
   * Create a new entity
   * @returns {Entity}
   */
  createEntity() {
    const entity = new Entity(this.nextId++);
    this.entities.add(entity);
    return entity;
  }

  /**
   * Remove an entity (deferred)
   * @param {Entity} entity
   */
  removeEntity(entity) {
    this.entitiesToRemove.add(entity);
  }

  /**
   * Get entity by ID
   * @param {number} id
   * @returns {Entity|undefined}
   */
  getEntityById(id) {
    return Array.from(this.entities).find(e => e.id === id);
  }

  /**
   * Get entities with specific components
   * @param {...string} componentTypes
   * @returns {Entity[]}
   */
  getEntitiesWith(...componentTypes) {
    return Array.from(this.entities).filter(
      entity => entity.active && componentTypes.every(type => entity.hasComponent(type))
    );
  }

  /**
   * Get entities with a specific tag
   * @param {string} tag
   * @returns {Entity[]}
   */
  getEntitiesWithTag(tag) {
    return Array.from(this.entities).filter(entity => {
      const tagComp = entity.getComponent('tag');
      return tagComp && tagComp.value === tag;
    });
  }

  /**
   * Get all active entities
   * @returns {Entity[]}
   */
  getAllActive() {
    return Array.from(this.entities).filter(e => e.active);
  }

  /**
   * Clean up removed entities (call at end of frame)
   */
  cleanup() {
    this.entitiesToRemove.forEach(entity => {
      entity.clearComponents();
      this.entities.delete(entity);
    });
    this.entitiesToRemove.clear();
  }

  /**
   * Remove all entities
   */
  clear() {
    this.entities.forEach(entity => entity.clearComponents());
    this.entities.clear();
    this.entitiesToRemove.clear();
    this.nextId = 0;
  }

  /**
   * Get statistics
   * @returns {Object}
   */
  getStats() {
    return {
      total: this.entities.size,
      active: this.getAllActive().length,
      pending_removal: this.entitiesToRemove.size,
    };
  }
}
