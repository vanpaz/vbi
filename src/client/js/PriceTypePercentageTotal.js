import React, { Component } from 'react';
import debugFactory from 'debug/browser';

import { assign } from 'lodash';

import TextField from 'material-ui/lib/text-field';

const debug = debugFactory('vbi:price');

export default class PriceTypePercentageTotal extends Component {
  render () {
    return <div className="price-type">
      <p className="description">
        A percentage of the total revenue, calculated from an initial price and initial total revenue.
      </p>
      <TextField
          value={this.props.price.value}
          floatingLabelText="Initial price"
          onChange={this.handleChangePrice.bind(this)} />
      <br />
    </div>
  }

  handleChangePrice (event) {
    let price = assign(this.props.price, { value: event.target.value });

    debug('handleChangePrice', price);

    this.props.onChange(price);
  }

  static format (price) {
    return price.value != undefined
        ? price.value.split(' ')[0]
        : '';
  }

  static label = 'Percentage of revenue';
}
