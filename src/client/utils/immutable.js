import Immutable from 'seamless-immutable'

/**
 * Append an item to an immutable Array
 * @param array
 * @param {*} item
 * @return
 */
export function appendItem(array, item) {
  return array.concat([item])
}

/**
 * Remove an item from an immutable Array
 * @param array
 * @param {number} index
 * @return
 */
export function removeItem(array, index) {
  return array.slice(0, index).concat(array.slice(index + 1))
}

/**
 * Replace an item in an immutable Array
 * @param array
 * @param {number} index
 * @param {*} newItem
 * @return
 */
export function replaceItem(array, index, newItem) {
  return array.slice(0, index).concat([newItem], array.slice(index + 1))
}

/**
 * Swap two items in an immutable Array
 * @param array
 * @param {number} index1
 * @param {number} index2
 * @return
 */
export function swapItems(array, index1, index2) {
  const firstIndex = Math.min(index1, index2)
  const lastIndex = Math.max(index1, index2)

  const firstItem = array[firstIndex]
  const lastItem = array[lastIndex]

  return Immutable([]).concat(
      array.slice(0, firstIndex),
      [lastItem],
      array.slice(firstIndex + 1, lastIndex),
      [firstItem],
      array.slice(lastIndex + 1)
  )
}
