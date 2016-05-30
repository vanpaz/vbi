import debugFactory from 'debug/browser'
import { addProps, subtractProps, initProps, mapProps, getProp } from './utils/object'

const debug = debugFactory('vbi:formulas')

const MAX_NUMBER_OF_YEARS = 100

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

  const grossMargin = subtractProps(revenueTotals, directCosts)
  const EBITDA = subtractProps(grossMargin, indirectCosts)

  const depreciationTangible = calculateTotals(data.investments.tangible, years)
  const depreciationIntangible = calculateTotals(data.investments.intangible, years)
  const depreciation = addProps(depreciationTangible, depreciationIntangible)

  const EBIT = subtractProps(EBITDA, depreciation)

  const interestPayableOnLoans = parsePercentage(data.parameters.interestPayableOnLoans)
  const longTermDept = calculateLongTermDebt(data).longTermDebt
  const interest = {}
  years.forEach(year => {
    // average over current and previous year, multiplied with the interest percentage
    interest[year] = (longTermDept[year - 1] + longTermDept[year]) / 2 * interestPayableOnLoans
  })

  const EBT = subtractProps(EBIT, interest)

  const corporateTaxes = mapProps(EBT, (value) => corporateTaxRate * value)

  const netResult = subtractProps(EBT, corporateTaxes)

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

export function calculateLongTermDebt (data) {
  const years = getYearsWithInitial(data)
  const bankLoansCapitalCalls = getProp(data, ['financing', 'bankLoansCapitalCalls'])
  const otherSourcesOfFinance = getProp(data, ['financing', 'otherSourcesOfFinance'])

  // TODO: create a helper function to do cumulative calculations

  // cumulative bank loans
  const bankLoans = {}
  years.forEach(year => {
    const previous = bankLoans[year - 1] || 0
    const current = bankLoansCapitalCalls[year] ? parsePrice(bankLoansCapitalCalls[year]) : 0
    bankLoans[year] = previous + current
  })

  // cumulative otherSourcesOfFinance
  const otherLongTermInterestBearingDebt = {}
  years.forEach(year => {
    const previous = otherLongTermInterestBearingDebt[year - 1] || 0
    const current = otherSourcesOfFinance[year] ? parsePrice(otherSourcesOfFinance[year]) : 0
    otherLongTermInterestBearingDebt[year] = previous + current
  })

  // sum up interest
  const longTermDebt = addProps(bankLoans, otherLongTermInterestBearingDebt)

  return {
    longTermDebt,
    bankLoans,
    otherLongTermInterestBearingDebt
  }
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
 * @param {Array.<number>} years
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
     * @param {Array.<number>} years
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
     * @param {Array.<number>} years
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
     * @param {Array.<number>} years
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
            .reduce(addProps, initProps(years))
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
     * @param {Array.<number>} years
     * @return {Object.<string, number>} Returns an object with years as key
     *                                   and prices as value
     */
    calculatePrices: function (item, years) {
      const prices = initProps(years)

      // for every quantity filled in for the item, we loop over all years
      // and add up the prices
      Object.keys(item.quantities).forEach(yearOfQuantity => {
        const offset = years.indexOf(parseInt(yearOfQuantity))
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
     * @param {Array.<number>} years
     * @return {Object.<string, number>} Returns an object with years as key
     *                                   and prices as value
     */
    calculatePrices: function (item, years) {
      const montlySalary = parsePrice(item.price.value)
      const change = 1 + parsePercentage(item.price.change)
      const holidayProvision = 1 + parsePercentage(item.price.holidayProvision)
      const SSCEmployer = 1 + parsePercentage(item.price.SSCEmployer)

      const prices = initProps(years)

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
 * Get an array with the years, given a starting year and the number of years
 * @param {{parameters: {startingYear: string, numberOfYears: string}}} data
 * @return {Array.<number>} Returns an array with years, like [2016, 2017, 2018]
 */
export function getYears (data) {
  const startingYear = parseInt(data.parameters.startingYear)
  let numberOfYears = parseInt(data.parameters.numberOfYears)
  const years = []

  if (numberOfYears > MAX_NUMBER_OF_YEARS) {
    numberOfYears = MAX_NUMBER_OF_YEARS
    console.warn('Number of years limited to ' + MAX_NUMBER_OF_YEARS)
  }

  for (var i = 0; i < numberOfYears; i++) {
    years.push(startingYear + i)
  }

  return years
}

/**
 * Get an array with the years, given a starting year and the number of years.
 * Includes the initial year, the year before the starting year.
 * @param {{parameters: {startingYear: string, numberOfYears: string}}} data
 * @return {Array.<number>} Returns an array with years, like [2016, 2017, 2018]
 */
export function getYearsWithInitial (data) {
  const years = getYears(data)
  const startYear = years[0]
  const initialYear = startYear !== undefined ? (startYear - 1) : 0
  return [initialYear].concat(years)
}

/**
 * Calculate totals for all revenues per category
 * @param {Array} categories
 * @param {Array.<number>} years
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
 * @param {Array.<number>} years
 * @param {Array} [revenueTotalsPerCategory]
 * @return {Object.<string, number>}
 */
export function calculateTotals (categories, years, revenueTotalsPerCategory) {
  if (!Array.isArray(categories)) {
    throw new TypeError('Array expected for calculateTotals')
  }
  
  const initial = initProps(years)

  return categories
      .map(category => calculatePrices(category, years, revenueTotalsPerCategory))
      .reduce(addProps, initial)
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