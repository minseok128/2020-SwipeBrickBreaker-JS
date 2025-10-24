import { describe, it, expect, beforeEach } from 'vitest';
import { EntityManager } from '../../src/core/EntityManager.js';
import { SystemManager } from '../../src/core/SystemManager.js';
import { System } from '../../src/core/System.js';

// Test system
class MovementSystem extends System {
  constructor() {
    super();
    this.requiredComponents = ['position', 'velocity'];
    this.priority = 10;
  }

  process(entities, deltaTime) {
    entities.forEach(entity => {
      const pos = entity.getComponent('position');
      const vel = entity.getComponent('velocity');

      pos.x += vel.vx * (deltaTime / 1000);
      pos.y += vel.vy * (deltaTime / 1000);
    });
  }
}

describe('ECS Integration', () => {
  let entityManager;
  let systemManager;

  beforeEach(() => {
    entityManager = new EntityManager();
    systemManager = new SystemManager();
  });

  it('should integrate entity, component, and system', () => {
    // Create entity with components
    const entity = entityManager.createEntity();
    entity.addComponent({ type: 'position', x: 0, y: 0 });
    entity.addComponent({ type: 'velocity', vx: 100, vy: 50 });

    // Add system
    systemManager.addSystem(new MovementSystem());

    // Initialize systems
    systemManager.init({});

    // Update for 1 second (1000ms)
    const entities = entityManager.getAllActive();
    systemManager.update(entities, 1000);

    // Check position updated
    const pos = entity.getComponent('position');
    expect(pos.x).toBeCloseTo(100, 1);
    expect(pos.y).toBeCloseTo(50, 1);
  });

  it('should handle multiple entities', () => {
    // Create multiple entities
    const entity1 = entityManager.createEntity();
    entity1.addComponent({ type: 'position', x: 0, y: 0 });
    entity1.addComponent({ type: 'velocity', vx: 100, vy: 0 });

    const entity2 = entityManager.createEntity();
    entity2.addComponent({ type: 'position', x: 0, y: 0 });
    entity2.addComponent({ type: 'velocity', vx: 0, vy: 100 });

    const entity3 = entityManager.createEntity();
    entity3.addComponent({ type: 'position', x: 0, y: 0 });

    // Add system
    systemManager.addSystem(new MovementSystem());
    systemManager.init({});

    // Update
    const entities = entityManager.getAllActive();
    systemManager.update(entities, 1000);

    // Check positions
    const pos1 = entity1.getComponent('position');
    expect(pos1.x).toBeCloseTo(100, 1);
    expect(pos1.y).toBeCloseTo(0, 1);

    const pos2 = entity2.getComponent('position');
    expect(pos2.x).toBeCloseTo(0, 1);
    expect(pos2.y).toBeCloseTo(100, 1);

    // Entity 3 should not move (no velocity)
    const pos3 = entity3.getComponent('position');
    expect(pos3.x).toBe(0);
    expect(pos3.y).toBe(0);
  });

  it('should remove entities properly', () => {
    const entity = entityManager.createEntity();
    entity.addComponent({ type: 'position', x: 0, y: 0 });

    entityManager.removeEntity(entity);
    entityManager.cleanup();

    const entities = entityManager.getAllActive();
    expect(entities.length).toBe(0);
  });

  it('should filter inactive entities', () => {
    const entity1 = entityManager.createEntity();
    const entity2 = entityManager.createEntity();

    entity1.setActive(false);

    const activeEntities = entityManager.getAllActive();
    expect(activeEntities.length).toBe(1);
    expect(activeEntities[0]).toBe(entity2);
  });
});
