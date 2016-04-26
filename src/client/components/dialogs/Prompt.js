import React from 'react';

import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';


export default class Prompt extends React.Component {

  render () {
    let {open, title, description, value, onChange, onCancel, onOk} = this.props;

    function handleCancel(event) {
      onCancel();
    }

    function handleOk(event) {
      event.stopPropagation();
      event.preventDefault();

      onOk(value);
    }

    function handleChange(event) {
      onChange(event.target.value);
    }

    const actions = [
      <FlatButton
          label="Cancel"
          secondary={true}
          onTouchTap={handleCancel}
      />,
      <FlatButton
          label="Ok"
          primary={true}
          keyboardFocused={true}
          onTouchTap={handleOk}
      />
    ];

    return <Dialog
        title={title}
        actions={actions}
        modal={false}
        open={open}
        onRequestClose={handleCancel}>
      <p>
        {description}
      </p>
      <form onSubmit={handleOk}>
        <input
            className="title"
            ref="title"
            value={value}
            onChange={handleChange}/>
      </form>
    </Dialog>
  }

  componentDidMount () {
    if (this.props.open) {
      this.select();
    }
  }
  
  componentDidUpdate (prevProps, prevState) {
    if (this.props.open && !prevProps.open) {
      this.select();
    }
  }

  select () {
    setTimeout(() => {
      this.refs.title.select()
    }, 0);
  }
}
