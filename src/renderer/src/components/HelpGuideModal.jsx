import { useState } from 'react'
import PropTypes from 'prop-types'
import {
  FaTimes,
  FaBook,
  FaBookmark,
  FaHistory,
  FaCog,
  FaPlus,
  FaEdit,
  FaSearch,
  FaExchangeAlt,
  FaCalendarAlt,
  FaUserCog,
  FaChevronRight,
  FaChevronLeft
} from 'react-icons/fa'
import './HelpGuideModal.css'

const HelpGuideModal = ({ isOpen, onClose }) => {
  const [selectedGuide, setSelectedGuide] = useState(null)

  if (!isOpen) return null

  const guides = [
    {
      icon: FaBook,
      title: 'Books Management',
      description:
        'Add, edit, or remove books. Search through the library catalog and manage book statuses.',
      examples: [
        {
          icon: FaPlus,
          title: 'Adding a New Book',
          steps: [
            'Click "Add New Book" button',
            'Fill in book details (title, author, ISBN, etc.)',
            'Set initial book status',
            'Save to add to catalog'
          ]
        },
        {
          icon: FaEdit,
          title: 'Editing Books',
          steps: [
            'Find book in the table',
            'Click "Edit" button',
            'Update necessary information',
            'Save changes'
          ]
        },
        {
          icon: FaSearch,
          title: 'Searching Books',
          steps: [
            'Use the search bar at the top',
            'Type title, author, or ISBN',
            'Results update automatically',
            'Sort columns by clicking headers'
          ]
        }
      ]
    },
    {
      icon: FaBookmark,
      title: 'Borrowing Books',
      description:
        'Process book borrowing, returns, and renewals. Monitor due dates and book availability.',
      examples: [
        {
          icon: FaPlus,
          title: 'Borrowing Process',
          steps: [
            'Click "Borrow Book" button',
            'Enter student ID',
            'Select book from available list',
            'Set due date and confirm'
          ]
        },
        {
          icon: FaExchangeAlt,
          title: 'Returns & Renewals',
          steps: [
            'Find borrowed book in list',
            'Click "Return" to process return',
            'For renewal, click "Renew"',
            'Maximum 3 renewals allowed'
          ]
        },
        {
          icon: FaCalendarAlt,
          title: 'Due Date Management',
          steps: [
            'Monitor upcoming due dates',
            'Receive notifications for overdue books',
            'Process renewals before due date',
            'Update status upon return'
          ]
        }
      ]
    },
    {
      icon: FaHistory,
      title: 'History',
      description:
        'View complete transaction history, including past borrows, returns, and renewals.',
      examples: [
        {
          icon: FaSearch,
          title: 'Viewing History',
          steps: [
            'Access History section',
            'Filter by date range',
            'Search by student or book',
            'View transaction details'
          ]
        }
      ]
    },
    {
      icon: FaCog,
      title: 'Settings',
      description:
        'Configure your account settings, manage notifications, and customize your preferences.',
      examples: [
        {
          icon: FaUserCog,
          title: 'Account Settings',
          steps: [
            'Update profile information',
            'Change password',
            'Set notification preferences',
            'Customize dashboard view'
          ]
        }
      ]
    }
  ]

  const handleBack = () => {
    setSelectedGuide(null)
  }

  return (
    <div className="help-modal-overlay">
      <div className="help-modal-content">
        <div className="help-modal-header">
          <h2>{selectedGuide ? selectedGuide.title : 'Quick Help Guide'}</h2>
          <div className="help-modal-actions">
            {selectedGuide && (
              <button onClick={handleBack} className="help-back-btn">
                <FaChevronLeft /> Back
              </button>
            )}
            <button onClick={onClose} className="help-close-btn">
              <FaTimes />
            </button>
          </div>
        </div>
        <div className="help-modal-body">
          {!selectedGuide ? (
            // Main menu view
            <div className="help-guide-menu">
              {guides.map((section, index) => (
                <div
                  key={index}
                  className="help-guide-menu-item"
                  onClick={() => setSelectedGuide(section)}
                >
                  <div className="help-guide-menu-header">
                    <section.icon className="help-section-icon" />
                    <div className="help-guide-menu-text">
                      <h3>{section.title}</h3>
                      <p>{section.description}</p>
                    </div>
                    <FaChevronRight className="help-chevron" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Detailed guide view
            <div className="help-guide-detail">
              <div className="help-guide-section">
                <p className="help-section-desc">{selectedGuide.description}</p>
                <div className="help-examples">
                  {selectedGuide.examples.map((example, idx) => (
                    <div key={idx} className="help-example">
                      <div className="example-header">
                        <example.icon className="example-icon" />
                        <h4>{example.title}</h4>
                      </div>
                      <ul className="example-steps">
                        {example.steps.map((step, stepIdx) => (
                          <li key={stepIdx}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

HelpGuideModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
}

export default HelpGuideModal
