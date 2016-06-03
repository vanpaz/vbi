/**
 * This file describes type definitions, purely used for autocompletion and intellisense
 *
 * @typedef {{
 *   startingYear: string,
 *   numberOfYears: string,
 *   currency: string,
 *   currencyMagnitude: string,
 *   numberOfDecimals: string,
 *   startingCapital: string,
 *
 *   VATRate: string,
 *   corporateTaxRate: string,
 *   incomeTax: string,
 *   SSCEmployer: string,
 *   SSCEmployee: string,
 *
 *   interestPayableOnOverdraft: string,
 *   interestPayableOnLoans: string,
 *   interestReceivableOnCredit: string,
 *
 *   daysInStockOfInventory: string,
 *   daysAccountsReceivablesOutstanding: string,
 *   daysPrepaymentOfExpenditure: string,
 *   daysAccrualOfIncome: string,
 *   daysAccountsPayableOutstanding: string,
 *   daysAccrualOfCost: string,
 *   daysDeferredIncome: string,
 *   monthsVATPaidAfter: string,
 *   monthsCorporateTaxPaidAfter: string,
 *   monthsIncomeTaxPaidAfter: string,
 *   monthsSSCPaidAfter: string,
 *
 *   holidayProvision: string,
 *   monthOfHolidayPayment: string
 * }} Parameters
 *
 * @typedef {{type: 'constant', value: string, change: string}} PriceTypeConstant
 * @typedef {{type: 'manual', value: string, change: string}} PriceTypeManual
 * @typedef {{type: 'revenue', percentage: string}} PriceTypeRevenue
 * @typedef {{type: 'investment', value: string, depreciationPeriod: string}} PriceTypeInvestment
 * @typedef {{type: 'salary', value: string, change: string}} PriceTypeSalary
 *
 * @typedef {
 *   PriceTypeConstant |
 *   PriceTypeManual |
 *   PriceTypeRevenue |
 *   PriceTypeInvestment |
 *   PriceTypeSalary
 * } Price
 *
 * @typedef {{
 *   id: string,
 *   name: string,
 *   price: Price,
 *   quantities: Object<string, string>
 * }} Category
 *
 * @typedef {{
 *   parameters: Parameters,
 *   costs: {
 *     direct: Array.<Category>,
 *     personnel: Array.<Category>,
 *     indirect: Array.<Category>
 *   },
 *   investments: {
 *     tangible: Array.<Category>,
 *     intangible: Array.<Category>
 *   },
 *   revenues: {
 *     all: Array.<Category>
 *   },
 *   financing: {
 *     investmentsInParticipations: Object
 *     equityContributions: Object
 *     bankLoansCapitalCalls: Object
 *     bankLoansRedemptionInstallments: Object
 *     otherSourcesOfFinance: Object
 *   },
 *   initialBalance: {
 *     tangiblesAndIntangibles: string | number,
 *     financialFixedAssets: string | number,
 *     deferredTaxAssets: string | number,
 *
 *     goodsInStock: string | number,
 *     tradeReceivables: string | number,
 *     prepayments: string | number,
 *     accruedIncome: string | number,
 *     receivableVAT: string | number,
 *
 *     agio: string | number,
 *     reserves: string | number,
 *     profitAndLoss: string | number,
 *
 *     bankLoans: string | number,
 *     otherSourcesOfFinance: string | number,
 *
 *     tradeCreditors: string | number,
 *     accruals: string | number,
 *     deferredIncome: string | number,
 *     payableVAT: string | number,
 *     payableCorporateTax: string | number,
 *     payableIncomeTax: string | number,
 *     payableSSC: string | number,
 *     provisionHolidayPayment: string | number,
 *   }
 * }} Scenario
 *
 **/