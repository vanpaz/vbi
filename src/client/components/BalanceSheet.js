import React, { Component } from 'react'
import { connect } from 'react-redux'
import debugFactory from 'debug/browser'

import InfoIcon from 'material-ui/lib/svg-icons/action/help'

import InfoPopover from './InfoPopover'
import DebouncedInput from './controls/DebouncedInput'

import { setProperty } from '../actions'
import bindMethods from '../utils/bindMethods'
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

/**
 * <BalanceSheet data={Object} />
 */
class BalanceSheet extends Component {
  constructor (props) {
    super(props)
    bindMethods(this)
  }

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

        <InfoPopover ref="infoPopover" onChanged={ this.updatePopover }  />
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
        <CategoryName entry={entry} showPopover={this.showPopover} />
      </td>
      <td className="magnitude">{`${currency}${magnitude !== 1 ? magnitude : ''}`}</td>
      {
        years.map((year, index) => {
          const total = entry.values[year]
          const value = total && format(total / magnitude, numberOfDecimals)

          if (index === 0) {
            if (entry.propertyPath) {
              return <td key="initial" className="input-field">
                  <EditableValue
                      dispatch={this.props.dispatch}
                      data={this.props.data}
                      propertyPath={entry.propertyPath}
                      magnitude={magnitude} />
              </td>
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

  showPopover (target, info) {
    this.refs.infoPopover.show(target, info)
  }

  updatePopover () {
    this.forceUpdate()
  }
}

/**
 * <EditableValue
 *     data={Object}
 *     dispatch={function}
 *     propertyPath={Array.<string>}
 *     magnitude={number}
 * />
 */
class EditableValue extends React.Component {
  constructor (props) {
    super(props)
    bindMethods(this)
  }

  render () {
    const rawValue = getProp(this.props.data, this.props.propertyPath)
    const validValue = !rawValue || numberRegExp.test(rawValue)
    const value = rawValue && validValue
        ? denormalize(rawValue, this.props.magnitude)
        : rawValue


    return <DebouncedInput
        value={value}
        className={ validValue ? '' : ' invalid' }
        onChange={this.handleChange}
    />
  }

  handleChange (value) {
    const normalizedValue = numberRegExp.test(value)  // test whether a valid number
        ? normalize(value, this.props.magnitude)
        : value

    this.props.dispatch(setProperty(this.props.propertyPath, normalizedValue))
  }
}

/**
 * <CategoryName
 *     entry={Object}
 *     showPopover={function(target, info)}
 * />
 */
class CategoryName extends React.Component {
  constructor (props) {
    super(props)
    bindMethods(this)
  }

  render () {
    if (this.props.entry.info) {
      const isSelected = this.refs.infoPopover && this.refs.infoPopover.isDisplaying(entry.info)

      return <span
          className={'category' + (isSelected ? ' selected' : '')}
          onTouchTap={this.showPopover} >
        {this.props.entry.label + ' '}
        <InfoIcon className="info-icon" style={styles.infoIcon} />
      </span>
    }
    else {
      return <span>{this.props.entry.label}</span>
    }
  }
  
  showPopover (event) {
    this.props.showPopover(event.currentTarget, this.props.entry.info)
  }
}

BalanceSheet = connect((state, ownProps) => {
  return {
    data: state.doc.data
  }
})(BalanceSheet)

export default BalanceSheet
