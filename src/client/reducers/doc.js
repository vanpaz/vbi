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
      periods: [year, year + 1, year + 2]
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


    case 'SET_PERIODS':
      return state.setIn(['data', 'parameters', 'periods'], action.periods)



    case 'ADD_GROUP':
      const newGroup = Immutable({
        id: uuid(),
        name: action.name,
        categories: []
      })

      return state.updateIn(['data', action.section],
          groups => groups.concat([newGroup]))

      return state

    case 'RENAME_GROUP':
      return state.updateIn(['data', action.section],
          groups => groups.map(group => {
            if (group.id === action.groupId) {
              return group.set('name', action.name)
            }
            else {
              return group
            }
          }))

      return state

    case 'DELETE_GROUP':
      return state.updateIn(['data', action.section],
          groups => groups.filter(group => group.id !== action.groupId))


    case 'ADD_CATEGORY':
      path = findGroupPath(state.data, action.section, action.groupId)
          .concat(['categories'])

      const category = Immutable({
        id: uuid(),
        name: action.name,
        price: action.price,
        quantities: action.quantities
      })

      return state.updateIn(path, categories => categories.concat([category]))

    case 'RENAME_CATEGORY':
      path = findCategoryPath(state.data, action.section, action.groupId, action.categoryId)
          .concat(['name'])

      return state.setIn(path, action.name)

    case 'MOVE_CATEGORY_UP':
        // TODO: simplify this function
      path = findCategoryPath(state.data, action.section, action.groupId, action.categoryId)

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
      path = findCategoryPath(state.data, action.section, action.groupId, action.categoryId)

      last = path.length - 1
      categoryIndex = path[last]
      path = removeItem(path, last)

      return state.updateIn(path, categories => removeItem(categories, categoryIndex))

    case 'SET_PRICE':
      path = findCategoryPath(state.data, action.section, action.groupId, action.categoryId)
          .concat(['price'])

      return state.setIn(path, action.price)

    case 'SET_QUANTITY':
      path = findCategoryPath(state.data, action.section, action.groupId, action.categoryId)
          .concat(['quantities', action.period])

      return state.setIn(path, action.quantity)

    default:
      return state
  }
}


function findGroupPath (data, section, groupId) {
  const groupIndex = data[section].findIndex(g => g.id === groupId)
  if (groupIndex === -1) {
    throw new Error(`Group not found`)
  }

  return ['data', section, groupIndex]
}


function findCategoryPath (data, section, groupId, categoryId) {
  const groupIndex = data[section].findIndex(g => g.id === groupId)
  if (groupIndex === -1) {
    throw new Error(`Group not found`)
  }

  const categoryIndex = data[section][groupIndex].categories
      .findIndex(c => c.id === categoryId)

  if (categoryIndex === -1) {
    throw new Error(`Category not found`)
  }

  return ['data', section, groupIndex, 'categories', categoryIndex]
}



export default doc
