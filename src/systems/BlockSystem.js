/**
 * BlockSystem - Block generation, shifting, game over detection
 * Priority: 40
 */

import { System } from '@core/System.js';
import { BlockFactory } from '@factories/BlockFactory.js';
import {
  GRID,
  CANVAS,
  BLOCK,
  STAGE_THRESHOLDS,
  DIFFICULTY_TABLES,
  BLOCK_TYPE,
} from '@config/constants.js';

export class BlockSystem extends System {
  constructor(world, eventBus) {
    super();
    this.requiredComponents = ['block'];
    this.priority = 40;
    this.world = world;
    this.eventBus = eventBus;
    this.currentLevel = 1;
    this.currentStage = 0;
  }

  /**
   * Initialize system
   * @param {Object} context
   */
  init(context) {
    super.init(context);
    this.entityManager = context.entityManager;
  }

  /**
   * Process block logic
   * @param {Entity[]} entities
   * @param {number} deltaTime
   */
  process(entities, deltaTime) {
    // Block logic is mostly event-driven
    // Check for game over condition
    this.checkGameOver(entities);
  }

  /**
   * Generate new row of blocks
   * @param {number} level - Current level
   */
  generateNewRow(level) {
    this.currentLevel = level;
    this.updateStage(level);

    const row = 0; // Always generate at top
    const health = this.calculateBlockHealth(level);

    // Determine block count (1-5 blocks randomly)
    const blockCount = Math.floor(Math.random() * 5) + 1;
    const positions = this.getRandomPositions(GRID.COLS, blockCount);

    // Determine if any block is bonus
    const bonusIndex = Math.random() < 0.15 ? Math.floor(Math.random() * blockCount) : -1;
    let bonusType = BLOCK_TYPE.BONUS_BALL;

    // Higher level bonus types
    if (level >= 11 && Math.random() < 0.3) {
      const types = [BLOCK_TYPE.BONUS_CROSS, BLOCK_TYPE.BONUS_HORIZONTAL, BLOCK_TYPE.BONUS_VERTICAL];
      bonusType = types[Math.floor(Math.random() * types.length)];
    }

    // Create blocks
    for (let i = 0; i < blockCount; i++) {
      const col = positions[i];

      if (i === bonusIndex) {
        // Create bonus block
        if (bonusType === BLOCK_TYPE.BONUS_BALL) {
          BlockFactory.createBonusBall(this.entityManager, this.world, col, row, health);
        } else {
          BlockFactory.createBonusPattern(
            this.entityManager,
            this.world,
            col,
            row,
            health,
            bonusType
          );
        }
      } else {
        // Create normal block
        BlockFactory.createNormal(this.entityManager, this.world, col, row, health);
      }
    }

    this.eventBus.emit('blocks:new_row', { level, health, count: blockCount });
  }

  /**
   * Shift all blocks down by one row
   * @returns {boolean} - True if any block reached bottom (game over)
   */
  shiftBlocksDown() {
    const blocks = this.entityManager.getEntitiesWithTag('block');
    let gameOver = false;

    for (const block of blocks) {
      const blockComp = block.getComponent('block');
      if (!blockComp) continue;

      // Check if block will reach bottom row
      if (blockComp.gridY >= GRID.ROWS - 1) {
        gameOver = true;
      }

      // Shift down
      BlockFactory.shiftDown(block);
    }

    this.eventBus.emit('blocks:shifted_down', { gameOver });

    return gameOver;
  }

  /**
   * Calculate block health based on level
   * @param {number} level
   * @returns {number}
   */
  calculateBlockHealth(level) {
    // Use difficulty tables
    const table = DIFFICULTY_TABLES[this.currentStage];
    if (!table) return level; // Fallback

    const index = Math.min(level - 1, table.length - 1);
    const multiplier = table[index];

    return level * multiplier;
  }

  /**
   * Update stage based on level
   * @param {number} level
   */
  updateStage(level) {
    for (let i = STAGE_THRESHOLDS.length - 1; i >= 0; i--) {
      if (level >= STAGE_THRESHOLDS[i]) {
        this.currentStage = i + 1;
        return;
      }
    }
    this.currentStage = 0;
  }

  /**
   * Get random column positions
   * @param {number} totalCols
   * @param {number} count
   * @returns {number[]}
   */
  getRandomPositions(totalCols, count) {
    const positions = [];
    const available = Array.from({ length: totalCols }, (_, i) => i);

    for (let i = 0; i < count; i++) {
      const index = Math.floor(Math.random() * available.length);
      positions.push(available[index]);
      available.splice(index, 1);
    }

    return positions.sort((a, b) => a - b);
  }

  /**
   * Check game over condition
   * @param {Entity[]} blocks
   */
  checkGameOver(blocks) {
    for (const block of blocks) {
      const blockComp = block.getComponent('block');
      if (!blockComp) continue;

      // Check if any block reached bottom row
      if (blockComp.gridY >= GRID.ROWS - 1) {
        this.eventBus.emit('game:over', { reason: 'blocks_reached_bottom' });
        return;
      }
    }
  }

  /**
   * Clear all blocks
   */
  clearAllBlocks() {
    const blocks = this.entityManager.getEntitiesWithTag('block');

    for (const block of blocks) {
      const bodyComp = block.getComponent('body');
      if (bodyComp?.body) {
        this.world.destroyBody(bodyComp.body);
        bodyComp.body = null;
      }
      block.destroy();
    }

    this.entityManager.cleanup();
  }

  /**
   * Reset system
   */
  reset() {
    this.currentLevel = 1;
    this.currentStage = 0;
    this.clearAllBlocks();
  }

  /**
   * Cleanup
   */
  cleanup() {
    this.clearAllBlocks();
  }
}
