
/**
 * Format a number
 * @param {number} number
 * @param {number} decimals
 * @return {string}
 */
export function format(number, decimals) {
  var str = number.toFixed(decimals)

  if (parseFloat(str) === 0) {
    // replace outputs like "-0" and "-0.00" with "0" and "0.00" respectively
    return (0).toFixed(decimals)
  }
  else {
    return str
  }
}

export const numberRegExp = /^([+-]?[0-9]+[.]?[0-9]*)([kMBT])?$/
export const percentageRegExp = /^([+-]?[0-9]+[.]?[0-9]*)%$/

/**
 * Parse a string into a number. Examples:
 *
 *     parseValue('23')    // 23
 *     parseValue('15k')   // 15000
 *     parseValue('2M')    // 2000000
 *     parseValue('6B')    // 6000000000
 *     parseValue('10%')   // 0.1
 *     parseValue('+5%')   // 0.05
 *     parseValue('-2.5%') // -0.025
 *
 * @param {string} value
 * @return {number} The numeric value of the value.
 *                  Return 0 when the string does not contain a valid value
 */
export function parseValue (value) {
  // parse a number
  const matchNumber = numberRegExp.exec(value)
  if (matchNumber) {
    let suffixes = {
      'undefined': 1,
      k: 1e3,
      M: 1e6,
      B: 1e9,
      T: 1e12
    }

    if (matchNumber[2] && (!(matchNumber[2] in suffixes))) {
      throw new Error('Invalid value "' + value + '"')
    }

    return parseFloat(matchNumber[1]) * suffixes[matchNumber[2]]
  }

  let matchPercentage = percentageRegExp.exec(value)
  if (matchPercentage) {
    return parseFloat(matchPercentage[1]) / 100
  }

  return 0
}

/**
 * Format a price like "12k". The value is rounded to zero digits,
 * and when a multiple of thousands, millions, or billions,
 * it's suffixed with "k", "m", "b". Examples:
 *
 *    formatPrice(12.05)      // "12"
 *    formatPrice(12.75)      // "13"
 *    formatPrice(15000)      // "15.0k"
 *    formatPrice(2340000)    // "2.3M"
 *    formatPrice(6000000000) // "6B"
 *
 * @param {number} price
 * @return {string} Returns the formatted price
 */
export function formatValueWithUnit (price) {
  if (Math.abs(price) > 1e13) { return (price / 1e12).toFixed() + 'T' }
  if (Math.abs(price) > 1e12) { return (price / 1e12).toFixed(1) + 'T' }

  if (Math.abs(price) > 1e10) { return (price / 1e9).toFixed() + 'B' }
  if (Math.abs(price) > 1e9)  { return (price / 1e9).toFixed(1) + 'B' }

  if (Math.abs(price) > 1e7)  { return (price / 1e6).toFixed() + 'M' }
  if (Math.abs(price) > 1e6)  { return (price / 1e6).toFixed(1) + 'M' }

  if (Math.abs(price) > 1e4)  { return (price / 1e3).toFixed() + 'k' }
  if (Math.abs(price) > 1e3)  { return (price / 1e3).toFixed(1) + 'k' }

  return price.toFixed()
}

/**
 * Normalize a string containing a value by multiplying it with the magnitude.
 *
 * A trailing decimal separator (.) are kept to allow people enter decimal
 * numbers, where the number is internally normalized and denormalized again
 * whilst typing.
 *
 * For example:
 *
 *     normalize('10', 1000)    // returns '10000'
 *     normalize('10.', 1000)    // returns '10000.'
 *     normalize('10.2', 1000)    // returns '10200'
 *
 * @param {string} valueStr
 * @param {number} magnitude
 * @return {string}
 */
export function normalize (valueStr, magnitude) {
  return String(parseValue(valueStr) * magnitude + (/\.$/.test(valueStr) ? '.' : ''))
}

/**
 * Normalize a string containing a value by multiplying it with the magnitude
 *
 * A trailing decimal separator (.) are kept to allow people enter decimal
 * numbers, where the number is internally normalized and denormalized again
 * whilst typing.
 *
 * For example:
 *
 *     denormalize('10000', 1000)    // returns '10'
 *     denormalize('10000.', 1000)   // returns '10.'
 *     denormalize('10200', 1000)    // returns '10.2'
 *
 * @param {string} valueStr
 * @param {number} magnitude
 * @return {string}
 */
export function denormalize (valueStr, magnitude) {
  return parseValue(valueStr) / magnitude + (/\.$/.test(valueStr) ? '.' : '')
}
