import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';

let app = ReactDOM.render(<App />, document.getElementById('root'));

// expose on window for easy debugging
if (typeof window !== 'undefined') {
  window.app = app;
}