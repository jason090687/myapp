import React from 'react';
import './Help.css';

const Help = () => {
  return (
    <div className="help-page">
      <nav className="help-navbar">
        <div className="nav-brand">Help Center</div>
        <div className="nav-search">
          <input type="search" placeholder="Search help articles..." />
        </div>
      </nav>
      
      <div className="help-content">
        <aside className="help-sidebar">
          <ul>
            <li className="active">Getting Started</li>
            <li>Common Questions</li>
            <li>Tutorials</li>
            <li>Troubleshooting</li>
            <li>Contact Support</li>
          </ul>
        </aside>
        
        <main className="help-main">
          <h1>Welcome to Help Center</h1>
          <div className="help-section">
            <h2>Getting Started</h2>
            <p>Here you'll find everything you need to know about using our platform.</p>
            
            <h3>Quick Start Guide</h3>
            <ul>
              <li>Setting up your account</li>
              <li>Basic navigation</li>
              <li>Creating your first project</li>
              <li>Managing settings</li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Help;
