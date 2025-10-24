import { BALL_STATE } from '@config/constants.js';

/**
 * BallComponent - Ball-specific data
 */
export class BallComponent {
  type = 'ball';

  /**
   * @param {number} id - Ball ID (for delay spawning)
   */
  constructor(id = 0) {
    this.id = id;
    this.state = BALL_STATE.INACTIVE;
    this.launchTime = 0;
    this.hasLanded = false;
    // Store launch parameters for delayed spawning
    this.launchAngle = 0;
    this.launchSpeed = 0;
  }

  /**
   * Check if inactive
   * @returns {boolean}
   */
  isInactive() {
    return this.state === BALL_STATE.INACTIVE;
  }

  /**
   * Check if waiting to launch
   * @returns {boolean}
   */
  isWaiting() {
    return this.state === BALL_STATE.WAITING;
  }

  /**
   * Check if active (moving)
   * @returns {boolean}
   */
  isActive() {
    return this.state === BALL_STATE.ACTIVE;
  }

  /**
   * Check if landed
   * @returns {boolean}
   */
  isLanded() {
    return this.state === BALL_STATE.LANDED;
  }

  /**
   * Set state
   * @param {string} state
   */
  setState(state) {
    this.state = state;
  }

  /**
   * Set launch time
   * @param {number} time - Game time when ball was launched
   */
  setLaunchTime(time) {
    this.launchTime = time;
  }

  /**
   * Set launch parameters (angle and speed for delayed launch)
   * @param {number} angle - Angle in radians
   * @param {number} speed - Speed magnitude
   */
  setLaunchParams(angle, speed) {
    this.launchAngle = angle;
    this.launchSpeed = speed;
  }

  /**
   * Get launch parameters
   * @returns {{angle: number, speed: number}}
   */
  getLaunchParams() {
    return {
      angle: this.launchAngle,
      speed: this.launchSpeed,
    };
  }

  /**
   * Check if ready to launch based on delay
   * @param {number} currentTime - Current game time
   * @param {number} launchDelay - Delay per ball (frames)
   * @returns {boolean}
   */
  isReadyToLaunch(currentTime, launchDelay = 6) {
    return currentTime - this.launchTime >= launchDelay * this.id;
  }

  /**
   * Reset ball state
   */
  reset() {
    this.state = BALL_STATE.INACTIVE;
    this.launchTime = 0;
    this.hasLanded = false;
    this.launchAngle = 0;
    this.launchSpeed = 0;
  }
}
