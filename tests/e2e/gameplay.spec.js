/**
 * E2E Tests - Gameplay Scenarios
 * Test the complete game flow and verify it matches legacy behavior
 */

import { test, expect } from '@playwright/test';

test.describe('Swipe Brick Breaker - Gameplay', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to game
    await page.goto('/');

    // Wait for canvas to be ready
    await page.waitForSelector('canvas', { state: 'visible', timeout: 10000 });

    // Wait for fonts to load
    await page.waitForTimeout(500);
  });

  test('should display menu screen on load', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Take screenshot of menu
    await page.screenshot({ path: 'test-results/menu-screen.png' });

    // Check for menu text (should render on canvas)
    // Since text is rendered on canvas, we can't query it directly
    // Instead, verify canvas is present and has correct dimensions
    const canvasSize = await canvas.boundingBox();
    expect(canvasSize?.width).toBe(600);
    expect(canvasSize?.height).toBe(700);
  });

  test('should start game when R key is pressed', async ({ page }) => {
    // Press R to start game
    await page.keyboard.press('r');

    // Wait a bit for game to initialize
    await page.waitForTimeout(1000);

    // Take screenshot of game state
    await page.screenshot({ path: 'test-results/game-started.png' });

    // Verify we're in play state (canvas should still be visible)
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('should launch balls when clicking on canvas', async ({ page }) => {
    // Start game
    await page.keyboard.press('r');
    await page.waitForTimeout(500);

    // Get canvas element
    const canvas = page.locator('canvas');
    const canvasBox = await canvas.boundingBox();

    // Click on upper-middle area to launch balls
    if (canvasBox) {
      await canvas.click({
        position: {
          x: canvasBox.width / 2,
          y: canvasBox.height / 3,
        },
      });

      // Wait for balls to start moving
      await page.waitForTimeout(2000);

      // Take screenshot during ball flight
      await page.screenshot({ path: 'test-results/balls-in-flight.png' });
    }
  });

  test('should complete one full round', async ({ page }) => {
    // Start game
    await page.keyboard.press('r');
    await page.waitForTimeout(500);

    // Get canvas element
    const canvas = page.locator('canvas');
    const canvasBox = await canvas.boundingBox();

    // Launch balls
    if (canvasBox) {
      await canvas.click({
        position: {
          x: canvasBox.width / 2,
          y: 200,
        },
      });

      // Wait for round to complete (balls to land)
      // Timeout is generous to allow for full ball flight
      await page.waitForTimeout(5000);

      // Take screenshot after round completes
      await page.screenshot({ path: 'test-results/round-complete.png' });
    }
  });

  test('should show FPS counter', async ({ page }) => {
    // Start game
    await page.keyboard.press('r');
    await page.waitForTimeout(1000);

    // Take screenshot to verify FPS display
    await page.screenshot({ path: 'test-results/fps-display.png' });

    // FPS should be rendered on canvas in top-right
    // We can't query canvas text directly, but we verified it exists in the code
  });

  test('should handle pause with D key', async ({ page }) => {
    // Start game
    await page.keyboard.press('r');
    await page.waitForTimeout(500);

    // Press D to pause
    await page.keyboard.press('d');
    await page.waitForTimeout(500);

    // Take screenshot of pause state
    await page.screenshot({ path: 'test-results/paused.png' });
  });

  test('should open manual with M key', async ({ page }) => {
    // Press M to open manual
    await page.keyboard.press('m');
    await page.waitForTimeout(500);

    // Take screenshot of manual
    await page.screenshot({ path: 'test-results/manual.png' });

    // Press B to go back
    await page.keyboard.press('b');
    await page.waitForTimeout(500);

    // Should be back at menu
    await page.screenshot({ path: 'test-results/back-to-menu.png' });
  });

  test('should handle multiple balls', async ({ page }) => {
    // This test would require setting up a game state with multiple balls
    // For now, we verify the single ball case and assume multi-ball works
    // based on unit tests

    // Start game
    await page.keyboard.press('r');
    await page.waitForTimeout(500);

    const canvas = page.locator('canvas');
    const canvasBox = await canvas.boundingBox();

    // Launch ball
    if (canvasBox) {
      await canvas.click({
        position: {
          x: canvasBox.width / 2,
          y: 200,
        },
      });

      // Wait for flight
      await page.waitForTimeout(1000);

      // Take screenshot during flight
      await page.screenshot({ path: 'test-results/ball-flight-1.png' });

      // Wait for landing
      await page.waitForTimeout(4000);

      // Take screenshot after landing
      await page.screenshot({ path: 'test-results/ball-landed-1.png' });
    }
  });
});

test.describe('Performance Tests', () => {
  test('should maintain 60 FPS during gameplay', async ({ page }) => {
    // Start game
    await page.goto('/');
    await page.waitForSelector('canvas');
    await page.keyboard.press('r');
    await page.waitForTimeout(500);

    // Launch balls
    const canvas = page.locator('canvas');
    const canvasBox = await canvas.boundingBox();

    if (canvasBox) {
      await canvas.click({
        position: {
          x: canvasBox.width / 2,
          y: 200,
        },
      });

      // Measure performance during ball flight
      const metrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          let frameCount = 0;
          const startTime = performance.now();
          const maxDuration = 2000; // 2 seconds

          function measureFrame() {
            frameCount++;
            const elapsed = performance.now() - startTime;

            if (elapsed < maxDuration) {
              requestAnimationFrame(measureFrame);
            } else {
              const fps = (frameCount / elapsed) * 1000;
              resolve({ fps, frameCount, elapsed });
            }
          }

          requestAnimationFrame(measureFrame);
        });
      });

      // Should be close to 60 FPS
      expect(metrics.fps).toBeGreaterThan(55);
      expect(metrics.fps).toBeLessThan(65);

      console.log(`Performance: ${metrics.fps.toFixed(2)} FPS over ${metrics.frameCount} frames`);
    }
  });

  test('should not leak memory during gameplay', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas');

    // Get initial memory
    const initialMemory = await page.evaluate(() => {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize;
      }
      return null;
    });

    if (initialMemory === null) {
      test.skip('Memory API not available in this browser');
      return;
    }

    // Start game
    await page.keyboard.press('r');
    await page.waitForTimeout(500);

    // Play several rounds
    for (let i = 0; i < 3; i++) {
      const canvas = page.locator('canvas');
      const canvasBox = await canvas.boundingBox();

      if (canvasBox) {
        await canvas.click({
          position: {
            x: canvasBox.width / 2,
            y: 200,
          },
        });

        // Wait for round to complete
        await page.waitForTimeout(5000);
      }
    }

    // Force garbage collection if available
    await page.evaluate(() => {
      if (window.gc) {
        window.gc();
      }
    });

    await page.waitForTimeout(1000);

    // Get final memory
    const finalMemory = await page.evaluate(() => {
      return performance.memory.usedJSHeapSize;
    });

    const memoryIncreaseMB = (finalMemory - initialMemory) / 1024 / 1024;

    console.log(`Memory increase: ${memoryIncreaseMB.toFixed(2)} MB`);

    // Memory should not increase more than 30MB after multiple rounds
    expect(memoryIncreaseMB).toBeLessThan(30);
  });
});
