import React from 'react'
import './Help.css'

const Help = () => {
  return (
    <>
      <div className="main-content">
        <div className="help-container">
          <div className="inner-help-sidebar">
            <ul>
              <li className="active">Getting Started</li>
              <li>Using the Library</li>
              <li>Managing Books</li>
              <li>Borrowing Process</li>
              <li>Account Settings</li>
              <li>FAQ</li>
            </ul>
          </div>

          <div className="help-main-content">
            <div className="help-header">
              <h1>Help Center</h1>
            </div>

            <div className="help-section">
              <h2>Getting Started</h2>
              <p>Welcome to the E-Library Management System. Here's how to get started:</p>

              <div className="help-card">
                <h3>Basic Navigation</h3>
                <ul>
                  <li>Use the sidebar menu to navigate between different sections</li>
                  <li>Browse books in the Books section</li>
                  <li>Track borrowed items in the Borrowed section</li>
                  <li>View your history in the History section</li>
                </ul>
              </div>

              <div className="help-card">
                <h3>Quick Actions</h3>
                <ul>
                  <li>Search for books using the top navigation bar</li>
                  <li>Check notifications for due dates and updates</li>
                  <li>Update your profile in Settings</li>
                  <li>Get support through the Help section</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Help
