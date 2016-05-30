import React, { Component } from 'react'
import debugFactory from 'debug/browser'

import { avgProps, avg, multiplyPropsWith } from '../utils/object'
import { profitAndLoss, clearIfZero, getYears, parseValue } from '../formulas'

const debug = debugFactory('vbi:profit-loss')

export default class ProfitAndLoss extends Component {
  render () {
    try {
      const currency = this.props.data.parameters.currency || 'x'
      const magnitude = parseValue(this.props.data.parameters.currencyMagnitude || '1')
      const years = getYears(this.props.data)
      const calculations = profitAndLoss(this.props.data)

      return <div>
        <table className="output" >
          <tbody>
          <tr>
            <th />
            <th />
            {years.map(year => <th key={year}>{year}</th>)}
          </tr>
          {
            calculations.map(entry => ProfitAndLoss.renderEntry(years, entry, currency, magnitude))
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

  static renderEntry (years, entry, currency, magnitude) {
    return <tr key={entry.name} className={entry.className}>
      <td className="name">{entry.name}</td>
      <td className="magnitude">{`${currency}${magnitude !== 1 ? magnitude : ''}`}</td>
      {
        years.map(year => {
          const total = entry.values[year]

          return <td key={year} >
            { clearIfZero(total && Math.round(total / magnitude)) }
          </td>
        })
      }
    </tr>
  }
}