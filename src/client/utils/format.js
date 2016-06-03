
/**
 * Format a number
 * @param {number} number
 * @param {number} decimals
 * @return {string}
 */
export default function format(number, decimals) {
  var str = number.toFixed(decimals)

  if (parseFloat(str) === 0) {
    // replace outputs like "-0" and "-0.00" with "0" and "0.00" respectively
    return (0).toFixed(decimals)
  }
  else {
    return str
  }
}
