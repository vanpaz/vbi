import Immutable from 'seamless-immutable'
import debugFactory from 'debug/browser'

import { uuid } from '../utils/uuid'
import { removeItem, swapItems, replaceItem } from '../utils/immutable'
import { isCustomCategory, types } from '../formulas'
import { sanitizeDoc, updateRevenueCategories, checkBMCCategories } from './docUtils'

const debug = debugFactory('vbi:reducers')

import * as bmcCategories from '../data/bmcCategories.json'

const doc = (state = Immutable({}), action) => {
  let index, filteredIndex, filteredCategories, category

  debug(action.type, action)

  switch (action.type) {
    case 'DOC_SET':
      return sanitizeDoc(action.doc)

    case 'DOC_RENAME':
      return state.set('title', action.title)

    case 'DOC_SET_PROPERTY':
      return state.setIn(['data'].concat(action.path), action.value)

    case 'DOC_SET_PARAMETER':
      return state.setIn(['data', 'parameters', action.parameter], action.value)

    case 'DOC_SET_COMPANY_TYPE':
      return state
          .setIn(['data', 'description', 'type'], action.companyType)
          .setIn(['data', 'categories'], checkBMCCategories(state.data.categories, action.companyType))

    case 'DOC_SET_UNIQUE_SELLING_POINT':
      return state.setIn(['data', 'description', 'uniqueSellingPoint'],
          action.uniqueSellingPoint)

    case 'DOC_SET_PRODUCTS':
      return state
          .setIn(['data', 'description', 'products'], action.products)
          .setIn(['data', 'categories'],
              updateRevenueCategories(state.data.categories, action.products, state.data.description.customers))

    case 'DOC_SET_CUSTOMERS':
      return state
          .setIn(['data', 'description', 'customers'], action.customers)
          .setIn(['data', 'categories'],
              updateRevenueCategories(state.data.categories, state.data.description.products, action.customers))

    case 'DOC_ADD_CATEGORY':
    {
      const category = Immutable({
        id: uuid(),
        section: action.section,
        group: action.group,
        label: action.label,
        price: action.price,
        quantities: action.quantities,
        custom: true
      })

      return state.setIn(['data', 'categories'], state.data.categories.concat([category]))
    }

    case 'DOC_UPDATE_CUSTOM_CATEGORIES':
      const oldCategories = state.data.categories.filter(category => isCustomCategory(category, action.bmcGroup))
      const newCategories = action.categories.map(category => {
        // merge the properties of the new categories into the old ones
        // create new categories when not yet existing
        const oldCategory = oldCategories.find(oldCategory => oldCategory.id === category.id)

        if (oldCategory) {
          // update existing custom category
          return oldCategory.merge({
            id: category.id,
            label: category.label,
            bmcChecked: true, // keep custom category always checked
            bmcCheckedManually: true
          })
        }
        else {
          // it's a new custom category
          const bmcGroupObj = bmcCategories.groups[action.bmcGroup]
          const section = bmcGroupObj && bmcGroupObj.section
          const group = bmcGroupObj && bmcGroupObj.group

          const price = (section === 'investments')
              ? types.investment.defaultPrice   // investments
              : types.constant.defaultPrice     // costs

          return Immutable({
            id: category.id,
            label: category.label,
            section,
            group,
            price,
            quantities: {},
            bmcGroup: action.bmcGroup,
            bmcChecked: true,
            bmcCheckedManually: true,
            custom: true
          })
        }
      })

      return state.setIn(['data', 'categories'], state.data.categories
          .filter(category => !isCustomCategory(category, action.bmcGroup))  // remove the old custom categories
          .concat(newCategories))          // append the new custom categories

    case 'DOC_CHECK_CATEGORY':
      // check a BMC category
      index = state.data.categories
          .findIndex(category => category.bmcId === action.bmcId)

      if (index !== -1) {
        // the category exists in the document, update it
        debug('check existing category', action)

        const category = state.data.categories[index]
        const updatedCategory = category.merge({
          bmcChecked: action.bmcChecked,
          bmcCheckedManually: true
        })

        return state.setIn(['data', 'categories', index], updatedCategory)
      }
      else {
        // add a new category
        const bmcCategory = bmcCategories.categories.find(bmcCategory => bmcCategory.bmcId === action.bmcId)

        if (!bmcCategory) {
          throw new Error('BMC category not found (id=' + action.bmcId + ')')
        }

        const bmcGroupObj = bmcCategories.groups[bmcCategory.bmcGroup]
        const section = bmcGroupObj && bmcGroupObj.section
        const group = bmcGroupObj && bmcGroupObj.group

        const price = (section === 'investments')
            ? types.investment.defaultPrice   // investments
            : types.constant.defaultPrice     // costs

        const newCategory = {
          id: uuid(),
          label: bmcCategory.label,
          section,
          group,
          price,
          quantities: {},
          bmcGroup: bmcCategory.bmcGroup,
          bmcId: bmcCategory.bmcId,
          bmcChecked: action.bmcChecked,
          bmcCheckedManually: true,
          custom: false
        }

        debug('check new category', action, bmcCategory, newCategory)

        return state.setIn(['data', 'categories'], state.data.categories.concat([newCategory]))
      }

    case 'DOC_RENAME_CATEGORY':
      index = state.data.categories.findIndex(category => category.id === action.categoryId)

      return state.setIn(['data', 'categories', index, 'label'], action.label)

    case 'DOC_MOVE_CATEGORY_UP':
    {
      const {section, group} = state.data.categories.find(category => category.id === action.categoryId)

      filteredCategories = filterCategories(state.data, section, group)

      filteredIndex = filteredCategories.findIndex(category => category.id === action.categoryId)
      if (filteredIndex > 0) {
        const prevCategory = filteredCategories[filteredIndex - 1]
        const index = findCategoryIndex(state.data, action.categoryId)
        const prevIndex = findCategoryIndex(state.data, prevCategory.id)

        return state.setIn(['data', 'categories'], swapItems(state.data.categories, index, prevIndex))
      }
      else {
        return state
      }
    }

    case 'DOC_MOVE_CATEGORY_DOWN':
    {
      const {section, group} = state.data.categories.find(category => category.id === action.categoryId)

      filteredCategories = filterCategories(state.data, section, group)

      filteredIndex = filteredCategories.findIndex(category => category.id === action.categoryId)
      if (filteredIndex < filteredCategories.length - 1) {
        const nextCategory = filteredCategories[filteredIndex + 1]
        const index = findCategoryIndex(state.data, action.categoryId)
        const nextIndex = findCategoryIndex(state.data, nextCategory.id)

        return state.setIn(['data', 'categories'], swapItems(state.data.categories, index, nextIndex))
      }
      else {
        return state
      }
    }

    case 'DOC_MOVE_CATEGORY':
      index = state.data.categories.findIndex(category => category.id === action.categoryId)

      if (index !== -1) {
        return state.setIn(['data', 'categories', index, 'group'], action.groupId)
      }
      else {
        return state
      }
      
    case 'DOC_DELETE_CATEGORY':
      {
        index = state.data.categories.findIndex(category => category.id === action.categoryId)

        const category = state.data.categories[index]
        if (category.bmcGroup) {
          // this is a built-in BMC category, mark it as deleted but keep it in the doc
          return state.updateIn(['data', 'categories'],
              categories => replaceItem(categories, index, category.set('deleted', true)))
        }
        else {
          // this is a custom category, delete it for real
          return state.setIn(['data', 'categories'], removeItem(state.data.categories, index))
        }
      }

    case 'DOC_SET_PRICE':
      index = findCategoryIndex(state.data, action.categoryId)
      return state.setIn(['data', 'categories', index, 'price'], action.price)

    case 'DOC_SET_QUANTITY':
      index = findCategoryIndex(state.data, action.categoryId)
      return state.setIn(['data', 'categories', index, 'quantities', action.year], action.quantity)

    default:
      return state
  }
}

/**
 * Find the index of a category
 * @param data
 * @param categoryId
 * @return {number|*}
 */
function findCategoryIndex (data, categoryId) {
  const categoryIndex = data.categories.findIndex(category => category.id === categoryId)

  if (categoryIndex === -1) {
    throw new Error('Category not found')
  }

  return categoryIndex
}

/**
 * Find all categories of one section and group
 * @param data
 * @param section
 * @param group
 * @return {Array}
 */
function filterCategories (data, section, group) {
  return data.categories.filter(category => category.section === section && category.group === group)
}

export default doc
