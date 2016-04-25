import React, { Component } from 'react';
import debugFactory from 'debug/browser';

import { calculateCostsTotals, calculateRevenueTotals, calculateTotals, clearIfZero, formatPrice } from './formulas';

const debug = debugFactory('vbi:profit-loss');

export default class ProfitAndLoss extends Component {
  render () {
    try {
      let periods = this.props.data.parameters.periods;
      let categoryCostsTotals = calculateCostsTotals(this.props.data);
      let categoryRevenueTotals = calculateRevenueTotals(this.props.data);

      debug ('periods', periods);
      debug ('categoryCostsTotals', categoryCostsTotals);
      debug ('categoryRevenueTotals', categoryRevenueTotals);

      return <div>
        <h1>costs</h1>
        {ProfitAndLoss.renderTotals(categoryCostsTotals, periods)}

        <h1>revenues</h1>
        {ProfitAndLoss.renderTotals(categoryRevenueTotals, periods)}
      </div>;
    }
    catch (err) {
      return <div className="error">{err.toString()}</div>
    }
  }

  static renderTotals (categoryTotals, periods) {
    let totals = calculateTotals(categoryTotals);

    return <table className="category-table" >
      <tbody>
      <tr>
        <th />
        {periods.map(period => <th key={period}>{period}</th>)}
      </tr>
      {
        categoryTotals.map(entry => <tr key={entry.category}>
          <td className="read-only">{entry.category}</td>
          {
            periods.map(period => {
              let total = entry.totals[period];
              
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
            let total = totals[period];

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