import { uniq, flatMap, unzipWith, clone } from 'lodash';
import debugFactory from 'debug/browser';

const debug = debugFactory('vbi:formulas');

/**
 * Extract all unique categories defined in the items. The returned categories
 * are sorted alphabetically.
 * @param items
 * @return {Array.<string>}
 */
export function getCategories (items) {
  let categories = items
      .map(item => item.category)
      .filter(category => category != undefined);  // not undefined or null

  return uniq(categories).sort(); // dedupe and sort
}

/**
 * Find the quantity for a certain period
 * @param item
 * @param {string} period
 * @return {{period: string, quantity: number}} Returns an object with quantity 0 if not found
 */
export function findQuantity (item, period) {
  return item.quantities[period] !== undefined
      ? item.quantities[period]
      : '0';
}

/**
 * Calculate actual prices for all periods configured for a single item.
 * @param item
 * @param {Array.<string>} periods
 * @param {Array.<{category: string, totals: Object.<string, number>}>} revenueTotals
 *                                   Totals of the revenues per category,
 *                                   needed to calculate prices based on a
 *                                   percentage of the total revenues or some
 *                                   categories.
 * @return {Object.<string, number>} Returns an object with periods as key
 *                                   and prices as value
 */
export function calculatePrices (item, periods, revenueTotals) {
  var type = types[item.price.type];

  if (!type) {
    throw new Error('Unknown item price type ' + JSON.stringify(item.price.type) + ' ' +
        'in item ' + JSON.stringify(item) + '. ' +
        'Choose from: ' + Object.keys(types).join(','));
  }

  return type.calculatePrices(item, periods, revenueTotals);
}

/**
 * A map with functions to calculate the price for a specific price type
 */
export let types = {
  constant: {
    /**
     * Calculate actual prices for all periods configured for a single item.
     * @param item
     * @param {Array.<string>} periods
     * @return {Object.<string, number>} Returns an object with periods as key
     *                                   and prices as value
     */
    calculatePrices: function (item, periods) {
      let initialPrice = parsePrice(item.price.value);
      let change = 1 + parsePercentage(item.price.change);

      return periods.reduce((prices, period, periodIndex) => {
        let quantity = findQuantity(item, period);

        if (item.price.value != undefined && item.price.change != undefined) {
          prices[period] = initialPrice * quantity * Math.pow(change, periodIndex);
        }
        else {
          prices[period] = 0;
        }

        return prices;
      }, {});
    }
  },

  manual: {
    /**
     * Calculate actual prices for all periods configured for a single item.
     * @param item
     * @param {Array.<string>} periods
     * @return {Object.<string, number>} Returns an object with periods as key
     *                                   and prices as value
     */
    calculatePrices: function (item, periods) {
      return periods.reduce((prices, period) => {
        let quantity = findQuantity(item, period);
        let value = item.price.values && item.price.values[period] || 0;

        prices[period] = quantity * value;

        return prices;
      }, {});
    }
  },

  percentage: {
    /**
     * Calculate actual prices for all periods configured for a single item.
     * @param item
     * @param {Array.<string>} periods
     * @param {Array.<{category: string, totals: Object.<string, number>}>} revenueTotals
     *                                   Totals of the revenues per category,
     *                                   needed to calculate prices based on a
     *                                   percentage of the total revenues or some
     *                                   categories.
     * @return {Object.<string, number>} Returns an object with periods as key
     *                                   and prices as value
     */
    calculatePrices: function (item, periods, revenueTotals) {
      if (!revenueTotals) {
        debug(new Error('No revenue totals available in this context'));
        return {};
      }

      if (item.price.all === true) {
        // calculate a percentage of all revenue
        let totals = calculateTotals(revenueTotals);
        let percentage = parsePercentage(item.price.percentage);

        return periods.reduce((prices, period) => {
          prices[period] = percentage * (totals[period] || 0);

          return prices;
        }, {});
      }
      else {
        return periods.reduce((prices, period) => {
          prices[period] = 0;

          if (item.price.percentages) {
            item.price.percentages.forEach(p => {
              let percentage = parsePercentage(p.percentage);
              let entry = revenueTotals.find(t => t.category === p.category);
              let total = entry && entry.totals && entry.totals[period] || 0;

              prices[period] += percentage * total;
            });
          }

          return prices;
        }, {});
      }
    }
  }
};

/**
 * Calculate totals for all costs per category
 * @param {{costs: Array}} data
 * @return {Array.<{category: string, totals: Object.<string, number>}>}
 */
export function calculateCostsTotals (data) {
  let revenueTotals = calculateRevenueTotals(data);
  let categories = getCategories(data.costs);
  let periods = data.parameters.periods;

  return categories.map(category => {
    let totals = data.costs
        .filter(item => item.category === category)
        .map(item => calculatePrices(item, periods, revenueTotals))
        .reduce(addTotals);

    return {category, totals};
  });
}

/**
 * Calculate totals for all revenues per category
 * @param {{revenues: Array}} data
 * @return {Array.<{category: string, totals: Object.<string, number>}>}
 */
export function calculateRevenueTotals (data) {
  let categories = getCategories(data.revenues);
  let periods = data.parameters.periods;

  return categories.map(category => {
    let totals = data.revenues
        .filter(item => item.category === category)
        .map(item => calculatePrices(item, periods))
        .reduce(addTotals);

    return {category, totals};
  });
}

/**
 * Calculate totals of all categories
 * @param {Array.<{category: string, totals: totals: Object.<string, number>}>} categoryTotals
 * @return {Object.<string, number>}
 */
export function calculateTotals (categoryTotals) {
  if (categoryTotals.length == 0) {
    return {};
  }

  if (categoryTotals.length == 1) {
    return clone(categoryTotals[0].totals);
  }

  return categoryTotals.reduce((a, b) => addTotals(a.totals, b.totals));
}

/**
 * Merge two objects, add the property values of object a to that of object b.
 * @param {Object.<string, number>} a  Object with periods as key and prices as value
 * @param {Object.<string, number>} b  Object with periods as key and prices as value
 * @return {Object.<string, number>} Returns an object with periods as key and prices as value
 */
export function addTotals (a, b) {
  let c = {};

  Object.keys(a).forEach(period => c[period] = a[period] + b[period]);

  return c;
}

/**
 * Return an empty string when the input value is '0', else return the value as is.
 * @param {string} value
 * @return {string}
 */
export function clearIfZero (value) {
  return (value === '0' || value === 0) ? '' : value;
}

/**
 * Parse a percentage. Examples:
 *
 *     parsePercentage('10%')     // 0.1
 *     parsePercentage('+5%')     // 0.05
 *     parsePercentage('-2.5%')   // -0.025
 *
 * @param {string} percentage
 * @return {number} Returns the numeric value of the percentage
 */
export function parsePercentage (percentage) {
  let match = /^([+-]?[0-9]+[.]?[0-9]*)%$/.exec(percentage);

  if (!match) {
    throw new Error('Invalid percentage "' + percentage + '"')
  }

  return parseFloat(match[1]) / 100;
}

/**
 * Parse a string into a number. Examples:
 *
 *     parsePrice('23')    // 23
 *     parsePrice('15k')   // 15000
 *     parsePrice('2M')    // 2000000
 *     parsePrice('6B')    // 6000000000
 *
 * @param {string} price
 * @return {number} The numeric value of the price
 */
export function parsePrice (price) {
  let match = /^([+-]?[0-9]+[.]?[0-9]*)([kMBT])?$/.exec(price);

  if (!match) {
    throw new Error('Invalid price "' + price + '"');
  }

  let suffixes = {
    'undefined': 1,
    k: 1e3,
    M: 1e6,
    B: 1e9,
    T: 1e12
  };

  if (match[2] && (!(match[2] in suffixes))) {
    throw new Error('Invalid price "' + price + '"');
  }

  return parseFloat(match[1]) * suffixes[match[2]];
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
export function formatPrice (price) {
  if (Math.abs(price) > 1e13) { return (price / 1e12).toFixed() + 'T'; }
  if (Math.abs(price) > 1e12) { return (price / 1e12).toFixed(1) + 'T'; }

  if (Math.abs(price) > 1e10) { return (price / 1e9).toFixed() + 'B'; }
  if (Math.abs(price) > 1e9)  { return (price / 1e9).toFixed(1) + 'B'; }

  if (Math.abs(price) > 1e7)  { return (price / 1e6).toFixed() + 'M'; }
  if (Math.abs(price) > 1e6)  { return (price / 1e6).toFixed(1) + 'M'; }

  if (Math.abs(price) > 1e4)  { return (price / 1e3).toFixed() + 'k'; }
  if (Math.abs(price) > 1e3)  { return (price / 1e3).toFixed(1) + 'k'; }

  return (price).toFixed();
}