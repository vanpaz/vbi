import React, { Component } from 'react'

import DebouncedTextField from '../controls/DebouncedTextField'

export default class PriceTypeRevenue extends Component {
  render () {
    return <div className="price-type">
      <p className="description">
        Enter a percentage of the revenue.
      </p>

      <DebouncedTextField
          value={this.props.price.percentage}
          hintText="5%"
          floatingLabelText="Percentage of revenue"
          onChange={value => this.handleChange('percentage', value)} />
    </div>
  }

  handleChange(property, value) {
    const price = this.props.price
        .set('type', 'revenue')
        .set(property, value)

    this.props.onChange(price)
  }

  static format (price) {
    return `${price.percentage || '%'} of revenue`
  }

  static label = 'Percentage of revenue'
}
