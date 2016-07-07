import React, { Component } from 'react'

import DebouncedTextField from '../controls/DebouncedTextField'

export default class PriceTypeConstant extends Component {
  render () {
    return <div className="price-type">
      <p className="description">
        Enter an initial price and a change per year.
      </p>
      <DebouncedTextField
          value={this.props.price.value}
          hintText="23k"
          floatingLabelText="Initial price"
          onChange={value => this.handleChange('value', value)} />
      <br />
      <DebouncedTextField
          value={this.props.price.change}
          hintText="+3%"
          floatingLabelText="Percentage of change per year"
          onChange={value => this.handleChange('change', value)}  />
    </div>
  }

  handleChange(property, value) {
    const price = this.props.price
        .set('type', 'constant')
        .set(property, value)

    this.props.onChange(price)
  }

  static format (price) {
    return `${price.value || ''} ${price.change || ''}`
  }

  static label = 'Constant change'
}
