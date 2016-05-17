
/**
 * Append an item to an immutable Array
 * @param array
 * @param {*} item
 * @return
 */
export function appendItem(array, item) {
  return array.concat(Immutable([item]));
}

/**
 * Remove an item from an immutable Array
 * @param array
 * @param {number} index
 * @return
 */
export function removeItem(array, index) {
  return array.slice(0, index).concat(array.slice(index + 1));
}
