import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { FaUser, FaEnvelope, FaIdCard, FaEdit, FaKey } from 'react-icons/fa'
import { toast } from 'react-toastify'
import Sidebar from '../components/Sidebar'
import { fetchUserDetails } from '../Features/api'
import {
  ProfileHeaderSkeleton,
  ProfileInfoSkeleton,
  SecuritySkeleton
} from '../components/SkeletonLoaders'
import './ProfilePage.css'

const ProfilePage = () => {
  const { token } = useSelector((state) => state.auth)
  const [isEditing, setIsEditing] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userDetails, setUserDetails] = useState(null)
  const [formData, setFormData] = useState({})

  useEffect(() => {
    const loadUserDetails = async () => {
      try {
        const data = await fetchUserDetails(token)
        setUserDetails(data)
        setFormData(data)
      } catch (error) {
        toast.error(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserDetails()
  }, [token])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const userInfo = [
    { label: 'First Name', value: userDetails?.first_name, field: 'first_name', icon: FaUser },
    { label: 'Last Name', value: userDetails?.last_name, field: 'last_name', icon: FaUser },
    { label: 'Email', value: userDetails?.email, field: 'email', icon: FaEnvelope }
  ]

  return (
    <div className="app-wrapper">
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      <div className={`profile-wrapper ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="profile-container">
          {isLoading ? (
            <>
              <ProfileHeaderSkeleton />
              <div className="profile-content">
                <ProfileInfoSkeleton />
                <SecuritySkeleton />
              </div>
            </>
          ) : (
            <>
              <div className="profile-header">
                <div className="profile-avatar">
                  <FaUser />
                </div>
                <h1>{`${userDetails?.first_name} ${userDetails?.last_name}`}</h1>
                <span className="profile-role">Librarian</span>
              </div>
              <div className="profile-content">
                <div className="profile-section">
                  <div className="section-header">
                    <h2>Personal Information</h2>
                    <button className="edit-button" onClick={() => setIsEditing(!isEditing)}>
                      <FaEdit /> {isEditing ? 'Save' : 'Edit'}
                    </button>
                  </div>

                  <div className="info-grid">
                    {userInfo.map((info, index) => (
                      <div key={index} className="info-item">
                        <div className="info-icon">
                          <info.icon />
                        </div>
                        <div className="info-content">
                          <label>{info.label}</label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={formData[info.field] || ''}
                              onChange={(e) => handleInputChange(info.field, e.target.value)}
                              className="edit-input"
                            />
                          ) : (
                            <span>{info.value}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="profile-section">
                  <div className="section-header">
                    <h2>Security</h2>
                  </div>
                  <div className="security-options">
                    <button className="security-button">
                      <FaKey />
                      Change Password
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
