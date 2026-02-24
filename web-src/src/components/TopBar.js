import React from 'react';
import '../ac-backend-theme.css';

function TopBar() {
  return (
    <header className="ac-topbar">
      <div className="ac-topbar-left">
        <span className="ac-logo">🅰️</span>
        <span className="ac-title">Review Manager</span>
      </div>
      <div className="ac-topbar-right">
        {/* Placeholder for user menu, notifications, etc. */}
        <span className="ac-user">User</span>
      </div>
    </header>
  );
}

export default TopBar;

