import React from 'react';

export default function ActionMenu ({children, actions}) {
  return <div className="action-menu-root">
    {children}
    <div className="action-menu">
      {actions}
    </div>
  </div>
}