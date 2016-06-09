import { combineReducers } from 'redux-seamless-immutable'

import view from './view'
import user from './user'
import docs from './docs'
import doc from './doc'
import changed from './changed'

const reducers = combineReducers({ view, user, docs, doc, changed })

export default reducers