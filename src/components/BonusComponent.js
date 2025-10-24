/**
 * BonusComponent - Bonus item data (falling bonus)
 */
export class BonusComponent {
  type = 'bonus';

  /**
   * @param {string} bonusType - Type of bonus ('extra_ball')
   * @param {number} value - Bonus value (number of extra balls)
   */
  constructor(bonusType = 'extra_ball', value = 1) {
    this.bonusType = bonusType;
    this.value = value;
    this.collected = false;
  }

  /**
   * Check if extra ball bonus
   * @returns {boolean}
   */
  isExtraBall() {
    return this.bonusType === 'extra_ball';
  }

  /**
   * Mark as collected
   */
  collect() {
    this.collected = true;
  }

  /**
   * Check if collected
   * @returns {boolean}
   */
  isCollected() {
    return this.collected;
  }

  /**
   * Get bonus value
   * @returns {number}
   */
  getValue() {
    return this.value;
  }
}
