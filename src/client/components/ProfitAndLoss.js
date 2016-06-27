import React, { Component } from 'react'
import debugFactory from 'debug/browser'

import InfoIcon from 'material-ui/lib/svg-icons/action/help'

import InfoPopover from './InfoPopover'

import { calculateProfitAndLoss, getYears } from '../formulas'
import { format, parseValue } from '../utils/number'

const debug = debugFactory('vbi:profit-loss')

const styles = {
  infoIcon: {
    width: 14,
    height: 14
  }
}

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
            profitAndLoss.map(entry => this.renderEntry(years, entry, currency, magnitude, numberOfDecimals))
          }
          </tbody>
        </table>

        <InfoPopover ref="infoPopover" onChanged={() => this.forceUpdate() } />
      </div>
    }
    catch (err) {
      debug(err)
      return <div className="error"><p>{err.toString()}</p></div>
    }
  }

  renderEntry (years, entry, currency, magnitude, numberOfDecimals) {
    return <tr key={entry.label} className={entry.className}>
      <td className="label" >
        { this.renderCategoryName(entry) }
      </td>
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

  renderCategoryName (entry) {
    if (entry.info) {
      const isSelected = this.refs.infoPopover && this.refs.infoPopover.isDisplaying(entry.info)

      return <span
          className={'category' + (isSelected ? ' selected' : '')}
          onTouchTap={event => {
            this.refs.infoPopover.show(event.currentTarget, entry.info)
          }} >
        {entry.label + ' '}
        <InfoIcon className="info-icon" style={styles.infoIcon} />
      </span>
    }
    else {
      return entry.label
    }
  }
}