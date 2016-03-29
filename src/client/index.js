import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';

import injectTapEventPlugin from 'react-tap-event-plugin';

// required for support for mouse and touch events
// see https://github.com/callemall/material-ui#react-tap-event-plugin
injectTapEventPlugin();

let app = ReactDOM.render(<App />, document.getElementById('root'));

// expose on window for easy debugging
if (typeof window !== 'undefined') {
  window.app = app;
}