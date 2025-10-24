/**
 * Game Constants
 * All magic numbers are defined here for maintainability
 */

export const CANVAS = {
  WIDTH: 600,
  HEIGHT: 700,
};

export const GRID = {
  COLS: 6,
  ROWS: 13,
  CELL_WIDTH: 100,
  CELL_HEIGHT: 50,
};

export const BALL = {
  RADIUS: 11,
  INITIAL_SPEED: 3.5,
  LAUNCH_DELAY_FRAMES: 6,
  COLOR: '#fdd700',
  MIN_LAUNCH_ANGLE: 0.17, // radians (~10°)
  MAX_LAUNCH_ANGLE: 2.96, // radians (~170°)
};

export const BLOCK = {
  WIDTH: 100,
  HEIGHT: 50,
  PADDING: 2,
  BORDER_RADIUS: 5,
  COLOR: '#ff384e',
  OPACITY_MIN: 0.1,
  OPACITY_MAX: 0.9,
};

export const BONUS = {
  COLOR: '#32b16c',
  AURA_COLOR: '#fdd700',
  RADIUS: 10,
  HEALTH_MULTIPLIER: 1.5,
};

export const PHYSICS = {
  GRAVITY: 0.05,
  FRICTION: 0.99,
  SCALE: 100, // pixels to meters conversion for Box2D
};

export const PARTICLE = {
  MAX_COUNT: 200,
  SIZE: 6,
  EXPLOSION_POWER: 20,
  OPACITY_DECAY: 0.004,
  AURA_OPACITY_DECAY: 0.007,
  AURA_EXPANSION_SPEED: 50,
};

export const ANIMATION = {
  TARGET_FPS: 60,
  FRAME_TIME: 1000 / 60,
};

export const GAME_STATE = {
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'game_over',
  MANUAL: 'manual',
};

export const BALL_STATE = {
  INACTIVE: 'inactive',
  WAITING: 'waiting',
  ACTIVE: 'active',
  LANDED: 'landed',
};

export const BLOCK_TYPE = {
  NORMAL: 'normal',
  BONUS_BALL: 'bonus_ball',
  BONUS_CROSS: 'bonus_cross',
  BONUS_HORIZONTAL: 'bonus_horizontal',
  BONUS_VERTICAL: 'bonus_vertical',
};

export const KEYS = {
  RESTART: 'r',
  DEBUG: 'd',
  KILL_BALLS: 'k',
  INIT: 'i',
  MANUAL: 'm',
  BACK: 'b',
};

export const STORAGE_KEYS = {
  LEADERBOARD: 'sbb_leaderboard_v2',
  SETTINGS: 'sbb_settings_v2',
};

export const STAGE_THRESHOLDS = [11, 31, 61, 101, 201, 301];

export const DIFFICULTY_TABLES = [
  [1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4],
  [1, 1, 1, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5],
  [1, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
  [1, 2, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
  [1, 2, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
  [1, 2, 3, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
  [1, 2, 3, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
];

export const COLORS = {
  BACKGROUND: '#161e38',
  BALL: '#fdd700',
  BLOCK: '#ff384e',
  BONUS: '#32b16c',
  BONUS_GLOW: '#fdd700',
  TEXT_PRIMARY: '#fdd700',
  TEXT_SECONDARY: '#ffffff',
  SHADOW: '#f384ae',
};

export const FONTS = {
  FAMILY: 'BM YEONSUNG OTF',
  SIZE_HUGE: '100px',
  SIZE_LARGE: '40px',
  SIZE_MEDIUM: '25px',
  SIZE_SMALL: '20px',
  SIZE_TINY: '15px',
};
