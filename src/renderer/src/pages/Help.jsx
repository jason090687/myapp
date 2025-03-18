import React, { useState } from 'react'
import './Help.css'

const Help = () => {
  const [activeSection, setActiveSection] = useState('getting-started')

  const sections = {
    'getting-started': {
      title: 'Getting Started',
      content: [
        {
          title: 'Basic Navigation',
          items: [
            'Use the sidebar menu to navigate between different sections',
            'Dashboard provides an overview of library statistics',
            'Access Books, Borrowed items, Students, and Staff sections',
            'Use Settings for system configuration',
            'Toggle sidebar collapse for more space'
          ]
        },
        {
          title: 'Quick Actions',
          items: [
            'Global search in the top navigation bar',
            'Session timeout after 15 minutes of inactivity',
            'Generate monthly reports from Dashboard',
            'Quick access to recent activities'
          ]
        }
      ]
    },
    'library-management': {
      title: 'Library Management',
      content: [
        {
          title: 'Books Section',
          items: [
            'View and manage all library books',
            'Add new books with MARC record details',
            'Search and filter book inventory',
            'Track book status and availability'
          ]
        },
        {
          title: 'Borrowing System',
          items: [
            'Process book borrowing and returns',
            'Manage overdue books and penalties',
            'Track borrowed book history',
            'Handle book renewals'
          ]
        }
      ]
    },
    'user-management': {
      title: 'User Management',
      content: [
        {
          title: 'Student Management',
          items: [
            'View and manage student profiles',
            'Track student borrowing history',
            'Monitor active and inactive students',
            'Manage student penalties and dues'
          ]
        },
        {
          title: 'Staff Management',
          items: [
            'Coming Soon: Staff profile management',
            'Coming Soon: Staff access control',
            'Coming Soon: Staff activity tracking',
            'Coming Soon: Role-based permissions'
          ]
        }
      ]
    },
    reports: {
      title: 'Reports & Analytics',
      content: [
        {
          title: 'Dashboard Analytics',
          items: [
            'View total books, borrowed, and returned statistics',
            'Monitor overdue books and pending fees',
            'Track top borrowers and popular books',
            'Generate monthly activity reports'
          ]
        },
        {
          title: 'Export Features',
          items: [
            'Download monthly reports as PDF',
            'Export borrowing history',
            'Generate statistical reports',
            'Save and print reports'
          ]
        }
      ]
    }
  }

  return (
    <div className="main-content">
      <div className="help-container">
        <div className="inner-help-sidebar">
          <ul>
            {Object.keys(sections).map((key) => (
              <li
                key={key}
                className={activeSection === key ? 'active' : ''}
                onClick={() => setActiveSection(key)}
              >
                {sections[key].title}
              </li>
            ))}
          </ul>
        </div>

        <div className="help-main-content">
          <div className="help-header">
            <h1>{sections[activeSection].title}</h1>
          </div>

          <div className="help-section">
            {sections[activeSection].content.map((section, index) => (
              <div key={index} className="help-card">
                <h3>{section.title}</h3>
                <ul>
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Help
