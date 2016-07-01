import React, { Component } from 'react'
import Immutable from 'seamless-immutable'

import RemoveIcon from 'material-ui/lib/svg-icons/content/remove-circle'
import AddIcon from 'material-ui/lib/svg-icons/content/add-circle'

import bindMethods from '../utils/bindMethods'
import { uuid } from '../utils/uuid'

const styles = {
  button: {
    color: '#6d6d6d' // @gray
  }
}

/**
 * Edit a list with items. Shows the items as a list of input boxes, and allows
 * adding/removing items. TextItemList works with immutable data.
 *
 * Usage:
 *
 *     let items = [
 *       {id: 1, value: "First item"},
 *       {id: 2, value: "Second item"},
 *     ]
 *
 *     function onChange (newItems) {
 *       // ... dispatch the changes
 *     }
 *
 *     <TextItemList
 *         items={items}
 *         onChange={function (items) }
 *         placeholder={string}
 *     />
 *
 */
export default class TextItemList extends Component {
  constructor (props) {
    super(props)

    bindMethods(this)
  }

  render () {
    const items = this.getItems()

    return <div className="list">
      { 
        items.map(this.renderItem)
      }
      <div className="add-item">
        <button onTouchTap={this.addItem}>
          <AddIcon color={styles.button.color} />
        </button>
      </div>
    </div>
  }

  renderItem (entry) {
    if (typeof entry !== 'object' || typeof entry.id === 'undefined' || typeof entry.value === 'undefined') {
      console.error('TextItemList entry should be an object {id: string, value: string} but is ' + JSON.stringify(entry))
    }

    return <div className="list-item" key={entry.id} >
      <div className="item-value" >
        <input ref={this.getItemRef(entry.id)}
               placeholder={this.props.placeholder}
               value={entry.value}
               onChange={event => this.changeItem({id: entry.id, value: event.target.value})} />
      </div>
      <div className="remove-item">
        <button onTouchTap={() => this.removeItem(entry.id)} >
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
      // this is already an immutable data structure
      return this.props.items
    }
    else {
      return Immutable(this.props.items)
    }
  }

  changeItem (entry) {
    // replace the entry with matching id with the new one
    const updatedItems = this.getItems()
        .map(e => (e.id === entry.id) ? entry : e)

    this.props.onChange(updatedItems)
  }

  addItem () {
    const id = uuid()
    const updatedItems = this.getItems()
        .concat([{ id, value: '' }])

    this.props.onChange(updatedItems)

    setTimeout(() => this.focus(id), 0)
  }

  removeItem (entryId) {
    const updatedItems = this.getItems()
        .filter(e => e.id !== entryId)
    this.props.onChange(updatedItems)
  }

  getItemRef (entryId) {
    return 'item' + entryId
  }

  focus(entryId) {
    const ref = this.getItemRef(entryId)
    const input = this.refs && this.refs[ref]
    if (input) {
      input.focus()
    }
  }
}
