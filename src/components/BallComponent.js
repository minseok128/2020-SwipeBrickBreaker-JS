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
  }
}
