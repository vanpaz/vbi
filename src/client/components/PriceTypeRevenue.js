import React, { Component } from 'react'
import debugFactory from 'debug/browser'
import Immutable from 'seamless-immutable'
import TextField from 'material-ui/lib/text-field'
import FlatButton from 'material-ui/lib/flat-button'
import SelectField from 'material-ui/lib/select-field'
import MenuItem from 'material-ui/lib/menus/menu-item'
import RadioButton from 'material-ui/lib/radio-button'
import RadioButtonGroup from 'material-ui/lib/radio-button-group'

import { appendItem, removeItem } from '../utils/immutable'

const debug = debugFactory('vbi:PriceTypeRevenue')

const styles = {
  selectCategory: {width: 128},
  textPercentage: {width: 96},
  radioAll: {margin: '8px 0'}
}

export default class PriceTypeRevenue extends Component {
  render () {
    return <div className="price-type">
      <p className="description">
        Enter a percentage of the revenue.
      </p>

      <div>
        Percentage: <TextField
          value={this.props.price.percentage}
          hintText="5%"
          style={styles.textPercentage}
          onChange={(event) => {
              this.handleChangePercentage(event.target.value) 
            }} />
      </div>
    </div>
  }

  handleChangePercentage (percentage) {
    debug('handleChangePercentage', percentage)

    const price = this.props.price.set('percentage', percentage)

    this.props.onChange(price)
  }

  static format (price) {
    return `${price.percentage || '%'} of revenue`
  }

  static label = 'Percentage of revenue'
}
