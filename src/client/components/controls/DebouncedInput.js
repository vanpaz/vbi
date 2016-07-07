import React from 'react'

/**
 * Usage:
 *
 *     <DebouncedInput
 *         value={"MyText"}
 *         onChange={function (value) { console.log('value=' + value)} }
 *         delay={300}
 *         placeholder={"enter text"}
 *     />
 *
 * All properties of DebouncedInput are passed to the created <input/> element.
 *
 * Methods:
 *
 *    .getInput()   // returns the input element
 *    .select()
 *    .focus()
 *    .update()
 */
export default class DebouncedInput extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      value: this.props.value || ''
    }

    this.timer = null

    this.handleChange = this.handleChange.bind(this);
    this.update = this.update.bind(this);
  }

  render() {
    return (
        <input
            {...this.props}
            ref="input"
            value={this.state.value}
            onChange={this.handleChange}
            onInput={this.handleChange}
            onBlur={this.update}
        />
    );
  }

  handleChange (event) {
    event.stopPropagation()

    const value = event.target.value
    const delay = this.props.delay != undefined ? this.props.delay : 300

    clearTimeout(this.timer)
    this.timer = setTimeout(this.update, delay)

    this.setState({ value })
  }

  update () {
    clearTimeout(this.timer)

    if (this.state.value !== this.props.value) {
      this.props.onChange(this.state.value)
    }
  }

  componentWillReceiveProps (nextProps) {
    this.setState({ 
      value: nextProps.value 
    })
  }

  componentWillUnmount() {
    this.update()
  }

  getInput () {
    return this.refs.input || null
  }

  focus () {
    if (this.refs.input) {
      this.refs.input.focus()
    }
  }

  select () {
    if (this.refs.input) {
      this.refs.input.select()
    }
  }
}
