import React, { Component } from 'react'
import Immutable from 'seamless-immutable'
import Dragula from 'react-dragula'

import Card from 'material-ui/lib/card/card'
import CardText from 'material-ui/lib/card/card-text'
import CheckBox from 'material-ui/lib/checkbox'
import SelectField from 'material-ui/lib/select-field'
import MenuItem from 'material-ui/lib/menus/menu-item'

import TextItemList from './TextItemList'

import { filterActiveCategories, isCustomCategory } from '../formulas'
import * as bmcCategories from '../data/bmcCategories.json'
import * as bmcDefaults  from'../data/bmcDefaults.json' // TODO: re-implement using bmcDefaults

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
    const {
        data, onSetCompanyType, onSetUniqueSellingPoint, onCheckCategory,
        onSetProducts, onSetCustomers, onUpdateCustomCategories
    } = this.props

    const checkedCategories = {}
    data.categories.forEach(category => {
      if (category.bmcId) {
        checkedCategories[category.bmcId] = category.bmcChecked === true
      }
    })

    const onChangeCompanyType = (event, index, value) => {
      onSetCompanyType(value)
    }

    const onChangeUniqueSellingPoint = event => {
      onSetUniqueSellingPoint(event.target.value)
    }

    return <div style={styles.container} >
      <Card className="card">
        <CardText style={styles.cardText}>

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
                      We are a <SelectField style={{fontSize: 14}} value={data.description && data.description.type || ''} onChange={onChangeCompanyType}>
                        <MenuItem index={0} value="" primaryText="&nbsp;"/>
                        {
                          bmcCategories.types.map((c, index) => (
                              <MenuItem key={c.id} index={index + 1} value={c.id} primaryText={c.label} />
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
                        { renderCategories('partnerships', checkedCategories, onCheckCategory) }
                        { renderOther(data, 'partnerships', onUpdateCustomCategories) }
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
                        { renderCategories('activities', checkedCategories, onCheckCategory) }
                        { renderOther(data, 'activities', onUpdateCustomCategories) }
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
                            items={data.description && data.description.products}
                            onChange={onSetProducts} />

                        <p>
                          for:
                        </p>
                        <TextItemList
                            placeholder="customers"
                            items={data.description && data.description.customers}
                            onChange={onSetCustomers} />

                        <p>
                          and they like us because of:
                        </p>
                        <input
                            type="text"
                            placeholder="unique selling point"
                            value={data.description && data.description.uniqueSellingPoint}
                            onChange={onChangeUniqueSellingPoint}
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
                        { renderCategories('contacts', checkedCategories, onCheckCategory) }
                        { renderOther(data, 'contacts', onUpdateCustomCategories) }
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
                            items={data.description && data.description.customers}
                            onChange={onSetCustomers} />
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
                        <div className="sub-header">Expenses</div>
                        { renderCategories('expenses', checkedCategories, onCheckCategory) }
                        { renderOther(data, 'expenses', onUpdateCustomCategories) }

                        <div className="sub-header">Investments</div>
                        { renderCategories('investments', checkedCategories, onCheckCategory) }
                        { renderOther(data, 'investments', onUpdateCustomCategories) }
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
                        { renderCategories('channels', checkedCategories, onCheckCategory) }
                        { renderOther(data, 'channels', onUpdateCustomCategories) }
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
                        { this.renderCostStructure(data) }
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
                        { this.renderRevenueStreams(data) }
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </CardText>
      </Card>
    </div>
  }

  renderCostStructure (data) {
    // filter categories marked as deleted
    const activeCategories = filterActiveCategories(data)

    const direct      = activeCategories.filter(category => category.section === 'costs' && category.group === 'direct')
    const investments = activeCategories.filter(category => category.section === 'investments')
    const indirect    = activeCategories.filter(category => category.section === 'costs' && category.group !== 'direct' && category.group !== 'personnel')

    const renderCategory = category => {
      return <div className="cost-group-item" key={category.id} >
        {category.label}
      </div>
    }

    const renderDraggableCategory = category => {
      return <div className="cost-group-item" key={category.id} data-category-id={category.id}>
        <span className="ellipsis">{'\u22ee'}</span>&nbsp;{category.label}
      </div>
    }

    return <table className="cost-structure">
      <tbody>
        <tr>
          <th>Direct</th>
          <th>Indirect</th>
          <th>Investments</th>
        </tr>
        <tr>
          <td className="cost-group draggable" ref="groupDirect" data-group-id="direct">
            { direct.map(renderDraggableCategory) }
          </td>
          <td className="cost-group draggable" ref="groupIndirect" data-group-id="indirect">
            { indirect.map(renderDraggableCategory) }
          </td>
          <td className="cost-group">
            { investments.map(renderCategory) }
          </td>
        </tr>
      </tbody>
    </table>
  }

  renderRevenueStreams (data) {
    return filterActiveCategories(data)
        .filter(category => category.deleted !== true) // filter deleted categories
        .filter(category => category.section === 'revenues')
        .map(category => {
          return <div key={category.id} className="revenue-stream">
            {category.label}
          </div>
        })
  }

  componentDidMount () {
    const containers = [
      this.refs.groupDirect,
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
        // remove the copied element, it will be generated again via React
        parent.removeChild(element)

        const groupId = parent.getAttribute('data-group-id')
        const categoryId = element.getAttribute('data-category-id')
        this.props.onMoveCategory(categoryId, groupId)
      }
    })
  }

  componentWillUnmount () {
    this.drake.destroy()
  }
}

function renderCategories (bmcGroup, checkedCategories, onCheckCategory) {
  return bmcCategories.categories
      .filter(bmcCategory => bmcCategory.bmcGroup === bmcGroup)
      .map(bmcCategory => {
        const props = {
          label: bmcCategory.label,
          checked: checkedCategories[bmcCategory.bmcId] || false,
          onCheck: (event) => {
            onCheckCategory(bmcCategory.bmcId, event.target.checked)
          }
        }
    
        return <div key={bmcCategory.bmcId} style={{marginRight: -10}}>
          <CheckBox {...props} />
        </div>
  })
}

function renderOther (data, bmcGroup, onUpdateCustomCategories) {
  const categories = data.categories.filter(category => isCustomCategory(category, bmcGroup))
  const items = categories.map(category => ({id: category.id, value: category.label}))

  const onChange = items => {
    const newCategories = items.map(item => {
      return {
        id: item.id,
        label: item.value
      }
    })

    onUpdateCustomCategories(bmcGroup, newCategories)
  }

  return <div>
    <div className="sub-header">Other</div>
    <TextItemList items={items} onChange={onChange} />
  </div>
}
