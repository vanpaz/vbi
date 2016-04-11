import React, { Component } from 'react';
import debugFactory from 'debug/browser';

import { assign } from 'lodash';

import Popover from 'material-ui/lib/popover/popover';
import TextField from 'material-ui/lib/text-field';
import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';

const debug = debugFactory('vbi:price');

/**
 * Price
 *
 * This component allows changing of different types of prices, see README
 * about "Price formats". The price can be changed by clicking on it, which
 * opens a popover where you can change stuff (similar to a date picker).
 *
 * Usage:
 *
 *     var price = {
 *       type: 'constant',
 *       value: '28',
 *       change: '+3%'
 *     }
 *
 *     function onChange (price) {
 *       console.log('changed', price);
 *     }
 *
 *     <Price price={price} onChange={onChange} />
 *
 */
export default class Price extends Component {
  constructor (props) {
    super(props);

    this.state = {
      showPopover: false,
      anchorEl: null
    };

    this.types = {
      'constant': {
        label: 'Constant change',
        description: 'Enter an initial price, have a constant change per period.'
      },
      'manual': {
        label: 'Manual per period',
        description: 'Manually enter a price for every period.'
      },
      'percentageTotal': {
        label: 'Percentage of revenue',
        description: 'A percentage of the total revenue, calculated from an initial price and initial total revenue.'
      },
      'percentageCategory': {
        label: 'Percentage of category',
        description: 'Enter a percentage of one or multiple revenue categories.'
      }
    }
  }

  render () {
    let value = this.props.price.value != undefined
        ? this.props.price.value.split(' ')[0]
        : '';
    let change = this.props.price.change || '';
    let label = `${value} ${change} \u25BE`;

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
        <div className="price-popover" >
          <SelectField value={this.props.price.type} onChange={this.handleChangeType.bind(this)} >
            {Object.keys(this.types).sort().map(type => {
              return <MenuItem key={type} value={type} primaryText={this.types[type].label} />
            })}
          </SelectField>
          <p className="description">
            {this.types[this.props.price.type].description}
          </p>

          <TextField
              value={this.props.price.value}
              onChange={this.handleChangePrice.bind(this)}
              onFocus={this.handleFocus.bind(this)} />
          <br />
          <TextField
              value={this.props.price.change}
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
    let price = assign(this.props.price, { value: event.target.value });

    debug('handleChangePrice', price);

    this.props.onChange(price);
  }

  handleChangeChange (event) {
    let price = assign(this.props.price, { change: event.target.value });

    debug('handleChangeChange', price);

    this.props.onChange(price);
  }

  handleChangeType (event, index, value) {
    let price = assign(this.props.price, { type: value });

    debug('handleChangeType', price);

    this.props.onChange(price);
  }

  handleFocus (event) {
    // event.target.select();
  }

}
