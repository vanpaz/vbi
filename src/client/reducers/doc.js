import Immutable from 'seamless-immutable'
import debugFactory from 'debug/browser'

import { uuid } from '../js/uuid'
import { removeItem } from '../js/immutable'

const debug = debugFactory('vbi:reducers')

const year = new Date().getFullYear()

const EMPTY_DOC = Immutable({
  title: 'New Scenario',
  data: {
    parameters: {
      startingYear: '2016',
      numberOfYears: '5'
    },
    costs: [],
    revenues: []
  }
})


const doc = (state = Immutable({}), action) => {
  let path, last, categoryIndex

  debug(action.type, action)

  switch (action.type) {
    case 'SET_DOC':
      return action.doc

    case 'NEW_DOC':
      return EMPTY_DOC

    case 'RENAME_DOC':
      return state.set('title', action.title)

    case 'SET_PARAMETER':
      return state.setIn(['data', 'parameters', action.parameter], action.value)


    case 'ADD_CATEGORY':
      path = ['data', action.section, action.group]

      const category = Immutable({
        id: uuid(),
        name: action.name,
        price: action.price,
        quantities: action.quantities
      })

      return state.updateIn(path,
          categories => categories.concat([category]))

    case 'RENAME_CATEGORY':
      path = findCategoryPath(state.data, action.section, action.group, action.categoryId)
          .concat(['name'])

      return state.setIn(path, action.name)

    case 'MOVE_CATEGORY_UP':
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

    case 'MOVE_CATEGORY_DOWN': // TODO


    case 'DELETE_CATEGORY':
      // TODO: simplify this function
      path = findCategoryPath(state.data, action.section, action.group, action.categoryId)

      last = path.length - 1
      categoryIndex = path[last]
      path = removeItem(path, last)

      return state.updateIn(path, categories => removeItem(categories, categoryIndex))

    case 'SET_PRICE':
      path = findCategoryPath(state.data, action.section, action.group, action.categoryId)
          .concat(['price'])

      return state.setIn(path, action.price)

    case 'SET_QUANTITY':
      path = findCategoryPath(state.data, action.section, action.group, action.categoryId)
          .concat(['quantities', action.period])

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
