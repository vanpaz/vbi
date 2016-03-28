/**
 * Generate a human readable id with given number of characters
 * @param {number} [len=6]   An event number, for example 4, 6, 8, ...
 */
exports.getFriendlyId = function getFriendlyId(len) {
  var _len = len ? len : 6;
  var vowel = 'aeiou';
  var consonant = 'bcdfghjklmnpqrstvwxyz';
  var id = '';

  while (id.length < _len) {
    id += _randChar(consonant) + _randChar(vowel);
  }

  return id;
};

/**
 * Pick a random character from a string
 * @param {string} text
 * @return {string} a random character from the string
 * @private
 */
function _randChar(text) {
  return text[Math.floor(Math.random() * text.length)];
}