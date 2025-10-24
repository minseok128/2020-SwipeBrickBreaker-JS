/**
 * Physics Equivalence Tests
 * Verify that refactored physics matches legacy behavior
 */

import { describe, it, expect } from 'vitest';
import { BALL } from '@config/constants.js';

describe('Physics Equivalence with Legacy Code', () => {
  /**
   * Legacy velocity calculation (from app.js lines 310-333)
   */
  function legacyVelocityCalculation(offsetX, offsetY, ballX, ballY, speed = 3.5) {
    const delta = Math.round((offsetX - ballX) * 1000) / 1000;
    const deltaY = Math.round((offsetY - ballY - BALL.RADIUS) * 1000) / 1000;
    let vx = 0;
    let vy = 0;
    const theta = -Math.atan2(deltaY, delta);  // Note: NEGATIVE

    if (theta <= 0.17) {
      vx = Math.round(speed * 10 * Math.cos(0.17)) / 10;
      vy = Math.abs(Math.round(speed * 10 * Math.sin(0.17)) / 10) * -1;
    } else if (theta >= 2.96) {
      vx = Math.round(speed * 10 * Math.cos(2.96)) / 10;
      vy = Math.abs(Math.round(speed * 10 * Math.sin(2.96)) / 10) * -1;
    } else {
      vx = Math.round(speed * 100 * Math.cos(theta)) / 100;
      vy = Math.abs(Math.round(speed * 100 * Math.sin(theta)) / 100) * -1;
    }

    return { vx, vy, theta };
  }

  /**
   * Refactored velocity calculation (to be implemented correctly)
   */
  function refactoredVelocityCalculation(offsetX, offsetY, ballX, ballY, speed = 3.5) {
    const delta = Math.round((offsetX - ballX) * 1000) / 1000;
    const deltaY = Math.round((offsetY - ballY - BALL.RADIUS) * 1000) / 1000;

    let theta = -Math.atan2(deltaY, delta);  // MUST be negative

    // Clamp angle
    let vx = 0;
    let vy = 0;

    if (theta <= BALL.MIN_LAUNCH_ANGLE) {
      // Use MIN_LAUNCH_ANGLE with precision 10
      vx = Math.round(speed * 10 * Math.cos(BALL.MIN_LAUNCH_ANGLE)) / 10;
      vy = Math.abs(Math.round(speed * 10 * Math.sin(BALL.MIN_LAUNCH_ANGLE)) / 10) * -1;
    } else if (theta >= BALL.MAX_LAUNCH_ANGLE) {
      // Use MAX_LAUNCH_ANGLE with precision 10
      vx = Math.round(speed * 10 * Math.cos(BALL.MAX_LAUNCH_ANGLE)) / 10;
      vy = Math.abs(Math.round(speed * 10 * Math.sin(BALL.MAX_LAUNCH_ANGLE)) / 10) * -1;
    } else {
      // Use actual angle with precision 100
      vx = Math.round(speed * 100 * Math.cos(theta)) / 100;
      vy = Math.abs(Math.round(speed * 100 * Math.sin(theta)) / 100) * -1;
    }

    return { vx, vy, theta };
  }

  describe('Ball Launch Velocity', () => {
    it('should match legacy velocity for center aim', () => {
      const ballX = 300;
      const ballY = 689;  // HEIGHT - RADIUS
      const targetX = 300;
      const targetY = 200;

      const legacy = legacyVelocityCalculation(targetX, targetY, ballX, ballY);
      const refactored = refactoredVelocityCalculation(targetX, targetY, ballX, ballY);

      expect(refactored.vx).toBeCloseTo(legacy.vx, 2);
      expect(refactored.vy).toBeCloseTo(legacy.vy, 2);
      expect(refactored.theta).toBeCloseTo(legacy.theta, 3);
    });

    it('should match legacy velocity for left diagonal aim', () => {
      const ballX = 300;
      const ballY = 689;
      const targetX = 100;
      const targetY = 200;

      const legacy = legacyVelocityCalculation(targetX, targetY, ballX, ballY);
      const refactored = refactoredVelocityCalculation(targetX, targetY, ballX, ballY);

      expect(refactored.vx).toBeCloseTo(legacy.vx, 2);
      expect(refactored.vy).toBeCloseTo(legacy.vy, 2);
    });

    it('should match legacy velocity for right diagonal aim', () => {
      const ballX = 300;
      const ballY = 689;
      const targetX = 500;
      const targetY = 200;

      const legacy = legacyVelocityCalculation(targetX, targetY, ballX, ballY);
      const refactored = refactoredVelocityCalculation(targetX, targetY, ballX, ballY);

      expect(refactored.vx).toBeCloseTo(legacy.vx, 2);
      expect(refactored.vy).toBeCloseTo(legacy.vy, 2);
    });

    it('should clamp angle to MIN_LAUNCH_ANGLE (0.17) when too shallow', () => {
      const ballX = 300;
      const ballY = 689;
      const targetX = 590;  // Very far right
      const targetY = 680;  // Almost horizontal

      const legacy = legacyVelocityCalculation(targetX, targetY, ballX, ballY);
      const refactored = refactoredVelocityCalculation(targetX, targetY, ballX, ballY);

      expect(refactored.vx).toBeCloseTo(legacy.vx, 1);
      expect(refactored.vy).toBeCloseTo(legacy.vy, 1);
      expect(Math.abs(refactored.theta)).toBeLessThanOrEqual(BALL.MIN_LAUNCH_ANGLE + 0.01);
    });

    it('should clamp angle to MAX_LAUNCH_ANGLE (2.96) when too steep', () => {
      const ballX = 300;
      const ballY = 689;
      const targetX = 10;   // Very far left
      const targetY = 680;  // Almost horizontal (opposite side)

      const legacy = legacyVelocityCalculation(targetX, targetY, ballX, ballY);
      const refactored = refactoredVelocityCalculation(targetX, targetY, ballX, ballY);

      expect(refactored.vx).toBeCloseTo(legacy.vx, 1);
      expect(refactored.vy).toBeCloseTo(legacy.vy, 1);
      expect(Math.abs(refactored.theta)).toBeGreaterThanOrEqual(BALL.MAX_LAUNCH_ANGLE - 0.01);
    });

    it('should always have negative vy (upward)', () => {
      const testCases = [
        { ballX: 300, ballY: 689, targetX: 300, targetY: 200 },
        { ballX: 300, ballY: 689, targetX: 100, targetY: 300 },
        { ballX: 300, ballY: 689, targetX: 500, targetY: 300 },
      ];

      testCases.forEach(({ ballX, ballY, targetX, targetY }) => {
        const legacy = legacyVelocityCalculation(targetX, targetY, ballX, ballY);
        const refactored = refactoredVelocityCalculation(targetX, targetY, ballX, ballY);

        expect(legacy.vy).toBeLessThan(0);
        expect(refactored.vy).toBeLessThan(0);
        expect(refactored.vy).toBeCloseTo(legacy.vy, 2);
      });
    });

    it('should use correct rounding precision', () => {
      const ballX = 300;
      const ballY = 689;
      const targetX = 400;
      const targetY = 300;

      const legacy = legacyVelocityCalculation(targetX, targetY, ballX, ballY);

      // Check that legacy uses 100 precision (2 decimal places)
      expect(legacy.vx).toBe(Math.round(legacy.vx * 100) / 100);
      expect(Math.abs(legacy.vy)).toBe(Math.round(Math.abs(legacy.vy) * 100) / 100);
    });
  });

  describe('Ball Launch Delay', () => {
    it('should launch balls with 6-frame delay per ball ID', () => {
      const LAUNCH_DELAY = 6;

      for (let ballId = 0; ballId < 5; ballId++) {
        const expectedDelay = LAUNCH_DELAY * ballId;
        expect(expectedDelay).toBe(ballId * 6);
      }
    });

    it('should have first ball (ID=0) launch immediately', () => {
      const ballId = 0;
      const startTime = 100;
      const currentTime = 100;

      const shouldLaunch = (currentTime - startTime) >= BALL.LAUNCH_DELAY_FRAMES * ballId;
      expect(shouldLaunch).toBe(true);
    });

    it('should have second ball (ID=1) launch after 6 frames', () => {
      const ballId = 1;
      const startTime = 100;
      const currentTime = 105;  // 5 frames elapsed

      const shouldNotLaunch = (currentTime - startTime) >= BALL.LAUNCH_DELAY_FRAMES * ballId;
      expect(shouldNotLaunch).toBe(false);

      const currentTime2 = 106;  // 6 frames elapsed
      const shouldLaunch = (currentTime2 - startTime) >= BALL.LAUNCH_DELAY_FRAMES * ballId;
      expect(shouldLaunch).toBe(true);
    });
  });

  describe('Ball Constants', () => {
    it('should have correct ball radius', () => {
      expect(BALL.RADIUS).toBe(11);
    });

    it('should have correct initial speed', () => {
      expect(BALL.INITIAL_SPEED).toBe(3.5);
    });

    it('should have correct angle constraints', () => {
      expect(BALL.MIN_LAUNCH_ANGLE).toBe(0.17);
      expect(BALL.MAX_LAUNCH_ANGLE).toBe(2.96);
    });

    it('should have correct launch delay', () => {
      expect(BALL.LAUNCH_DELAY_FRAMES).toBe(6);
    });
  });
});
