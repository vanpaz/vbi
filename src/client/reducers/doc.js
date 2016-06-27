import Immutable from 'seamless-immutable'
import debugFactory from 'debug/browser'

import { merge } from 'lodash'

import { uuid } from '../utils/uuid'
import { removeItem, swapItems, replaceItem } from '../utils/immutable'

const debug = debugFactory('vbi:reducers')

import * as bmcCategories from '../data/bmcCategories.json'
import * as newScenarioJSON from '../data/newScenario.json'

const newScenario = Immutable(newScenarioJSON)

/**
 * Ensure that all required fields are available in the document.
 * Missing fields will be added
 * @param {Object} doc
 * @return {Object}
 */
function sanitizeDoc (doc) {
  return Immutable(merge({}, newScenario, doc))
}


const doc = (state = Immutable({}), action) => {
  let index, filteredIndex, categories

  debug(action.type, action)

  switch (action.type) {
    case 'DOC_SET':
      return sanitizeDoc(action.doc)

    case 'DOC_RENAME':
      return state.set('title', action.title)

    case 'DOC_SET_PARAMETER':
      return state.setIn(['data', 'parameters', action.parameter], action.value)

    case 'DOC_SET_PROPERTY':
      return state.setIn(['data'].concat(action.path), action.value)

    case 'DOC_ADD_CATEGORY':
    {
      const category = Immutable({
        id: uuid(),
        section: action.section,
        group: action.group,
        name: action.name,
        price: action.price,
        quantities: action.quantities
      })

      return state.setIn(['data', 'categories'], state.data.categories.concat([category]))
    }

    case 'DOC_CHECK_CATEGORY':
      // check a BMC category
      index = state.data.categories
          .findIndex(category => category.bmcId === action.bmcId)

      if (index !== -1) {
        // the category exists in the document, update it
        debug('check existing category', action)

        const category = state.data.categories[index]
        const updatedCategory = category
            .set('bmcChecked', action.checked)
            .set('deleted', action.checked ? false : (category.deleted || false))  // un-delete the category when checked again

        return state.setIn(['data', 'categories', index], updatedCategory)
      }
      else {
        // add a new category

        // TODO: simplify finding category when bmcCategories is restructured
        let bmcCategory = null
        Object.keys(bmcCategories).forEach(groupName => {
          const group = bmcCategories[groupName]
          const category = Array.isArray(group)
              ? group.find(category => category.id === action.bmcId)
              : null

          if (category) {
            bmcCategory = {
              id: category.id,
              groupName,
              text: category.text
            }
          }
        })

        if (!bmcCategory) {
          throw new Error('BMC category not found (id=' + action.bmcId + ')')
        }

        const newCategory = {
          id: uuid(),
          section: 'costs', // TODO: set initial section and group depending on the bmc group
          group: 'indirect',
          bmcGroup: bmcCategory.group,
          bmcId: bmcCategory.id,
          bmcChecked: action.checked,
          deleted: false,
          name: bmcCategory.text
        }

        debug('check new category', action, bmcCategory, newCategory)

        return state.setIn(['data', 'categories'], state.data.categories.concat([newCategory]))
      }

    case 'DOC_RENAME_CATEGORY':
      index = findCategoryIndex(state.data, action.section, action.group, action.categoryId)

      return state.setIn(['data', 'categories', index, 'name'], action.name)

    case 'DOC_MOVE_CATEGORY_UP':
      categories = filterCategories(state.data, action.section, action.group)

      filteredIndex = categories.findIndex(category => category.id === action.categoryId)
      if (filteredIndex > 0) {
        const prevCategory = categories[filteredIndex - 1]
        const index     = findCategoryIndex(state.data, action.section, action.group, action.categoryId)
        const prevIndex = findCategoryIndex(state.data, action.section, action.group, prevCategory.id)

        return state.setIn(['data', 'categories'], swapItems(state.data.categories, index, prevIndex))
      }
      else {
        return state
      }

    case 'DOC_MOVE_CATEGORY_DOWN':
      categories = filterCategories(state.data, action.section, action.group)

      filteredIndex = categories.findIndex(category => category.id === action.categoryId)
      if (filteredIndex < categories.length - 1) {
        const nextCategory = categories[filteredIndex + 1]
        const index     = findCategoryIndex(state.data, action.section, action.group, action.categoryId)
        const nextIndex = findCategoryIndex(state.data, action.section, action.group, nextCategory.id)

        return state.setIn(['data', 'categories'], swapItems(state.data.categories, index, nextIndex))
      }
      else {
        return state
      }

    case 'DOC_DELETE_CATEGORY':
      {
        index = findCategoryIndex(state.data, action.section, action.group, action.categoryId)
        const category = state.data.categories[index]
        if (category.bmcId) {
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
      index = findCategoryIndex(state.data, action.section, action.group, action.categoryId)
      return state.setIn(['data', 'categories', index, 'price'], action.price)

    case 'DOC_SET_QUANTITY':
      index = findCategoryIndex(state.data, action.section, action.group, action.categoryId)
      return state.setIn(['data', 'categories', index, 'quantities', action.year], action.quantity)

    default:
      return state
  }
}

/**
 * Find the index of a category
 * @param data
 * @param section
 * @param group
 * @param categoryId
 * @return {number|*}
 */
function findCategoryIndex (data, section, group, categoryId) {
  const categoryIndex = data.categories
      .findIndex(c => c.section === section && c.group === group && c.id === categoryId)

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
