import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { FaUser, FaEnvelope, FaIdCard, FaEdit, FaKey } from 'react-icons/fa'
import { fetchUserDetails, updateUserDetails } from '../services/userService'
import { toast } from 'react-toastify'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import './ProfilePage.css'
import { fetchUsers } from '../Features/api'

const ProfilePage = () => {
  const { token, user: authUser } = useSelector((state) => state.auth)
  const [isEditing, setIsEditing] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userDetails, setUserDetails] = useState(null)
  const [formData, setFormData] = useState({})

  // Fetch user details
  useEffect(() => {
    const loadUserDetails = async () => {
      try {
        const data = await fetchUsers(token)
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

  const handleSave = async () => {
    try {
      const updatedUser = await updateUserDetails(token, formData)
      setUserDetails(updatedUser)
      setIsEditing(false)
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error(error.message)
    }
  }

  // Update userInfo to use fetched details
  const userInfo = [
    { label: 'First Name', value: userDetails?.first_name, field: 'first_name', icon: FaUser },
    { label: 'Last Name', value: userDetails?.last_name, field: 'last_name', icon: FaUser },
    { label: 'Email', value: userDetails?.email, field: 'email', icon: FaEnvelope },
    { label: 'ID Number', value: userDetails?.id_number, field: 'id_number', icon: FaIdCard }
  ]

  if (isLoading) {
    return <div className="profile-loading">Loading...</div>
  }

  return (
    <div className="app-wrapper">
      <Sidebar isCollapsed={isCollapsed} />
      <div className={`profile-wrapper ${isCollapsed ? 'collapsed' : ''}`}>
        <Navbar
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
          userDetails={userDetails}
        />
        <div className="profile-container">
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
                <button
                  className="edit-button"
                  onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                >
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
                {/* Add more security options as needed */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
