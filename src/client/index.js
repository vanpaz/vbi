import React from 'react'
import { render } from 'react-dom'
import injectTapEventPlugin from 'react-tap-event-plugin'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import Immutable from 'seamless-immutable'

import * as constants from './constants'
import { hash } from './utils/hash'
import './utils/polyfills'
import App from './components/App'
import reducers from './reducers'
import { sanitizeDoc } from './reducers/docUtils'

import * as demoScenarioJSON from './data/demoScenario.json'

import '!style!css!less!./style.less'

// required for support for mouse and touch events
// see https://github.com/callemall/material-ui#react-tap-event-plugin
injectTapEventPlugin()

let initialState = Immutable({
  view: {
    // visible page: 'model', 'finance'
    page: hash.get('page') || constants.defaultPage,

    // visible tab: 'parameters', 'costs', 'investments', 'revenues'
    inputs: hash.get('inputs') || constants.defaultInputs,

    // visible tab: 'profitAndLoss', 'balanceSheet', 'cashFlow'
    outputs: hash.get('outputs') || constants.defaultOutputs
  },  
  
  user: {},

  changed: false,         // true when the current document contains unsaved changes
  doc: sanitizeDoc(demoScenarioJSON),  // The current doc
  docs: []                // list with all docs of the user
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