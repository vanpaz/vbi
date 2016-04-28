import React from 'react';

export default function ActionMenu ({children, actions}) {
  return <div className="action-menu-root">
    {children}
    <div className="action-menu">
      <table className="action-menu-contents">
        <tbody>
          <tr>
            {
              actions.map((action, index) => <td key={index}>{action}</td>)
            }
          </tr>
        </tbody>
      </table>
    </div>
  </div>
}