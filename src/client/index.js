import React from 'react'
import { render } from 'react-dom'
import injectTapEventPlugin from 'react-tap-event-plugin'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import Immutable from 'seamless-immutable'

import './utils/polyfills'
import App from './components/App'
import reducers from './reducers'

// required for support for mouse and touch events
// see https://github.com/callemall/material-ui#react-tap-event-plugin
injectTapEventPlugin()

let initialState = Immutable({
  user: {},

  unchangedDoc: null,  // contains the document as loaded/saved in the database
  doc: require('../../data/koekjes.json'),   // The current doc
  docs: [] // list with all docs of the user
})

let store = createStore(reducers, initialState)

let app = render(
    <Provider store={store}>
      <App />
    </Provider>, 
    document.getElementById('root'))

// expose on window for easy debugging
if (typeof window !== 'undefined') {
  window.app = app
  window.store = store
}