import { describe, it, expect, beforeEach } from 'vitest';
import { Entity } from '../../../src/core/Entity.js';

describe('Entity', () => {
  let entity;

  beforeEach(() => {
    entity = new Entity(1);
  });

  it('should create entity with id', () => {
    expect(entity.id).toBe(1);
    expect(entity.active).toBe(true);
    expect(entity.components.size).toBe(0);
  });

  it('should add component', () => {
    const component = { type: 'position', x: 10, y: 20 };
    entity.addComponent(component);

    expect(entity.hasComponent('position')).toBe(true);
    expect(entity.getComponent('position')).toBe(component);
  });

  it('should support method chaining', () => {
    const comp1 = { type: 'position', x: 10, y: 20 };
    const comp2 = { type: 'velocity', vx: 5, vy: -5 };

    const result = entity.addComponent(comp1).addComponent(comp2);

    expect(result).toBe(entity);
    expect(entity.hasComponent('position')).toBe(true);
    expect(entity.hasComponent('velocity')).toBe(true);
  });

  it('should check multiple components', () => {
    const comp1 = { type: 'position', x: 10, y: 20 };
    const comp2 = { type: 'velocity', vx: 5, vy: -5 };

    entity.addComponent(comp1).addComponent(comp2);

    expect(entity.hasComponents('position', 'velocity')).toBe(true);
    expect(entity.hasComponents('position', 'sprite')).toBe(false);
  });

  it('should remove component', () => {
    const component = { type: 'position', x: 10, y: 20 };
    entity.addComponent(component);

    entity.removeComponent('position');

    expect(entity.hasComponent('position')).toBe(false);
  });

  it('should clear all components', () => {
    entity.addComponent({ type: 'position', x: 10, y: 20 });
    entity.addComponent({ type: 'velocity', vx: 5, vy: -5 });

    entity.clearComponents();

    expect(entity.components.size).toBe(0);
  });

  it('should set active state', () => {
    entity.setActive(false);
    expect(entity.active).toBe(false);

    entity.setActive(true);
    expect(entity.active).toBe(true);
  });

  it('should destroy entity', () => {
    entity.destroy();
    expect(entity.active).toBe(false);
  });
});
