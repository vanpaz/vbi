import React, { Component } from 'react';

import { assign } from 'lodash';

import TextField from 'material-ui/lib/text-field';

export default class PriceTypeInvestment extends Component {
  render () {
    return <div className="price-type">
      <p className="description">
        Enter the value and deprecation of the investment.
      </p>
      <TextField
          value={this.props.price.value}
          hintText="1000"
          floatingLabelText="Value"
          onChange={this.handleChangePrice.bind(this)} />
      <br />
      <TextField
          value={this.props.price.deprecationPeriod}
          hintText="5"
          floatingLabelText="Deprecation period"
          onChange={this.handleChangeDeprecation.bind(this)}  />
    </div>
  }

  handleChangePrice (event) {
    let price = assign(this.props.price, { value: event.target.value });

    this.props.onChange(price);
  }

  handleChangeDeprecation (event) {
    let price = assign(this.props.price, { deprecationPeriod: event.target.value });

    this.props.onChange(price);
  }

  static format (price) {
    return `${price.value} over ${price.deprecationPeriod} periods`;
  }

  static label = 'Investment';
}
