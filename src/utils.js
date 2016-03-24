import { uniq, flatMap, unzipWith } from 'lodash';

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
    let pricePeriods = item.prices.map(price => price.period);
    let quantityPeriods = Object.keys(item.quantities);

    return pricePeriods.concat(quantityPeriods).filter(period => period != undefined)
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
  return item.quantities[period]
      ? item.quantities[period]
      : '0';
}

/**
 * Calculate actual prices for all periods configured for a single item.
 * @param item
 * @param {Array.<string>} periods
 * @return {Object.<string, number>} Returns an object with periods as key
 *                                   and prices as value
 */
export function calculatePrices (item, periods) {
  let initialPrice = parseFloat(item.prices[0].price);
  let change = 1 + parseFloat(item.prices[0].change) / 100;

  return periods.reduce((prices, period, periodIndex) => {
    let quantity = findQuantity(item, period);

    // TODO: handle the different structures for pricing
    if (item.prices[0].price && item.prices[0].change) {
      prices[period] = initialPrice * quantity * Math.pow(change, periodIndex);
    }
    else {
      prices[period] = 0;
    }

    return prices;
  }, {});
}

/**
 * Calculate totals per category
 * @param items
 * @return {Array.<{category: string, totals: Object.<string, number>}>}
 */
export function calculateCategoryTotals (items) {
  let categories = getCategories(items);
  let periods = getPeriods(items);

  return categories.map(category => {
    let totals = items
        .filter(item => item.category === category)
        .map(item => calculatePrices(item, periods))
        .reduce(addTotals);

    return {category, totals};
  });
}

/**
 * Calculate totals
 * @param {Array.<{category: string, totals: totals: Object.<string, number>}>} categories
 * @return {Object.<string, number>}
 */
export function calculateTotals (categories) {
  return categories.reduce((a, b) => addTotals(a.totals, b.totals));
}

/**
 *
 * @param {Object.<string, number>} a  Object with periods as key and prices as value
 * @param {Object.<string, number>} b  Object with periods as key and prices as value
 * @return {Object.<string, number>} Returns an object with periods as key and prices as value
 */
export function addTotals (a, b) {
  let c = {};

  Object.keys(a).forEach(period => c[period] = a[period] + b[period]);

  return c;
}
