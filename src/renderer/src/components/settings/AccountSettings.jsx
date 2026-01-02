import { useState } from 'react'
import { useSelector } from 'react-redux'
import { FaSave, FaKey, FaUser } from 'react-icons/fa'
import { updateUserProfile, changePassword } from '../../Features/api'

function AccountSettings() {
  const { user, token } = useSelector((state) => state.auth)
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    firstName: user?.first_name || '',
    lastName: user?.last_name || ''
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      await updateUserProfile(token, profileData)
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update profile'
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' })
      return
    }

    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      await changePassword(token, {
        old_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      })
      setMessage({ type: 'success', text: 'Password changed successfully!' })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to change password'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="settings-section">
      <h2>Account Settings</h2>
      <p className="settings-description">Manage your account information and security</p>

      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      {/* Profile Information */}
      <div className="settings-card">
        <h3>
          <FaUser /> Profile Information
        </h3>
        <form onSubmit={handleProfileUpdate} className="settings-form">
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={profileData.username}
              onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
              disabled
              className="disabled-input"
            />
            <small>Username cannot be changed</small>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                value={profileData.firstName}
                onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                value={profileData.lastName}
                onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            <FaSave />
            <span>{loading ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="settings-card">
        <h3>
          <FaKey /> Change Password
        </h3>
        <form onSubmit={handlePasswordChange} className="settings-form">
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, currentPassword: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              required
              minLength={8}
            />
            <small>Must be at least 8 characters</small>
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, confirmPassword: e.target.value })
              }
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            <FaKey />
            <span>{loading ? 'Changing...' : 'Change Password'}</span>
          </button>
        </form>
      </div>
    </div>
  )
}

export default AccountSettings
