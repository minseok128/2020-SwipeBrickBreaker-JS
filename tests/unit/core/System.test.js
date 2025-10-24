import { describe, it, expect, beforeEach } from 'vitest';
import { System } from '../../../src/core/System.js';
import { Entity } from '../../../src/core/Entity.js';

class TestSystem extends System {
  constructor() {
    super();
    this.requiredComponents = ['position'];
    this.processedEntities = [];
  }

  process(entities, deltaTime) {
    this.processedEntities = entities;
  }
}

describe('System', () => {
  let system;

  beforeEach(() => {
    system = new TestSystem();
  });

  it('should create system with default properties', () => {
    expect(system.requiredComponents).toEqual(['position']);
    expect(system.priority).toBe(0);
    expect(system.enabled).toBe(true);
  });

  it('should initialize with context', () => {
    const context = { game: 'test' };
    system.init(context);

    expect(system.context).toBe(context);
  });

  it('should filter entities by required components', () => {
    const entity1 = new Entity(1);
    entity1.addComponent({ type: 'position', x: 0, y: 0 });

    const entity2 = new Entity(2);
    entity2.addComponent({ type: 'velocity', vx: 0, vy: 0 });

    const entity3 = new Entity(3);
    entity3.addComponent({ type: 'position', x: 10, y: 10 });

    const filtered = system.filterEntities([entity1, entity2, entity3]);

    expect(filtered.length).toBe(2);
    expect(filtered).toContain(entity1);
    expect(filtered).toContain(entity3);
  });

  it('should update and process entities', () => {
    const entity1 = new Entity(1);
    entity1.addComponent({ type: 'position', x: 0, y: 0 });

    const entity2 = new Entity(2);
    entity2.addComponent({ type: 'velocity', vx: 0, vy: 0 });

    system.update([entity1, entity2], 16);

    expect(system.processedEntities.length).toBe(1);
    expect(system.processedEntities[0]).toBe(entity1);
  });

  it('should not update when disabled', () => {
    const entity = new Entity(1);
    entity.addComponent({ type: 'position', x: 0, y: 0 });

    system.setEnabled(false);
    system.update([entity], 16);

    expect(system.processedEntities.length).toBe(0);
  });

  it('should throw error if process not implemented', () => {
    const baseSystem = new System();
    const entity = new Entity(1);

    expect(() => baseSystem.process([entity], 16)).toThrow();
  });
});
