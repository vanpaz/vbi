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
 *   section: string,
 *   group: string,
 *   label: string,
 *   price: ?Price,
 *   quantities: ?Object<string, string>,
 *   deleted: ?boolean,
 *   custom: boolean,
 *   bmcGroup: ?string,
 *   bmcId: ?string,
 *   bmcChecked: ?boolean
 *   bmcCheckedManually: ?boolean   
 * }} Category
 *
 * @typedef {{value: boolean, isDefault: boolean}} Option
 * @typedef {{id: string, value: string}} TextItem
 *
 * @typedef {{
 *   expenses:          {values: Object.<string, Option>, other: Array.<TextItem>},
 *   activities:        {values: Object.<string, Option>, other: Array.<TextItem>},
 *   contacts:          {values: Object.<string, Option>, other: Array.<TextItem>},
 *   channels:          {values: Object.<string, Option>, other: Array.<TextItem>},
 *   partnerships:      {values: Object.<string, Option>, other: Array.<TextItem>},
 *   investments:       {values: Object.<string, Option>, other: Array.<TextItem>},
 *   customerSegments:  {values: Object.<string, Option>, other: Array.<TextItem>},
 *   costStructure:     Object.<string, {categoryId: string, groupId: string, index: string}>
 * }} BMC
 *
 * @typedef {{
 *   description: {
 *     type: string,
 *     products: Array.<TextItem>,
 *     customers: Array.<TextItem>,
 *     uniqueSellingPoint: string
 *   },
 *   parameters: Parameters,
 *   categories: Array.<Category>,
 *   financing: {
 *     investmentsInParticipations: Object<string, string>
 *     equityContributions: Object<string, string>
 *     bankLoansCapitalCalls: Object<string, string>
 *     bankLoansRedemptionInstallments: Object<string, string>
 *     otherSourcesOfFinance: Object<string, string>
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
 *     otherLongTermInterestBearingDebt: string | number,
 *
 *     tradeCreditors: string | number,
 *     accruals: string | number,
 *     deferredIncome: string | number,
 *     payableVAT: string | number,
 *     payableCorporateTax: string | number,
 *     payableIncomeTax: string | number,
 *     payableSSC: string | number,
 *     provisionHolidayPayment: string | number,
 *   },
 *   bmc: BMC
 * }} Scenario
 *
 **/