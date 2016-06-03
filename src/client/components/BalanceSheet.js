import React, { Component } from 'react'
import { connect } from 'react-redux'
import debugFactory from 'debug/browser'

import { setProperty } from '../actions'
import { getProp } from '../utils/object'
import { format, parseValue, numberRegExp } from '../utils/number'
import { calculateBalanceSheet, getYearsWithInitial } from '../formulas'

const debug = debugFactory('vbi:profit-loss')

class BalanceSheet extends Component {
  render () {
    try {
      const currency = this.props.data.parameters.currency || 'x'
      const magnitude = parseValue(this.props.data.parameters.currencyMagnitude) || 1
      const numberOfDecimals = parseValue(this.props.data.parameters.numberOfDecimals)
      const years = getYearsWithInitial(this.props.data)

      const balanceSheet = calculateBalanceSheet(this.props.data)
      const balance = balanceSheet.find(e => e.id === 'balance').values
      const balanceIsZero = Object.keys(balance).every(year => Math.round(balance[year]) === 0)

      return <div>
        <table className="output" >
          <tbody>
          <tr>
            <th />
            <th />
            {years.map(year => <th key={year}>{year}</th>)}
          </tr>
          {
            balanceSheet.map(entry => this.renderEntry(years, entry, currency, magnitude, numberOfDecimals))
          }
          </tbody>
        </table>
        
        { balanceIsZero ? null : <div className="error">Warning: the balance is not zero!</div> }
      </div>
    }
    catch (err) {
      debug(err)
      return <div className="error"><p>{err.toString()}</p></div>
    }
  }

  renderEntry (years, entry, currency, magnitude, numberOfDecimals) {
    return <tr key={entry.name} className={entry.className}>
      <td className="name">{entry.name}</td>
      <td className="magnitude">{`${currency}${magnitude !== 1 ? magnitude : ''}`}</td>
      {
        years.map((year, index) => {
          const total = entry.values[year]
          const value = total && format(total / magnitude, numberOfDecimals)

          if (index === 0) {
            if (entry.initialValuePath) {
              return this.renderEditableInitialValue(entry.initialValuePath, magnitude)
            }
            else {
              return <td key={year} >{ value }</td>
            }
          }
          else {
            return <td key={year} >{ value }</td>
          }
        })
      }
    </tr>
  }

  renderEditableInitialValue (path, magnitude) {
    const rawValue = getProp(this.props.data, path)
    const validValue = !rawValue || numberRegExp.test(rawValue)
    const value = rawValue && validValue
        ? parseValue(rawValue) / magnitude
        : rawValue

    return <td key="initial" className="input-field">
      <input
          value={value}
          className={ validValue ? '' : ' invalid' }
          onChange={(event) => {
            const value = numberRegExp.test(event.target.value)  // test whether a valid number
              ? String(parseValue(event.target.value) * magnitude)
              : event.target.value

              this.props.dispatch(setProperty(['data'].concat(path), value))
           }}
      />
    </td>
  }
}

BalanceSheet = connect((state, ownProps) => {
  return {
    data: state.doc.data
  }
})(BalanceSheet)

export default BalanceSheet
