import React, { Component } from 'react'
import { connect } from 'react-redux'
import debugFactory from 'debug/browser'

import { setProperty } from '../actions'
import { getProp } from '../utils/object'
import { calulateCashflow, clearIfZero, parseValue, getYears } from '../formulas'

const debug = debugFactory('vbi:profit-loss')

class Cashflow extends Component {
  render () {
    try {
      const currency = this.props.data.parameters.currency || 'x'
      const magnitude = parseValue(this.props.data.parameters.currencyMagnitude) || 1
      const years = getYears(this.props.data)
      const cashflow = calulateCashflow(this.props.data)

      return <div>
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
                return this.renderEntry(years, entry, currency, magnitude)
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

  renderEntry (years, entry, currency, magnitude) {
    return <tr key={entry.name} className={entry.className}>
      <td className="name">{entry.name}</td>
      <td className="magnitude">{`${currency}${magnitude !== 1 ? magnitude : ''}`}</td>
      {
        years.map(year => {
          const total = entry.values[year]
          const value = total && Math.round(total / magnitude)

          return <td key={year} >
            { entry.showZeros ? value : clearIfZero(value) }
          </td>
        })
      }
    </tr>
  }

  renderEditableEntry (years, entry, currency, magnitude) {
    const values = getProp(this.props, entry.path)

    return <tr key={entry.name} className={entry.className}>
      <td className="name">{entry.name}</td>
      <td className="magnitude">{`${currency}${magnitude !== 1 ? magnitude : ''}`}</td>
      {
        years.map(year => {
          return <td key={year} >
            <input className="financing"
                   value={values[year]}
                   onChange={(event) => {
                     this.props.dispatch(setProperty(entry.path.concat(year), event.target.value))
                   }}
                   onFocus={(event) => event.target.select()} />
          </td>
        })
      }
    </tr>
  }
}

Cashflow = connect((state, ownProps) => {
  return {
    data: state.doc.data
  }
})(Cashflow)

export default Cashflow
