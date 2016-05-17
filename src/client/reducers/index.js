import { combineReducers } from 'redux-seamless-immutable'

import user from './user'
import docs from './docs'
import doc from './doc'
import remoteDoc from './remoteDoc'

const reducers = combineReducers({ user, docs, doc, remoteDoc })

export default reducers