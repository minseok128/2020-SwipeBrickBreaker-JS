/**
 * StateManager - Manages game state transitions
 */

export class StateManager {
  /**
   * @param {Engine} engine - Game engine
   */
  constructor(engine) {
    this.engine = engine;
    this.currentState = null;
    this.previousState = null;
  }

  /**
   * Initialize with starting state
   * @param {GameState} initialState
   */
  init(initialState) {
    if (initialState) {
      this.setState(initialState);
    }
  }

  /**
   * Change to new state
   * @param {GameState} newState
   */
  setState(newState) {
    // Exit current state
    if (this.currentState) {
      this.currentState.exit(this.engine);
      this.previousState = this.currentState;
    }

    // Enter new state
    this.currentState = newState;
    this.currentState.enter(this.engine);
  }

  /**
   * Revert to previous state
   */
  revertToPrevious() {
    if (this.previousState) {
      this.setState(this.previousState);
    }
  }

  /**
   * Update current state
   * @param {number} deltaTime
   */
  update(deltaTime) {
    if (this.currentState) {
      this.currentState.update(this.engine, deltaTime);
    }
  }

  /**
   * Render current state
   * @param {CanvasRenderer} renderer
   * @param {number} alpha
   */
  render(renderer, alpha) {
    if (this.currentState) {
      this.currentState.render(this.engine, renderer, alpha);
    }
  }

  /**
   * Handle input in current state
   * @param {Object} input
   */
  handleInput(input) {
    if (this.currentState) {
      this.currentState.handleInput(this.engine, input);
    }
  }

  /**
   * Cleanup
   */
  cleanup() {
    if (this.currentState) {
      this.currentState.cleanup();
    }
    this.currentState = null;
    this.previousState = null;
  }
}
