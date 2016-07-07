import React, { Component } from 'react'

import bindMethods from '../../utils/bindMethods'
import DebouncedTextField from '../controls/DebouncedTextField'

export default class PriceTypeConstant extends Component {
  constructor (props) {
    super(props)

    bindMethods (this)
  }

  render () {
    return <div className="price-type">
      <p className="description">
        Enter an initial price and a change per year.
      </p>
      <DebouncedTextField
          value={this.props.price.value}
          hintText="23k"
          floatingLabelText="Initial price"
          onChange={this.handleChangePrice} />
      <br />
      <DebouncedTextField
          value={this.props.price.change}
          hintText="+3%"
          floatingLabelText="Percentage of change per year"
          onChange={this.handleChangeChange}  />
    </div>
  }

  handleChangePrice(value) {
    const price = this.props.price
        .set('type', 'constant')
        .set('value', value)

    this.props.onChange(price)
  }

  handleChangeChange(value) {
    const price = this.props.price
        .set('type', 'constant')
        .set('change', value)

    this.props.onChange(price)
  }

  static format (price) {
    return `${price.value || ''} ${price.change || ''}`
  }

  static label = 'Constant change'
}
