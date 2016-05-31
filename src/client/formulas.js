import debugFactory from 'debug/browser'
import { addProps, subtractProps, initProps, multiplyPropsWith, sumProps, getProp } from './utils/object'

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
 * Find the quantity for a certain year and parse it into a number
 * @param item
 * @param {string | number} year
 * @param {string} [defaultValue='0']
 * @return {number} Returns the quantity
 */
export function parseQuantity (item, year, defaultValue = '0') {
  return parseValue(findQuantity(item, year, defaultValue))
}

/**
 * Generate partials for profit and loss (including totals)
 * @param data
 */
export function calculateProfitAndLossPartials (data) {
  const years = getYears(data)
  const corporateTaxRate = parsePercentage(data.parameters.corporateTaxRate)

  const revenueTotalsPerCategory = calculateTotalsPerCategory(data.revenues.all, years)
  const revenues = calculateTotals(data.revenues.all, years)

  const directCosts = calculateTotals(data.costs.direct, years, revenueTotalsPerCategory)
  const personnelCosts = calculateTotals(data.costs.personnel, years, revenueTotalsPerCategory)
  const indirectCosts = calculateTotals(data.costs.indirect, years, revenueTotalsPerCategory)

  const grossMargin = subtractProps(revenues, directCosts)
  const EBITDA = subtractProps(grossMargin, indirectCosts)

  const allInvestments = data.investments.tangible.concat(data.investments.intangible)
  const depreciation = calculateTotals(allInvestments, years)

  const EBIT = subtractProps(EBITDA, depreciation)

  const interestPayableOnLoans = parsePercentage(data.parameters.interestPayableOnLoans)
  const longTermDept = calculateLongTermDebt(data).longTermDebt
  const interest = {}
  years.forEach(year => {
    // average over current and previous year, multiplied with the interest percentage
    interest[year] = (longTermDept[year - 1] + longTermDept[year]) / 2 * interestPayableOnLoans
  })

  const EBT = subtractProps(EBIT, interest)

  const corporateTaxes = multiplyPropsWith(EBT, corporateTaxRate)

  const netResult = subtractProps(EBT, corporateTaxes)

  return {
    revenues,
    directCosts,
    grossMargin,
    personnelCosts,
    indirectCosts,
    EBITDA,
    depreciation,
    EBIT,
    interest,
    EBT,
    corporateTaxes,
    netResult
  }
}

/**
 * Generate profit and loss data
 * @param data
 */
export function calculateProfitAndLoss (data) {
  const partials = calculateProfitAndLossPartials(data)

  return [
    {name: 'Total revenues', id: 'revenues', values: partials.revenues },
    {name: 'Total direct costs', id: 'directCosts', values: partials.directCosts },
    {name: 'Gross margin', values: partials.grossMargin },
    {name: 'Total personnel costs', id: 'personnelCosts', values: partials.personnelCosts },
    {name: 'Total other direct costs', id: 'indirectCosts', values: partials.indirectCosts },
    {name: 'EBITDA', values: partials.EBITDA },
    {name: 'Depreciation and amortization', values: partials.depreciation },
    {name: 'EBIT', values: partials.EBIT, className: 'main-middle' },
    {name: 'Interest (not yet available...)', values: partials.interest },
    {name: 'EBT', id: 'ebt', values: partials.EBT },
    {name: 'Corporate taxes', id: 'corporateTaxes', values: partials.corporateTaxes },
    {name: 'Net result', id: 'netResult', values: partials.netResult }
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
    const current = bankLoansCapitalCalls[year] ? parseValue(bankLoansCapitalCalls[year]) : 0
    bankLoans[year] = previous + current
  })

  // cumulative otherSourcesOfFinance
  const otherLongTermInterestBearingDebt = {}
  years.forEach(year => {
    const previous = otherLongTermInterestBearingDebt[year - 1] || 0
    const current = otherSourcesOfFinance[year] ? parseValue(otherSourcesOfFinance[year]) : 0
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
 * Generate partials for the balance sheet, excluding totals
 * This partials is used both for the BalanceSheet as well as the Cashflow
 * @param data
 * @param {Array} profitAndLoss   Profit and loss calculated with
 *                                calculateProfitAndLoss(data)
 * @returns {Object} Returns an object with balance sheet partials
 */
export function calculateBalanceSheetPartials (data, profitAndLoss) {

  const corporateTaxRate = parsePercentage(data.parameters.corporateTaxRate)
  const years = getYears(data)
  const revenues = profitAndLoss.find(e => e.id === 'revenues').values
  const netResult = profitAndLoss.find(e => e.id === 'netResult').values
  const corporateTaxes = profitAndLoss.find(e => e.id === 'corporateTaxes').values
  const payments = calculatePayments(data, profitAndLoss, years)

  // fixedAssets
  const tangiblesAndIntangibles = calculateAssetValues(data, years)
  const financialFixedAssets = calculateFinancialFixedAssets(data, years)
  const deferredTaxAsset = calculateDeferredTaxAsset(profitAndLoss, corporateTaxRate, years)

  // goodsInStock
  const daysInStockOfInventory = parseValue(data.parameters.daysInStockOfInventory)
  const revenueTotalsPerCategory = calculateTotalsPerCategory(data.revenues.all, years)
  const directCostscategoriesInStock = data.costs.direct.filter(category => category.stock === true)
  const goodsInStock = multiplyPropsWith(
      calculateTotals(directCostscategoriesInStock, years, revenueTotalsPerCategory),
      daysInStockOfInventory / 365
  )

  // tradeReceivables
  const daysAccountsReceivablesOutstanding = parseValue(data.parameters.daysAccountsReceivablesOutstanding)
  const tradeReceivables = multiplyPropsWith(revenues, daysAccountsReceivablesOutstanding / 365)

  // prepayments
  const daysPrepaymentOfExpenditure = parseValue(data.parameters.daysPrepaymentOfExpenditure)
  const prepayments = multiplyPropsWith(payments, daysPrepaymentOfExpenditure / 365)

  // accrued income
  const daysAccrualOfIncome = parseValue(data.parameters.daysAccrualOfIncome)
  const accruedIncome = multiplyPropsWith(revenues, daysAccrualOfIncome / 365)

  // receivable VAT
  const VATRate = parsePercentage(data.parameters.VATRate)
  const VATPaidAfter = parseValue(data.parameters.VATPaidAfter)
  const receivableVAT = multiplyPropsWith(payments, VATRate * VATPaidAfter / 12)

  // paid in capital
  const startingCapital = parseValue(data.parameters.startingCapital)
  const paidInCapital = initProps(years, startingCapital)

  // agio
  const equityContributions = data.financing.equityContributions
  let agio = {}
  years.forEach(year => {
    agio[year] = (agio[year - 1] || 0) + parseValue(equityContributions[year] || 0)
  })

  // reserves
  let reserves = {}
  years.forEach(year => {
    reserves[year] = (reserves[year - 1] || 0) + (netResult[year - 1] || 0)
  })

  // long-term debt
  const bankLoans = calculateBankLoans(data, years)
  const otherSourcesOfFinance = calculateOtherSourcesOfFinance(data, years)

  // short-term debt
  const daysAccountsPayableOutstanding = parseValue(data.parameters.daysAccountsPayableOutstanding)
  const daysAccrualOfCost = parseValue(data.parameters.daysAccrualOfCost)
  const daysDeferredIncome = parseValue(data.parameters.daysDeferredIncome)
  const tradeCreditors = multiplyPropsWith(payments, daysAccountsPayableOutstanding / 365)
  const accruals = multiplyPropsWith(payments, daysAccrualOfCost / 365)
  const deferredIncome = multiplyPropsWith(revenues, daysDeferredIncome / 365)
  const payableVAT = multiplyPropsWith(revenues, VATRate * VATPaidAfter / 12)

  // payableCorporateTax
  const corporateTaxPaidAfter = parseValue(data.parameters.corporateTaxPaidAfter)
  const payableCorporateTax = {}
  years.forEach(year => {
    const difference = (corporateTaxes[year] || 0) - (deferredTaxAsset[year - 1] || 0)
    if (difference > 0) {
      payableCorporateTax[year] = (difference * corporateTaxPaidAfter / 12)
    }
    else {
      payableCorporateTax[year] = 0
    }
  })

  // payableTaxIncome
  const payableTaxIncome = calculatePayableIncomeTax(data, years)

  // payableSSC
  const payableSSC = calculatePayableSSC(data, years)

  // provisionHolidayPay
  const monthOfHolidayPayment = parseValue(data.parameters.monthOfHolidayPayment)
  const personnelCosts = profitAndLoss.find(e => e.id === 'personnelCosts').values
  const provisionHolidayPay = multiplyPropsWith(personnelCosts,
      // (12 / 13) / 12 * ((12 - monthOfHolidayPayment) / 12))
      (12 - monthOfHolidayPayment) / 12 / 13)

  return {
    // fixed assets
    tangiblesAndIntangibles,
    financialFixedAssets,
    deferredTaxAsset,

    // current assets
    goodsInStock,
    tradeReceivables,
    prepayments,
    accruedIncome,
    receivableVAT,

    // equity
    paidInCapital,
    agio,
    reserves,
    netResult,

    // long-term debt
    bankLoans,
    otherSourcesOfFinance,

    // short-term liabilities
    tradeCreditors,
    accruals,
    deferredIncome,
    payableVAT,
    payableCorporateTax,
    payableTaxIncome,
    payableSSC,
    provisionHolidayPay
  }
}

/**
 * Generate balance sheet data
 * @param data
 * @param {Array} profitAndLoss   Profit and loss calculated with
 *                                calculateProfitAndLoss(data)
 * @return {Array.<{name: string, values: {}, className: string, showZeros: boolean}>}
 */
export function calculateBalanceSheet (data, profitAndLoss) {
  const years = getYears(data)
  const partials = calculateBalanceSheetPartials(data, profitAndLoss) // TODO: pass as argument

  const fixedAssets = sumProps([
    partials.tangiblesAndIntangibles,
    partials.financialFixedAssets,
    partials.deferredTaxAsset
  ])

  const currentAssets = sumProps([
    partials.goodsInStock,
    partials.tradeReceivables,
    partials.prepayments,
    partials.accruedIncome,
    partials.receivableVAT
  ])

  const cashAndBank = initProps(years) // TODO: implement cash and bank

  const assets = sumProps([
    fixedAssets,
    currentAssets,
    cashAndBank
  ])

  const equity = sumProps([
    partials.paidInCapital,
    partials.agio,
    partials.reserves,
    partials.netResult
  ])

  const longTermDebt = sumProps([
    partials.bankLoans,
    partials.otherSourcesOfFinance
  ])

  const shortTermLiabilities = sumProps([
    partials.tradeCreditors,
    partials.accruals,
    partials.deferredIncome,
    partials.payableVAT,
    partials.payableCorporateTax,
    partials.payableTaxIncome,
    partials.payableSSC,
    partials.provisionHolidayPay
  ])

  const liabilities = sumProps([equity, longTermDebt, shortTermLiabilities])

  const balance = subtractProps(assets, liabilities)

  return [
    {name: 'Assets', values: assets, className: 'header' },

    {name: 'Fixed assets', values: fixedAssets, className: 'main-top' },
    {name: 'Tangibles & intangibles', values: partials.tangiblesAndIntangibles },
    {name: 'Financial fixed assets', values: partials.financialFixedAssets },
    {name: 'Deferred tax asset', values: partials.deferredTaxAsset },

    {name: 'Current assets', values: currentAssets, className: 'main-top' },
    {name: 'Goods in stock', values: partials.goodsInStock },
    {name: 'Trade receivables', values: partials.tradeReceivables },
    {name: 'Prepayments', values: partials.prepayments },
    {name: 'Accrued income', values: partials.accruedIncome },
    {name: 'Receivable VAT', values: partials.receivableVAT },

    {name: 'Cash & bank (not yet implemented)', values: cashAndBank, className: 'main-middle' },

    {name: 'Liabilities', values: liabilities, className: 'header' },

    {name: 'Equity', values: equity, className: 'main-top' },
    {name: 'Paid-in capital', values: partials.paidInCapital },
    {name: 'Agio', values: partials.agio },
    {name: 'Reserves', values: partials.reserves },
    {name: 'Profit/loss for the year', values: partials.netResult },

    {name: 'Long-term debt', values: longTermDebt, className: 'main-top' },
    {name: 'Bank loans', values: partials.bankLoans },
    {name: 'other long-term interest bearing debt', values: partials.otherSourcesOfFinance },

    {name: 'Short-term liabilities', values: shortTermLiabilities, className: 'main-top' },
    {name: 'Trade creditors', values: partials.tradeCreditors },
    {name: 'Accruals', values: partials.accruals },
    {name: 'Deferred Income', values: partials.deferredIncome },
    {name: 'Payable VAT', values: partials.payableVAT },
    {name: 'Payable Corporate tax', values: partials.payableCorporateTax },
    {name: 'Payable income tax', values: partials.payableTaxIncome },
    {name: 'Payable Social security contributions', values: partials.payableSSC },
    {name: 'Provision holiday pay', values: partials.provisionHolidayPay },

    {name: 'Balance', values: balance, className: 'header', showZeros: true }
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
    return value != undefined ? parseValue(value) : 0
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

export function calculateDeferredTaxAsset (profitAndLoss, corporateTaxRate, years) {
  const ebt = profitAndLoss.find(e => e.id === 'ebt').values
  const deferredTaxAsset = {}

  let cumulative = 0
  years.forEach(year => {
    cumulative += (ebt[year] || 0)
    deferredTaxAsset[year] = cumulative < 0 ? -cumulative * corporateTaxRate : 0
  })

  return deferredTaxAsset
}

/**
 * Calculate totals of a the asset values
 * @param {Object} data
 * @param {Array.<number>} years
 * @return {Object.<string, number>}
 */
export function calculateAssetValues (data, years) {
  const initial = initProps(years)

  const allInvestments = data.investments.tangible.concat(data.investments.intangible)

  return allInvestments
      .map(investment => types.investment.calculateAssetValue(investment, years))
      .reduce(addProps, initial)
}

/**
 * Calculate the accumulated financial fixed assets
 * (based on the field data.financing.investmentsInParticipations)
 * @param data
 * @param {Array.<number>} years
 * @return {Object.<string, number>}
 */
export function calculateFinancialFixedAssets (data, years) {
  const investments = data.financing.investmentsInParticipations
  const fixedAssets = {}

  let cumulative = 0
  years.forEach(year => {
    cumulative += parseValue(investments[year] || 0)
    fixedAssets[year] = cumulative
  })

  return fixedAssets
}

/**
 * Calculate payments, build up as the sum of:
 *
 * - direct costs
 * - other direct costs
 * - tangible and intangible investments
 *
 * @param data
 * @param profitAndLoss
 * @param {Array.<number>} years
 * @return {Object.<string, number>}
 */
export function calculatePayments(data, profitAndLoss, years) {
  const directCosts = profitAndLoss.find(e => e.id === 'directCosts').values
  const indirectCosts = profitAndLoss.find(e => e.id === 'indirectCosts').values

  const allInvestments = data.investments.tangible.concat(data.investments.intangible)
  const totalInvestments = allInvestments
      .map(category => types.investment.calculatePxQ(category, years))
      .reduce(addProps, initProps(years))

  return sumProps([directCosts, indirectCosts, totalInvestments])
}

/**
 * Calculate payable income tax
 *
 * @param data
 * @param {Array.<number>} years
 * @return {Object.<string, number>}
 */
export function calculatePayableIncomeTax(data, years) {
  const incomeTaxPaidAfter = parseValue(data.parameters.incomeTaxPaidAfter)

  const incomeTax = data.costs.personnel
      .map(category => types.salary.calculateIncomeTax(category, years))
      .reduce(addProps, initProps(years))

  return multiplyPropsWith(incomeTax, incomeTaxPaidAfter / 12)
}

/**
 * Calculate payable social security contributions
 *
 * @param data
 * @param {Array.<number>} years
 * @return {Object.<string, number>}
 */
export function calculatePayableSSC (data, years) {
  const socialSecurityContributionsPaidAfter = parseValue(data.parameters.socialSecurityContributionsPaidAfter)

  const SSCCosts = data.costs.personnel
      .map(category => types.salary.calculateSSC(category, years))
      .reduce(addProps, initProps(years))

  return multiplyPropsWith(SSCCosts, socialSecurityContributionsPaidAfter / 12)
}

/**
 * Calculate cumulative bank loans
 *
 * @param data
 * @param {Array.<number>} years
 * @return {Object.<string, number>}
 */
export function calculateBankLoans(data, years) {
  const bankLoans = initProps(years)

  years.forEach(year => {
    bankLoans[year] +=
        (bankLoans[year - 1] || 0) +
        parseValue(data.financing.bankLoansCapitalCalls[year] || 0) +
        parseValue(data.financing.bankLoansRedemptionInstallments[year] || 0)
  })

  return bankLoans
}

/**
 * Calculate cumulative other sources of finance
 *
 * @param data
 * @param {Array.<number>} years
 * @return {Object.<string, number>}
 */
export function calculateOtherSourcesOfFinance(data, years) {
  const result = initProps(years)

  years.forEach(year => {
    result[year] +=
        (result[year - 1] || 0) +
        parseValue(data.financing.otherSourcesOfFinance[year] || 0)
  })

  return result
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
      let initialPrice = parseValue(item.price.value)
      let change = 1 + parsePercentage(item.price.change)

      return years.reduce((prices, year, yearIndex) => {
        let quantity = parseQuantity(item, year)

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
        let quantity = parseQuantity(item, year)
        let value = parseValue(item.price.values && item.price.values[year] || '0')

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
     * This returns the depreciation of an investment
     * @param item
     * @param {Array.<number>} years
     * @return {Object.<string, number>} Returns an object with years as key
     *                                   and prices as value
     */
    calculatePrices: function (item, years) {
      const prices = initProps(years)

      // we ignore years for which we don't have a quantity,
      // and also ignore quantities not inside the provided series of years
      years.forEach(year => {
        const price = parseValue(item.price.value)
        const quantity = parseQuantity(item, year)
        const depreciationPeriod = parseValue(item.price.depreciationPeriod)
        const costPerYear = price * quantity / depreciationPeriod

        let y = year
        let assetValue = price * quantity
        while (assetValue > 0 && y in prices) {
          // first year we depreciate half of the cost per year
          const deprecate = (y === year) ? (costPerYear / 2) : costPerYear
          assetValue -= deprecate
          prices[y] += deprecate
          y++
        }
      })

      return prices
    },

    /**
     * Calculate the value of an asset: the initial value minus deprecation till now
     * @param item
     * @param {Array.<number>} years
     * @return {Object.<string, number>} Returns an object with years as key
     *                                   and prices as value
     */
    calculateAssetValue: function (item, years) {
      const assetValues = initProps(years)

      // we ignore years for which we don't have a quantity,
      // and also ignore quantities not inside the provided series of years
      years.forEach(year => {
        const price = parseValue(item.price.value)
        const quantity = parseQuantity(item, year)
        const depreciationPeriod = parseValue(item.price.depreciationPeriod)
        const costPerYear = price * quantity / depreciationPeriod

        let y = year
        let assetValue = price * quantity
        while (assetValue > 0 && y in assetValues) {
          // first year we depreciate half of the cost per year
          const deprecate = (y === year) ? (costPerYear / 2) : costPerYear
          assetValue -= deprecate
          assetValues[y] += assetValue
          y++
        }
      })

      return assetValues
    },

    /**
     * Calculate price times quantity for an asset
     * @param item
     * @param {Array.<number>} years
     * @return {Object.<string, number>} Returns an object with years as key
     *                                   and prices as value
     */
    calculatePxQ: function (item, years) {
      const prices = initProps(years)

      // we ignore years for which we don't have a quantity,
      // and also ignore quantities not inside the provided series of years
      years.forEach(year => {
        const price = parseValue(item.price.value)
        const quantity = parseQuantity(item, year)
        prices[year] = price * quantity
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
      const monthlySalary = parseValue(item.price.value)
      const change = 1 + parsePercentage(item.price.change)
      const holidayProvision = 1 + parsePercentage(item.price.holidayProvision)
      const SSCEmployer = 1 + parsePercentage(item.price.SSCEmployer)

      const prices = initProps(years)

      years.forEach((year, yearIndex) => {
        const quantity = parseQuantity(item, year)

        if (item.price.value != undefined && item.price.change != undefined) {
          prices[year] =
              holidayProvision * SSCEmployer * Math.pow(change, yearIndex) *
              monthlySalary * 12 *
              quantity
        }
      })

      return prices
    },

    /**
     * Calculate income tax for a salary
     * @param item
     * @param {Array.<number>} years
     * @return {Object.<string, number>} Returns an object with years as key
     *                                   and prices as value
     */
    calculateIncomeTax: function (item, years) {
      const monthlySalary = parseValue(item.price.value)
      const change = 1 + parsePercentage(item.price.change)
      const prices = initProps(years)
      const incomeTax = parsePercentage(item.price.incomeTax)
      
      years.forEach((year, yearIndex) => {
        const quantity = parseQuantity(item, year)

        if (item.price.value != undefined && item.price.change != undefined) {
          prices[year] =
              incomeTax * Math.pow(change, yearIndex) *
              monthlySalary * 12 *
              quantity
        }
      })

      return prices
    },

    /**
     * Calculate social security costs for a salary (SSC employer + SSC employee)
     * @param item
     * @param {Array.<number>} years
     * @return {Object.<string, number>} Returns an object with years as key
     *                                   and prices as value
     */
    calculateSSC: function (item, years) {
      const monthlySalary = parseValue(item.price.value)
      const change = 1 + parsePercentage(item.price.change)
      const prices = initProps(years)
      const SSCEmployer = parsePercentage(item.price.SSCEmployer)
      const SSCEmployee = parsePercentage(item.price.SSCEmployee)

      years.forEach((year, yearIndex) => {
        const quantity = parseQuantity(item, year)

        if (item.price.value != undefined && item.price.change != undefined) {
          prices[year] =
              (SSCEmployer + SSCEmployee) * Math.pow(change, yearIndex) *
              monthlySalary * 12 *
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
  const numberOfYears = parseInt(data.parameters.numberOfYears)

  return createYearsArray(startingYear, numberOfYears)
}

export function createYearsArray(startingYear, numberOfYears) {
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
 * @param {string | number} value
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
 *     parseValue('23')    // 23
 *     parseValue('15k')   // 15000
 *     parseValue('2M')    // 2000000
 *     parseValue('6B')    // 6000000000
 *
 * @param {string} value
 * @return {number} The numeric value of the value
 */
export function parseValue (value) {
  let match = /^([+-]?[0-9]+[.]?[0-9]*)([kMBT])?$/.exec(value)

  if (!match) {
    throw new Error('Invalid value "' + value + '"')
  }

  let suffixes = {
    'undefined': 1,
    k: 1e3,
    M: 1e6,
    B: 1e9,
    T: 1e12
  }

  if (match[2] && (!(match[2] in suffixes))) {
    throw new Error('Invalid value "' + value + '"')
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
