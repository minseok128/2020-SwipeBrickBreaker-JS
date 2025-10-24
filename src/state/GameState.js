/**
 * GameState - Abstract base class for game states
 * Implements the State Pattern
 */

export class GameState {
  /**
   * @param {string} name - State name
   */
  constructor(name) {
    this.name = name;
  }

  /**
   * Called when entering this state
   * @param {Engine} engine - Game engine
   */
  enter(engine) {
    console.log(`Entering ${this.name} state`);
  }

  /**
   * Called when exiting this state
   * @param {Engine} engine - Game engine
   */
  exit(engine) {
    console.log(`Exiting ${this.name} state`);
  }

  /**
   * Update state logic
   * @param {Engine} engine
   * @param {number} deltaTime
   */
  update(engine, deltaTime) {
    // Override in subclass
  }

  /**
   * Render state
   * @param {Engine} engine
   * @param {CanvasRenderer} renderer
   * @param {number} alpha - Interpolation factor
   */
  render(engine, renderer, alpha) {
    // Override in subclass
  }

  /**
   * Handle input
   * @param {Engine} engine
   * @param {Object} input - Input event {type, key, x, y}
   */
  handleInput(engine, input) {
    // Override in subclass
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    // Override if needed
  }
}
