import React, { Component } from 'react'
import debugFactory from 'debug/browser'

import { balanceSheet, clearIfZero, formatPrice, getYears } from './../js/formulas'

const debug = debugFactory('vbi:profit-loss')

export default class BalanceSheet extends Component {
  render () {
    try {
      const years = getYears(this.props.data)
      const calculations = balanceSheet(this.props.data)

      return <div>
        <table className="output" >
          <tbody>
          <tr>
            <th />
            {years.map(period => <th key={period}>{period}</th>)}
          </tr>
          {
            calculations.map(entry => BalanceSheet.renderEntry(years, entry))
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

  static renderEntry (years, entry) {
    return <tr key={entry.name} className={entry.className}>
      <td className="name">{entry.name}</td>
      {
        years.map(period => {
          const total = entry.values[period]

          return <td key={period} >
            { clearIfZero(total && formatPrice(total)) }
          </td>
        })
      }
    </tr>
  }
}