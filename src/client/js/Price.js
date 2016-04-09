import React, { Component } from 'react';
import debugFactory from 'debug/browser';

import { assign } from 'lodash';

import FlatButton from 'material-ui/lib/flat-button';
import Popover from 'material-ui/lib/popover/popover';
import TextField from 'material-ui/lib/text-field';

const debug = debugFactory('vbi:price');
const styles = {
  popover: {
    padding: 20
  }
};

/**
 * Price
 *
 * This component allows changing of different types of prices, see README
 * about "Price formats". The price can be changed by clicking on it, which
 * opens a popover where you can change stuff (similar to a date picker).
 *
 * Usage:
 *
 *     var entry = {
 *       type: 'constant',
 *       initialPrice: '28',
 *       change: '+3%'
 *     }
 *
 *     function onChange (entry) {
 *       console.log('changed', entry);
 *     }
 *
 *     <Price entry={entry} onChange={onChange} />
 *
 */
export default class Price extends Component {
  constructor (props) {
    super(props);

    this.state = {
      showPopover: false,
      anchorEl: null
    }
  }

  render () {
    let price = this.props.entry.price.split(' ')[0];
    let change = this.props.entry.change || '';
    let label = `${price} ${change} \u25BE`;

    // TODO: highlight the FlatButton when Popover is visible
    return <div className="price">
      <button
          className={this.state.showPopover ? 'expanded' : ''}
          onClick={this.showPopover.bind(this)}      // bind click too to support pressing enter when the button has focus
          onTouchTap={this.showPopover.bind(this)} >
        {label}
      </button>

      <Popover
          ref="popover"
          open={this.state.showPopover}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}
          onRequestClose={this.hidePopover.bind(this)}
      >
        <div style={styles.popover} >
          <TextField
              ref="price"
              value={this.props.entry.price}
              onChange={this.handleChangePrice.bind(this)}
              onFocus={this.handleFocus.bind(this)} />
          <br />
          <TextField
              ref="change"
              value={this.props.entry.change}
              onChange={this.handleChangeChange.bind(this)}
              onFocus={this.handleFocus.bind(this)} />

        </div>
      </Popover>
    </div>
  }

  showPopover (event) {
    debug('showPopover');
    this.setState({
      showPopover: true,
      anchorEl: event.currentTarget
    });
  }

  hidePopover (event) {
    debug('hidePopover');
    this.setState({showPopover: false});
  }

  handleChangePrice (event) {
    let entry = assign(this.props.entry, { price: event.target.value });

    debug('handleChangePrice', entry);

    this.props.onChange(entry);
  }

  handleChangeChange (event) {
    let entry = assign(this.props.entry, { change: event.target.value });

    debug('handleChangeChange', entry);

    this.props.onChange(entry);
  }

  handleFocus (event) {
    // event.target.select();
  }

}
