import React, { Component } from 'react'

import bindMethods from '../../utils/bindMethods'
import DebouncedTextField from '../controls/DebouncedTextField'

export default class PriceTypeSalary extends Component {
  constructor (props) {
    super(props)
    bindMethods(this)
  }

  render () {
    return <div className="price-type">
      <p className="description">
        Enter salary details
      </p>
      <DebouncedTextField
          value={this.props.price.value}
          hintText="3000"
          floatingLabelText="Monthly salary"
          onChange={this.handleChangeSalary} />
      <br />
      <DebouncedTextField
          value={this.props.price.change}
          hintText="+2%"
          floatingLabelText="Change per year (percentage)"
          onChange={this.handleChangeChange} />
    </div>
  }

  handleChangeSalary(value) {
    const price = this.props.price
        .set('type', 'salary')
        .set('value', value)

    this.props.onChange(price)
  }

  handleChangeChange(value) {
    const price = this.props.price
        .set('type', 'salary')
        .set('change', value)

    this.props.onChange(price)
  }

  static format (price) {
    return `${price.value || ''} ${price.change || ''}`
  }

  static label = 'Salary'
}
