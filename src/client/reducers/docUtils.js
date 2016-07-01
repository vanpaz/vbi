import Immutable from 'seamless-immutable'
import { merge } from 'lodash'

import { uuid } from '../utils/uuid'
import { types } from '../formulas'
import * as newScenarioJSON from '../data/newScenario.json'

const newScenario = Immutable(newScenarioJSON)

/**
 * Ensure that all required fields are available in the document.
 * Missing fields will be added
 * @param {Object} doc
 * @return {Object}
 */
export function sanitizeDoc (doc) {
  const _doc = Immutable(merge({}, newScenario, doc))

  return _doc.setIn(['data', 'categories'], updateRevenueCategories(
      _doc.data.categories,
      _doc.data.description.products,
      _doc.data.description.customers))
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
        bmcId: product.id + ':' + customer.id
      }
    })
  })
}
