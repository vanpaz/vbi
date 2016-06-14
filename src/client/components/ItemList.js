import React, { Component } from 'react'
import Immutable from 'seamless-immutable'

import RemoveIcon from 'material-ui/lib/svg-icons/content/remove-circle'
import AddIcon from 'material-ui/lib/svg-icons/content/add-circle'


const styles = {
  button: {
    color: '#6d6d6d' // @gray
  }
}

export default class ItemList extends Component {
  render () {
    const items = this.getItems()

    return <div className="list">
      { items.map(this.renderItem.bind(this))}
      <div className="add-item">
        <button onTouchTap={this.addItem.bind(this)}>
          <AddIcon color={styles.button.color} />
        </button>
      </div>
    </div>
  }

  renderItem (value, index) {
    return <div className="list-item" key={index} >
      <div className="item-value" >
        <input ref={'item' + index}
               placeholder={this.props.placeholder}
               value={value}
               onChange={event => this.changeItem(event.target.value, index)} />
      </div>
      <div className="remove-item">
        <button onTouchTap={this.removeItem.bind(this, index)} >
          <RemoveIcon color={styles.button.color} />
        </button>
      </div>
    </div>
  }

  /**
   * Return the items as an immutable array
   * @return {*}
   */
  getItems () {
    if (!this.props.items) {
      return Immutable([])
    }
    else if (this.props.items.updateIn) {
      return this.props.items
    }
    else {
      return Immutable(this.props.items)
    }
  }

  changeItem (value, index) {
    const updatedItems = this.getItems().updateIn([index], () => value)
    this.props.onChange(updatedItems)
  }

  addItem () {
    const updatedItems = this.getItems().concat([''])
    this.props.onChange(updatedItems)

    setTimeout(this.focus.bind(this, updatedItems.length - 1), 0)
  }

  removeItem (index) {
    const items = this.getItems()
    const updatedItems = items.slice(0, index).concat(items.slice(index + 1))
    this.props.onChange(updatedItems)
  }

  focus(index) {
    const input = this.refs && this.refs['item' + index]
    if (input) {
      input.focus()
    }
  }
}
