import React, { Component } from 'react';
import debugFactory from '../../../node_modules/debug/browser';

import AppBar from '../../../node_modules/material-ui/lib/app-bar';
import LeftNav from '../../../node_modules/material-ui/lib/left-nav';
import MenuItem from '../../../node_modules/material-ui/lib/menus/menu-item';

import InputForm from './InputForm';
import ProfitAndLoss from './ProfitAndLoss';

const debug = debugFactory('vbi:app');

// Road map:
// - create two panels: left panel for input, right panel for profit & loss
// - left panel shows excel-like tables
// - the right panel shows a profit&loss table
// - later on we could create a business model canvas input format in the left panel
// - create an option to show the numbers as a cumulative bar chart


// expose the debug library to window, so we can enable and disable it
if (typeof window !== 'undefined') {
  console.info('To enable debugging, enter debug.enable(\'vbi:*\') in this console, then refresh the page');
  console.info('To disable debugging, enter debug.disable() in this console, then refresh the page');
  window.debug = debugFactory;
}

// TODO: read data from localStorage and in the end from a database
var data = require('../../../data/example_company.json');

debug('data', data);


export default class App extends Component {
  constructor (props) {
    super(props);

    this.state = {
      showLeftNav: false,
      data
    };
  }

  render() {
    return (
      <div>
        <AppBar
            style={{position: 'fixed', top: 0, left: 0, zIndex: 999, background: '#f3742c'}}
            title="VanPaz Business Intelligence" />

        <LeftNav docked={false}
                 width={200}
                 open={this.state.showLeftNav}
                 onRequestChange={showLeftNav => this.setState({showLeftNav})} >
          <MenuItem>Menu Item</MenuItem>
          <MenuItem>Menu Item 2</MenuItem>
        </LeftNav>

        <div>
          <div className="container input-form">
            <InputForm data={this.state.data} onChange={data => this.handleChange(data)} />
          </div>

          <div className="container profit-and-loss">
            <ProfitAndLoss data={this.state.data} />
          </div>
        </div>

        <div className="footer">
          Copyright &copy; 2016 <a href="http://vanpaz.com">VanPaz</a>
        </div>
      </div>
    );
  }

  handleChange (data) {
    debug('handleChange', data);
    this.setState({data});
    // TODO: save changes to database
  }

}