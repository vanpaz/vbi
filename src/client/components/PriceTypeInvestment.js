import React, { Component } from 'react';

import TextField from 'material-ui/lib/text-field';

export default class PriceTypeInvestment extends Component {
  render () {
    return <div className="price-type">
      <p className="description">
        Enter the value and depreciation of the investment.
      </p>
      <TextField
          value={this.props.price.value}
          hintText="1000"
          floatingLabelText="Cost"
          onChange={this.handleChangePrice.bind(this)} />
      <br />
      <TextField
          value={this.props.price.depreciationPeriod}
          hintText="5"
          floatingLabelText="Depreciation period (years)"
          onChange={this.handleChangeDepreciation.bind(this)}  />
    </div>
  }

  handleChangePrice (event) {
    const price = this.props.price
        .set('type', 'investment')
        .set('value', event.target.value)

    this.props.onChange(price);
  }

  handleChangeDepreciation (event) {
    const price = this.props.price
        .set('type', 'investment')
        .set('depreciationPeriod', event.target.value)

    this.props.onChange(price);
  }

  static format (price) {
    return `${price.value} spread over ${price.depreciationPeriod} years`;
  }

  static label = 'Investment';
}
