import Immutable from 'seamless-immutable'
import debugFactory from 'debug/browser'

import { merge } from 'lodash'

import { uuid } from '../utils/uuid'
import { removeItem } from '../utils/immutable'

const debug = debugFactory('vbi:reducers')

const EMPTY_DOC = Immutable({
  title: 'New Scenario',
  data: {
    parameters: {
      startingYear: "2016",
      numberOfYears: "5",
      currency: "\u20ac",
      currencyMagnitude: "1000",
      numberOfDecimals: "0",
      startingCapital: "10k",
      VATRate: "21%",
      corporateTaxRate: "25%",

      interestPayableOnOverdraft: "8%",
      interestPayableOnLoans: "5%",
      interestReceivableOnCredit: "1%",

      VATPaidAfter: "3",
      corporateTaxPaidAfter: "12",
      incomeTaxPaidAfter: "1",
      socialSecurityContributionsPaidAfter: "1",

      daysInStockOfInventory: "10",
      daysAccountsReceivablesOutstanding: "30",
      daysPrepaymentOfExpenditure: "5",
      daysAccrualOfIncome: "15",
      daysAccountsPayableOutstanding: "30",
      daysAccrualOfCost: "15",
      daysDeferredIncome: "15",

      monthOfHolidayPayment: "5"
    },
    costs: {
      direct: [],
      personnel: [],
      indirect: []
    },
    investments: {
      tangible: [],
      intangible: []
    },
    revenues: {
      all: []
    },
    financing: {
      investmentsInParticipations: {},
      equityContributions: {},
      bankLoansCapitalCalls: {},
      bankLoansRedemptionInstallments: {},
      otherSourcesOfFinance: {}
    }
  }
})

/**
 * Ensure that all required fields are available in the document.
 * Missing fields will be added
 * @param {Object} doc
 * @return {Object}
 */
function sanitizeDoc (doc) {
  return Immutable(merge({}, EMPTY_DOC, doc))
}


const doc = (state = Immutable({}), action) => {
  let path, last, categoryIndex

  debug(action.type, action)

  switch (action.type) {
    case 'DOC_SET':
      return sanitizeDoc(action.doc)

    case 'DOC_NEW':
      return EMPTY_DOC

    case 'DOC_RENAME':
      return state.set('title', action.title)

    case 'DOC_SET_PARAMETER':
      return state.setIn(['data', 'parameters', action.parameter], action.value)

    case 'DOC_SET_PROPERTY':
      return state.setIn(action.path, action.value)

    case 'DOC_ADD_CATEGORY':
      path = ['data', action.section, action.group]

      const category = Immutable({
        id: uuid(),
        name: action.name,
        price: action.price,
        quantities: action.quantities
      })

      return state.updateIn(path,
          categories => categories.concat([category]))

    case 'DOC_RENAME_CATEGORY':
      path = findCategoryPath(state.data, action.section, action.group, action.categoryId)
          .concat(['name'])

      return state.setIn(path, action.name)

    case 'DOC_MOVE_CATEGORY_UP':
        // TODO: simplify this function
      path = findCategoryPath(state.data, action.section, action.group, action.categoryId)

      last = path.length - 1
      categoryIndex = path[last]
      path = removeItem(path, last)

      if (categoryIndex > 0) {
        return state.updateIn(path, categories => {
          return Immutable([].concat(
              categories.slice(0, categoryIndex - 1),
              [categories[categoryIndex], categories[categoryIndex - 1]],
              categories.slice(categoryIndex + 1)
          ))
        })
      }
      else {
        return state
      }

    case 'DOC_MOVE_CATEGORY_DOWN': // TODO


    case 'DOC_DELETE_CATEGORY':
      // TODO: simplify this function
      path = findCategoryPath(state.data, action.section, action.group, action.categoryId)

      last = path.length - 1
      categoryIndex = path[last]
      path = removeItem(path, last)

      return state.updateIn(path, categories => removeItem(categories, categoryIndex))

    case 'DOC_SET_PRICE':
      path = findCategoryPath(state.data, action.section, action.group, action.categoryId)
          .concat(['price'])

      return state.setIn(path, action.price)

    case 'DOC_SET_QUANTITY':
      path = findCategoryPath(state.data, action.section, action.group, action.categoryId)
          .concat(['quantities', action.year])

      return state.setIn(path, action.quantity)

    default:
      return state
  }
}


function findCategoryPath (data, section, group, categoryId) {
  const categoryIndex = data[section][group].findIndex(c => c.id === categoryId)

  if (categoryIndex === -1) {
    throw new Error(`Category not found`)
  }

  return ['data', section, group, categoryIndex]
}



export default doc
