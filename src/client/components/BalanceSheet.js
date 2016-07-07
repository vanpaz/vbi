import React, { Component } from 'react'
import { connect } from 'react-redux'
import debugFactory from 'debug/browser'

import InfoIcon from 'material-ui/lib/svg-icons/action/help'

import InfoPopover from './InfoPopover'
import DebouncedInput from './controls/DebouncedInput'

import { setProperty } from '../actions'
import { getProp } from '../utils/object'
import { format, normalize, denormalize, parseValue, numberRegExp } from '../utils/number'
import { calculateBalanceSheet, getYearsWithInitial } from '../formulas'

const debug = debugFactory('vbi:profit-loss')

const styles = {
  infoIcon: {
    width: 14,
    height: 14
  }
}

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

        <InfoPopover ref="infoPopover" onChanged={() => this.forceUpdate() }  />
      </div>
    }
    catch (err) {
      debug(err)
      return <div className="error"><p>{err.toString()}</p></div>
    }
  }

  renderEntry (years, entry, currency, magnitude, numberOfDecimals) {
    return <tr key={entry.label} className={entry.className}>
      <td className="name">
        { this.renderCategoryName(entry) }
      </td>
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
        ? denormalize(rawValue, magnitude)
        : rawValue

    return <td key="initial" className="input-field">
      <DebouncedInput
          value={value}
          className={ validValue ? '' : ' invalid' }
          onChange={(value) => {
            const normalizedValue = numberRegExp.test(value)  // test whether a valid number
              ? normalize(value, magnitude)
              : value

              this.props.dispatch(setProperty(path, normalizedValue))
           }}
      />
    </td>
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

BalanceSheet = connect((state, ownProps) => {
  return {
    data: state.doc.data
  }
})(BalanceSheet)

export default BalanceSheet
