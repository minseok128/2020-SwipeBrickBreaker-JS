/**
 * PlayState - Main gameplay state
 */

import { GameState } from '../GameState.js';
import { BallFactory } from '@factories/BallFactory.js';
import { BlockFactory } from '@factories/BlockFactory.js';
import { KEYS, BALL, CANVAS, COLORS, FONTS } from '@config/constants.js';

export class PlayState extends GameState {
  constructor() {
    super('play');
    this.level = 1;
    this.score = 0;
    this.ballCount = 1;
    this.gameStarted = false;
    this.ballsLanded = false;
    this.landingX = CANVAS.WIDTH / 2;
    // Initial position: ball center so that bottom touches floor
    this.landingY = BALL.INITIAL_Y; // 689 = 700 - 11
  }

  /**
   * Enter play state
   * @param {Engine} engine
   */
  enter(engine) {
    super.enter(engine);

    // Initialize game
    this.initializeGame(engine);

    // Listen to events
    this.setupEventListeners(engine);
  }

  /**
   * Initialize game
   * @param {Engine} engine
   */
  initializeGame(engine) {
    // Clear existing entities
    engine.entityManager.clear();

    // Reset game state
    this.level = 1;
    this.score = 0;
    this.ballCount = 1;
    this.gameStarted = false;
    this.ballsLanded = false;
    this.landingX = CANVAS.WIDTH / 2;
    // Initial position: ball center so that bottom touches floor
    this.landingY = BALL.INITIAL_Y; // 689 = 700 - 11

    // Create initial balls
    this.createBalls(engine);

    // Generate first row of blocks
    const blockSystem = this.getBlockSystem(engine);
    if (blockSystem) {
      blockSystem.generateNewRow(this.level);
    }
  }

  /**
   * Create balls
   * @param {Engine} engine
   */
  createBalls(engine) {
    for (let i = 0; i < this.ballCount; i++) {
      BallFactory.create(
        engine.entityManager,
        engine.physics.world,
        this.landingX,
        this.landingY,
        i
      );
    }
  }

  /**
   * Setup event listeners
   * @param {Engine} engine
   */
  setupEventListeners(engine) {
    // Listen for balls landing
    engine.eventBus.on('balls:all_landed', (data) => {
      this.handleAllBallsLanded(engine, data);
    });

    // Listen for block destruction
    engine.eventBus.on('block:destroyed', (data) => {
      this.score += data.score || 1;
    });

    // Listen for bonus collection
    engine.eventBus.on('bonus:collected', (data) => {
      if (data.bonusType === 'extra_ball') {
        this.ballCount += data.value;
      }
    });

    // Listen for game over
    engine.eventBus.on('game:over', (data) => {
      this.handleGameOver(engine);
    });
  }

  /**
   * Handle all balls landed
   * @param {Engine} engine
   * @param {Object} data
   */
  handleAllBallsLanded(engine, data) {
    this.ballsLanded = true;
    this.landingX = data.landingX;
    // Update to waiting position: ball center at 688 for next turn
    // (with visual radius 10, bottom at 698, 2px above floor)
    this.landingY = BALL.WAITING_Y; // 688 = 700 - 12

    // Shift blocks down
    const blockSystem = this.getBlockSystem(engine);
    if (blockSystem) {
      const gameOver = blockSystem.shiftBlocksDown();
      if (gameOver) {
        this.handleGameOver(engine);
        return;
      }

      // Generate new row
      this.level++;
      blockSystem.generateNewRow(this.level);
    }

    // Reset balls for next turn
    this.resetBallsForNextTurn(engine);
  }

  /**
   * Reset balls for next turn
   * @param {Engine} engine
   */
  resetBallsForNextTurn(engine) {
    // Remove old balls
    const oldBalls = engine.entityManager.getEntitiesWithTag('ball');
    for (const ball of oldBalls) {
      const bodyComp = ball.getComponent('body');
      if (bodyComp?.body) {
        engine.physics.world.destroyBody(bodyComp.body);
      }
      engine.entityManager.removeEntity(ball);
    }
    engine.entityManager.cleanup();

    // Create new balls at landing position
    for (let i = 0; i < this.ballCount; i++) {
      BallFactory.create(
        engine.entityManager,
        engine.physics.world,
        this.landingX,
        this.landingY,
        i
      );
    }

    this.gameStarted = false;
    this.ballsLanded = false;
  }

  /**
   * Handle game over
   * @param {Engine} engine
   */
  handleGameOver(engine) {
    import('./GameOverState.js').then(({ GameOverState }) => {
      engine.stateManager.setState(new GameOverState(this.score, this.level));
    });
  }

  /**
   * Update game logic
   * @param {Engine} engine
   * @param {number} deltaTime
   */
  update(engine, deltaTime) {
    // Game logic is handled by systems
  }

  /**
   * Render game
   * @param {Engine} engine
   * @param {CanvasRenderer} renderer
   * @param {number} alpha
   */
  render(engine, renderer, alpha) {
    // UI rendering
    this.renderUI(renderer);

    // Draw aim line if not started
    if (!this.gameStarted) {
      this.renderAimLine(renderer, engine);
    }
  }

  /**
   * Render UI
   * @param {CanvasRenderer} renderer
   */
  renderUI(renderer) {
    // Level
    renderer.drawText(`Level: ${this.level}`, 20, 30, {
      font: `${FONTS.SIZE_SMALL} ${FONTS.FAMILY}`,
      color: COLORS.TEXT_PRIMARY,
      align: 'left',
    });

    // Score
    renderer.drawText(`Score: ${this.score}`, 20, 60, {
      font: `${FONTS.SIZE_SMALL} ${FONTS.FAMILY}`,
      color: COLORS.TEXT_SECONDARY,
      align: 'left',
    });

    // Ball count
    renderer.drawText(`Balls: ${this.ballCount}`, 20, 90, {
      font: `${FONTS.SIZE_SMALL} ${FONTS.FAMILY}`,
      color: COLORS.TEXT_SECONDARY,
      align: 'left',
    });
  }

  /**
   * Render aim line
   * @param {CanvasRenderer} renderer
   * @param {Engine} engine
   */
  renderAimLine(renderer, engine) {
    // Get mouse position from input manager
    const mousePos = engine.input.getMousePosition();
    if (!mousePos) return;

    const ctx = renderer.ctx;
    ctx.save();
    ctx.strokeStyle = COLORS.TEXT_PRIMARY;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(this.landingX, this.landingY);
    ctx.lineTo(mousePos.x, mousePos.y);
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Handle input
   * @param {Engine} engine
   * @param {Object} input
   */
  handleInput(engine, input) {
    if (input.type === 'mousedown' && !this.gameStarted && !this.ballsLanded) {
      this.launchBalls(engine, input.x, input.y);
    }

    if (input.type === 'keydown') {
      if (input.key === KEYS.DEBUG || input.key === 'd') {
        import('./PauseState.js').then(({ PauseState }) => {
          engine.stateManager.setState(new PauseState());
        });
      }
    }
  }

  /**
   * Launch balls
   * @param {Engine} engine
   * @param {number} targetX
   * @param {number} targetY
   */
  launchBalls(engine, targetX, targetY) {
    // Calculate angle (legacy compatible)
    // Legacy: theta = -Math.atan2(deltaY, delta)
    const delta = Math.round((targetX - this.landingX) * 1000) / 1000;
    const deltaY = Math.round((targetY - this.landingY - BALL.RADIUS) * 1000) / 1000;
    const angle = -Math.atan2(deltaY, delta);  // Note: NEGATIVE to match legacy

    // Angle clamping is handled in BallFactory.launch()

    // Launch all balls
    const balls = engine.entityManager.getEntitiesWithTag('ball');
    const ballSystem = this.getBallSystem(engine);

    if (ballSystem) {
      ballSystem.launchBalls(balls, angle, performance.now());
    }

    this.gameStarted = true;
  }

  /**
   * Get BallSystem instance
   * @param {Engine} engine
   * @returns {BallSystem|null}
   */
  getBallSystem(engine) {
    return engine.systemManager.systems.find(s => s.constructor.name === 'BallSystem') || null;
  }

  /**
   * Get BlockSystem instance
   * @param {Engine} engine
   * @returns {BlockSystem|null}
   */
  getBlockSystem(engine) {
    return engine.systemManager.systems.find(s => s.constructor.name === 'BlockSystem') || null;
  }

  /**
   * Exit play state
   * @param {Engine} engine
   */
  exit(engine) {
    super.exit(engine);
    // Remove event listeners
    engine.eventBus.listeners.clear();
  }
}
