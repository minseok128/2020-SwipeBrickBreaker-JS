/**
 * Game Configuration
 * Combines all constants for easy access
 */

import * as CONSTANTS from './constants.js';
import * as LAYERS from './layers.js';

export const CONFIG = {
  ...CONSTANTS,
  ...LAYERS,
};

export default CONFIG;
