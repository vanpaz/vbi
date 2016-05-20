import { uniq, flatMap, clone } from 'lodash'
import debugFactory from 'debug/browser'

const debug = debugFactory('vbi:formulas')

/**
 * Find the quantity for a certain year
 * @param item
 * @param {string} year
 * @param {string} [defaultValue='0']
 * @return {string} Returns the quantity
 */
export function findQuantity (item, year, defaultValue = '0') {
  return (item.quantities[year] !== undefined)
      ? item.quantities[year]
      : defaultValue
}

/**
 * Generate profit and loss data
 * @param data
 */
export function profitAndLoss (data) {
  const years = getYears(data)
  const corporateTaxRate = parsePercentage(data.parameters.corporateTaxRate)

  const revenueTotalsPerCategory = calculateTotalsPerCategory(data.revenues.all, years)
  const revenueTotals = calculateTotals(data.revenues.all, years)

  const directCosts = calculateTotals(data.costs.direct, years, revenueTotalsPerCategory)
  const personnelCosts = calculateTotals(data.costs.personnel, years, revenueTotalsPerCategory)
  const indirectCosts = calculateTotals(data.costs.indirect, years, revenueTotalsPerCategory)

  const grossMargin = zipObjectsWith([revenueTotals, directCosts], subtract, years)
  const EBITDA = zipObjectsWith([grossMargin, indirectCosts], subtract, years)

  const depreciationTangible = calculateTotals(data.investments.tangible, years)
  const depreciationIntangible = calculateTotals(data.investments.intangible, years)
  const depreciation = addTotals(depreciationTangible, depreciationIntangible)

  const EBIT = zipObjectsWith([EBITDA, depreciation], subtract, years)

  // TODO: get interest from balance sheet calculations
  // const interest = {
  //   '2016': 1.3e3,
  //   '2017': 5.0e3,
  //   '2018': 12.5e3,
  //   '2019': 17.5e3,
  //   '2020': 17.5e3
  // }
  const interest = initializeTotals(years)

  const EBT = zipObjectsWith([EBIT, interest], subtract, years)

  const corporateTaxes = zipObjectsWith([EBT], (value) => corporateTaxRate * value, years)

  const netResult = zipObjectsWith([EBT, corporateTaxes], subtract, years)

  return [
    {name: 'Total revenues', values: revenueTotals },
    {name: 'Total direct costs', values: directCosts },
    {name: 'Gross margin', values: grossMargin },
    {name: 'Total personnel cost', values: personnelCosts },
    {name: 'Total other direct cost', values: indirectCosts },
    {name: 'EBITDA', values: EBITDA },
    {name: 'Depreciation and amortization', values: depreciation },
    {name: 'EBIT', values: EBIT, className: 'bold' },
    {name: 'Interest (not yet available...)', values: interest },
    {name: 'EBT', values: EBT },
    {name: 'Corporate taxes', values: corporateTaxes },
    {name: 'Net result', values: netResult }
  ]
}

/**
 * Generate balance sheet data
 * @param data
 */
export function balanceSheet (data) {
  // TODO: implement balanceSheet calculations

  return [
    {name: 'Assets', values: {}, className: 'header' },

    {name: 'Fixed assets', values: {}, className: 'main-top' },
    {name: 'Tangibles & intangibles', values: {} },
    {name: 'Financial fixed assets', values: {} },
    {name: 'Deferred tax asset', values: {} },

    {name: 'Current assets', values: {}, className: 'main-top' },
    {name: 'Goods in stock', values: {} },
    {name: 'Trade receivables', values: {} },
    {name: 'Prepayments', values: {} },
    {name: 'Accrued income', values: {} },
    {name: 'Receivable VAT', values: {} },

    {name: 'Cash & bank', values: {}, className: 'main-middle' },

    {name: 'Liabilities', values: {}, className: 'header' },

    {name: 'Equity', values: {}, className: 'main-top' },
    {name: 'Paid-in capital', values: {} },
    {name: 'Agio', values: {} },
    {name: 'Reserves', values: {} },
    {name: 'Profit/loss for the year', values: {} },

    {name: 'Long-term debt', values: {}, className: 'main-top' },
    {name: 'Bank loans', values: {} },
    {name: 'other long-term interest bearing debt', values: {} },

    {name: 'Short-term liabilities', values: {}, className: 'main-top' },
    {name: 'Trade creditors', values: {} },
    {name: 'Accruals', values: {} },
    {name: 'Deferred Income', values: {} },
    {name: 'Payable VAT', values: {} },
    {name: 'Payable Corporate tax', values: {} },
    {name: 'Payable income tax', values: {} },
    {name: 'Payable Social security contributions', values: {} },
    {name: 'Provision holiday pay', values: {} },

    {name: 'Balance', values: {}, className: 'balance' }
  ]
}

/**
 * Generate balance sheet data
 * @param data
 */
export function cashflow (data) {
  // TODO: implement cashflow calculations

  const years = getYears(data)

  function parseAndInit (value) {
    return value != undefined ? parsePrice(value) : 0
  }

  // const investmentsInParticipations     = zipObjectsWith([data.financing.investmentsInParticipations], parseAndInit, years)
  // const equityContributions             = zipObjectsWith([data.financing.equityContributions], parseAndInit, years)
  // const bankLoansCapitalCalls           = zipObjectsWith([data.financing.bankLoansCapitalCalls], parseAndInit, years)
  // const bankLoansRedemptionInstallments = zipObjectsWith([data.financing.bankLoansRedemptionInstallments], parseAndInit, years)
  // const otherSourcesOfFinance           = zipObjectsWith([data.financing.otherSourcesOfFinance], parseAndInit, years)

  return [
    {name: 'Net result', values: {} },
    {name: 'Correction on paid Corporate tax', values: {} },
    {name: 'Changes in deferred tax assets', values: {} },
    {name: 'NOPLAT', values: {} },
    
    {name: 'Depreciation & amortization', values: {} },
      
    {name: 'Changes in working capital', values: {}, className: 'main-top' },
    {name: 'Changes in stock', values: {}},
    {name: 'Changes in accounts receivables', values: {}},
    {name: 'Changes in prepayments', values: {}},
    {name: 'Changes in accrued income', values: {}},
    {name: 'Changes in accounts payables', values: {}},
    {name: 'Changes in accruals', values: {}},
    {name: 'Changes in deferred income', values: {}},

    {name: 'Changes in taxes & social security contributions', values: {}, className: 'main-top'},
    {name: 'Changes in VAT receivable', values: {} },
    {name: 'Changes In VAT payable', values: {} },
    {name: 'Changes in corporate tax payable', values: {} },
    {name: 'Changes in income tax payable', values: {} },
    {name: 'Changes in social security contributions payable', values: {} },
    {name: 'Holiday payment', values: {} },

    {name: 'Cashflow from operations', values: {}, className: 'main-middle' },

    {name: 'Investments in fixed assets', values: {} },
    {name: 'Investments in participations', editable: true, path: ['data', 'financing', 'investmentsInParticipations']},
    {name: 'Cashflow from investments', values: {}, className: 'main-bottom' },

    {name: 'Equity contributions', editable: true, path: ['data', 'financing', 'equityContributions'] },
    {name: 'Bank loans capital calls', editable: true, path: ['data', 'financing', 'bankLoansCapitalCalls'] },
    {name: 'Bank loans redemption installments', editable: true, path: ['data', 'financing', 'bankLoansRedemptionInstallments']},
    {name: 'Other sources of finance', editable: true, path: ['data', 'financing', 'otherSourcesOfFinance']},
    {name: 'Cashflow from financing', values: {}, className: 'main-bottom' },
      
    {name: 'Total cash balance EoP', values: {}, className: 'main-middle' }
  ]
}

/**
 * Calculate actual prices for all years configured for a single item.
 * @param {{price: Object, quantities: Object}} item
 * @param {Array.<string>} years
 * @param {Array.<{category: string, totals: Object.<string, number>}>} [revenueTotalsPerCategory]
 *                                   Totals of the revenues per category,
 *                                   needed to calculate prices based on a
 *                                   percentage of the total revenues or some
 *                                   categories.
 * @return {Object.<string, number>} Returns an object with years as key
 *                                   and prices as value
 */
export function calculatePrices (item, years, revenueTotalsPerCategory) {
  var type = types[item.price.type]

  if (!type) {
    throw new Error('Unknown item price type ' + JSON.stringify(item.price.type) + ' ' +
        'in item ' + JSON.stringify(item) + '. ' +
        'Choose from: ' + Object.keys(types).join(','))
  }

  return type.calculatePrices(item, years, revenueTotalsPerCategory)
}

/**
 * A map with functions to calculate the price for a specific price type
 */
export let types = {
  constant: {
    /**
     * Calculate actual prices for all years configured for a single item.
     * @param item
     * @param {Array.<string>} years
     * @return {Object.<string, number>} Returns an object with years as key
     *                                   and prices as value
     */
    calculatePrices: function (item, years) {
      let initialPrice = parsePrice(item.price.value)
      let change = 1 + parsePercentage(item.price.change)

      return years.reduce((prices, year, yearIndex) => {
        let quantity = findQuantity(item, year)

        if (item.price.value != undefined && item.price.change != undefined) {
          prices[year] = initialPrice * quantity * Math.pow(change, yearIndex)
        }
        else {
          prices[year] = 0
        }

        return prices
      }, {})
    }
  },

  manual: {
    /**
     * Calculate actual prices for all years configured for a single item.
     * @param item
     * @param {Array.<string>} years
     * @return {Object.<string, number>} Returns an object with years as key
     *                                   and prices as value
     */
    calculatePrices: function (item, years) {
      return years.reduce((prices, year) => {
        let quantity = findQuantity(item, year)
        let value = item.price.values && item.price.values[year] || 0

        prices[year] = quantity * value

        return prices
      }, {})
    }
  },

  revenue: {
    /**
     * Calculate actual prices for all years configured for a single item.
     * @param item
     * @param {Array.<string>} years
     * @param {Array.<{category: string, totals: Object.<string, number>}>} revenueTotalsPerCategory
     *                                   Totals of the revenues per category,
     *                                   needed to calculate prices based on a
     *                                   percentage of the total revenues or some
     *                                   categories.
     * @return {Object.<string, number>} Returns an object with years as key
     *                                   and prices as value
     */
    calculatePrices: function (item, years, revenueTotalsPerCategory) {
      if (!revenueTotalsPerCategory) {
        debug(new Error('No revenue totals available in this context'))
        return {}
      }

      if (item.price.all === true) {
        // calculate a percentage of all revenue
        let totals = revenueTotalsPerCategory
            .map(category => category.totals)
            .reduce(addTotals, initializeTotals(years))
        let percentage = parsePercentage(item.price.percentage)

        return years.reduce((prices, year) => {
          prices[year] = percentage * (totals[year] || 0)

          return prices
        }, {})
      }
      else {
        return years.reduce((prices, year) => {
          prices[year] = 0

          if (item.price.percentages) {
            item.price.percentages.forEach(p => {
              let percentage = parsePercentage(p.percentage)
              let category = revenueTotalsPerCategory
                  .find(category => category.id === p.categoryId)
              let total = category && category.totals[year] || 0

              prices[year] += percentage * total
            })
          }

          return prices
        }, {})
      }
    }
  },
  
  investment: {
    /**
     * Calculate actual prices for all years configured for a single item.
     * @param item
     * @param {Array.<string>} years
     * @return {Object.<string, number>} Returns an object with years as key
     *                                   and prices as value
     */
    calculatePrices: function (item, years) {
      const prices = initializeTotals(years)

      // for every quantity filled in for the item, we loop over all years
      // and add up the prices
      Object.keys(item.quantities).forEach(yearOfQuantity => {
        const offset = years.indexOf(yearOfQuantity)
        if (offset !== -1) { // ignore quantities outside of scope
          const price = item.price.value
          const quantity = item.quantities[yearOfQuantity]
          const depreciationPeriod = item.price.depreciationPeriod
          const costPerYear = price * quantity / depreciationPeriod

          years
              .slice(offset)
              .forEach((year, index) => {
                if (index === 0 || index === depreciationPeriod) {
                  // first and last year we depreciate half of the cost per year
                  prices[year] += costPerYear / 2
                }
                else {
                  prices[year] += costPerYear
                }
              })
        }
      })

      return prices
    }
  },

  salary: {
    /**
     * Calculate actual prices for all years configured for a single item.
     * @param item
     * @param {Array.<string>} years
     * @return {Object.<string, number>} Returns an object with years as key
     *                                   and prices as value
     */
    calculatePrices: function (item, years) {
      const montlySalary = parsePrice(item.price.value)
      const change = 1 + parsePercentage(item.price.change)
      const holidayProvision = 1 + parsePercentage(item.price.holidayProvision)
      const SSCEmployer = 1 + parsePercentage(item.price.SSCEmployer)

      const prices = initializeTotals(years)

      years.forEach((year, yearIndex) => {
        const quantity = findQuantity(item, year)

        if (item.price.value != undefined && item.price.change != undefined) {
          prices[year] =
              holidayProvision * SSCEmployer * Math.pow(change, yearIndex) *
              montlySalary * 12 *
              quantity
        }
      })

      return prices
    }
  }

}

/**
 * Get
 * @param {{parameters: {startingYear: string, numberOfYears: string}}} data
 * @return {Array} Returns an array with years, like ["2016", "2017", "2018"]
 */
export function getYears (data) {
  const startingYear = parseInt(data.parameters.startingYear)
  const numberOfYears = parseInt(data.parameters.numberOfYears)
  const years = []

  for (var i = 0; i < numberOfYears; i++) {
    years.push(String(startingYear + i))
  }

  return years
}

/**
 * Calculate totals for all revenues per category
 * @param {Array} categories
 * @param {Array.<string>} years
 * @return {Array.<{category: string, totals: Object.<string, number>}>}
 */
export function calculateTotalsPerCategory (categories, years) {
  return categories.map(category => ({
    id: category.id,
    category: category.name,
    totals: calculatePrices(category, years)
  }))
}

/**
 * Calculate totals of an array with categories
 * @param {Array.<{price: Object, quantities: Object}>} categories
 * @param {Array.<string>} years
 * @param {Array} [revenueTotalsPerCategory]
 * @return {Object.<string, number>}
 */
export function calculateTotals (categories, years, revenueTotalsPerCategory) {
  const initial = initializeTotals(years)

  return categories
      .map(category => calculatePrices(category, years, revenueTotalsPerCategory))
      .reduce(addTotals, initial)
}

/**
 * Merge two objects, add the property values of object a to that of object b.
 * @param {Object.<string, number>} a  Object with years as key and prices as value
 * @param {Object.<string, number>} b  Object with years as key and prices as value
 * @return {Object.<string, number>} Returns an object with years as key and prices as value
 */
export function addTotals (a, b) {
  const c = {}

  Object.keys(a).forEach(year => c[year] = a[year] + b[year])

  return c
}

/**
 * Return an empty string when the input value is '0', else return the value as is.
 * @param {string} value
 * @return {string}
 */
export function clearIfZero (value) {
  return (value === '0' || value === 0) ? '' : value
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
  let match = /^([+-]?[0-9]+[.]?[0-9]*)%$/.exec(percentage)

  if (!match) {
    throw new Error('Invalid percentage "' + percentage + '"')
  }

  return parseFloat(match[1]) / 100
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
  let match = /^([+-]?[0-9]+[.]?[0-9]*)([kMBT])?$/.exec(price)

  if (!match) {
    throw new Error('Invalid price "' + price + '"')
  }

  let suffixes = {
    'undefined': 1,
    k: 1e3,
    M: 1e6,
    B: 1e9,
    T: 1e12
  }

  if (match[2] && (!(match[2] in suffixes))) {
    throw new Error('Invalid price "' + price + '"')
  }

  return parseFloat(match[1]) * suffixes[match[2]]
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
 * Create a totals object with a key for every year and zero as value.
 * For example:
 *
 *     initializeTotals(['2016', '2017', '2018'])
 *
 *     // output: {'2016': 0, '2017': 0, '2018': 0}
 *
 * @param {Array.<string>} years
 * @return {{}} Returns a totals object
 */
export function initializeTotals (years) {
  const totals = {}

  years.forEach(year => totals[year] = 0)

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

export function getProp (object, path) {
  let prop = object
  path.forEach(key => prop = prop[key])
  return prop
}