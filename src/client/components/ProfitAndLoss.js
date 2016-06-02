import React, { Component } from 'react'
import debugFactory from 'debug/browser'

import { calculateProfitAndLoss, getYears, parseValue } from '../formulas'

const debug = debugFactory('vbi:profit-loss')

export default class ProfitAndLoss extends Component {
  render () {
    try {
      const currency = this.props.data.parameters.currency || 'x'
      const magnitude = parseValue(this.props.data.parameters.currencyMagnitude) || 1
      const numberOfDecimals = parseValue(this.props.data.parameters.numberOfDecimals)
      const years = getYears(this.props.data)
      const profitAndLoss = calculateProfitAndLoss(this.props.data)

      return <div>
        <table className="output" >
          <tbody>
          <tr>
            <th />
            <th />
            {years.map(year => <th key={year}>{year}</th>)}
          </tr>
          {
            profitAndLoss.map(entry => ProfitAndLoss.renderEntry(years, entry, currency, magnitude, numberOfDecimals))
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

  static renderEntry (years, entry, currency, magnitude, numberOfDecimals) {
    return <tr key={entry.name} className={entry.className}>
      <td className="name">{entry.name}</td>
      <td className="magnitude">{`${currency}${magnitude !== 1 ? magnitude : ''}`}</td>
      {
        years.map(year => {
          const total = entry.values[year]
          const value = total && (total / magnitude).toFixed(numberOfDecimals)

          return <td key={year} >
            { value }
          </td>
        })
      }
    </tr>
  }
}