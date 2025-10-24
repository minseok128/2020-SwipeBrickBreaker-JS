/**
 * InputManager - Input handling abstraction
 * Manages keyboard and mouse events
 */

export class InputManager {
  /**
   * @param {HTMLCanvasElement} canvas - Canvas element for mouse events
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.listeners = new Map();
    this.mousePosition = { x: 0, y: 0 };
    this.keysPressed = new Set();

    this.setupListeners();
  }

  /**
   * Setup event listeners
   */
  setupListeners() {
    // Keyboard events
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));

    // Mouse events
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));

    // Touch events (for mobile)
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
  }

  /**
   * Handle keydown event
   * @param {KeyboardEvent} e
   */
  handleKeyDown(e) {
    const key = e.key.toLowerCase();
    this.keysPressed.add(key);
    this.emit('keydown', key);
  }

  /**
   * Handle keyup event
   * @param {KeyboardEvent} e
   */
  handleKeyUp(e) {
    const key = e.key.toLowerCase();
    this.keysPressed.delete(key);
    this.emit('keyup', key);
  }

  /**
   * Handle mousedown event
   * @param {MouseEvent} e
   */
  handleMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.emit('mousedown', { x, y, button: e.button });
  }

  /**
   * Handle mouseup event
   * @param {MouseEvent} e
   */
  handleMouseUp(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.emit('mouseup', { x, y, button: e.button });
  }

  /**
   * Handle mousemove event
   * @param {MouseEvent} e
   */
  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mousePosition.x = e.clientX - rect.left;
    this.mousePosition.y = e.clientY - rect.top;

    this.emit('mousemove', this.mousePosition);
  }

  /**
   * Handle touchstart event
   * @param {TouchEvent} e
   */
  handleTouchStart(e) {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    this.emit('mousedown', { x, y, button: 0 });
  }

  /**
   * Handle touchend event
   * @param {TouchEvent} e
   */
  handleTouchEnd(e) {
    e.preventDefault();
    this.emit('mouseup', { x: this.mousePosition.x, y: this.mousePosition.y, button: 0 });
  }

  /**
   * Handle touchmove event
   * @param {TouchEvent} e
   */
  handleTouchMove(e) {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const touch = e.touches[0];
    this.mousePosition.x = touch.clientX - rect.left;
    this.mousePosition.y = touch.clientY - rect.top;

    this.emit('mousemove', this.mousePosition);
  }

  /**
   * Subscribe to an input event
   * @param {string} event - Event name
   * @param {Function} callback - Event handler
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    return () => this.off(event, callback);
  }

  /**
   * Unsubscribe from an input event
   * @param {string} event - Event name
   * @param {Function} callback - Event handler
   */
  off(event, callback) {
    if (!this.listeners.has(event)) return;

    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
  }

  /**
   * Emit an input event
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    if (!this.listeners.has(event)) return;

    const callbacks = this.listeners.get(event);
    callbacks.forEach(callback => callback(data));
  }

  /**
   * Check if a key is currently pressed
   * @param {string} key - Key to check
   * @returns {boolean}
   */
  isKeyPressed(key) {
    return this.keysPressed.has(key.toLowerCase());
  }

  /**
   * Get current mouse position
   * @returns {{x: number, y: number}}
   */
  getMousePosition() {
    return { ...this.mousePosition };
  }

  /**
   * Clean up event listeners
   */
  cleanup() {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('touchstart', this.handleTouchStart);
    this.canvas.removeEventListener('touchend', this.handleTouchEnd);
    this.canvas.removeEventListener('touchmove', this.handleTouchMove);

    this.listeners.clear();
  }
}
