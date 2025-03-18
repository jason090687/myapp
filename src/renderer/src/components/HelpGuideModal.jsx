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
  FaChevronLeft,
  FaGraduationCap,
  FaUsers
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
            'Upload MARC record if available',
            'Set initial book status and availability'
          ]
        },
        {
          icon: FaEdit,
          title: 'Managing Books',
          steps: [
            'Search books using global search or filters',
            'View detailed book information',
            'Update book status and details',
            'Track book history and availability'
          ]
        }
      ]
    },
    {
      icon: FaBookmark,
      title: 'Borrowing System',
      description: 'Manage book borrowing, returns, and track due dates.',
      examples: [
        {
          icon: FaExchangeAlt,
          title: 'Borrow Process',
          steps: [
            'Select student from database',
            'Scan or select books to borrow',
            'Set due dates and terms'
          ]
        },
        {
          icon: FaCalendarAlt,
          title: 'Returns & Renewals',
          steps: [
            'Process book returns',
            'Handle late returns and penalties',
            'Manage book renewals',
            'Update borrowing history'
          ]
        }
      ]
    },
    {
      icon: FaGraduationCap,
      title: 'Student Management',
      description: 'Track and manage student records and borrowing history.',
      examples: [
        {
          icon: FaUsers,
          title: 'Student Records',
          steps: [
            'Maintain student profiles',
            'Track borrowing history',
            'Monitor overdue books',
            'Handle penalties and payments'
          ]
        },
        {
          icon: FaHistory,
          title: 'Reports & Statistics',
          steps: [
            'Generate student activity reports',
            'View borrowing statistics',
            'Track frequent borrowers',
            'Monitor student status'
          ]
        }
      ]
    },
    {
      icon: FaUserCog,
      title: 'Staff Section',
      description: 'Coming soon: Staff management and access control features.',
      examples: [
        {
          icon: FaUsers,
          title: 'Staff Management',
          steps: [
            'Coming Soon: Staff profile management',
            'Coming Soon: Role assignments',
            'Coming Soon: Activity monitoring',
            'Coming Soon: Access permissions'
          ]
        }
      ]
    },
    {
      icon: FaCog,
      title: 'System Features',
      description: 'Additional features and settings for library management.',
      examples: [
        {
          icon: FaSearch,
          title: 'Global Search',
          steps: [
            'Search across all library records',
            'Filter results by category',
            'Quick access to records',
            'Real-time search suggestions'
          ]
        },
        {
          icon: FaUserCog,
          title: 'Session Management',
          steps: [
            'Auto-logout after 15 minutes inactivity',
            'Secure authentication',
            'Profile settings and preferences',
            'Activity tracking and history'
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
