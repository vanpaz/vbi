import React, { Component } from 'react'
import TextField from 'material-ui/TextField'

const styles = {
  textField: {width: 128}
}

export default class PriceTypeManual extends Component {
  render () {
    return <div className="price-type">
      <p className="description">
        Manually enter a price for every year.
      </p>
      <table>
        <tbody>
        <tr>
          <th>Year</th>
          <th>Price</th>
        </tr>
        {this.props.years.map(year => {
          let value = this.props.price.values && this.props.price.values[year]

          return <tr key={year}>
            <td>
              {year}
            </td>
            <td>
              {this.renderValue(year, value)}
            </td>
          </tr>
        })}
        </tbody>
      </table>
    </div>
  }

  renderValue (year, value) {
    return <TextField
        value={value}
        hintText="23k"
        style={styles.textField}
        onChange={(event) => this.handleChangeEntry(year, event.target.value)} />
  }

  handleChangeEntry (year, value) {
    const price = this.props.price
        .set('type', 'manual')
        .setIn(['values', year], value)

    this.props.onChange(price)
  }

  static format (price) {
    if (price.values) {
      return Object.keys(price.values).map(year => price.values[year]).join(', ')
    }
    else {
      return ''
    }
  }

  static label = 'Manual per year'
}
