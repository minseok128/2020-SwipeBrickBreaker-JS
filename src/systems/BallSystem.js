/**
 * BallSystem - Ball-specific logic (launch, landing, delay spawning)
 * Priority: 30
 */

import { System } from '@core/System.js';
import { BallFactory } from '@factories/BallFactory.js';
import { BALL, BALL_STATE, CANVAS } from '@config/constants.js';

export class BallSystem extends System {
  constructor(eventBus) {
    super();
    this.requiredComponents = ['ball', 'position', 'lifecycle'];
    this.priority = 30;
    this.eventBus = eventBus;
    this.gameTime = 0;
    this.allBallsLanded = false;
    this.landingX = null;
  }

  /**
   * Process ball logic
   * @param {Entity[]} entities
   * @param {number} deltaTime
   */
  process(entities, deltaTime) {
    this.gameTime += deltaTime;

    // Process each ball
    for (const ball of entities) {
      this.processBall(ball);
    }

    // Check if all balls have landed
    this.checkAllBallsLanded(entities);
  }

  /**
   * Process individual ball
   * @param {Entity} ball
   */
  processBall(ball) {
    const ballComp = ball.getComponent('ball');
    const lifecycle = ball.getComponent('lifecycle');
    const pos = ball.getComponent('position');

    if (!ballComp || !lifecycle || !pos) return;

    // Waiting → Active (delayed spawn)
    if (ballComp.isWaiting()) {
      if (ballComp.isReadyToLaunch(this.gameTime, BALL.LAUNCH_DELAY_FRAMES)) {
        lifecycle.setState('active');
      }
    }

    // Active → Check for landing
    if (ballComp.isActive()) {
      // Check if ball reached bottom
      if (pos.y >= CANVAS.HEIGHT - BALL.RADIUS) {
        this.landBall(ball);
      }
    }
  }

  /**
   * Land a ball
   * @param {Entity} ball
   */
  landBall(ball) {
    const ballComp = ball.getComponent('ball');
    const pos = ball.getComponent('position');
    const bodyComp = ball.getComponent('body');

    if (!ballComp || !pos) return;

    // Stop ball
    if (bodyComp?.body) {
      bodyComp.body.setLinearVelocity({ x: 0, y: 0 });
      bodyComp.body.setAwake(false);
    }

    // Set landed position
    pos.y = CANVAS.HEIGHT - BALL.RADIUS;

    // Record landing X (first ball sets the position)
    if (this.landingX === null) {
      this.landingX = Math.round(pos.x);
    }

    // Move to landing X
    pos.x = this.landingX;
    if (bodyComp?.body) {
      bodyComp.body.setPosition({
        x: this.landingX / 100,
        y: pos.y / 100,
      });
    }

    // Update state
    ballComp.setState(BALL_STATE.LANDED);
    ballComp.hasLanded = true;

    // Emit event
    this.eventBus.emit('ball:landed', {
      ball,
      x: this.landingX,
      y: pos.y,
    });
  }

  /**
   * Check if all balls have landed
   * @param {Entity[]} balls
   */
  checkAllBallsLanded(balls) {
    const activeBalls = balls.filter(b => {
      const ballComp = b.getComponent('ball');
      return ballComp?.isActive() || ballComp?.isWaiting();
    });

    if (activeBalls.length === 0 && balls.length > 0) {
      if (!this.allBallsLanded) {
        this.allBallsLanded = true;
        this.eventBus.emit('balls:all_landed', {
          landingX: this.landingX,
        });
      }
    } else {
      this.allBallsLanded = false;
    }
  }

  /**
   * Launch all balls at angle
   * @param {Entity[]} balls
   * @param {number} angle - Angle in radians
   * @param {number} startTime - Game time when launch started
   */
  launchBalls(balls, angle, startTime) {
    this.landingX = null;
    this.allBallsLanded = false;

    for (const ball of balls) {
      const ballComp = ball.getComponent('ball');
      if (!ballComp) continue;

      ballComp.setState(BALL_STATE.WAITING);
      ballComp.setLaunchTime(startTime);

      // Launch immediately (BallFactory handles angle clamping)
      BallFactory.launch(ball, angle, BALL.INITIAL_SPEED);
    }
  }

  /**
   * Reset all balls to position
   * @param {Entity[]} balls
   * @param {number} x
   * @param {number} y
   */
  resetBalls(balls, x, y) {
    this.landingX = x;
    this.allBallsLanded = false;

    for (const ball of balls) {
      BallFactory.reset(ball, x, y);
    }
  }

  /**
   * Cleanup
   */
  cleanup() {
    this.gameTime = 0;
    this.landingX = null;
    this.allBallsLanded = false;
  }
}
