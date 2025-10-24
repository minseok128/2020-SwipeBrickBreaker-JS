/**
 * ManualState - Help/Instructions screen
 */

import { GameState } from '../GameState.js';
import { KEYS, COLORS, FONTS, CANVAS } from '@config/constants.js';

export class ManualState extends GameState {
  constructor() {
    super('manual');
  }

  /**
   * Render manual
   * @param {Engine} engine
   * @param {CanvasRenderer} renderer
   * @param {number} alpha
   */
  render(engine, renderer, alpha) {
    const cx = CANVAS.WIDTH / 2;
    let y = 80;

    // Title
    renderer.drawText('HOW TO PLAY', cx, y, {
      font: `${FONTS.SIZE_LARGE} ${FONTS.FAMILY}`,
      color: COLORS.TEXT_PRIMARY,
      align: 'center',
    });

    y += 80;

    // Instructions
    const instructions = [
      'Click to launch balls',
      'Destroy blocks by hitting them',
      'Blocks have health = level number',
      'Collect green bonus blocks',
      'Get extra balls!',
      '',
      'Special Blocks:',
      'Cross - Destroys row + column',
      'Horizontal - Destroys row',
      'Vertical - Destroys column',
      '',
      'Game Over if blocks reach bottom',
    ];

    for (const line of instructions) {
      renderer.drawText(line, cx, y, {
        font: line.startsWith('Special') || line.startsWith('Game')
          ? `${FONTS.SIZE_SMALL} ${FONTS.FAMILY}`
          : `${FONTS.SIZE_TINY} ${FONTS.FAMILY}`,
        color: line === '' ? COLORS.BACKGROUND : COLORS.TEXT_SECONDARY,
        align: 'center',
      });
      y += line === '' ? 10 : 35;
    }

    // Back instruction
    renderer.drawText('Press B to go back', cx, CANVAS.HEIGHT - 50, {
      font: `${FONTS.SIZE_SMALL} ${FONTS.FAMILY}`,
      color: COLORS.TEXT_PRIMARY,
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
      if (input.key === KEYS.BACK || input.key === 'b') {
        import('./MenuState.js').then(({ MenuState }) => {
          engine.stateManager.setState(new MenuState());
        });
      }
    }
  }
}
