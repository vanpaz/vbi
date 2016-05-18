import React, { Component } from 'react'
import debugFactory from 'debug/browser'

import { profitAndLoss, clearIfZero, formatPrice } from './../js/formulas'

const debug = debugFactory('vbi:profit-loss')

export default class ProfitAndLoss extends Component {
  render () {
    try {
      const periods = this.props.data.parameters.periods
      const pl = profitAndLoss(this.props.data)

      return <div>
        <table className="output" >
          <tbody>
          <tr>
            <th />
            {periods.map(period => <th key={period}>{period}</th>)}
          </tr>
          {
            pl.map(entry => ProfitAndLoss.renderEntry(periods, entry))
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

  static renderEntry (periods, entry) {
    return <tr key={entry.name} className={entry.className}>
      <td className="name">{entry.name}</td>
      {
        periods.map(period => {
          const total = entry.values[period]

          return <td key={period} >
            { clearIfZero(total && formatPrice(total)) }
          </td>
        })
      }
    </tr>
  }
}