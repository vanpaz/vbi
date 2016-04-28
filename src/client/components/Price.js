import React, { Component } from 'react';
import debugFactory from 'debug/browser';

import { assign } from 'lodash';

import Popover from 'material-ui/lib/popover/popover';
import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';

import PriceTypeConstant from './PriceTypeConstant';
import PriceTypeInvestment from './PriceTypeInvestment';
import PriceTypeManual from './PriceTypeManual';
import PriceTypeRevenue from './PriceTypeRevenue';

const debug = debugFactory('vbi:Price');

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
 *     var categories = ['licenses', 'projects'];
 *
 *     var periods = ['2015', '2016', '2017', '2018']
 *
 *     function onChange (price) {
 *       console.log('changed', price);
 *     }
 *
 *     <Price price={price} categories={categories} onChange={onChange} />
 *
 */
export default class Price extends Component {
  constructor (props) {
    super(props);

    this.state = {
      showPopover: false,
      anchorEl: null
    };
  }

  render () {
    const type = Price.PRICE_TYPES[this.props.price.type] && this.props.priceTypes.includes(this.props.price.type)
        ? this.props.price.type
        : this.props.priceTypes[0];
    const PriceType = Price.PRICE_TYPES[type];

    return <div className="price">
      <button
          className={this.state.showPopover ? 'price expanded' : 'price'}
          onTouchTap={this.showPopover.bind(this)} >
        {PriceType && PriceType.format(this.props.price)}
        {' \u25BE'}
      </button>

      <Popover
          ref="popover"
          open={this.state.showPopover}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}
          onRequestClose={this.hidePopover.bind(this)} >
        <div className="price-popover">
          {
            this.renderTypeSelection()
          }
          {
            PriceType
                ? <PriceType 
                      price={this.props.price} 
                      categories={this.props.categories}
                      periods={this.props.periods}
                      onChange={this.handleChangePrice.bind(this)} />
                : <p>(Select a price type first...)</p>
          }
        </div>
      </Popover>
    </div>
  }

  renderTypeSelection () {
    // only render the select field when there are multiple types allowed
    if (this.props.priceTypes.length <= 1) {
      return null;
    }

    let priceTypes = Object.keys(Price.PRICE_TYPES)
        .filter(type => this.props.priceTypes.includes(type))
        .sort()
        .map(type => {
          return <MenuItem
              key={type}
              value={type}
              primaryText={Price.PRICE_TYPES[type].label} />
        });

    return <SelectField value={this.props.price.type} onChange={this.handleChangeType.bind(this)} >
      {priceTypes}
    </SelectField>

  }

  showPopover (event) {
    event.preventDefault(); // prevent from immediately closing on tap

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

  handleChangePrice (price) {
    debug('handleChangePrice', price);
    this.props.onChange(price);
  }

  handleChangeType (event, index, value) {
    let price = assign(this.props.price, { type: value });

    debug('handleChangeType', price);

    this.props.onChange(price);
  }

  /**
   * map with all registered price types
   */
  static PRICE_TYPES = {
    constant: PriceTypeConstant,
    investment: PriceTypeInvestment,
    manual: PriceTypeManual,
    revenue: PriceTypeRevenue
  };
}
