/**
 * MenuState - Main menu screen
 */

import { GameState } from '../GameState.js';
import { KEYS, COLORS, FONTS, CANVAS } from '@config/constants.js';

export class MenuState extends GameState {
  constructor() {
    super('menu');
    this.time = 0;
    this.fontSize = 25;
  }

  /**
   * Enter menu state
   * @param {Engine} engine
   */
  enter(engine) {
    super.enter(engine);
    this.time = 0;
  }

  /**
   * Update menu (animate text)
   * @param {Engine} engine
   * @param {number} deltaTime
   */
  update(engine, deltaTime) {
    this.time += deltaTime;

    // Animate font size
    this.fontSize = 25 + Math.sin(this.time / 200) * 2;
  }

  /**
   * Render menu
   * @param {Engine} engine
   * @param {CanvasRenderer} renderer
   * @param {number} alpha
   */
  render(engine, renderer, alpha) {
    const cx = CANVAS.WIDTH / 2;

    // Title
    renderer.drawText('Swipe Brick Breaker', cx, 200, {
      font: `${FONTS.SIZE_HUGE} ${FONTS.FAMILY}`,
      color: COLORS.TEXT_PRIMARY,
      align: 'center',
    });

    // Subtitle
    renderer.drawText('2.0', cx, 280, {
      font: `${FONTS.SIZE_LARGE} ${FONTS.FAMILY}`,
      color: COLORS.TEXT_SECONDARY,
      align: 'center',
    });

    // Instructions (animated)
    renderer.drawText('Press R to Start', cx, 400, {
      font: `${this.fontSize}px ${FONTS.FAMILY}`,
      color: COLORS.TEXT_PRIMARY,
      align: 'center',
    });

    renderer.drawText('Press M for Manual', cx, 450, {
      font: `${FONTS.SIZE_SMALL} ${FONTS.FAMILY}`,
      color: COLORS.TEXT_SECONDARY,
      align: 'center',
    });

    // Credits
    renderer.drawText('Refactored with Clean Architecture + ECS + Box2D', cx, 600, {
      font: `${FONTS.SIZE_TINY} ${FONTS.FAMILY}`,
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
      if (input.key === KEYS.RESTART || input.key === 'r') {
        // Import PlayState dynamically to avoid circular dependency
        import('./PlayState.js').then(({ PlayState }) => {
          engine.stateManager.setState(new PlayState());
        });
      } else if (input.key === KEYS.MANUAL || input.key === 'm') {
        import('./ManualState.js').then(({ ManualState }) => {
          engine.stateManager.setState(new ManualState());
        });
      }
    }
  }
}
