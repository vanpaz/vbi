import React, { Component } from 'react';

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
    const price = this.props.price.set('value', event.target.value);

    this.props.onChange(price);
  }

  handleChangeChange (event) {
    const price = this.props.price.set('change', event.target.value);

    this.props.onChange(price);
  }

  static format (price) {
    return `${price.value || ''} ${price.change || ''}`;
  }

  static label = 'Constant change';
}
