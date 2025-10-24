/**
 * Main entry point
 * Swipe Brick Breaker 2.0
 */

import { Engine } from '@core/Engine.js';

// Get canvas element
const canvas = document.getElementById('game-canvas');

if (!canvas) {
  console.error('Canvas element not found!');
} else {
  // Create and start engine
  const engine = new Engine(canvas);

  // Start engine
  engine.start();

  // Expose engine globally for debugging
  window.gameEngine = engine;

  // Log initialization
  console.log('🎮 Swipe Brick Breaker 2.0 initialized!');
  console.log('📦 Engine:', engine);
  console.log('✅ Phase 0-2 complete: Infrastructure + Core Systems');
}
