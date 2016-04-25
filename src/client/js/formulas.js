import { uniq, flatMap, unzipWith, clone } from 'lodash';
import debugFactory from 'debug/browser';

const debug = debugFactory('vbi:formulas');

// P*Q etcetera

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
 * Extract the unique periods used in the items. The returned periods
 * are sorted alphabetically.
 * @param {Array} items
 * @return {Array.<string>}
 */
export function getPeriods(items) {
  let periods = flatMap(items, item => {
    return Object.keys(item.quantities)
        .concat(Object.keys(item.price.values || {}))
        .filter(period => period != undefined);
  });

  return uniq(periods).sort();
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
      let initialPrice = parseFloat(item.price.value);
      let change = 1 + parseFloat(item.price.change) / 100;

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
        let percentage = parseFloat(item.price.percentage) / 100;

        return periods.reduce((prices, period) => {
          prices[period] = percentage * (totals[period] || 0);

          return prices;
        }, {});
      }
      else {
        return periods.reduce((prices, period) => {
          prices[period] = 0;

          item.price.percentages.forEach(p => {
            let percentage = parseFloat(p.percentage) / 100;
            let entry = revenueTotals.find(t => t.category === p.category);
            let total = entry && entry.totals && entry.totals[period] || 0;

            prices[period] += percentage * total;
          });

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
  let periods = getPeriods(data.costs);

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
  let periods = getPeriods(data.revenues);

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
  return value === '0' ? '' : value;
}
