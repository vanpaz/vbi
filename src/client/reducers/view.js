import Immutable from 'seamless-immutable'

const view = (state = Immutable({}), action) => {
  switch (action.type) {
    case 'VIEW_PAGE':
      return state.set('page', action.page)

    case 'VIEW_INPUTS':
      return state.set('inputs', action.tab)

    case 'VIEW_OUTPUTS':
      return state.set('outputs', action.tab)

    default:
      return state
  }
}

export default view