/**
 * EventBus - Pub/Sub event system
 * Decouples components through events
 */
export class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Event handler
   * @param {Object} context - Callback context (this)
   * @returns {Function} Unsubscribe function
   */
  on(event, callback, context = null) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    this.listeners.get(event).push({ callback, context });

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function} callback - Event handler
   */
  off(event, callback) {
    if (!this.listeners.has(event)) return;

    const listeners = this.listeners.get(event);
    const index = listeners.findIndex(l => l.callback === callback);

    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    if (!this.listeners.has(event)) return;

    const listeners = this.listeners.get(event);
    listeners.forEach(({ callback, context }) => {
      if (context) {
        callback.call(context, data);
      } else {
        callback(data);
      }
    });
  }

  /**
   * Subscribe to an event once
   * @param {string} event - Event name
   * @param {Function} callback - Event handler
   * @param {Object} context - Callback context
   */
  once(event, callback, context = null) {
    const wrapper = data => {
      callback.call(context, data);
      this.off(event, wrapper);
    };
    this.on(event, wrapper, context);
  }

  /**
   * Remove all listeners for an event
   * @param {string} event - Event name (optional, clears all if not specified)
   */
  clear(event) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}
