import { combineReducers } from 'redux-seamless-immutable'

import user from './user'
import docs from './docs'
import doc from './doc'
import changed from './changed'

const reducers = combineReducers({ user, docs, doc, changed })

export default reducers