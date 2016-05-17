import React, { Component } from 'react';

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
          floatingLabelText="Value (cost)"
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
    const price = this.props.price.set('value', event.target.value)

    this.props.onChange(price);
  }

  handleChangeDeprecation (event) {
    const price = this.props.price.set('deprecationPeriod', event.target.value)

    this.props.onChange(price);
  }

  static format (price) {
    return `${price.value} spread over ${price.deprecationPeriod} periods`;
  }

  static label = 'Investment';
}
