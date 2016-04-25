import React, { Component } from 'react';

import { assign } from 'lodash';

import TextField from 'material-ui/lib/text-field';

export default class PriceTypeConstant extends Component {
  render () {
    return <div className="price-type">
      <p className="description">
        Enter an initial price and a constant change per period.
      </p>
      <TextField
          value={this.props.price.value}
          hintText="23k"
          floatingLabelText="Initial price"
          onChange={this.handleChangePrice.bind(this)} />
      <br />
      <TextField
          value={this.props.price.change}
          hintText="+3%"
          floatingLabelText="Percentage of change per period"
          onChange={this.handleChangeChange.bind(this)}  />
    </div>
  }

  handleChangePrice (event) {
    let price = assign(this.props.price, { value: event.target.value });

    this.props.onChange(price);
  }

  handleChangeChange (event) {
    let price = assign(this.props.price, { change: event.target.value });

    this.props.onChange(price);
  }

  static format (price) {
    let value = price.value != undefined ? price.value.split(' ')[0] : '';
    let change = price.change || '';
    return `${value} ${change}`;
  }

  static label = 'Constant change';
}
