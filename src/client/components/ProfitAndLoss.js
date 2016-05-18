import React, { Component } from 'react'
import debugFactory from 'debug/browser'

import { calculateCostsTotals, calculateRevenueTotals, calculateTotals, clearIfZero, formatPrice } from './../js/formulas'

const debug = debugFactory('vbi:profit-loss')

export default class ProfitAndLoss extends Component {
  render () {
    try {
      const periods = this.props.data.parameters.periods
      const categoryCostsTotals = calculateCostsTotals(this.props.data)
      const categoryRevenueTotals = calculateRevenueTotals(this.props.data)

      debug ('periods', periods)
      debug ('categoryCostsTotals', categoryCostsTotals)
      debug ('categoryRevenueTotals', categoryRevenueTotals)

      return <div>
        <p>
          (not yet worked out in detail...)
        </p>

        <h1>Costs</h1>
        {ProfitAndLoss.renderTotals(categoryCostsTotals, periods)}

        <h1>Revenues</h1>
        {ProfitAndLoss.renderTotals(categoryRevenueTotals, periods)}
      </div>
    }
    catch (err) {
      debug(err)
      return <div className="error"><p>{err.toString()}</p></div>
    }
  }

  static renderTotals (categoryTotals, periods) {
    let totals = calculateTotals(categoryTotals)

    return <table className="category-table" >
      <tbody>
      <tr>
        <th />
        {periods.map(period => <th key={period}>{period}</th>)}
      </tr>
      {
        categoryTotals.map(entry => <tr key={entry.name}>
          <td className="read-only">{entry.name}</td>
          {
            periods.map(period => {
              let total = entry.totals[period]
              
              return <td key={period} className="read-only">{
                clearIfZero(total && formatPrice(total))
              }</td>
            })
          }
        </tr>)
      }
      <tr>
        <td className="read-only total">total</td>
        {
          periods.map(period => {
            let total = totals[period]

            return  <td key={period} className="read-only total">{
              clearIfZero(total && formatPrice(total))
            }</td>
          })
        }
      </tr>
      </tbody>
    </table>
  }

}