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
    let quantityPeriods = item.quantities.map(quantity => quantity.period);

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
  let entry = item.quantities && item.quantities.find(quantity => quantity.period == period);

  return entry || {period, quantity: 0};
}

/**
 * Calculate actual prices for all periods configured for a single item.
 * @param item
 * @param {Array.<string>} periods
 * @return {{period: string, price: number}}
 */
export function calculatePrices (item, periods) {
  let initialPrice = parseFloat(item.prices[0].price);
  let change = 1 + parseFloat(item.prices[0].change) / 100;

  return periods.map((period, periodIndex) => {
    let quantity = findQuantity(item, period);

    return {
      period,
      price: initialPrice * quantity.quantity * Math.pow(change, periodIndex)
    };
  });
}

/**
 * Calculate totals per category
 * @param items
 * @return {{category: string, totals: Array.<number>}}
 */
export function calculateCategoryTotals (items) {
  let categories = getCategories(items);
  let periods = getPeriods(items);

  return categories.map(category => {
    let totals = items
        .filter(item => item.category === category)
        .map(item => calculatePrices(item, periods))
        .reduce((a, b) => unzipWith([a, b], addTotals));

    return {category, totals};
  });
}

/**
 * Calculate totals
 * @param {Array.<{category: string, totals: Array.<number>}>} categories
 * @return {Array.<{period: string, price: number}>}
 */
export function calculateTotals (categories) {
  return categories.reduce((a, b) => unzipWith([a.totals, b.totals], addTotals));
}

/**
 *
 * @param {{period: string, price: number}} a
 * @param {{period: string, price: number}} b
 * @return {{period: string, price: number}}
 */
export function addTotals (a, b) {
  return {
    period: a.period,
    price: a.price + b.price
  };
}
