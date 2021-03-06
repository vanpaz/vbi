import React, { Component } from 'react'
import Immutable from 'seamless-immutable'
import debugFactory from 'debug/browser'

import Popover from 'material-ui/lib/popover/popover'
import SelectField from 'material-ui/lib/select-field'
import MenuItem from 'material-ui/lib/menus/menu-item'

import PriceTypeConstant from './PriceTypeConstant'
import PriceTypeInvestment from './PriceTypeInvestment'
import PriceTypeManual from './PriceTypeManual'
import PriceTypeRevenue from './PriceTypeRevenue'
import PriceTypeSalary from './PriceTypeSalary'

import { types } from '../../formulas'
import bindMethods from '../../utils/bindMethods'

const debug = debugFactory('vbi:Price')

/**
 * Price
 *
 * This component allows changing of different types of prices, see README
 * about "Price formats". The price can be changed by clicking on it, which
 * opens a popover where you can change stuff (similar to a date picker).
 *
 * Usage:
 *
 *     var price = {
 *       type: 'constant',
 *       value: '28',
 *       change: '+3%'
 *     }
 *
 *     var categories = [{id: 1, label: 'licenses'}, {id: 2, label: 'projects'}]
 *
 *     var years = ['2015', '2016', '2017', '2018']
 *
 *     function onChange (price) {
 *       console.log('changed', price)
 *     }
 *
 *     <Price price={price} categories={categories} onChange={onChange} />
 *
 */
export default class Price extends Component {
  constructor (props) {
    super(props)

    this.state = {
      showPopover: false,
      anchorEl: null
    }
    
    bindMethods(this)
  }

  render () {
    const type = findPriceType(this.props.priceTypes, this.props.price)
    const PriceType = Price.PRICE_TYPES[type]

    return <div className="price">
      <button
          className={this.state.showPopover ? 'price expanded' : 'price'}
          onTouchTap={this.showPopover} >
        {PriceType && this.props.price && PriceType.format(this.props.price)}
        {' \u25BE'}
      </button>

      <Popover
          ref="popover"
          open={this.state.showPopover}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}
          onRequestClose={this.hidePopover} >
        <div className="price-popover">
          {
            this.renderTypeSelection()
          }
          {
            PriceType
                ? <PriceType 
                      price={this.props.price || Immutable({})}
                      categories={this.props.categories}
                      years={this.props.years}
                      onChange={this.handleChangePrice} />
                : <p>(Select a price type first...)</p>
          }
        </div>
      </Popover>
    </div>
  }

  renderTypeSelection () {
    // only render the select field when there are multiple types allowed
    if (this.props.priceTypes.length <= 1) {
      return null
    }

    let priceTypes = Object.keys(Price.PRICE_TYPES)
        .filter(type => this.props.priceTypes.includes(type))
        .sort()
        .map(type => {
          return <MenuItem
              key={type}
              value={type}
              primaryText={Price.PRICE_TYPES[type].label} />
        })

    return <SelectField
        value={this.props.price && this.props.price.type}
        onChange={this.handleChangeType}
        hintText="Select a price type">
      {priceTypes}
    </SelectField>

  }

  showPopover (event) {
    event.preventDefault() // prevent from immediately closing on tap

    debug('showPopover')
    this.setState({
      showPopover: true,
      anchorEl: event.currentTarget
    })
  }

  hidePopover (event) {
    debug('hidePopover')
    this.setState({showPopover: false})
  }

  handleChangePrice (price) {
    debug('handleChangePrice', price)
    this.props.onChange(price)
  }

  handleChangeType (event, index, type) {
    const defaultPrice = Immutable(types[type].defaultPrice)

    let price = defaultPrice
        .merge(this.props.price || Immutable({}))
        .set('type', type)

    debug('handleChangeType', price)

    this.props.onChange(price)
  }

  /**
   * map with all registered price types
   */
  static PRICE_TYPES = {
    constant: PriceTypeConstant,
    investment: PriceTypeInvestment,
    manual: PriceTypeManual,
    revenue: PriceTypeRevenue,
    salary: PriceTypeSalary
  }
}


function findPriceType (priceTypes, price) {
  if(price && Price.PRICE_TYPES[price.type] && priceTypes.includes(price.type)) {
    return price.type
  }
  else {
    return priceTypes[0]
  }
}
