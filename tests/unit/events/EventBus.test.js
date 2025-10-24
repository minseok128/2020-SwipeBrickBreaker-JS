import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventBus } from '../../../src/events/EventBus.js';

describe('EventBus', () => {
  let eventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  it('should subscribe to events', () => {
    const callback = vi.fn();
    eventBus.on('test', callback);

    eventBus.emit('test', { data: 'value' });

    expect(callback).toHaveBeenCalledWith({ data: 'value' });
  });

  it('should unsubscribe from events', () => {
    const callback = vi.fn();
    eventBus.on('test', callback);

    eventBus.off('test', callback);
    eventBus.emit('test', {});

    expect(callback).not.toHaveBeenCalled();
  });

  it('should return unsubscribe function', () => {
    const callback = vi.fn();
    const unsubscribe = eventBus.on('test', callback);

    unsubscribe();
    eventBus.emit('test', {});

    expect(callback).not.toHaveBeenCalled();
  });

  it('should support multiple listeners', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    eventBus.on('test', callback1);
    eventBus.on('test', callback2);

    eventBus.emit('test', { data: 'value' });

    expect(callback1).toHaveBeenCalled();
    expect(callback2).toHaveBeenCalled();
  });

  it('should support context binding', () => {
    const context = { value: 42 };
    let receivedContext;

    const callback = function (data) {
      receivedContext = this;
    };

    eventBus.on('test', callback, context);
    eventBus.emit('test', {});

    expect(receivedContext).toBe(context);
  });

  it('should support once subscription', () => {
    const callback = vi.fn();

    eventBus.once('test', callback);

    eventBus.emit('test', {});
    eventBus.emit('test', {});

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should clear specific event listeners', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    eventBus.on('test1', callback1);
    eventBus.on('test2', callback2);

    eventBus.clear('test1');

    eventBus.emit('test1', {});
    eventBus.emit('test2', {});

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalled();
  });

  it('should clear all event listeners', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    eventBus.on('test1', callback1);
    eventBus.on('test2', callback2);

    eventBus.clear();

    eventBus.emit('test1', {});
    eventBus.emit('test2', {});

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();
  });

  it('should handle non-existent events gracefully', () => {
    expect(() => {
      eventBus.emit('nonexistent', {});
      eventBus.off('nonexistent', () => {});
    }).not.toThrow();
  });
});
