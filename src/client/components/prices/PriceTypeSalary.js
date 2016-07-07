import React, { Component } from 'react'

import DebouncedTextField from '../controls/DebouncedTextField'

export default class PriceTypeSalary extends Component {
  render () {
    return <div className="price-type">
      <p className="description">
        Enter salary details
      </p>
      <DebouncedTextField
          value={this.props.price.value}
          hintText="3000"
          floatingLabelText="Monthly salary"
          onChange={value => this.handleChange('value', value)} />
      <br />
      <DebouncedTextField
          value={this.props.price.change}
          hintText="+2%"
          floatingLabelText="Change per year (percentage)"
          onChange={value => this.handleChange('change', value)}  />
    </div>
  }

  handleChange(property, value) {
    const price = this.props.price
        .set('type', 'salary')
        .set(property, value)

    this.props.onChange(price)
  }

  static format (price) {
    return `${price.value || ''} ${price.change || ''}`
  }

  static label = 'Salary'
}
