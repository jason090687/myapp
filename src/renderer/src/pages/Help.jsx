import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import {
  FaBook,
  FaUsers,
  FaChartLine,
  FaCog,
  FaQuestionCircle,
  FaBookOpen,
  FaExchangeAlt,
  FaUserGraduate,
  FaClipboardCheck,
  FaFileDownload,
  FaSearch,
  FaLightbulb,
  FaRocket
} from 'react-icons/fa'
import './Help.css'

const Help = () => {
  const [activeSection, setActiveSection] = useState('getting-started')
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const sections = {
    'getting-started': {
      title: 'Getting Started',
      icon: FaRocket,
      color: '#3b82f6',
      content: [
        {
          title: 'Welcome to Library Management System',
          icon: FaLightbulb,
          items: [
            'Navigate using the sidebar menu to access different sections',
            'Dashboard provides real-time statistics and analytics',
            'Use the search bar to quickly find books, students, or records',
            'Your session will timeout after 15 minutes of inactivity for security',
            'Toggle the sidebar to expand your workspace'
          ]
        },
        {
          title: 'Quick Navigation Tips',
          icon: FaSearch,
          items: [
            'Click on Dashboard for an overview of library activities',
            'Books section for managing the library inventory',
            'Borrowed section tracks all active loans and returns',
            'Students section manages student profiles and history',
            'Settings allows you to customize your preferences'
          ]
        }
      ]
    },
    'books-management': {
      title: 'Books Management',
      icon: FaBook,
      color: '#10b981',
      content: [
        {
          title: 'Managing Your Library Collection',
          icon: FaBookOpen,
          items: [
            'Add new books with complete cataloging information',
            'Edit book details, ISBN, author, and classification',
            'Track multiple copies and variants of the same book',
            'Monitor book availability and status in real-time',
            'Search and filter books by title, author, or ISBN',
            'Delete books that are no longer in circulation'
          ]
        },
        {
          title: 'Book Variants & Copies',
          icon: FaClipboardCheck,
          items: [
            'Manage different editions of the same book',
            'Track individual copies with accession numbers',
            'Set availability status for each copy',
            'View which copies are currently borrowed',
            'Add notes or remarks for specific variants'
          ]
        }
      ]
    },
    'borrowing-system': {
      title: 'Borrowing System',
      icon: FaExchangeAlt,
      color: '#f59e0b',
      content: [
        {
          title: 'Processing Loans',
          icon: FaExchangeAlt,
          items: [
            'Select student and book to create a new loan',
            'Set due dates based on library policies',
            'Process returns and mark books as returned',
            'Handle renewals for active loans',
            'Calculate and manage overdue penalties automatically'
          ]
        },
        {
          title: 'Overdue Management',
          icon: FaClipboardCheck,
          items: [
            'View all overdue books in one place',
            'System automatically calculates penalty fees',
            'Track pending fee collections',
            'Send reminders to students with overdue books',
            'Generate overdue reports for follow-up'
          ]
        }
      ]
    },
    'student-management': {
      title: 'Student Management',
      icon: FaUserGraduate,
      color: '#8b5cf6',
      content: [
        {
          title: 'Student Profiles',
          icon: FaUsers,
          items: [
            'Add new students with complete information',
            'Edit student details, grade, and section',
            'View complete borrowing history',
            'Track active loans and overdue books',
            'Manage student penalties and dues',
            'Deactivate graduated or transferred students'
          ]
        },
        {
          title: 'Student Analytics',
          icon: FaChartLine,
          items: [
            'View top borrowers in your library',
            'Track student reading patterns',
            'Monitor frequent library users',
            'Generate student activity reports',
            'Identify students with outstanding penalties'
          ]
        }
      ]
    },
    'reports-analytics': {
      title: 'Reports & Analytics',
      icon: FaChartLine,
      color: '#ec4899',
      content: [
        {
          title: 'Dashboard Analytics',
          icon: FaChartLine,
          items: [
            'View total books in your collection',
            'Monitor currently borrowed books',
            'Track returned books count',
            'See overdue books and pending fees',
            'Analyze active users and library traffic',
            'Interactive charts show trends over time'
          ]
        },
        {
          title: 'Report Generation',
          icon: FaFileDownload,
          items: [
            'Generate monthly activity reports',
            'Export borrowing history as PDF',
            'Download statistical summaries',
            'Print formatted reports for documentation',
            'Create custom date range reports',
            'Share reports with administrators'
          ]
        }
      ]
    },
    'settings-help': {
      title: 'Settings & Configuration',
      icon: FaCog,
      color: '#6366f1',
      content: [
        {
          title: 'General Settings',
          icon: FaCog,
          items: [
            'Change application language (English, Spanish, Filipino, French, German)',
            'Customize date and time formats',
            'Set items per page for tables',
            'Choose between light and dark themes',
            'Configure welcome screen preferences'
          ]
        },
        {
          title: 'Account & Security',
          icon: FaUsers,
          items: [
            'Update your profile information',
            'Change your password regularly',
            'Manage notification preferences',
            'Set up email alerts for overdue books',
            'Configure desktop notifications'
          ]
        },
        {
          title: 'System Management',
          icon: FaCog,
          items: [
            'Clear cache for better performance',
            'Manage data synchronization settings',
            'Configure logging levels',
            'Create backups of your library data',
            'Restore from previous backups'
          ]
        }
      ]
    }
  }

  const filteredSections = Object.keys(sections).reduce((acc, key) => {
    if (searchQuery === '') {
      acc[key] = sections[key]
      return acc
    }

    const section = sections[key]
    const matchesTitle = section.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesContent = section.content.some(
      (content) =>
        content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        content.items.some((item) => item.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    if (matchesTitle || matchesContent) {
      acc[key] = section
    }

    return acc
  }, {})

  return (
    <div className="app-wrapper">
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      <div className={`help-page-container ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="help-header-section">
          <div className="help-hero">
            <FaQuestionCircle className="help-hero-icon" />
            <h1>Help & Documentation</h1>
            <p>Learn how to make the most of your Library Management System</p>
          </div>

          <div className="help-search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="help-content-wrapper">
          <div className="help-sidebar-nav">
            <h3>Topics</h3>
            <ul>
              {Object.keys(filteredSections).map((key) => {
                const section = sections[key]
                const Icon = section.icon
                return (
                  <li
                    key={key}
                    className={activeSection === key ? 'active' : ''}
                    onClick={() => setActiveSection(key)}
                    style={{ '--accent-color': section.color }}
                  >
                    <Icon className="nav-icon" />
                    <span>{section.title}</span>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="help-main-section">
            {filteredSections[activeSection] && (
              <>
                <div className="help-section-header">
                  {React.createElement(sections[activeSection].icon, {
                    className: 'section-header-icon',
                    style: { color: sections[activeSection].color }
                  })}
                  <h2>{sections[activeSection].title}</h2>
                </div>

                <div className="help-cards-grid">
                  {sections[activeSection].content.map((section, index) => {
                    const Icon = section.icon
                    return (
                      <div key={index} className="help-info-card">
                        <div className="card-header">
                          <Icon className="card-icon" />
                          <h3>{section.title}</h3>
                        </div>
                        <ul className="card-list">
                          {section.items.map((item, itemIndex) => (
                            <li key={itemIndex}>
                              <span className="bullet">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {Object.keys(filteredSections).length === 0 && (
              <div className="no-results">
                <FaSearch />
                <h3>No results found</h3>
                <p>Try searching with different keywords</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Help
