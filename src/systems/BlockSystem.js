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
    this.randomArray = DIFFICULTY_TABLES[0]; // Start with stage 0
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

    // Determine block count based on difficulty table (legacy logic)
    const difficultyIndex = Math.floor(Math.random() * 21); // 0-20
    const blockCount = this.randomArray[difficultyIndex] + 1;
    const positions = this.getRandomPositions(GRID.COLS, blockCount);

    // ALWAYS create exactly ONE bonus block per round (legacy logic)
    const bonusIndex = Math.floor(Math.random() * blockCount);
    let bonusType = BLOCK_TYPE.BONUS_BALL;

    // Special bonus types ONLY on levels that are multiples of 10 (legacy: level % 10 == 0)
    if (level % 10 === 0) {
      const types = [BLOCK_TYPE.BONUS_CROSS, BLOCK_TYPE.BONUS_HORIZONTAL, BLOCK_TYPE.BONUS_VERTICAL];
      bonusType = types[Math.floor(Math.random() * types.length)];
    }

    // Create blocks
    for (let i = 0; i < blockCount; i++) {
      const col = positions[i];

      if (i === bonusIndex) {
        // Create bonus block
        if (bonusType === BLOCK_TYPE.BONUS_BALL) {
          // Legacy: Bonus ball has no health, just a static collectible
          BlockFactory.createBonusBall(this.entityManager, this.world, col, row);
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
   * Legacy: Bonus items also shift down with blocks
   * @returns {boolean} - True if any block reached bottom (game over)
   */
  shiftBlocksDown() {
    // Only get ACTIVE blocks (visible on screen)
    const allBlocks = this.entityManager.getEntitiesWithTag('block');
    const blocks = allBlocks.filter(b => b.active);
    const bonuses = this.entityManager.getEntitiesWithTag('bonus');
    let gameOver = false;

    // Count blocks by row and check for game over
    // Note: blocks array already filtered to active only
    for (const block of blocks) {
      const blockComp = block.getComponent('block');
      if (!blockComp) continue;

      // Check if block will go BEYOND the screen after shifting
      // If current gridY is at the last row (12), shifting would move it off-screen (13)
      if (blockComp.gridY >= GRID.ROWS - 1) {
        gameOver = true;
      }

      // Shift down
      BlockFactory.shiftDown(block);
    }

    // Shift bonus items down (legacy behavior)
    for (const bonus of bonuses) {
      const blockComp = bonus.getComponent('block');
      if (!blockComp) continue;

      // Check if bonus reached bottom row (collect it)
      if (blockComp.gridY >= GRID.ROWS - 1) {
        this.collectBonus(bonus);
      } else {
        // Shift down
        BlockFactory.shiftDown(bonus);
      }
    }

    this.eventBus.emit('blocks:shifted_down', { gameOver });

    return gameOver;
  }

  /**
   * Collect bonus at bottom row (legacy behavior)
   * @param {Entity} bonus
   */
  collectBonus(bonus) {
    const bonusComp = bonus.getComponent('bonus');
    if (!bonusComp || bonusComp.isCollected()) return;

    // Mark as collected
    bonusComp.collect();

    // Emit collection event
    this.eventBus.emit('bonus:collected', {
      bonusType: bonusComp.bonusType,
      value: bonusComp.getValue(),
    });

    // Remove bonus entity
    bonus.destroy();
  }

  /**
   * Calculate block health based on level
   * Legacy: Block health equals game level directly
   * @param {number} level
   * @returns {number}
   */
  calculateBlockHealth(level) {
    // Legacy behavior: block health = game level
    return level;
  }

  /**
   * Update stage based on level
   * @param {number} level
   */
  updateStage(level) {
    for (let i = STAGE_THRESHOLDS.length - 1; i >= 0; i--) {
      if (level >= STAGE_THRESHOLDS[i]) {
        this.currentStage = i + 1;
        this.randomArray = DIFFICULTY_TABLES[this.currentStage]; // Update difficulty table
        return;
      }
    }
    this.currentStage = 0;
    this.randomArray = DIFFICULTY_TABLES[0]; // Reset to stage 0
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
      // Skip destroyed blocks (active=false, pending cleanup)
      if (!block.active) continue;

      const blockComp = block.getComponent('block');
      if (!blockComp) continue;

      // Check if any block went BEYOND the bottom row (screen boundary)
      // GRID.ROWS = 13, so valid rows are 0-12
      // Game over when gridY > 12 (trying to go to row 13, which is off-screen)
      if (blockComp.gridY > GRID.ROWS - 1) {
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

    // Force cleanup to remove inactive entities
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
