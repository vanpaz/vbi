import Immutable from 'seamless-immutable'
import debugFactory from 'debug/browser'

import { merge } from 'lodash'

import { uuid } from '../utils/uuid'
import { removeItem } from '../utils/immutable'

const debug = debugFactory('vbi:reducers')

const newScenario = Immutable(require('../data/newScenario.json'))

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
  let path, last, categoryIndex

  debug(action.type, action)

  switch (action.type) {
    case 'DOC_SET':
      return sanitizeDoc(action.doc)

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
