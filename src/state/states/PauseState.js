/**
 * PauseState - Pause overlay
 */

import { GameState } from '../GameState.js';
import { KEYS, COLORS, FONTS, CANVAS } from '@config/constants.js';

export class PauseState extends GameState {
  constructor() {
    super('pause');
  }

  /**
   * Render pause overlay
   * @param {Engine} engine
   * @param {CanvasRenderer} renderer
   * @param {number} alpha
   */
  render(engine, renderer, alpha) {
    const cx = CANVAS.WIDTH / 2;
    const cy = CANVAS.HEIGHT / 2;

    // Draw semi-transparent overlay
    const ctx = renderer.ctx;
    ctx.save();
    ctx.globalAlpha = 0.7;
    renderer.drawRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT, '#000000');
    ctx.restore();

    // Pause text
    renderer.drawText('PAUSED', cx, cy - 50, {
      font: `${FONTS.SIZE_HUGE} ${FONTS.FAMILY}`,
      color: COLORS.TEXT_PRIMARY,
      align: 'center',
    });

    renderer.drawText('Press D to Resume', cx, cy + 50, {
      font: `${FONTS.SIZE_MEDIUM} ${FONTS.FAMILY}`,
      color: COLORS.TEXT_SECONDARY,
      align: 'center',
    });

    renderer.drawText('Press R to Restart', cx, cy + 100, {
      font: `${FONTS.SIZE_SMALL} ${FONTS.FAMILY}`,
      color: COLORS.TEXT_SECONDARY,
      align: 'center',
    });
  }

  /**
   * Handle input
   * @param {Engine} engine
   * @param {Object} input
   */
  handleInput(engine, input) {
    if (input.type === 'keydown') {
      if (input.key === KEYS.DEBUG || input.key === 'd') {
        // Resume game (go back to previous state)
        engine.stateManager.revertToPrevious();
      } else if (input.key === KEYS.RESTART || input.key === 'r') {
        // Restart game
        import('./PlayState.js').then(({ PlayState }) => {
          engine.stateManager.setState(new PlayState());
        });
      }
    }
  }
}
