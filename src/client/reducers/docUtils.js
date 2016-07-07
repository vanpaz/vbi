import Immutable from 'seamless-immutable'
import { merge } from 'lodash'

import { uuid } from '../utils/uuid'
import { types } from '../formulas'
import * as newScenarioJSON from '../data/newScenario.json'
import * as bmcDefaults  from'../data/bmcDefaults.json'
import * as bmcCategories from '../data/bmcCategories.json'

const newScenario = Immutable(newScenarioJSON)

/**
 * Ensure that all required fields are available in the document.
 * Missing fields will be added
 * @param {Object} doc
 * @return {Object}
 */
export function sanitizeDoc (doc) {
  const _doc = Immutable(merge({}, newScenario, doc))

  let updatedCategories = updateRevenueCategories(
      _doc.data.categories,
      _doc.data.description.products,
      _doc.data.description.customers)

  updatedCategories = checkBMCCategories(updatedCategories,
      _doc.data.description.type)

  return _doc.setIn(['data', 'categories'], updatedCategories)
}

/**
 * Depending on the selected company type, check/uncheck the BMC categories
 * based on the defaults for the company type
 * @param {Array.<Category>} categories
 * @param {string} companyType
 * @return {Array.<Category>} Returns the updated categories
 */
export function checkBMCCategories (categories, companyType) {
  // uncheck all existing categories which are not marked as bmcDefault===true
  const uncheckedCategories = categories.map(category => {
    if (!category.bmcCheckedManually) {
      return category.set('bmcChecked', false)
    }
    else {
      return category
    }
  })

  // loop over all default categories for this companyType,
  // apply default bmcChecked values
  const defaultCategories = bmcDefaults[companyType]
  if (defaultCategories) {
    const defaults = {}
    defaultCategories.forEach(c => defaults[c.bmcId] = c.bmcChecked)

    const existing = {}
    uncheckedCategories.forEach(c => existing[c.bmcId] = true)

    // update existing categories
    const checkedCategories = uncheckedCategories.map(category => {
      if (category.bmcId in defaults && !category.bmcCheckedManually) {
        return category.set('bmcChecked', defaults[category.bmcId])
      }
      else {
        return category
      }
    })

    // add new categories
    const newCategories = defaultCategories
        .filter(category => !existing[category.bmcId])
        .map(defaultCategory => {
          const bmcId = defaultCategory.bmcId
          const { bmcGroup, label } = bmcCategories.categories.find(c => c.bmcId === bmcId)
          const { section, group } = bmcCategories.groups[bmcGroup]

          const price = (section === 'investments')
              ? types.investment.defaultPrice   // investments
              : types.constant.defaultPrice     // costs

          return {
            id: uuid(),
            label,
            section,
            group,
            price,
            quantities: {},
            bmcGroup: bmcGroup,
            bmcId,
            bmcChecked: defaults[bmcId],
            custom: false
          }
        })

    return checkedCategories.concat(newCategories)
  }
  else {
    return uncheckedCategories
  }
}

/**
 * Update the revenue categories: generate and update revenue categories
 * @param categories
 * @param products
 * @param customers
 * @return {Array} Returns updated categories
 */
export function updateRevenueCategories(categories, products, customers) {
  const revenueCategories = generateRevenueCategories(products, customers)

  const newRevenueCategories = revenueCategories
      .filter(category => !categories.find(c => c.bmcId === category.bmcId))

  const labels = {}
  revenueCategories.forEach(category => labels[category.bmcId] = category.label)

  return categories
      // filter categories that no longer exist
      .filter(category => category.bmcGroup === 'revenues' ? labels[category.bmcId] : true)

      // update label of existing categories
      .map(category => {
        return category.bmcGroup === 'revenues'
            ? category.set('label', labels[category.bmcId])
            : category
      })

      // append new categories
      .concat(newRevenueCategories)
}

/**
 * Create a category for every combination of product and customer
 * @param {Array.<{id: string, value: string}>} products
 * @param {Array.<{id: string, value: string}>} customers
 * @return {Array.<{id: string, value: string}>}
 *   Array with entries having a compound key as id, which is a concatenation
 *   of the id's of the product and customer.
 */
export function generateRevenueCategories (products = [], customers = []) {
  return Immutable(products).flatMap(product => {
    return customers.map(customer => {
      return {
        id: uuid(),
        label: (product.value || '<product>') + ' for ' + (customer.value || '<customer>'),
        section: 'revenues',
        group: 'all',
        price: types.constant.defaultPrice,
        quantities: {},
        bmcGroup: 'revenues',
        bmcChecked: true,
        bmcCheckedManually: true,
        bmcId: product.id + ':' + customer.id
      }
    })
  })
}
