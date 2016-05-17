import Immutable from 'seamless-immutable'
import debugFactory from 'debug/browser'

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
  let path

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



    case 'ADD_GROUP':// TODO:
      return state

    case 'RENAME_GROUP':// TODO:
      return state

    case 'DELETE_GROUP':
      return state.updateIn(['data', action.section],
          groups => removeItem(groups, action.groupIndex))


    case 'ADD_CATEGORY':
      path = findCategoryPath(state, action.section, action.group, action.category)

      const category = Immutable({
        name: action.name,
        price: action.price,
        quantities: action.quantities
      })

      return state.updateIn(path, categories => categories.push(category))

    case 'RENAME_CATEGORY':
      path = findCategoryPath(state, action.section, action.group, action.category)
          .concat(['name'])

      return state.setIn(path, action.name)

    case 'DELETE_CATEGORY':
      path = findCategoryPath(state, action.section, action.group, action.category)

      const last = path.length - 1
      const categoryIndex = path[last]
      path = removeItem(path, last)

      return state.updateIn(path, categories => removeItem(categories, categoryIndex))

    case 'SET_PRICE':
      path = findCategoryPath(state, action.section, action.group, action.category)
          .concat(['price'])

      return state.setIn(path, action.price)

    case 'SET_QUANTITY':
      path = findCategoryPath(state, action.section, action.group, action.category)
          .concat(['quantities', action.period])

      return state.setIn(path, action.quantity)

    default:
      return state
  }
}


function findCategoryPath (state, section, group, category) {
  const groupIndex = state.data[section].findIndex(g => g.name === group)
  if (groupIndex === -1) {
    throw new Error(`Group "${group}" not found`)
  }

  const categoryIndex = state.data[section][groupIndex].categories
      .findIndex(c => c.name === category)

  if (categoryIndex === -1) {
    throw new Error(`Category "${category}" not found`)
  }

  return ['data', section, groupIndex, 'categories', categoryIndex]
}



export default doc
