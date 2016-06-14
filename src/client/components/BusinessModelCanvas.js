import React, { Component } from 'react'

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
                          </SelectField> company.
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
                        <div className="inner value-propositions">
                          <div className="header">
                            Value propositions
                          </div>
                          <div className="contents">
                            We make

                            <ItemList
                                items={bmc.description && bmc.description.products}
                                onChange={onChangeProducts} />

                            for

                            <ItemList
                                items={bmc.description && bmc.description.customers}
                                onChange={onChangeCustomers} />

                            and they like us because of<br/>
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
                            { this.renderCategories('customerSegments', bmc, onSetProperty) }
                            { this.renderOther('customerSegments', bmc, onSetProperty) }
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
                            <b>Resources</b>
                            { this.renderCategories('resources', bmc, onSetProperty) }
                            <br />
                            <b>Investments</b>
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
                        </div>
                      </div>
                    </td>
                    <td colSpan="5">
                      <div className="outer height1">
                        <div className="inner">
                          <div className="header">
                            Revenue streams
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

      let checked = getOptionalProp(bmc, [category, 'values', entry.id, 'value'])
      if (typeof checked !== 'boolean') {
        checked = getOptionalProp(bmcDefaults, [bmc.description.type, category, 'values', entry.id, 'value'])
        if (typeof checked !== 'boolean') {
          checked = false
        }
      }

      const props = {
        label: entry.text,
        checked,
        onCheck: (event) => {
          const newValue = {
            value: event.target.checked,
            isDefault: false
          }
          onSetProperty(['bmc', category, 'values', entry.id], newValue)
        }
      }

      return <div key={entry.id}>
        <CheckBox {...props} />
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
