import { combineReducers } from 'redux-immutable'

import user from './user'
import doc from './doc'

const reducers = combineReducers({ user, doc })

export default reducers