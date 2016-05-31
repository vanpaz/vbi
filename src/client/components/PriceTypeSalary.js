import React, { Component } from 'react'

import TextField from 'material-ui/lib/text-field'

export default class PriceTypeSalary extends Component {
  render () {
    return <div className="price-type">
      <p className="description">
        Enter salary details
      </p>
      <TextField
          value={this.props.price.value}
          hintText="3000"
          floatingLabelText="Monthly salary"
          onChange={event => this.handleChange('value', event.target.value)} />
      <br />
      <TextField
          value={this.props.price.change}
          hintText="+2%"
          floatingLabelText="Change per year (percentage)"
          onChange={event => this.handleChange('change', event.target.value)}  />
      <br />
      <TextField
          value={this.props.price.holidayProvision}
          hintText="8.33%"
          floatingLabelText="Holiday provision (percentage)"
          onChange={event => this.handleChange('holidayProvision', event.target.value)}  />
      <br />
      <TextField
          value={this.props.price.incomeTax}
          hintText="35%"
          floatingLabelText="Income tax (percentage)"
          onChange={event => this.handleChange('incomeTax', event.target.value)}  />
      <br />
      <TextField
          value={this.props.price.SSCEmployer}
          hintText="18%"
          floatingLabelText="SSC employer (percentage)"
          onChange={event => this.handleChange('SSCEmployer', event.target.value)}  />
      <br />
      <TextField
          value={this.props.price.SSCEmployee}
          hintText="17%"
          floatingLabelText="SSC employee (percentage)"
          onChange={event => this.handleChange('SSCEmployee', event.target.value)}  />
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
