import { uniq, flatMap, clone } from 'lodash';
import debugFactory from 'debug/browser';

const debug = debugFactory('vbi:formulas');

/**
 * Find a group object in the data model. Case insensitive search
 *
 * Example:
 *
 *     findGroup(data, 'costs', 'Personnel')
 *
 * @param {Object} data
 * @param {string} section
 * @param {string} groupName
 * @return {*}
 */
export function findGroup (data, section, groupName) {
  if (!data[section]) {
    return null;
  }

  return data[section].find(group => group.name && group.name.toLowerCase() === groupName )
}

/**
 * Find the quantity for a certain period
 * @param item
 * @param {string} period
 * @return {{period: string, quantity: number}} Returns an object with quantity 0 if not found
 */
export function findQuantity (item, period) {
  return (item.quantities[period] !== undefined)
      ? item.quantities[period]
      : '0';
}

/**
 * Generate profit and loss data
 * @param data
 */
export function profitAndLoss (data) {
  const periods = data.parameters.periods

  const groupDirect = findGroup(data, 'costs', 'direct' )
  const groupPersonnel = findGroup(data, 'costs', 'personnel' )
  const groupsOther = data.costs
      .filter(group => group !== groupDirect && group !== groupPersonnel )

  const VATRate = 0.25          // TODO: make VATRate customizable
  const holidayProvision = 1/12 // TODO: read holidayProvision from price
  const sscEmployer = 0.18      // TODO: read sscEmployer from price

  function calculateSalaryCosts (monthlySalary) {
    return (1 + holidayProvision) * (1 + sscEmployer) * 12 * monthlySalary
  }

  const revenueTotalsPerCategory = calculateRevenueTotalsPerCategory(data)
  const revenueTotals = calculateTotals(revenueTotalsPerCategory)
  const directCosts = calculateGroupTotals(groupDirect, periods, revenueTotalsPerCategory)
  let personnelCosts = calculateGroupTotals(groupPersonnel, periods, revenueTotalsPerCategory)
  personnelCosts = zipObjectsWith([personnelCosts], calculateSalaryCosts)

  const otherCosts = groupsOther
      .map(group => calculateGroupTotals(group, periods, revenueTotalsPerCategory))
      .reduce(addTotals, initializeTotals(periods))

  const grossMargin = zipObjectsWith([revenueTotals, directCosts], subtract, periods)
  const EBITDA = zipObjectsWith([grossMargin, otherCosts], subtract, periods)

  const depreciation = data.investments
      .map(group => calculateGroupTotals(group, periods, revenueTotalsPerCategory))
      .reduce(addTotals, initializeTotals(periods))

  const EBIT = zipObjectsWith([EBITDA, depreciation], subtract, periods)

  // TODO: get interest from balance sheet calculations
  const interest = {
    '2016': 1.3e3,
    '2017': 5.0e3,
    '2018': 12.5e3,
    '2019': 17.5e3,
    '2020': 17.5e3
  }

  const EBT = zipObjectsWith([EBIT, interest], subtract, periods)

  const corporateTaxes = zipObjectsWith([EBT], (value) => VATRate * value, periods)

  const netResult = zipObjectsWith([EBT, corporateTaxes], subtract, periods)

  return [
    {name: 'Total revenues', values: revenueTotals },
    {name: 'Total direct costs', values: directCosts },
    {name: 'Gross margin', values: grossMargin },
    {name: 'Total personnel cost', values: personnelCosts },
    {name: 'Total other direct cost', values: otherCosts },
    {name: 'EBITDA', values: EBITDA },
    {name: 'Depreciation and amortization', values: depreciation },
    {name: 'EBIT', values: EBIT, className: 'main' },
    {name: 'Interest', values: interest },
    {name: 'EBT', values: EBT },
    {name: 'Corporate taxes', values: corporateTaxes },
    {name: 'Net result', values: netResult }
  ]
}

/**
 * Calculate actual prices for all periods configured for a single item.
 * @param item
 * @param {Array.<string>} periods
 * @param {Array.<{category: string, totals: Object.<string, number>}>} revenueTotalsPerCategory
 *                                   Totals of the revenues per category,
 *                                   needed to calculate prices based on a
 *                                   percentage of the total revenues or some
 *                                   categories.
 * @return {Object.<string, number>} Returns an object with periods as key
 *                                   and prices as value
 */
export function calculatePrices (item, periods, revenueTotalsPerCategory) {
  var type = types[item.price.type];

  if (!type) {
    throw new Error('Unknown item price type ' + JSON.stringify(item.price.type) + ' ' +
        'in item ' + JSON.stringify(item) + '. ' +
        'Choose from: ' + Object.keys(types).join(','));
  }

  return type.calculatePrices(item, periods, revenueTotalsPerCategory);
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

  revenue: {
    /**
     * Calculate actual prices for all periods configured for a single item.
     * @param item
     * @param {Array.<string>} periods
     * @param {Array.<{category: string, totals: Object.<string, number>}>} revenueTotalsPerCategory
     *                                   Totals of the revenues per category,
     *                                   needed to calculate prices based on a
     *                                   percentage of the total revenues or some
     *                                   categories.
     * @return {Object.<string, number>} Returns an object with periods as key
     *                                   and prices as value
     */
    calculatePrices: function (item, periods, revenueTotalsPerCategory) {
      if (!revenueTotalsPerCategory) {
        debug(new Error('No revenue totals available in this context'));
        return {};
      }

      if (item.price.all === true) {
        // calculate a percentage of all revenue
        let totals = calculateTotals(revenueTotalsPerCategory);
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
              let entry = revenueTotalsPerCategory.find(t => t.category === p.category);
              let total = entry && entry.totals && entry.totals[period] || 0;

              prices[period] += percentage * total;
            });
          }

          return prices;
        }, {});
      }
    }
  },
  
  investment: {
    /**
     * Calculate actual prices for all periods configured for a single item.
     * @param item
     * @param {Array.<string>} periods
     * @return {Object.<string, number>} Returns an object with periods as key
     *                                   and prices as value
     */
    calculatePrices: function (item, periods) {
      const prices = initializeTotals(periods)

      // for every quantity filled in for the item, we loop over all periods
      // and add up the prices
      Object.keys(item.quantities).forEach(quantityPeriod => {
        const offset = periods.indexOf(quantityPeriod)
        if (offset !== -1) { // ignore quantities outside of scope
          const price = item.price.value
          const quantity = item.quantities[quantityPeriod]
          const depreciationPeriod = item.price.depreciationPeriod
          const costPerPeriod = price * quantity / depreciationPeriod

          periods
              .slice(offset)
              .forEach((period, index) => {
                if (index === 0 || index === depreciationPeriod) {
                  // first and last period we depreciate half of the cost per period
                  prices[period] += costPerPeriod / 2
                }
                else {
                  prices[period] += costPerPeriod
                }
              })
        }
      })

      return prices
    }
  }
};

/**
 * Calculate totals for all costs per category
 * @param {{costs: Array}} data
 * @return {Array.<{name: string, totals: Object.<string, number>}>}
 */
export function calculateCostsTotals (data) {
  const revenueTotalsPerCategory = calculateRevenueTotalsPerCategory(data);
  const periods = data.parameters.periods;
  const initial = initializeTotals(periods)

  return data.costs
      .map(group => {
        return {
          name: group.name,
          totals: calculateGroupTotals(group, periods, revenueTotalsPerCategory)
        }
      });
}


export function calculateGroupTotals (group, periods, revenueTotalsPerCategory) {
  const initial = initializeTotals(periods)

  return group.categories
      .map(item => calculatePrices(item, periods, revenueTotalsPerCategory))
      .reduce(addTotals, initial)
}

/**
 * Calculate totals for all revenues per category
 * @param {{revenues: Array}} data
 * @return {Array.<{category: string, totals: Object.<string, number>}>}
 */
export function calculateRevenueTotalsPerCategory (data) {
  const periods = data.parameters.periods;
  const initial = initializeTotals(periods)

  return data.revenues
      .map(group => {
        return {
          name: group.name,
          totals: group.categories
              .map(item => calculatePrices(item, periods))
              .reduce(addTotals, initial)
        }
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

  return categoryTotals
      .map(a => a.totals)
      .reduce(addTotals);
}

/**
 * Merge two objects, add the property values of object a to that of object b.
 * @param {Object.<string, number>} a  Object with periods as key and prices as value
 * @param {Object.<string, number>} b  Object with periods as key and prices as value
 * @return {Object.<string, number>} Returns an object with periods as key and prices as value
 */
export function addTotals (a, b) {
  const c = {};

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

/**
 * Create a totals object with a key for every period and zero as value.
 * For example:
 *
 *     initializeTotals(['2016', '2017', '2018'])
 *
 *     // output: {'2016': 0, '2017': 0, '2018': 0}
 *
 * @param {Array.<string>} periods
 * @return {{}} Returns a totals object
 */
export function initializeTotals (periods) {
  const totals = {}

  periods.forEach(period => totals[period] = 0);

  return totals
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

export function add (a, b) {
  return a + b
}

export function subtract (a, b) {
  return a - b
}