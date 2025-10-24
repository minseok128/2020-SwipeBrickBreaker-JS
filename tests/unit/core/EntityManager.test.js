import { describe, it, expect, beforeEach } from 'vitest';
import { EntityManager } from '../../../src/core/EntityManager.js';

describe('EntityManager', () => {
  let manager;

  beforeEach(() => {
    manager = new EntityManager();
  });

  it('should create entities with unique IDs', () => {
    const entity1 = manager.createEntity();
    const entity2 = manager.createEntity();

    expect(entity1.id).toBe(0);
    expect(entity2.id).toBe(1);
    expect(manager.entities.size).toBe(2);
  });

  it('should get entity by ID', () => {
    const entity = manager.createEntity();
    const found = manager.getEntityById(entity.id);

    expect(found).toBe(entity);
  });

  it('should get entities with specific components', () => {
    const entity1 = manager.createEntity();
    entity1.addComponent({ type: 'position', x: 0, y: 0 });

    const entity2 = manager.createEntity();
    entity2.addComponent({ type: 'position', x: 10, y: 10 });
    entity2.addComponent({ type: 'velocity', vx: 5, vy: 5 });

    const entity3 = manager.createEntity();
    entity3.addComponent({ type: 'velocity', vx: 0, vy: 0 });

    const withPosition = manager.getEntitiesWith('position');
    expect(withPosition.length).toBe(2);

    const withBoth = manager.getEntitiesWith('position', 'velocity');
    expect(withBoth.length).toBe(1);
    expect(withBoth[0]).toBe(entity2);
  });

  it('should get entities with tag', () => {
    const entity1 = manager.createEntity();
    entity1.addComponent({ type: 'tag', value: 'ball' });

    const entity2 = manager.createEntity();
    entity2.addComponent({ type: 'tag', value: 'block' });

    const balls = manager.getEntitiesWithTag('ball');
    expect(balls.length).toBe(1);
    expect(balls[0]).toBe(entity1);
  });

  it('should get all active entities', () => {
    const entity1 = manager.createEntity();
    const entity2 = manager.createEntity();
    entity2.setActive(false);

    const active = manager.getAllActive();
    expect(active.length).toBe(1);
    expect(active[0]).toBe(entity1);
  });

  it('should defer entity removal', () => {
    const entity = manager.createEntity();
    manager.removeEntity(entity);

    // Entity still exists before cleanup
    expect(manager.entities.size).toBe(1);
    expect(manager.entitiesToRemove.size).toBe(1);

    manager.cleanup();

    // Entity removed after cleanup
    expect(manager.entities.size).toBe(0);
    expect(manager.entitiesToRemove.size).toBe(0);
  });

  it('should clear all entities', () => {
    manager.createEntity();
    manager.createEntity();

    manager.clear();

    expect(manager.entities.size).toBe(0);
    expect(manager.nextId).toBe(0);
  });

  it('should return statistics', () => {
    const entity1 = manager.createEntity();
    const entity2 = manager.createEntity();
    entity2.setActive(false);
    const entity3 = manager.createEntity();
    manager.removeEntity(entity3);

    const stats = manager.getStats();

    expect(stats.total).toBe(3);
    expect(stats.active).toBe(2); // entity1 and entity3 are still active (entity3 not removed until cleanup)
    expect(stats.pending_removal).toBe(1);
  });
});
