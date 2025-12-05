import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { FaUser, FaEnvelope, FaIdCard, FaEdit, FaKey, FaCamera } from 'react-icons/fa'
import { toast } from 'react-toastify'
import Sidebar from '../components/Sidebar'
import { fetchUserDetails, updateUserProfile } from '../Features/api'
import { storeUser } from '../Features/authSlice'
import {
  ProfileHeaderSkeleton,
  ProfileInfoSkeleton,
  SecuritySkeleton
} from '../components/SkeletonLoaders'
import './ProfilePage.css'

const ProfilePage = () => {
  const { token } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const [isEditing, setIsEditing] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [userDetails, setUserDetails] = useState(null)
  const [formData, setFormData] = useState({})
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)

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

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('first_name', formData.first_name || '')
      formDataToSend.append('last_name', formData.last_name || '')
      formDataToSend.append('email', formData.email || '')

      if (avatarFile) {
        formDataToSend.append('avatar', avatarFile)
      }

      const updatedUser = await updateUserProfile(token, formDataToSend)
      setUserDetails(updatedUser)
      dispatch(storeUser(updatedUser))
      setAvatarFile(null)
      setAvatarPreview(null)
      setIsEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditToggle = () => {
    if (isEditing) {
      handleSave()
    } else {
      setIsEditing(true)
    }
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
                  {avatarPreview || userDetails?.profile_image ? (
                    <img
                      src={avatarPreview || userDetails.profile_image}
                      alt="Profile"
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <FaUser />
                  )}
                  {isEditing && (
                    <div className="avatar-upload">
                      <label htmlFor="avatar-input" className="avatar-upload-label">
                        <FaCamera />
                      </label>
                      <input
                        id="avatar-input"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        style={{ display: 'none' }}
                      />
                    </div>
                  )}
                </div>
                <h1>{`${userDetails?.first_name} ${userDetails?.last_name}`}</h1>
                <span className="profile-role">Librarian</span>
              </div>
              <div className="profile-content">
                <div className="profile-section">
                  <div className="section-header">
                    <h2>Personal Information</h2>
                    <button className="edit-button" onClick={handleEditToggle} disabled={isSaving}>
                      <FaEdit /> {isSaving ? 'Saving...' : isEditing ? 'Save' : 'Edit'}
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

                {/* <div className="profile-section">
                  <div className="section-header">
                    <h2>Security</h2>
                  </div>
                  <div className="security-options">
                    <button className="security-button">
                      <FaKey />
                      Change Password
                    </button>
                  </div>
                </div> */}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
