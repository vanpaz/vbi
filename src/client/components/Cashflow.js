import React, { Component } from 'react'
import { connect } from 'react-redux'
import debugFactory from 'debug/browser'

import { setProperty } from '../actions'
import { cashflow, clearIfZero, formatPrice, getYears, getProp } from './../js/formulas'

const debug = debugFactory('vbi:profit-loss')

class Cashflow extends Component {
  render () {
    try {
      const years = getYears(this.props.data)
      const calculations = cashflow(this.props.data)

      return <div>
        <table className="output" >
          <tbody>
          <tr>
            <th />
            {years.map(period => <th key={period}>{period}</th>)}
          </tr>
          {
            calculations.map(entry => {
              if (entry.editable) {
                return this.renderEditableEntry(entry.name, years, entry.path, entry.className)
              }
              else {
                return this.renderEntry(entry.name, years, entry.values, entry.className)
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

  renderEntry (name, years, values, className) {
    return <tr key={name} className={className}>
      <td className="name">{name}</td>
      {
        years.map(year => {
          const total = values[year]

          return <td key={year} >
            { clearIfZero(total && formatPrice(total)) }
          </td>
        })
      }
    </tr>
  }

  renderEditableEntry (name, years, path, className) {
    const values = getProp(this.props, path)

    return <tr key={name} className={className}>
      <td className="name">{name}</td>
      {
        years.map(year => {
          return <td key={year} >
            <input className="financing"
                   value={values[year]}
                   onChange={(event) => {
                     this.props.dispatch(setProperty(path.concat(year), event.target.value))
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
