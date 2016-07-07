import React, { Component } from 'react'

import DebouncedTextField from '../controls/DebouncedTextField'

import bindMethods from '../../utils/bindMethods'

export default class PriceTypeInvestment extends Component {
  constructor (props) {
    super(props)

    bindMethods(this)
  }

  render () {
    return <div className="price-type">
      <p className="description">
        Enter the value and depreciation of the investment.
      </p>
      <DebouncedTextField
          value={this.props.price.value}
          hintText="1000"
          floatingLabelText="Cost"
          onChange={this.handleChangePrice} />
      <br />
      <DebouncedTextField
          value={this.props.price.depreciationPeriod}
          hintText="5"
          floatingLabelText="Depreciation period (years)"
          onChange={this.handleChangeDepreciation}  />
    </div>
  }

  handleChangePrice (value) {
    const price = this.props.price
        .set('type', 'investment')
        .set('value', value)

    this.props.onChange(price)
  }

  handleChangeDepreciation (value) {
    const price = this.props.price
        .set('type', 'investment')
        .set('depreciationPeriod', value)

    this.props.onChange(price)
  }

  static format (price) {
    return `${price.value} spread over ${price.depreciationPeriod} years`
  }

  static label = 'Investment'
}
