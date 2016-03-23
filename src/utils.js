import { uniq, flatMap, unzipWith } from 'lodash';


export function getCategories (items) {
  let categories = items
      .map(item => item.category)
      .filter(category => category != undefined);  // not undefined or null

  return uniq(categories).sort(); // dedupe and sort
}

export function getPeriods(items) {
  let periods = flatMap(items, item => {
    let pricePeriods = item.prices.map(price => price.period);
    let quantityPeriods = item.quantities.map(quantity => quantity.period);

    return pricePeriods.concat(quantityPeriods).filter(period => period != undefined)
  });

  return uniq(periods).sort();
}

export function findQuantity (item, period) {
  let entry = item.quantities && item.quantities.find(quantity => quantity.period == period);

  return entry || {};
}

export function calculateTotals (item, periods) {
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

export function calculateCategoryTotals (items) {
  let categories = getCategories(items);
  let periods = getPeriods(items);

  return categories.map(category => {
    let totals = items
        .filter(item => item.category === category)
        .map(item => calculateTotals(item, periods))
        .reduce((a, b) => unzipWith([a, b], addTotals));

    return {category, totals};
  });
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
