import React, { Component } from 'react'
import TextField from 'material-ui/lib/text-field'

export default class PriceTypeRevenue extends Component {
  render () {
    return <div className="price-type">
      <p className="description">
        Enter a percentage of the revenue.
      </p>

      <TextField
          value={this.props.price.percentage}
          hintText="5%"
          floatingLabelText="Percentage of revenue"
          onChange={event => this.handleChange('percentage', event.target.value)} />
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
