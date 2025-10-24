/**
 * GameOverState - Game over screen with score
 */

import { GameState } from '../GameState.js';
import { KEYS, COLORS, FONTS, CANVAS } from '@config/constants.js';

export class GameOverState extends GameState {
  /**
   * @param {number} finalScore
   * @param {number} finalLevel
   */
  constructor(finalScore = 0, finalLevel = 1) {
    super('game_over');
    this.finalScore = finalScore;
    this.finalLevel = finalLevel;
    this.time = 0;
  }

  /**
   * Enter game over state
   * @param {Engine} engine
   */
  enter(engine) {
    super.enter(engine);
    this.time = 0;

    // TODO: Save score to leaderboard (Phase 6)
  }

  /**
   * Update
   * @param {Engine} engine
   * @param {number} deltaTime
   */
  update(engine, deltaTime) {
    this.time += deltaTime;
  }

  /**
   * Render game over screen
   * @param {Engine} engine
   * @param {CanvasRenderer} renderer
   * @param {number} alpha
   */
  render(engine, renderer, alpha) {
    const cx = CANVAS.WIDTH / 2;

    // Title
    renderer.drawText('GAME OVER', cx, 150, {
      font: `${FONTS.SIZE_HUGE} ${FONTS.FAMILY}`,
      color: COLORS.TEXT_PRIMARY,
      align: 'center',
    });

    // Final stats
    renderer.drawText(`Final Level: ${this.finalLevel}`, cx, 280, {
      font: `${FONTS.SIZE_LARGE} ${FONTS.FAMILY}`,
      color: COLORS.TEXT_SECONDARY,
      align: 'center',
    });

    renderer.drawText(`Final Score: ${this.finalScore}`, cx, 340, {
      font: `${FONTS.SIZE_LARGE} ${FONTS.FAMILY}`,
      color: COLORS.TEXT_SECONDARY,
      align: 'center',
    });

    // Instructions
    const fontSize = 25 + Math.sin(this.time / 200) * 2;
    renderer.drawText('Press R to Restart', cx, 480, {
      font: `${fontSize}px ${FONTS.FAMILY}`,
      color: COLORS.TEXT_PRIMARY,
      align: 'center',
    });

    renderer.drawText('Press M for Menu', cx, 530, {
      font: `${FONTS.SIZE_SMALL} ${FONTS.FAMILY}`,
      color: COLORS.TEXT_SECONDARY,
      align: 'center',
    });

    // TODO: Leaderboard (Phase 6)
  }

  /**
   * Handle input
   * @param {Engine} engine
   * @param {Object} input
   */
  handleInput(engine, input) {
    if (input.type === 'keydown') {
      if (input.key === KEYS.RESTART || input.key === 'r') {
        import('./PlayState.js').then(({ PlayState }) => {
          engine.stateManager.setState(new PlayState());
        });
      } else if (input.key === KEYS.MANUAL || input.key === 'm') {
        import('./MenuState.js').then(({ MenuState }) => {
          engine.stateManager.setState(new MenuState());
        });
      }
    }
  }
}
