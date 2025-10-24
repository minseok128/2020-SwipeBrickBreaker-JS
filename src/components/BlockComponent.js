import { BLOCK_TYPE } from '@config/constants.js';

/**
 * BlockComponent - Block-specific data
 */
export class BlockComponent {
  type = 'block';

  /**
   * @param {string} blockType - Block type ('normal' | 'bonus_ball' | 'bonus_cross' | etc.)
   * @param {number} gridX - Grid column index
   * @param {number} gridY - Grid row index
   */
  constructor(blockType = BLOCK_TYPE.NORMAL, gridX = 0, gridY = 0) {
    this.blockType = blockType;
    this.gridX = gridX;
    this.gridY = gridY;
  }

  /**
   * Check if normal block
   * @returns {boolean}
   */
  isNormal() {
    return this.blockType === BLOCK_TYPE.NORMAL;
  }

  /**
   * Check if bonus block
   * @returns {boolean}
   */
  isBonus() {
    return this.blockType !== BLOCK_TYPE.NORMAL;
  }

  /**
   * Check if bonus ball block
   * @returns {boolean}
   */
  isBonusBall() {
    return this.blockType === BLOCK_TYPE.BONUS_BALL;
  }

  /**
   * Check if cross bonus
   * @returns {boolean}
   */
  isCross() {
    return this.blockType === BLOCK_TYPE.BONUS_CROSS;
  }

  /**
   * Check if horizontal bonus
   * @returns {boolean}
   */
  isHorizontal() {
    return this.blockType === BLOCK_TYPE.BONUS_HORIZONTAL;
  }

  /**
   * Check if vertical bonus
   * @returns {boolean}
   */
  isVertical() {
    return this.blockType === BLOCK_TYPE.BONUS_VERTICAL;
  }

  /**
   * Get grid position
   * @returns {{x: number, y: number}}
   */
  getGridPosition() {
    return { x: this.gridX, y: this.gridY };
  }

  /**
   * Set grid position
   * @param {number} x
   * @param {number} y
   */
  setGridPosition(x, y) {
    this.gridX = x;
    this.gridY = y;
  }

  /**
   * Shift down by one row
   */
  shiftDown() {
    this.gridY += 1;
  }
}
