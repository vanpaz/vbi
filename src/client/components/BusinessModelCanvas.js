import React, { Component } from 'react'
import Immutable from 'seamless-immutable'
import Dragula from 'react-dragula'

import Card from 'material-ui/lib/card/card'
import CardText from 'material-ui/lib/card/card-text'
import Tabs from 'material-ui/lib/tabs/tabs'
import Tab from 'material-ui/lib/tabs/tab'
import CheckBox from 'material-ui/lib/checkbox'
import SelectField from 'material-ui/lib/select-field'
import MenuItem from 'material-ui/lib/menus/menu-item'

import TextItemList from './TextItemList'
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
                            { renderCategories('partnerships', bmc, onSetProperty) }
                            { renderOther('partnerships', bmc, onSetProperty) }
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
                            { renderCategories('activities', bmc, onSetProperty) }
                            { renderOther('activities', bmc, onSetProperty) }
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
                            <TextItemList
                                placeholder="product"
                                items={bmc.description && bmc.description.products}
                                onChange={onChangeProducts} />

                            <p>
                              for:
                            </p>
                            <TextItemList
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
                            { renderCategories('contacts', bmc, onSetProperty) }
                            { renderOther('contacts', bmc, onSetProperty) }
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
                            <TextItemList
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
                            <div className="group-header">Resources</div>
                            { renderCategories('resources', bmc, onSetProperty) }
                            { renderOther('resources', bmc, onSetProperty) }

                            <div className="group-header">Investments</div>
                            { renderCategories('investments', bmc, onSetProperty) }
                            { renderOther('investments', bmc, onSetProperty) }
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
                            { renderCategories('channels', bmc, onSetProperty) }
                            { renderOther('channels', bmc, onSetProperty) }
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
                            { renderRevenueStreams(bmc, onSetProperty) }
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

  renderCostStructure (bmc, onSetProperty) {
    const categories = generateCostCategories(bmc)

    function getGroupId (category) {
      if (bmc.costStructure && bmc.costStructure[category.id]) {
        return bmc.costStructure[category.id].groupId
      }
      else if (category.group) {
        return category.group
      }
      else {
        return 'indirect'
      }
    }

    const isDirect    = category => getGroupId(category) === 'direct'
    const isPersonnel = category => getGroupId(category) === 'personnel'
    const isIndirect  = category => !isDirect(category) && !isPersonnel(category)

    const direct    = categories.filter(isDirect)
    const personnel = categories.filter(isPersonnel)
    const indirect  = categories.filter(isIndirect)

    const renderCategory = category => {
      return <div className="cost-group-item" key={category.id} data-category-id={category.id}>
        <span className="ellipsis">{'\u22ee'}</span>&nbsp;{category.text}
      </div>
    }

    return <div className="cost-structure">
      <div className="cost-group">
        <div className="group-header">Direct</div>
        <div className="cost-group-contents" ref="groupDirect" data-group-id="direct">
          { direct.map(renderCategory) }
        </div>
      </div>
      <div className="cost-group">
        <div className="group-header">Personnel</div>
        <div className="cost-group-contents" ref="groupPersonnel" data-group-id="personnel">
          { personnel.map(renderCategory) }
        </div>
      </div>
      <div className="cost-group">
        <div className="group-header">Indirect</div>
        <div className="cost-group-contents" ref="groupIndirect" data-group-id="indirect">
          { indirect.map(renderCategory) }
        </div>
      </div>
    </div>
  }

  componentDidMount () {
    const containers = [
      this.refs.groupDirect,
      this.refs.groupPersonnel,
      this.refs.groupIndirect
    ]

    // we create copies of the dragged elements, which are cleaned up again
    // when dropped so React can create the element itself.
    this.drake = Dragula(containers, {
      copy: true
    })

    this.drake.on('drop', (element) => {
      const parent = element.parentNode
      if (parent) {
        const groupId = parent.getAttribute('data-group-id')
        const categoryId = element.getAttribute('data-category-id')
        const index = toArray(parent.childNodes).indexOf(element)

        // remove the copied element, it will be generated again via React
        parent.removeChild(element)

        this.props.onSetProperty(['bmc', 'costStructure', categoryId], { groupId, index })
      }
    })
  }

  componentWillUnmount () {
    this.drake.destroy()
  }
}

function renderCategories (group, bmc, onSetProperty) {
  return bmcCategories[group].map(category => {

    const props = {
      label: category.text,
      checked: isCategoryChecked(group, bmc, category.id),
      onCheck: (event) => {
        const newValue = {
          value: event.target.checked,
          isDefault: false
        }
        onSetProperty(['bmc', group, 'values', category.id], newValue)
      }
    }

    return <div key={category.id} style={{marginRight: -10}}>
      <CheckBox {...props} />
    </div>
  })
}

function isCategoryChecked (group, bmc, categoryId) {
  let checked = getOptionalProp(bmc, [group, 'values', categoryId, 'value'])
  if (typeof checked !== 'boolean') {
    checked = getOptionalProp(bmcDefaults, [bmc.description.type, group, 'values', categoryId, 'value'])
    if (typeof checked !== 'boolean') {
      checked = false
    }
  }
  return checked
}

function generateCostCategories (bmc) {
  const groups = Immutable([ 'activities', 'resources', 'investments', 'contacts', 'channels' ])

  return groups
      .flatMap(group => {
        const groups = bmcCategories[group]
            .filter(category => isCategoryChecked (group, bmc, category.id))

        const otherGroups = (bmc[group] && bmc[group].other || [])
            .map(({id, value}) => ({id, text: value}))

        return groups.concat(otherGroups)
      })
}

function renderRevenueStreams (bmc, onSetProperty) {
  const revenueStreams = generateRevenueCategories(bmc.description.products, bmc.description.customers)

  return revenueStreams.map(category => {
    let checked = getOptionalProp(bmc, ['revenueStreams', 'values', category.id, 'value'])
    if (checked === undefined) {
      checked = true
    }

    const onCheck = (event) => {
      const newValue = {
        value: event.target.checked,
        isDefault: false
      }

      onSetProperty(['bmc', 'revenueStreams', 'values', category.id], newValue)
    }

    return <div key={category.id} className="revenue-stream">
      <CheckBox checked={checked} label={category.value} onCheck={onCheck} />
    </div>
  })
}

/**
 * Create a category for every combination of product and customer
 * @param {Array.<{id: string, value: string}>} products
 * @param {Array.<{id: string, value: string}>} customers
 * @return {Array.<{id: string, value: string}>}
 *   Array with entries having a compound key as id, which is a concatenation
 *   of the id's of the product and customer.
 */
function generateRevenueCategories (products = [], customers = []) {
  return Immutable(products).flatMap(product => {
    return customers.map(customer => {
      return {
        id: product.id + ':' + customer.id,
        value: product.value + ' for ' + customer.value
      }
    })
  })
}

function renderOther (group, bmc, onSetProperty) {
  const items = bmc[group] && bmc[group].other || []

  const onChange = items => {
    onSetProperty(['bmc', group, 'other'], items)
  }

  return <div>
    <div className="sub-header">Other</div>
    <TextItemList items={items} onChange={onChange} />
  </div>
}

/**
 * Convert a DOM Node List or Arguments into a regular Array
 * @param nodes
 * @return {Array}
 */
function toArray (nodes) {
  const array = [];

  for (var i = 0; i < nodes.length; i++) {
    array[i] = nodes[i]
  }

  return array
}