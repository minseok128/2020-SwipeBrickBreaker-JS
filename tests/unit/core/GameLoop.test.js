import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameLoop } from '../../../src/core/GameLoop.js';

describe('GameLoop', () => {
  let updateFn;
  let renderFn;
  let gameLoop;

  beforeEach(() => {
    updateFn = vi.fn();
    renderFn = vi.fn();
    gameLoop = new GameLoop(updateFn, renderFn, 60);

    // Mock requestAnimationFrame
    global.requestAnimationFrame = vi.fn(cb => setTimeout(cb, 16));
    global.performance = {
      now: () => Date.now(),
    };
  });

  it('should create game loop with target FPS', () => {
    expect(gameLoop.targetFPS).toBe(60);
    expect(gameLoop.frameTime).toBeCloseTo(16.67, 1);
    expect(gameLoop.running).toBe(false);
  });

  it('should start the game loop', () => {
    gameLoop.start();

    expect(gameLoop.running).toBe(true);
    expect(global.requestAnimationFrame).toHaveBeenCalled();
  });

  it('should stop the game loop', () => {
    gameLoop.start();
    gameLoop.stop();

    expect(gameLoop.running).toBe(false);
  });

  it('should not start if already running', () => {
    gameLoop.start();
    const callCount = global.requestAnimationFrame.mock.calls.length;

    gameLoop.start();

    expect(global.requestAnimationFrame.mock.calls.length).toBe(callCount);
  });

  it('should call update and render when loop runs', () => {
    // Mock requestAnimationFrame to execute callback immediately
    let rafCallback;
    global.requestAnimationFrame = vi.fn(cb => {
      rafCallback = cb;
      return 1;
    });

    gameLoop.start();
    expect(global.requestAnimationFrame).toHaveBeenCalled();

    // Manually execute the loop callback
    if (rafCallback) {
      const currentTime = performance.now() + 100; // Simulate 100ms elapsed
      rafCallback(currentTime);

      // After one loop iteration, callbacks should be called
      expect(updateFn).toHaveBeenCalled();
      expect(renderFn).toHaveBeenCalled();
    }

    gameLoop.stop();
  });

  it('should track FPS', () => {
    const initialFPS = gameLoop.getFPS();
    expect(initialFPS).toBe(0);

    gameLoop.start();

    // FPS will update after 1 second
    expect(gameLoop.currentFPS).toBeDefined();
  });
});
