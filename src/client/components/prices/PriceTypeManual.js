import React, { Component } from 'react'

import bindMethods from '../../utils/bindMethods'
import DebouncedTextField from '../controls/DebouncedTextField'

const styles = {
  textField: {width: 128},
  priceColumn: {paddingLeft: 16}
}

class Entry extends Component {
  constructor (props) {
    super(props)
    bindMethods(this)
  }

  render () {
    return <DebouncedTextField
        value={this.props.value}
        hintText="23k"
        style={styles.textField}
        onChange={this.handleChangeEntry} />
  }

  handleChangeEntry(value) {
    this.props.onChange(this.props.year, value)
  }
}


export default class PriceTypeManual extends Component {
  constructor (props) {
    super(props)
    bindMethods(this)
  }

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
            <td style={styles.priceColumn}>
              <Entry year={year} value={value} onChange={this.handleChangeEntry}/>
            </td>
          </tr>
        })}
        </tbody>
      </table>
    </div>
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
