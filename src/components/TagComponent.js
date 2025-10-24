/**
 * TagComponent - Entity tagging for identification
 */
export class TagComponent {
  type = 'tag';

  /**
   * @param {string} value - Tag value (e.g., 'ball', 'block', 'bonus', 'particle', 'wall')
   */
  constructor(value) {
    this.value = value;
  }

  /**
   * Check if tag matches
   * @param {string} tag
   * @returns {boolean}
   */
  is(tag) {
    return this.value === tag;
  }

  /**
   * Check if tag is one of multiple values
   * @param {...string} tags
   * @returns {boolean}
   */
  isOneOf(...tags) {
    return tags.includes(this.value);
  }

  /**
   * Set tag value
   * @param {string} value
   */
  set(value) {
    this.value = value;
  }
}
