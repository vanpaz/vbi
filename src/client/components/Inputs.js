import React, { Component } from 'react'
import { connect } from 'react-redux'
import debugFactory from 'debug/browser'

import Card from 'material-ui/lib/card/card'
import CardText from 'material-ui/lib/card/card-text'
import Tabs from 'material-ui/lib/tabs/tabs'
import Tab from 'material-ui/lib/tabs/tab'

import Prompt from './dialogs/Prompt'
import Confirm from './dialogs/Confirm'
import {
    addCategory, deleteCategory, renameCategory, moveCategoryUp, moveCategoryDown,
    setParameter, setQuantity, setPrice
} from '../actions'
import { findQuantity, getYears } from '../formulas'
import Price from './prices/Price'
import Parameters from './Parameters'

import ActionMenu from './ActionMenu'

const debug = debugFactory('vbi:inputs')


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

// TODO: refactor Inputs, split renderCategory into a separate component

class Inputs extends Component {
  constructor (props) {
    super(props)

    // bind all methods to current instance so we don't have to create wrapper functions to use them
    this.handleSetParameter = this.handleSetParameter.bind(this)
    this.handleRenameCategory = this.handleRenameCategory.bind(this)
    this.handleMoveCategoryUp = this.handleMoveCategoryUp.bind(this)
    this.handleMoveCategoryDown = this.handleMoveCategoryDown.bind(this)
    this.handleDeleteCategory = this.handleDeleteCategory.bind(this)
    this.handleAddCategory = this.handleAddCategory.bind(this)
  }

  render () {
    return <div style={styles.container}>
      <Card className="card">
        <CardText style={styles.cardText}>
          <Tabs inkBarStyle={styles.inkBar} contentContainerStyle={styles.tabContents}>
            <Tab label="Parameters">
              <Parameters
                  parameters={this.props.data.parameters}
                  onChange={this.handleSetParameter} />
            </Tab>

            <Tab label="Costs" >
              <h1>Direct</h1>
              {this.renderCategory('costs', 'direct', ['constant', 'manual', 'revenue'])}

              <h1>Indirect - personnel</h1>
              {this.renderCategory('costs', 'personnel', ['salary'])}

              <h1>Indirect - other</h1>
              {this.renderCategory('costs', 'indirect', ['constant', 'manual', 'revenue'])}
            </Tab>

            <Tab label="Investments">
              <h1>Tangible fixed assets</h1>
              {this.renderCategory('investments', 'tangible', ['investment'])}

              <h1>Intangible fixed assets</h1>
              {this.renderCategory('investments', 'intangible', ['investment'])}
            </Tab>

            <Tab label="Revenues">
              <h1>&nbsp;</h1>
              {this.renderCategory('revenues', 'all', ['constant', 'manual'])}
            </Tab>
          </Tabs>
        </CardText>
      </Card>

      <Prompt ref="prompt" />
      <Confirm ref="confirm" />
    </div>
  }

  renderCategory (section, group, priceTypes) {
    const years = getYears(this.props.data)
    const categories = this.props.data[section][group]
    const revenueCategories = this.props.data.revenues.all

    return <table className="input" >
      <colgroup>
        <col width='120px'/>
      </colgroup>
      <tbody>
        <tr>
          <th />
          <th className="main" colSpan={years.length}>Quantity</th>
          <th className="main" colSpan={1}>Price</th>
        </tr>
        <tr>
          <th />
          {
            years.map(year => <th key={year}>{year}</th> )
          }
          <th />
        </tr>
        {
          categories.map((category, index) => <tr key={category.id}>
            <td>
              <ActionMenu
                  section={section}
                  group={group}
                  categoryId={category.id}
                  index={index} // provide index to enforce a re-render when moving up/down
                  name={category.name}
                  onRename={this.handleRenameCategory }
                  onMoveUp={this.handleMoveCategoryUp}
                  onMoveDown={this.handleMoveCategoryDown }
                  onDelete={this.handleDeleteCategory } />
            </td>
            {
                category.price.type !== 'revenue'
                    ? this.renderQuantities(section, group, category, years)
                    : <td className="info"
                          colSpan={years.length}
                          title="Quantities are coupled with revenue">(coupled with revenue)</td>
            }
            <td>
              <Price price={category.price}
                     categories={revenueCategories}
                     years={years}
                     priceTypes={priceTypes}
                     onChange={(price) => {
                       this.props.dispatch(setPrice (section, group, category.id, price))
                     }} />
            </td>
          </tr>)
        }
      <tr>
        <td className="read-only">
          <button
              className="add-category"
              title="Add a new category"
              onTouchTap={ (event) => this.handleAddCategory(section, group) }>
            +
          </button>
        </td>
      </tr>
      </tbody>
    </table>
  }

  renderQuantities (section, group, category, years) {
    return years.map(year => (<td key={year} className="quantity">
      <input className="quantity"
             value={findQuantity(category, year, '')}
             onChange={(event) => {
                         const quantity = event.target.value
                         this.props.dispatch(setQuantity(section, group, category.id, year, quantity))
                       }}
             onFocus={(event) => event.target.select()} />
    </td>))
  }

  handleSetParameter (parameter, value) {
    this.props.dispatch(setParameter(parameter, value))
  }

  handleAddCategory (section, group) {
    const options = {
      title: 'New category',
      description: 'Enter a name for the new category:',
      hintText: 'New category',
      value: 'New category'
    }

    this.refs.prompt.show(options).then(name => {
      if (name !== null) {
        this.props.dispatch(addCategory(section, group, name))
      }
    })
  }

  handleRenameCategory (section, group, categoryId) {
    const category = this.findCategory(section, group, categoryId)

    const options = {
      title: 'Rename category',
      description: 'Enter a new name for the category:',
      hintText: 'New category',
      value: category.name
    }

    this.refs.prompt.show(options).then(newName => {
      if (newName !== null) {
        this.props.dispatch(renameCategory(section, group, categoryId, newName))
      }
    })
  }

  handleMoveCategoryUp (section, group, categoryId) {
    this.props.dispatch(moveCategoryUp(section, group, categoryId))
  }

  handleMoveCategoryDown (section, group, categoryId) {
    this.props.dispatch(moveCategoryDown(section, group, categoryId))
  }

  handleDeleteCategory (section, group, categoryId) {
    const category = this.findCategory(section, group, categoryId)

    const options = {
      title: 'Delete category',
      description: <p>Are you sure you want to delete category "{category.name}"?</p>
    }

    this.refs.confirm.show(options).then(ok => {
      if (ok) {
        this.props.dispatch(deleteCategory(section, group, categoryId))
      }
    })
  }

  findCategory (section, group, categoryId) {
    return this.props.data[section][group]
        .find(category => category.id === categoryId)
  }

}

Inputs = connect((state, ownProps) => {
  return {
    data: state.doc.data
  }
})(Inputs)

export default Inputs
