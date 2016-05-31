
/**
 * Create a object containing given properties with a default value.
 *
 * For example:
 *
 *     initProps(['2016', '2017', '2018'], 0)
 *
 *     // output: {'2016': 0, '2017': 0, '2018': 0}
 *
 * @param {Array.<string | number>} properties
 * @param {* | function (prop) } [defaultValue=0]
 * @return {Object} Returns the created object
 */
export function initProps (properties, defaultValue = 0) {
  const obj = {}

  properties.forEach(prop => {
    obj[prop] = (typeof defaultValue === 'function')
        ? defaultValue(prop)
        : defaultValue
  })

  return obj
}

/**
 * Merge objects given a callback function which is invoked on pairs of property
 * values of the objects.
 * @param {Array.<Object>} objects
 * @param {function} callback
 * @param {Array.<string>} [keys]
 * @return {object}
 */
export function zipObjectsWith (objects, callback, keys = null) {
  const result = {}
  const _keys = keys || (objects && objects[0] && Object.keys(objects[0])) || []

  _keys.forEach(key => {
    result[key] = callback.apply(null, objects.map(object => object[key]))
  })

  return result
}

/**
 * Create a object containing given properties with a default value.
 *
 * For example:
 *
 *     mapProps({a: 2, b: 3}, x => x * x)
 *     // output: {a: 4, b: 6}
 *
 * @param {Object} object
 * @param {function (value: *, property: string, object: Object) } callback
 * @return {Object} Returns the mapped object
 */
export function mapProps (object, callback) {
  const result = {}

  Object.keys(object).forEach(prop => result[prop] = callback(object[prop], prop, object))

  return result
}

/**
 * For each property, add the property values of two objects.
 *
 * For example:
 *
 *     addProps({a: 2, b: 3}, {a: 4, b: 5}) // returns {a: 6, b: 8}
 *
 * @param {Object.<string, number>} a
 * @param {Object.<string, number>} b
 * @return {Object.<string, number>}
 */
export function addProps (a, b) {
  const c = {}

  Object.keys(a).forEach(prop => c[prop] = a[prop] + b[prop])

  return c
}

/**
 * Negate the value of each property of provided object
 *
 * For example:
 *
 *     negateProps({a: 2, b: 3}) // returns {a: -2, b: -3}
 *
 * @param {Object.<string, number>} object
 * @return {Object.<string, number>}
 */
export function negateProps (object) {
  const negated = {}

  Object.keys(object).forEach(prop => negated[prop] = -object[prop])

  return negated
}

/**
 * Calculate the difference between (ordered) keys of an object
 *
 * For example:
 *
 *     diffProps({'2016': 5, '2017': 6, '2018': 9})
 *     // returns {'2016': 5, '2017': 1, '2018': 3}
 *
 * @param {Object.<string, number>} object
 * @return {Object.<string, number>}
 */
export function diffProps (object) {
  const diff = {}
  const props = Object.keys(object).sort()

  props.forEach((prop, index) => {
    diff[prop] = (object[prop] || 0) - (object[props[index - 1]] || 0)
  })

  return diff
}

/**
 * Calculate the cumulative of (ordered) keys of an object
 *
 * For example:
 *
 *     accumulateProps({'2016': 5, '2017': 6, '2018': 9})
 *     // returns {'2016': 5, '2017': 11, '2018': 20}
 *
 * @param {Object.<string, number>} object
 * @return {Object.<string, number>}
 */
export function accumulateProps (object) {
  const accumulated = {}
  const props = Object.keys(object).sort()
  let total = 0

  props.forEach(prop => {
    total += (object[prop] || 0)
    accumulated[prop] = total
  })

  return accumulated
}

/**
 * For each property, subtract the property values of two objects.
 *
 * For example:
 *
 *     subtractProps({a: 4, b: 5}, {a: 1, b: 4}) // returns {a: 3, b: 1}
 *
 * @param {Object.<string, number>} a
 * @param {Object.<string, number>} b
 * @return {Object.<string, number>}
 */
export function subtractProps (a, b) {
  const c = {}

  Object.keys(a).forEach(prop => c[prop] = a[prop] - b[prop])

  return c
}

/**
 * For each property, subtract the property values of two objects.
 *
 * For example:
 *
 *     multiplyPropsWith({a: 4, b: 5}, 2) // returns {a: 8, b: 10}
 *
 * @param {Object.<string, number>} object
 * @param {Object.<string, number>} value
 * @return {Object.<string, number>}
 */
export function multiplyPropsWith (object, value) {
  const result = {}

  Object.keys(object).forEach(prop => result[prop] = value * object[prop])

  return result
}

/**
 * For calculate the sum of all properties for each property on the objects
 *
 * For example:
 *
 *     sumProps([{a: 2, b: 3}, {a: 4, b: 5}, {a: 1, b: 1}]) // returns {a: 7, b: 9}
 *
 * @param {Array.<Object.<string, number>>} objects
 * @return {Object.<string, number>}
 */
export function sumProps (objects) {
  const props = Object.keys(objects[0])
  const sum = initProps(props)

  objects.forEach(object => {
    props.forEach(prop => sum[prop] += object[prop])
  })

  return sum
}

/**
 * For each property, calculate the average of all property of provided objects.
 *
 * @param {Array.<Object.<string, number>>} objects
 * @return {Object.<string, number>}
 */
export function avgProps (objects) {
  return multiplyPropsWith(sumProps(objects), 1 / objects.length)
}

/**
 * Find a nested property value from an object
 * @param {Object} object
 * @param {string[]} path
 * @return {*}
 */
export function getProp (object, path) {
  let prop = object

  path.forEach(key => prop = prop[key])

  return prop
}

/**
 * Calculate the average of all objects property values
 * @param {Object} object
 * @return {number}
 */
export function avg (object) {
  function add (a, b) {
    return a + b
  }

  const props = Object.keys(object)
  const total = props.map(prop => object[prop]).reduce(add, 0)
  return total / props.length
}