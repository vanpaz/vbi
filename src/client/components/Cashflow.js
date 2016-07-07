import React, { Component } from 'react'
import { connect } from 'react-redux'
import debugFactory from 'debug/browser'

import RaisedButton from 'material-ui/lib/raised-button';

import DebouncedInput from './controls/DebouncedInput'
import { setProperty } from '../actions'
import { getProp } from '../utils/object'
import { format, parseValue, numberRegExp } from '../utils/number'
import { calulateCashflow, getYears } from '../formulas'

const debug = debugFactory('vbi:profit-loss')

class Cashflow extends Component {
  constructor (props) {
    super(props)

    this.state = {
      showInfo: false
    }
  }

  render () {
    try {
      const currency = this.props.data.parameters.currency || 'x'
      const magnitude = parseValue(this.props.data.parameters.currencyMagnitude) || 1
      const numberOfDecimals = parseValue(this.props.data.parameters.numberOfDecimals)
      const years = getYears(this.props.data)
      const cashflow = calulateCashflow(this.props.data)

      return <div>

        <div style={{margin: 10}}>
          { this.state.showInfo && this.renderInfo() }

          <RaisedButton
              label={this.state.showInfo ? 'Hide info' : 'Show info'}
              onTouchTap={event => this.setState({ showInfo: !this.state.showInfo })} />
        </div>

        <table className="output" >
          <tbody>
          <tr>
            <th />
            <th />
            {years.map(year => <th key={year}>{year}</th>)}
          </tr>
          {
            cashflow.map(entry => {
              if (entry.editable) {
                return this.renderEditableEntry(years, entry, currency, magnitude)
              }
              else {
                return this.renderEntry(years, entry, currency, magnitude, numberOfDecimals)
              }
            })
          }
          </tbody>
        </table>
      </div>
    }
    catch (err) {
      debug(err)
      return <div className="error"><p>{err.toString()}</p></div>
    }
  }

  renderEntry (years, entry, currency, magnitude, numberOfDecimals) {
    return <tr key={entry.label} className={entry.className}>
      <td className="label">{entry.label}</td>
      <td className="magnitude">{`${currency}${magnitude !== 1 ? magnitude : ''}`}</td>
      {
        years.map(year => {
          const total = entry.values[year]
          const value = total && format(total / magnitude, numberOfDecimals)

          return <td key={year} >
            { value }
          </td>
        })
      }
    </tr>
  }

  renderEditableEntry (years, entry, currency, magnitude) {
    const values = getProp(this.props.data, entry.path)

    return <tr key={entry.label} className={entry.className}>
      <td className="label">{entry.label}</td>
      <td className="magnitude">{`${currency}${magnitude !== 1 ? magnitude : ''}`}</td>
      {
        years.map(year => {
          const hasValue = year in values && values[year] !== ''
          const validValue = !hasValue || numberRegExp.test(values[year])
          const value = hasValue && validValue
              ? parseValue(values[year]) / magnitude
              : values[year]

          return <td key={year} className="input-field" >
            <DebouncedInput value={value}
                   className={ validValue ? '' : ' invalid' }
                   onChange={(value) => {
                     const normalizedValue = numberRegExp.test(value)  // test whether a valid number
                       ? parseValue(value) * magnitude
                       : value

                     this.props.dispatch(setProperty(entry.path.concat(year), normalizedValue))
                   }}
                   onFocus={(event) => event.target.select()} />
          </td>
        })
      }
    </tr>
  }

  renderInfo () {
    return <div>
      <h1>Cashflow information</h1>

      <p>
        The cashflow is in principle calculated from operations and investments. In an ideal world, the total of the P&L, minus the depreciation and amortization, for which you would take the investments (because this is the stuff that you actually pay) would be the cashflow. However, that would imply that all transactions are paid/ received on the same day that the connected revenue, costs and investments are put into the P&L and balance sheet. In that case cash flow would equal the Net result x, and the balance sheet would simply be balanced by adding x to the equity on the liability side and to cash and bank on the asset side and that’s it. However, this of course is not the case.
      </p>
      <p>
        So it serves as a baseline (NOPLAT, Net operation profit less adjusted taxes, because of the deferred tax asset described earlier), and then there is a whole bunch of corrections on it, which are called in general "changes in working capital".
      </p>
      <p>
        Example: you had 100 worth of accounts receivable on 31-12 preceding the year you are planning. One can assume that these are paid in that year, adding 100 to the cashflow. However, at the end of the year you will find that some revenue you booked is not paid, and you will have – again-  an accounts receivable position. If this position is then 150, you effectively have received 50 less than the revenue you booked: 100 + your revenue -/- the 150 that you didn't get yet.
      </p>
      <p>
        So in general: if the working capital numbers on the asset side increase year over year, it has a negative effect on the cashflow, if they decrease it has a positive effect.
        For the items on the liability side it is exactly the reverse.
        You will find the correction to be simply the position begin of the year -/- position end of the year, or the other way around.
      </p>
    </div>
  }
}

Cashflow = connect((state, ownProps) => {
  return {
    data: state.doc.data
  }
})(Cashflow)

export default Cashflow
