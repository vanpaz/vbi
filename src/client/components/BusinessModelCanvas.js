import React, { Component } from 'react'
import Immutable from 'seamless-immutable'

import Card from 'material-ui/lib/card/card'
import CardText from 'material-ui/lib/card/card-text'
import Tabs from 'material-ui/lib/tabs/tabs'
import Tab from 'material-ui/lib/tabs/tab'
import CheckBox from 'material-ui/lib/checkbox'
import SelectField from 'material-ui/lib/select-field'
import MenuItem from 'material-ui/lib/menus/menu-item'

import ItemList from './ItemList'
import { getOptionalProp } from '../utils/object'

import * as bmcCategories from '../data/bmcCategories.json'
import * as bmcDefaults  from'../data/bmcDefaults.json'

import shouldComponentUpdate from '../utils/shouldComponentUpdate'

const styles = {
  container: {
    width: '100%',
    display: 'inline-flex'
  },
  cardText: {
    padding: 0
  },
  inkBar: {
    height: 6,
    marginTop: -6
  },
  tabContents: {
    padding: 16,
    paddingBottom: 50,
    overflow: 'auto'
  }
}

export default class BusinessModelCanvas extends Component {
  constructor (props) {
    super(props)

    // update only when props or state are changed
    this.shouldComponentUpdate = shouldComponentUpdate
  }

  render () {
    const { bmc, onSetProperty } = this.props

    const onChangeType = (event, index, value) => {
      onSetProperty(['bmc', 'description', 'type'], value)
    }
    const onChangeProducts = value => {
      onSetProperty(['bmc', 'description', 'products'], value)
    }
    const onChangeCustomers = value => {
      onSetProperty(['bmc', 'description', 'customers'], value)
    }
    const onChangeUniqueSellingPoint = event => {
      onSetProperty(['bmc', 'description', 'uniqueSellingPoint'], event.target.value)
    }

    return <div style={styles.container} >
      <Card className="card">
        <CardText style={styles.cardText}>
          <Tabs inkBarStyle={styles.inkBar} contentContainerStyle={styles.tabContents}>
            <Tab label="Business Model Canvas">
              <table className="bmc" width="100%">
                <colGroup>
                  <col width="10%" />
                  <col width="10%" />
                  <col width="10%" />
                  <col width="10%" />
                  <col width="10%" />
                  <col width="10%" />
                  <col width="10%" />
                  <col width="10%" />
                  <col width="10%" />
                  <col width="10%" />
                </colGroup>
                <tbody>
                  <tr>
                    <td colSpan="10">
                      <div className="outer">
                        <div className="inner main">
                          We are a <SelectField style={{fontSize: 14}} value={bmc.description && bmc.description.type} onChange={onChangeType}>
                            <MenuItem index={-1} value="" primaryText=""/>
                            {
                              bmcCategories.types.map((c, i) => (
                                  <MenuItem key={c.id} index={i} value={c.id} primaryText={c.text} />
                              ))
                            }
                          </SelectField> company
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="2" rowSpan="2">
                      <div className="outer height4">
                        <div className="inner">
                          <div className="header">
                            Key partners
                          </div>
                          <div className="contents">
                            { this.renderCategories('partnerships', bmc, onSetProperty) }
                            { this.renderOther('partnerships', bmc, onSetProperty) }
                          </div>
                        </div>
                      </div>
                    </td>
                    <td colSpan="2">
                      <div className="outer height2">
                        <div className="inner">
                          <div className="header">
                            Key activities
                          </div>
                          <div className="contents">
                            { this.renderCategories('activities', bmc, onSetProperty) }
                            { this.renderOther('activities', bmc, onSetProperty) }
                          </div>
                        </div>
                      </div>
                    </td>
                    <td colSpan="2" rowSpan="2">
                      <div className="outer height4">
                        <div className="inner value-proposition">
                          <div className="header">
                            Value proposition
                          </div>
                          <div className="contents">
                            <p>
                              We make:
                            </p>
                            <ItemList
                                placeholder="product"
                                items={bmc.description && bmc.description.products}
                                onChange={onChangeProducts} />

                            <p>
                              for:
                            </p>
                            <ItemList
                                placeholder="customers"
                                items={bmc.description && bmc.description.customers}
                                onChange={onChangeCustomers} />

                            <p>
                              and they like us because of:
                            </p>
                            <input
                                type="text"
                                placeholder="unique selling point"
                                value={bmc.description && bmc.description.uniqueSellingPoint}
                                onChange={onChangeUniqueSellingPoint }
                            />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td colSpan="2">
                      <div className="outer height2">
                        <div className="inner">
                          <div className="header">
                            Customer relations
                          </div>
                          <div className="contents">
                            { this.renderCategories('contacts', bmc, onSetProperty) }
                            { this.renderOther('contacts', bmc, onSetProperty) }
                          </div>
                        </div>
                      </div>
                    </td>
                    <td colSpan="2" rowSpan="2">
                      <div className="outer height4">
                        <div className="inner">
                          <div className="header">
                            Customer segments
                          </div>
                          <div className="contents">
                            <ItemList
                                items={bmc.description && bmc.description.customers}
                                onChange={onChangeCustomers} />
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="2">
                      <div className="outer height2">
                        <div className="inner">
                          <div className="header">
                            Key resources
                          </div>
                          <div className="contents">
                            <div className="category-header">Resources</div>
                            { this.renderCategories('resources', bmc, onSetProperty) }
                            { this.renderOther('resources', bmc, onSetProperty) }

                            <div className="category-header">Investments</div>
                            { this.renderCategories('investments', bmc, onSetProperty) }
                            { this.renderOther('investments', bmc, onSetProperty) }
                          </div>
                        </div>
                      </div>
                    </td>
                    <td colSpan="2">
                      <div className="outer height2">
                        <div className="inner">
                          <div className="header">
                            Channels
                          </div>
                          <div className="contents">
                            { this.renderCategories('channels', bmc, onSetProperty) }
                            { this.renderOther('channels', bmc, onSetProperty) }
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="5">
                      <div className="outer height1">
                        <div className="inner">
                          <div className="header">
                            Cost structure
                          </div>
                          <div className="contents">
                            { this.renderCostStructure(bmc, onSetProperty) }
                          </div>
                        </div>
                      </div>
                    </td>
                    <td colSpan="5">
                      <div className="outer height1">
                        <div className="inner">
                          <div className="header">
                            Revenue streams
                          </div>
                          <div className="contents">
                            { this.renderRevenueStreams(bmc, onSetProperty) }
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

            </Tab>
          </Tabs>

        </CardText>
      </Card>
    </div>
  }

  renderCategories (category, bmc, onSetProperty) {
    return bmcCategories[category].map(entry => {

      const props = {
        label: entry.text,
        checked: this.isCategoryChecked(category, bmc, entry.id),
        onCheck: (event) => {
          const newValue = {
            value: event.target.checked,
            isDefault: false
          }
          onSetProperty(['bmc', category, 'values', entry.id], newValue)
        }
      }

      return <div key={entry.id} style={{marginRight: -10}}>
        <CheckBox {...props} />
      </div>
    })
  }

  isCategoryChecked (category, bmc, entryId) {
    let checked = getOptionalProp(bmc, [category, 'values', entryId, 'value'])
    if (typeof checked !== 'boolean') {
      checked = getOptionalProp(bmcDefaults, [bmc.description.type, category, 'values', entryId, 'value'])
      if (typeof checked !== 'boolean') {
        checked = false
      }
    }
    return checked
  }

  renderCostStructure (bmc, onSetProperty) {
    const groups = Immutable([ 'activities', 'resources', 'investments', 'contacts', 'channels' ])

    return groups
        .flatMap(group => {
          const groups = bmcCategories[group]
              .filter(entry => this.isCategoryChecked (group, bmc, entry.id))

          const otherGroups = (bmc[group] && bmc[group].other || [])
              .map((text, i) => ({id: group + i, text})) // TODO: make this mapping redundant

          return groups.concat(otherGroups)
        })
        .map(category => <div key={category.id}>{category.text}</div>)
  }

  renderRevenueStreams (bmc, onSetProperty) {
    const products = bmc.description.products || []
    const customers = bmc.description.customers || []
    const revenueStreams = []
    products.forEach(product => {
      customers.forEach(customer => {
        revenueStreams.push(product + ' for ' + customer)
      })
    })

    return revenueStreams.map(name => {
      let checked = getOptionalProp(bmc, ['revenueStreams', 'values', name, 'value'])
      if (checked === undefined) {
        checked = true
      }

      const onCheck = (event) => {
        const newValue = {
          value: event.target.checked,
          isDefault: false
        }

        onSetProperty(['bmc', 'revenueStreams', 'values', name], newValue)
      }

      return <div key={name} className="revenue-stream">
        <CheckBox checked={checked} label={name} onCheck={onCheck} />
      </div>
    })
  }

  renderOther (category, bmc, onSetProperty) {
    const items = bmc[category] && bmc[category].other || ''

    const onChange = items => {
      onSetProperty(['bmc', category, 'other'], items)
    }

    return <div>
      <div className="sub-header">Other</div>
      <ItemList items={items} onChange={onChange} />
    </div>
  }
}
