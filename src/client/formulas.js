import debugFactory from 'debug/browser'
import {
    addProps, subtractProps, mapProps, negateProps, initProps, accumulateProps,
    diffProps, multiplyPropsWith, sumProps, getProp
} from './utils/object'

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
  const corporateTaxRate = parseValue(data.parameters.corporateTaxRate)

  const revenueTotalsPerCategory = calculateTotalsPerCategory(data.revenues.all, years)
  const revenues = calculateTotals(data.revenues.all, years)

  const directCosts = calculateTotals(data.costs.direct, years, revenueTotalsPerCategory)
  const holidayProvision = parseValue(data.parameters.holidayProvision)
  const SSCEmployer = parseValue(data.parameters.SSCEmployer)
  const personnelCosts = multiplyPropsWith(
      calculateTotals(data.costs.personnel, years),
      (1 + holidayProvision) * (1 + SSCEmployer)
  )
  const indirectCosts = calculateTotals(data.costs.indirect, years, revenueTotalsPerCategory)

  const grossMargin = subtractProps(revenues, directCosts)
  const EBITDA = subtractProps(grossMargin, indirectCosts)

  const allInvestments = data.investments.tangible.concat(data.investments.intangible)
  const depreciation = calculateTotals(allInvestments, years)

  const EBIT = subtractProps(EBITDA, depreciation)

  const interestPayableOnLoans = parseValue(data.parameters.interestPayableOnLoans)
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
 * @param {Object} data
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
    {name: 'EBIT', values: partials.EBIT, className: 'main middle' },
    {name: 'Interest', values: partials.interest },
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
 * @returns {Object} Returns an object with balance sheet partials
 */
export function calculateBalanceSheetPartials (data) {
  const profitAndLossPartials = calculateProfitAndLossPartials(data)

  const corporateTaxRate = parseValue(data.parameters.corporateTaxRate)
  const years = getYears(data)
  const revenues = profitAndLossPartials.revenues
  const netResult = profitAndLossPartials.netResult
  const corporateTaxes = profitAndLossPartials.corporateTaxes
  const investments = calculateInvestments(data, years)

  const payments = sumProps([
    profitAndLossPartials.directCosts,
    profitAndLossPartials.indirectCosts,
    investments
  ])

  // fixedAssets
  const tangiblesAndIntangibles = calculateAssetValues(data, years)
  const financialFixedAssets = calculateFinancialFixedAssets(data, years)
  const deferredTaxAssets = calculateDeferredTaxAssets(profitAndLossPartials, corporateTaxRate, years)

  // goodsInStock
  const daysInStockOfInventory = parseValue(data.parameters.daysInStockOfInventory)
  const revenueTotalsPerCategory = calculateTotalsPerCategory(data.revenues.all, years)
  const goodsInStock = multiplyPropsWith(
      calculateTotals(data.costs.direct, years, revenueTotalsPerCategory),
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
  const VATRate = parseValue(data.parameters.VATRate)
  const monthsVATPaidAfter = parseValue(data.parameters.monthsVATPaidAfter)
  const receivableVAT = multiplyPropsWith(payments, VATRate * monthsVATPaidAfter / 12)

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
  const payableVAT = multiplyPropsWith(revenues, VATRate * monthsVATPaidAfter / 12)

  // payableCorporateTax
  const monthsCorporateTaxPaidAfter = parseValue(data.parameters.monthsCorporateTaxPaidAfter)
  const payableCorporateTax = {}
  years.forEach(year => {
    const difference = (corporateTaxes[year] || 0) - (deferredTaxAssets[year - 1] || 0)
    if (difference > 0) {
      payableCorporateTax[year] = (difference * monthsCorporateTaxPaidAfter / 12)
    }
    else {
      payableCorporateTax[year] = 0
    }
  })

  // payableIncomeTax
  const payableIncomeTax = calculatePayableIncomeTax(data, years)

  // payableSSC
  const payableSSC = calculatePayableSSC(data, years)

  // provisionHolidayPayment
  const monthOfHolidayPayment = parseValue(data.parameters.monthOfHolidayPayment)
  const personnelCosts = profitAndLossPartials.personnelCosts
  const provisionHolidayPayment = multiplyPropsWith(personnelCosts,
      // (12 / 13) / 12 * ((12 - monthOfHolidayPayment) / 12))
      (12 - monthOfHolidayPayment) / 12 / 13)

  return {
    // fixed assets
    tangiblesAndIntangibles,
    financialFixedAssets,
    deferredTaxAssets,

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
    payableIncomeTax,
    payableSSC,
    provisionHolidayPayment
  }
}

/**
 * Generate balance sheet data
 * @param {Object} data
 * @return {Array.<{name: string, values: {}, className: string}>}
 */
export function calculateBalanceSheet (data) {
  const partials = calculateBalanceSheetPartials(data)
  const cashflowPartials = calulateCashflowPartials(data)
  
  const fixedAssets = sumProps([
    partials.tangiblesAndIntangibles,
    partials.financialFixedAssets,
    partials.deferredTaxAssets
  ])

  const currentAssets = sumProps([
    partials.goodsInStock,
    partials.tradeReceivables,
    partials.prepayments,
    partials.accruedIncome,
    partials.receivableVAT
  ])

  const cashAndBank = cashflowPartials.totalCashBalanceEoP

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
    partials.payableIncomeTax,
    partials.payableSSC,
    partials.provisionHolidayPayment
  ])

  const liabilities = sumProps([equity, longTermDebt, shortTermLiabilities])

  const balance = subtractProps(assets, liabilities)

  return [
    {name: 'Assets', values: assets, className: 'header' },

    {name: 'Fixed assets', values: fixedAssets, className: 'main top' },
    {name: 'Tangibles & intangibles', values: partials.tangiblesAndIntangibles },
    {name: 'Financial fixed assets', values: partials.financialFixedAssets },
    {name: 'Deferred tax assets', values: partials.deferredTaxAssets },

    {name: 'Current assets', values: currentAssets, className: 'main top' },
    {name: 'Goods in stock', values: partials.goodsInStock },
    {name: 'Trade receivables', values: partials.tradeReceivables },
    {name: 'Prepayments', values: partials.prepayments },
    {name: 'Accrued income', values: partials.accruedIncome },
    {name: 'Receivable VAT', values: partials.receivableVAT },

    {name: 'Cash & bank', values: cashAndBank, className: 'main middle' },

    {name: 'Liabilities', values: liabilities, className: 'header' },

    {name: 'Equity', values: equity, className: 'main top' },
    {name: 'Paid-in capital', values: partials.paidInCapital },
    {name: 'Agio', values: partials.agio },
    {name: 'Reserves', values: partials.reserves },
    {name: 'Profit/loss for the year', values: partials.netResult },

    {name: 'Long-term debt', values: longTermDebt, className: 'main top' },
    {name: 'Bank loans', values: partials.bankLoans },
    {name: 'other long-term interest bearing debt', values: partials.otherSourcesOfFinance },

    {name: 'Short-term liabilities', values: shortTermLiabilities, className: 'main top' },
    {name: 'Trade creditors', values: partials.tradeCreditors },
    {name: 'Accruals', values: partials.accruals },
    {name: 'Deferred Income', values: partials.deferredIncome },
    {name: 'Payable VAT', values: partials.payableVAT },
    {name: 'Payable Corporate tax', values: partials.payableCorporateTax },
    {name: 'Payable income tax', values: partials.payableIncomeTax },
    {name: 'Payable Social security contributions', values: partials.payableSSC },
    {name: 'Provision holiday pay', values: partials.provisionHolidayPayment },

    {name: 'Balance', values: balance, className: 'header' }
  ]
}

/**
 * Calculate partials for Cashflow
 * @param data
 * @return {Object}
 */
export function calulateCashflowPartials (data) {
  const years = getYears(data)
  const profitAndLossPartials = calculateProfitAndLossPartials(data)
  const balanceSheetPartials = calculateBalanceSheetPartials(data)

  const changesInDeferredTaxAssets = negateProps(diffProps(balanceSheetPartials.deferredTaxAssets))

  const NOPLAT = sumProps([
    profitAndLossPartials.netResult,
    changesInDeferredTaxAssets
  ])

  // changes in working capital
  const changesInStock = negateProps(diffProps(balanceSheetPartials.goodsInStock))
  const changesInAccountsReceivables = negateProps(diffProps(balanceSheetPartials.tradeReceivables))
  const changesInPrepayments = negateProps(diffProps(balanceSheetPartials.prepayments))
  const changesInAccruedIncome = negateProps(diffProps(balanceSheetPartials.accruedIncome))
  const changesInAccountsPayables = diffProps(balanceSheetPartials.tradeCreditors)
  const changesInAccruals = diffProps(balanceSheetPartials.accruals)
  const changesInDeferredIncome = diffProps(balanceSheetPartials.deferredIncome)
  const changesInWorkingCapital = sumProps([
    changesInStock,
    changesInAccountsReceivables,
    changesInPrepayments,
    changesInAccruedIncome,
    changesInAccountsPayables,
    changesInAccruals,
    changesInDeferredIncome
  ])

  // Changes in taxes & social security contributions
  const changesInReceivableVAT = negateProps(diffProps(balanceSheetPartials.receivableVAT))
  const changesInPayableVAT = diffProps(balanceSheetPartials.payableVAT)
  const changesInPayableCorporateTax = diffProps(balanceSheetPartials.payableCorporateTax)
  const changesInPayableIncomeTax = diffProps(balanceSheetPartials.payableIncomeTax)
  const changesInPayableSSC = diffProps(balanceSheetPartials.payableSSC)
  const changesInHolidayPayment = diffProps(balanceSheetPartials.provisionHolidayPayment)
  const changesInTaxesAndSSC = sumProps([
    changesInReceivableVAT,
    changesInPayableVAT,
    changesInPayableCorporateTax,
    changesInPayableIncomeTax,
    changesInPayableSSC,
    changesInHolidayPayment
  ])

  const cashflowFromOperations = sumProps([
    NOPLAT,
    profitAndLossPartials.depreciation,
    changesInWorkingCapital,
    changesInTaxesAndSSC
  ])

  // investments
  const investmentsInFixedAssets = negateProps(calculateInvestments(data, years))
  const investmentsInParticipations = initProps(years, function (year) {
    return parseValue(data.financing.investmentsInParticipations[year] || '0')
  })
  const cashflowFromInvestments = sumProps([
    investmentsInFixedAssets,
    investmentsInParticipations
  ])

  // financing
  const equityContributions = initProps(years, function (year) {
    return parseValue(data.financing.equityContributions[year] || '0')
  })
  const bankLoansCapitalCalls = initProps(years, function (year) {
    return parseValue(data.financing.bankLoansCapitalCalls[year] || '0')
  })
  const bankLoansRedemptionInstallments = initProps(years, function (year) {
    return parseValue(data.financing.bankLoansRedemptionInstallments[year] || '0')
  })
  const otherSourcesOfFinance = initProps(years, function (year) {
    return parseValue(data.financing.otherSourcesOfFinance[year] || '0')
  })
  const cashflowFromFinancing = sumProps([
    equityContributions,
    bankLoansCapitalCalls,
    bankLoansRedemptionInstallments,
    otherSourcesOfFinance
  ])

  const startingCapital = parseValue(data.parameters.startingCapital)
  const cashflow = sumProps([
    cashflowFromOperations,
    cashflowFromInvestments,
    cashflowFromFinancing
  ])

  const totalCashBalanceEoP = mapProps(accumulateProps(cashflow), value => value + startingCapital)

  return {
    netResult: profitAndLossPartials.netResult,
    changesInDeferredTaxAssets,
    NOPLAT,
    depreciation: profitAndLossPartials.depreciation,

    changesInStock,
    changesInAccountsReceivables,
    changesInPrepayments,
    changesInAccruedIncome,
    changesInAccountsPayables,
    changesInAccruals,
    changesInDeferredIncome,
    changesInWorkingCapital,

    changesInReceivableVAT,
    changesInPayableVAT,
    changesInPayableCorporateTax,
    changesInPayableIncomeTax,
    changesInPayableSSC,
    changesInHolidayPayment,
    changesInTaxesAndSSC,

    cashflowFromOperations,

    investmentsInFixedAssets,
    investmentsInParticipations,
    cashflowFromInvestments,

    equityContributions,
    bankLoansCapitalCalls,
    bankLoansRedemptionInstallments,
    otherSourcesOfFinance,
    cashflowFromFinancing,

    totalCashBalanceEoP
  }
}

/**
 * Calculate cashflow data
 * @param data
 * @return {Array}
 */
export function calulateCashflow (data) {
  const partials = calulateCashflowPartials(data)

  return [
    {name: 'Net result', values: partials.netResult },

    {name: 'Changes in deferred tax assets', values: partials.changesInDeferredTaxAssets },
    {name: 'NOPLAT', values: partials.NOPLAT },
    
    {name: 'Depreciation & amortization', values: partials.depreciation },
      
    {name: 'Changes in working capital', values: partials.changesInWorkingCapital, className: 'main top' },
    {name: 'Changes in stock', values: partials.changesInStock},
    {name: 'Changes in accounts receivables', values: partials.changesInAccountsReceivables},
    {name: 'Changes in prepayments', values: partials.changesInPrepayments},
    {name: 'Changes in accrued income', values: partials.changesInAccruedIncome},
    {name: 'Changes in accounts payables', values: partials.changesInAccountsPayables},
    {name: 'Changes in accruals', values: partials.changesInAccruals},
    {name: 'Changes in deferred income', values: partials.changesInDeferredIncome},

    {name: 'Changes in taxes & social security contributions', values: partials.changesInTaxesAndSSC, className: 'main top'},
    {name: 'Changes in receivable VAT', values: partials.changesInReceivableVAT },
    {name: 'Changes in payable VAT', values: partials.changesInPayableVAT },
    {name: 'Changes in payable corporate tax', values: partials.changesInPayableCorporateTax },
    {name: 'Changes in payable income tax', values: partials.changesInPayableIncomeTax },
    {name: 'Changes in payable social security contributions ', values: partials.changesInPayableSSC },
    {name: 'Holiday payment', values: partials.changesInHolidayPayment },

    {name: 'Cashflow from operations', values: partials.cashflowFromOperations, className: 'header middle' },

    {name: 'Investments in fixed assets', values: partials.investmentsInFixedAssets },
    {name: 'Investments in participations', editable: true, path: ['data', 'financing', 'investmentsInParticipations']},
    {name: 'Cashflow from investments', values: partials.cashflowFromInvestments, className: 'header middle' },

    {name: 'Equity contributions', editable: true, path: ['data', 'financing', 'equityContributions'] },
    {name: 'Bank loans capital calls', editable: true, path: ['data', 'financing', 'bankLoansCapitalCalls'] },
    {name: 'Bank loans redemption installments', editable: true, path: ['data', 'financing', 'bankLoansRedemptionInstallments']},
    {name: 'Other sources of finance', editable: true, path: ['data', 'financing', 'otherSourcesOfFinance']},
    {name: 'Cashflow from financing', values: partials.cashflowFromFinancing, className: 'header middle' },
      
    {name: 'Total cash balance EoP', values: partials.totalCashBalanceEoP, className: 'header middle' }
  ]
}

export function calculateDeferredTaxAssets (profitAndLossPartials, corporateTaxRate, years) {
  const ebt = profitAndLossPartials.EBT
  const deferredTaxAssets = {}

  let cumulative = 0
  years.forEach(year => {
    cumulative += (ebt[year] || 0)
    deferredTaxAssets[year] = cumulative < 0 ? -cumulative * corporateTaxRate : 0
  })

  return deferredTaxAssets
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
 * Calculate PxQ for the investments (both tangible and intangible)
 *
 * @param data
 * @param {Array.<number>} years
 * @return {Object.<string, number>}
 */
export function calculateInvestments(data, years) {
  const allInvestments = data.investments.tangible.concat(data.investments.intangible)

  return allInvestments
      .map(category => types.investment.calculatePxQ(category, years))
      .reduce(addProps, initProps(years))
}

/**
 * Calculate payable income tax
 *
 * @param data
 * @param {Array.<number>} years
 * @return {Object.<string, number>}
 */
export function calculatePayableIncomeTax(data, years) {
  const incomeTax = parseValue(data.parameters.incomeTax)
  const monthsIncomeTaxPaidAfter = parseValue(data.parameters.monthsIncomeTaxPaidAfter)

  return multiplyPropsWith(
      calculateTotals(data.costs.personnel, years),
      incomeTax * monthsIncomeTaxPaidAfter / 12
  )
}

/**
 * Calculate payable social security contributions
 *
 * @param data
 * @param {Array.<number>} years
 * @return {Object.<string, number>}
 */
export function calculatePayableSSC (data, years) {
  const monthsSSCPaidAfter = parseValue(data.parameters.monthsSSCPaidAfter)
  const SSCEmployer = parseValue(data.parameters.SSCEmployer)
  const SSCEmployee = parseValue(data.parameters.SSCEmployee)

  return multiplyPropsWith(
      calculateTotals(data.costs.personnel, years),
      (SSCEmployer + SSCEmployee) * monthsSSCPaidAfter / 12
  )
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
      let change = 1 + parseValue(item.price.change)

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
        let percentage = parseValue(item.price.percentage)

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
              let percentage = parseValue(p.percentage)
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
      const change = 1 + parseValue(item.price.change)
      const prices = initProps(years)

      years.forEach((year, yearIndex) => {
        const quantity = parseQuantity(item, year)

        if (item.price.value != undefined && item.price.change != undefined) {
          prices[year] =
              Math.pow(change, yearIndex) *
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

export const numberRegExp = /^([+-]?[0-9]+[.]?[0-9]*)([kMBT])?$/
export const percentageRegExp = /^([+-]?[0-9]+[.]?[0-9]*)%$/

/**
 * Parse a string into a number. Examples:
 *
 *     parseValue('23')    // 23
 *     parseValue('15k')   // 15000
 *     parseValue('2M')    // 2000000
 *     parseValue('6B')    // 6000000000
 *     parseValue('10%')   // 0.1
 *     parseValue('+5%')   // 0.05
 *     parseValue('-2.5%') // -0.025
 *
 * @param {string} value
 * @return {number} The numeric value of the value.
 *                  Return 0 when the string does not contain a valid value
 */
export function parseValue (value) {
  // parse a number
  const matchNumber = numberRegExp.exec(value)
  if (matchNumber) {
    let suffixes = {
      'undefined': 1,
      k: 1e3,
      M: 1e6,
      B: 1e9,
      T: 1e12
    }

    if (matchNumber[2] && (!(matchNumber[2] in suffixes))) {
      throw new Error('Invalid value "' + value + '"')
    }

    return parseFloat(matchNumber[1]) * suffixes[matchNumber[2]]
  }

  let matchPercentage = percentageRegExp.exec(value)
  if (matchPercentage) {
    return parseFloat(matchPercentage[1]) / 100
  }

  return 0
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
