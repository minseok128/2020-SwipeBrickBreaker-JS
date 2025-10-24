/**
 * Collision and Render Layer Definitions
 * Using bitmask for efficient collision filtering
 */

export const COLLISION_LAYERS = {
  NONE: 0,
  BALL: 1 << 0, // 0001 = 1
  BLOCK: 1 << 1, // 0010 = 2
  BONUS: 1 << 2, // 0100 = 4
  WALL: 1 << 3, // 1000 = 8
  ALL: 0xffff,
};

export const RENDER_LAYERS = {
  BACKGROUND: 0,
  BLOCKS: 1,
  BALLS: 2,
  PARTICLES: 3,
  UI: 4,
};
