import React, { Component } from 'react';
import debugFactory from 'debug/browser';
import { assign, cloneDeep } from 'lodash';
import TextField from 'material-ui/lib/text-field';

const debug = debugFactory('vbi:PriceTypeManual');

const styles = {
  textField: {width: 128}
};

export default class PriceTypeManual extends Component {
  render () {
    return <div className="price-type">
      <p className="description">
        Manually enter a price for every period.
      </p>
      <table>
        <tbody>
        <tr>
          <th>Period</th>
          <th>Price</th>
        </tr>
        {this.props.periods.map(period => {
          let value = this.props.price.values && this.props.price.values[period];

          return <tr key={period}>
            <td>
              {period}
            </td>
            <td>
              {this.renderValue(period, value)}
            </td>
          </tr>
        })}
        </tbody>
      </table>
    </div>
  }

  renderValue (period, value) {
    return <TextField
        value={value}
        hintText="23k"
        style={styles.textField}
        onChange={(event) => this.handleChangeEntry(period, event.target.value)} />
  }

  handleChangeEntry (period, value) {
    debug('handleChangeEntry', period, value);

    var price = cloneDeep(this.props.price);
    if (!price.values) {
      price.values = {};
    }

    price.values[period] = value;

    this.props.onChange(price);
  }

  static format (price) {
    if (price.values) {
      return Object.keys(price.values).map(period => price.values[period]).join(', ');
    }
    else {
      return '';
    }
  }

  static label = 'Manual per period';
}
