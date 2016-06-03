import debugFactory from 'debug/browser'
import {
    addProps, subtractProps, mapProps, negateProps, initProps, accumulateProps,
    diffProps, multiplyPropsWith, sumProps
} from './utils/object'
import { parseValue } from './utils/number'

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
 * @param {Scenario} data
 */
export function calculateProfitAndLossPartials (data) {
  const years = getYears(data)
  const corporateTaxRate = parseValue(data.parameters.corporateTaxRate)

  const revenues = calculatePxQ(data.revenues.all, years)

  const directCosts = calculatePxQ(data.costs.direct, years, revenues)
  const holidayProvision = parseValue(data.parameters.holidayProvision)
  const SSCEmployer = parseValue(data.parameters.SSCEmployer)
  const personnelCosts = multiplyPropsWith(
      calculatePxQ(data.costs.personnel, years),
      (1 + holidayProvision) * (1 + SSCEmployer)
  )
  const indirectCosts = calculatePxQ(data.costs.indirect, years, revenues)

  const grossMargin = subtractProps(revenues, directCosts)
  const EBITDA = subtractProps(grossMargin, indirectCosts)

  const allInvestments = data.investments.tangible.concat(data.investments.intangible)
  const depreciation = calculatePxQ(allInvestments, years)

  const EBIT = subtractProps(EBITDA, depreciation)

  const interestPayableOnLoans = parseValue(data.parameters.interestPayableOnLoans)
  const longTermDept = calculateLongTermDebt(data, years)
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
 * @param {Scenario} data
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

  // cumulative bank loans
  const bankLoansCapitalCalls = initProps(years, year => parseValue(data.financing.bankLoansCapitalCalls[year]))
  const bankLoans = accumulateProps(bankLoansCapitalCalls)

  // cumulative otherSourcesOfFinance
  const otherSourcesOfFinance = initProps(years, year => parseValue(data.financing.otherSourcesOfFinance[year]))
  const otherLongTermInterestBearingDebt = accumulateProps(otherSourcesOfFinance)

  // sum up interest
  return addProps(bankLoans, otherLongTermInterestBearingDebt)
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
  const initialYear = years[0] - 1
  const revenues = profitAndLossPartials.revenues
  const profitAndLoss = profitAndLossPartials.netResult
  profitAndLoss[initialYear] = parseValue(data.initialBalance.profitAndLoss)
  const corporateTaxes = profitAndLossPartials.corporateTaxes
  const investments = calculateInvestments(data, years)

  const payments = sumProps([
    profitAndLossPartials.directCosts,
    profitAndLossPartials.indirectCosts,
    investments
  ])

  // fixedAssets
  const tangiblesAndIntangibles = calculateAssetsValues(data, years)
  tangiblesAndIntangibles[initialYear] = parseValue(data.initialBalance.tangiblesAndIntangibles)
  const investmentsInParticipations = initProps(years, year => -parseValue(data.financing.investmentsInParticipations[year]))
  const financialFixedAssets = accumulateProps(investmentsInParticipations)
  financialFixedAssets[initialYear] = parseValue(data.initialBalance.financialFixedAssets)
  const deferredTaxAssets = mapProps(
      accumulateProps(profitAndLossPartials.EBT),
      value => value < 0 ? -value * corporateTaxRate : 0
  )
  deferredTaxAssets[initialYear] = -parseValue(data.initialBalance.deferredTaxAssets)

  // goodsInStock
  const daysInStockOfInventory = parseValue(data.parameters.daysInStockOfInventory)
  const goodsInStock = multiplyPropsWith(
      calculatePxQ(data.costs.direct, years, profitAndLossPartials.revenues),
      daysInStockOfInventory / 365
  )
  goodsInStock[initialYear] = parseValue(data.initialBalance.goodsInStock)

  // tradeReceivables
  const daysAccountsReceivablesOutstanding = parseValue(data.parameters.daysAccountsReceivablesOutstanding)
  const tradeReceivables = multiplyPropsWith(revenues, daysAccountsReceivablesOutstanding / 365)
  tradeReceivables[initialYear] = parseValue(data.initialBalance.tradeReceivables)

  // prepayments
  const daysPrepaymentOfExpenditure = parseValue(data.parameters.daysPrepaymentOfExpenditure)
  const prepayments = multiplyPropsWith(payments, daysPrepaymentOfExpenditure / 365)
  prepayments[initialYear] = parseValue(data.initialBalance.prepayments)

  // accrued income
  const daysAccrualOfIncome = parseValue(data.parameters.daysAccrualOfIncome)
  const accruedIncome = multiplyPropsWith(revenues, daysAccrualOfIncome / 365)
  accruedIncome[initialYear] = parseValue(data.initialBalance.accruedIncome)

  // receivable VAT
  const VATRate = parseValue(data.parameters.VATRate)
  const monthsVATPaidAfter = parseValue(data.parameters.monthsVATPaidAfter)
  const receivableVAT = multiplyPropsWith(payments, VATRate * monthsVATPaidAfter / 12)
  receivableVAT[initialYear] = parseValue(data.initialBalance.receivableVAT)

  // paid in capital
  const startingCapital = parseValue(data.parameters.startingCapital)
  const paidInCapital = initProps(years, startingCapital)
  paidInCapital[initialYear] = startingCapital

  // agio
  const equityContributions = data.financing.equityContributions
  let agio = {}
  years.forEach(year => {
    agio[year] = (agio[year - 1] || 0) + parseValue(equityContributions[year] || 0)
  })
  agio[initialYear] = parseValue(data.initialBalance.agio)

  // reserves
  let reserves = {}
  years.forEach(year => {
    reserves[year] = (reserves[year - 1] || 0) + (profitAndLoss[year - 1] || 0)
  })
  reserves[initialYear] = parseValue(data.initialBalance.reserves)

  // long-term debt
  const bankLoans = accumulateProps(initProps(years, year => {
    return parseValue(data.financing.bankLoansCapitalCalls[year]) +
        parseValue(data.financing.bankLoansRedemptionInstallments[year])
  }))
  bankLoans[initialYear] = parseValue(data.initialBalance.bankLoans)

  const otherSourcesOfFinance = initProps(years, year => parseValue(data.financing.otherSourcesOfFinance[year]))
  const otherLongTermInterestBearingDebt = accumulateProps(otherSourcesOfFinance)
  otherLongTermInterestBearingDebt[initialYear] = parseValue(data.initialBalance.otherLongTermInterestBearingDebt)

  // short-term debt
  const daysAccountsPayableOutstanding = parseValue(data.parameters.daysAccountsPayableOutstanding)
  const daysAccrualOfCost = parseValue(data.parameters.daysAccrualOfCost)
  const daysDeferredIncome = parseValue(data.parameters.daysDeferredIncome)
  const tradeCreditors = multiplyPropsWith(payments, daysAccountsPayableOutstanding / 365)
  tradeCreditors[initialYear] = parseValue(data.initialBalance.tradeCreditors)
  const accruals = multiplyPropsWith(payments, daysAccrualOfCost / 365)
  accruals[initialYear] = parseValue(data.initialBalance.accruals)
  const deferredIncome = multiplyPropsWith(revenues, daysDeferredIncome / 365)
  deferredIncome[initialYear] = parseValue(data.initialBalance.deferredIncome)
  const payableVAT = multiplyPropsWith(revenues, VATRate * monthsVATPaidAfter / 12)
  payableVAT[initialYear] = parseValue(data.initialBalance.payableVAT)

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
  payableCorporateTax[initialYear] = parseValue(data.initialBalance.payableCorporateTax)

  // payableIncomeTax
  const incomeTax = parseValue(data.parameters.incomeTax)
  const monthsIncomeTaxPaidAfter = parseValue(data.parameters.monthsIncomeTaxPaidAfter)
  const payableIncomeTax = multiplyPropsWith(
      calculatePxQ(data.costs.personnel, years),
      incomeTax * monthsIncomeTaxPaidAfter / 12
  )
  payableIncomeTax[initialYear] = parseValue(data.initialBalance.payableIncomeTax)

  // payableSSC
  const SSCEmployer = parseValue(data.parameters.SSCEmployer)
  const SSCEmployee = parseValue(data.parameters.SSCEmployee)
  const monthsSSCPaidAfter = parseValue(data.parameters.monthsSSCPaidAfter)
  const payableSSC = multiplyPropsWith(
      calculatePxQ(data.costs.personnel, years),
      (SSCEmployer + SSCEmployee) * monthsSSCPaidAfter / 12
  )
  payableSSC[initialYear] = parseValue(data.initialBalance.payableSSC)

  // provisionHolidayPayment
  const monthOfHolidayPayment = parseValue(data.parameters.monthOfHolidayPayment)
  const provisionHolidayPayment = multiplyPropsWith(profitAndLossPartials.personnelCosts,
      // (12 / 13) / 12 * ((12 - monthOfHolidayPayment) / 12))   // unsimplified formula
      (12 - monthOfHolidayPayment) / 12 / 13)                    // simplified formula
  provisionHolidayPayment[initialYear] = parseValue(data.initialBalance.provisionHolidayPayment)

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
    profitAndLoss,

    // long-term debt
    bankLoans,
    otherLongTermInterestBearingDebt,

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
 * @param {Scenario} data
 * @return {Array.<{name: string, values: {}, className: string}>}
 */
export function calculateBalanceSheet (data) {
  const years = getYearsWithInitial(data)
  const initialYear = years[0]
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
  cashAndBank[initialYear] = parseValue(data.parameters.startingCapital)

  const assets = sumProps([
    fixedAssets,
    currentAssets,
    cashAndBank
  ])

  const equity = sumProps([
    partials.paidInCapital,
    partials.agio,
    partials.reserves,
    partials.profitAndLoss
  ])

  const longTermDebt = sumProps([
    partials.bankLoans,
    partials.otherLongTermInterestBearingDebt
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

  const balance = mapProps(subtractProps(assets, liabilities), value => {
    return value === -0 ? 0 : value
  })

  return [
    {name: 'Assets', values: assets, className: 'header' },

    {name: 'Fixed assets', values: fixedAssets, className: 'main top' },
    {name: 'Tangibles & intangibles', values: partials.tangiblesAndIntangibles, initialValuePath: ['initialBalance', 'tangiblesAndIntangibles'] },
    {name: 'Financial fixed assets', values: partials.financialFixedAssets, initialValuePath:  ['initialBalance', 'financialFixedAssets'] },
    {name: 'Deferred tax assets', values: partials.deferredTaxAssets, initialValuePath: ['initialBalance', 'deferredTaxAssets'] },

    {name: 'Current assets', values: currentAssets, className: 'main top' },
    {name: 'Goods in stock', values: partials.goodsInStock, initialValuePath: ['initialBalance', 'goodsInStock'] },
    {name: 'Trade receivables', values: partials.tradeReceivables, initialValuePath: ['initialBalance', 'tradeReceivables'] },
    {name: 'Prepayments', values: partials.prepayments, initialValuePath: ['initialBalance', 'prepayments'] },
    {name: 'Accrued income', values: partials.accruedIncome, initialValuePath: ['initialBalance', 'accruedIncome'] },
    {name: 'Receivable VAT', values: partials.receivableVAT, initialValuePath: ['initialBalance', 'receivableVAT'] },

    {name: 'Cash & bank', values: cashAndBank, className: 'main middle' },

    {name: 'Liabilities', values: liabilities, className: 'header' },

    {name: 'Equity', values: equity, className: 'main top' },
    {name: 'Paid-in capital', values: partials.paidInCapital, initialValuePath: ['parameters', 'startingCapital'] },
    {name: 'Agio', values: partials.agio, initialValuePath: ['initialBalance', 'agio'] },
    {name: 'Reserves', values: partials.reserves, initialValuePath: ['initialBalance', 'reserves'] },
    {name: 'Profit/loss for the year', values: partials.profitAndLoss, initialValuePath: ['initialBalance', 'profitAndLoss'] },

    {name: 'Long-term debt', values: longTermDebt, className: 'main top' },
    {name: 'Bank loans', values: partials.bankLoans, initialValuePath: ['initialBalance', 'bankLoans'] },
    {name: 'other long-term interest bearing debt', values: partials.otherLongTermInterestBearingDebt, initialValuePath: ['initialBalance', 'otherLongTermInterestBearingDebt'] },

    {name: 'Short-term liabilities', values: shortTermLiabilities, className: 'main top' },
    {name: 'Trade creditors', values: partials.tradeCreditors, initialValuePath: ['initialBalance', 'tradeCreditors'] },
    {name: 'Accruals', values: partials.accruals, initialValuePath: ['initialBalance', 'accruals'] },
    {name: 'Deferred Income', values: partials.deferredIncome, initialValuePath: ['initialBalance', 'deferredIncome'] },
    {name: 'Payable VAT', values: partials.payableVAT, initialValuePath: ['initialBalance', 'payableVAT'] },
    {name: 'Payable Corporate tax', values: partials.payableCorporateTax, initialValuePath: ['initialBalance', 'payableCorporateTax'] },
    {name: 'Payable income tax', values: partials.payableIncomeTax, initialValuePath: ['initialBalance', 'payableIncomeTax'] },
    {name: 'Payable Social security contributions', values: partials.payableSSC, initialValuePath: ['initialBalance', 'payableSSC'] },
    {name: 'Provision holiday pay', values: partials.provisionHolidayPayment, initialValuePath: ['initialBalance', 'provisionHolidayPayment'] },

    {name: 'Balance', id: 'balance', values: balance, className: 'header' }
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

/**
 * Calculate totals of a the asset values
 * @param {Scenario} data
 * @param {Array.<number>} years
 * @return {Object.<string, number>}
 */
export function calculateAssetsValues (data, years) {
  const initial = initProps(years)

  const allInvestments = data.investments.tangible.concat(data.investments.intangible)

  return allInvestments
      .asMutable()
      .map(investment => types.investment.calculateAssetsValue(investment, years))
      .reduce(addProps, initial)
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
      .map(category => types.investment.calculateInvestmentsValue(category, years))
      .reduce(addProps, initProps(years))
}

/**
 * A map with functions to calculate the price for a specific price type
 */
export let types = {
  constant: {
    /**
     * Calculate actual prices for all years configured for a single item.
     * @param category
     * @param {Array.<number>} years
     * @return {Object.<string, number>} Returns an object with years as key
     *                                   and prices as value
     */
    calculatePxQ: function (category, years) {
      let initialPrice = parseValue(category.price.value)
      let change = 1 + parseValue(category.price.change)

      return years.reduce((prices, year, yearIndex) => {
        let quantity = parseQuantity(category, year)

        if (category.price.value != undefined && category.price.change != undefined) {
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
     * @param category
     * @param {Array.<number>} years
     * @return {Object.<string, number>} Returns an object with years as key
     *                                   and prices as value
     */
    calculatePxQ: function (category, years) {
      return years.reduce((prices, year) => {
        let quantity = parseQuantity(category, year)
        let value = parseValue(category.price.values && category.price.values[year] || '0')

        prices[year] = quantity * value

        return prices
      }, {})
    }
  },

  revenue: {
    /**
     * Calculate actual prices for all years configured for a single item.
     * @param category
     * @param {Array.<number>} years
     * @param {Object.<string, number>} revenues
     *                                   Totals of the revenues, needed to
     *                                   calculate prices based on a
     *                                   percentage of the revenues
     * @return {Object.<string, number>} Returns an object with years as key
     *                                   and prices as value
     */
    calculatePxQ: function (category, years, revenues) {
      if (!revenues) {
        debug(new Error('No revenues available in this context'))
        return {}
      }

      let percentage = parseValue(category.price.percentage)

      return years.reduce((prices, year) => {
        prices[year] = percentage * (revenues[year] || 0)

        return prices
      }, {})
    }
  },

  investment: {
    /**
     * Calculate actual prices for all years configured for a single item.
     * This returns the depreciation of an investment
     * @param category
     * @param {Array.<number>} years
     * @return {Object.<string, number>} Returns an object with years as key
     *                                   and prices as value
     */
    calculatePxQ: function (category, years) {
      const prices = initProps(years)

      // we ignore years for which we don't have a quantity,
      // and also ignore quantities not inside the provided series of years
      years.forEach(year => {
        const price = parseValue(category.price.value)
        const quantity = parseQuantity(category, year)
        const depreciationPeriod = parseValue(category.price.depreciationPeriod)
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
     * @param category
     * @param {Array.<number>} years
     * @return {Object.<string, number>} Returns an object with years as key
     *                                   and prices as value
     */
    calculateAssetsValue: function (category, years) {
      const assetValues = initProps(years)

      // we ignore years for which we don't have a quantity,
      // and also ignore quantities not inside the provided series of years
      years.forEach(year => {
        const price = parseValue(category.price.value)
        const quantity = parseQuantity(category, year)
        const depreciationPeriod = parseValue(category.price.depreciationPeriod)
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
     * @param category
     * @param {Array.<number>} years
     * @return {Object.<string, number>} Returns an object with years as key
     *                                   and prices as value
     */
    calculateInvestmentsValue: function (category, years) {
      const prices = initProps(years)

      // we ignore years for which we don't have a quantity,
      // and also ignore quantities not inside the provided series of years
      years.forEach(year => {
        const price = parseValue(category.price.value)
        const quantity = parseQuantity(category, year)
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
    calculatePxQ: function (item, years) {
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
 * Calculate PxQ (price times quantity) of an array with categories
 * @param {Array.<{price: Object, quantities: Object}>} categories
 * @param {Array.<number>} years
 * @param {Object.<string, number>} [revenues]
 *                                   Totals of the revenues, needed to
 *                                   calculate prices based on a
 *                                   percentage of the revenues
 * @return {Object.<string, number>}
 */
export function calculatePxQ (categories, years, revenues) {
  if (!Array.isArray(categories)) {
    throw new TypeError('Array expected for calculatePxQ')
  }

  const initial = initProps(years)

  return categories
      .map(category => {
        var type = types[category.price.type]

        if (!type) {
          throw new Error('Unknown price type ' + JSON.stringify(category.price.type) + ' ' +
              'in item ' + JSON.stringify(category) + '. ' +
              'Choose from: ' + Object.keys(types).join(','))
        }

        return type.calculatePxQ(category, years, revenues)
      })
      .reduce(addProps, initial)
}
