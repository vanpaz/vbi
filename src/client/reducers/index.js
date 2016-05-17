import { combineReducers } from 'redux-seamless-immutable'

import user from './user'
import docs from './docs'
import doc from './doc'
import unchangedDoc from './unchangedDoc'

const reducers = combineReducers({ user, docs, doc, unchangedDoc })

export default reducers