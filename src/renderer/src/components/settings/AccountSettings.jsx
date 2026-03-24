import { useState } from 'react'
import { FaSave, FaKey, FaUser } from 'react-icons/fa'
import { useUserDetails } from '../../hooks'
import { useChangePassword, useUpdateUserProfile } from '../../hooks/useAuth'
import { Button } from '../ui/button'

function AccountSettings() {
  const { data: profileData } = useUserDetails()
  const updateUserProfile = useUpdateUserProfile()
  const changePassword = useChangePassword()

  const [profileForm, setProfileForm] = useState({
    email: profileData?.email ?? '',
    first_name: profileData?.first_name ?? '',
    last_name: profileData?.last_name ?? ''
  })

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    re_new_password: ''
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Update profileForm if profileData changes
  if (profileData && profileData.email !== profileForm.email) {
    setProfileForm({
      email: profileData.email,
      first_name: profileData.first_name,
      last_name: profileData.last_name
    })
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      await updateUserProfile.mutateAsync(profileForm)
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

    if (passwordData.new_password !== passwordData.re_new_password) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }

    if (passwordData.new_password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' })
      return
    }

    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      await changePassword.mutateAsync({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
        re_new_password: passwordData.re_new_password
      })
      setMessage({ type: 'success', text: 'Password changed successfully!' })
      setPasswordData({ current_password: '', new_password: '', re_new_password: '' })
    } catch (error) {
      const errors = error.response?.data
      const text =
        errors &&
        Object.entries(errors)
          .map(([key, val]) => `${key}: ${val.join(', ')}`)
          .join(' | ')
      setMessage({
        type: 'error',
        text: text || error.message || 'Failed to change password'
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
            <label>Email Address</label>
            <input
              type="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                value={profileForm.first_name}
                onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                value={profileForm.last_name}
                onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
              />
            </div>
          </div>

          <Button type="submit" variant="primary" disabled={loading}>
            <FaSave />
            <span>{loading ? 'Saving...' : 'Save Profile'}</span>
          </Button>
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
              value={passwordData.current_password}
              onChange={(e) =>
                setPasswordData({ ...passwordData, current_password: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={passwordData.new_password}
              onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
              required
              minLength={8}
            />
            <small>Must be at least 8 characters</small>
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              value={passwordData.re_new_password}
              onChange={(e) =>
                setPasswordData({ ...passwordData, re_new_password: e.target.value })
              }
              required
            />
          </div>

          <Button type="submit" variant="primary" disabled={loading}>
            <FaKey />
            <span>{loading ? 'Changing...' : 'Change Password'}</span>
          </Button>
        </form>
      </div>
    </div>
  )
}

export default AccountSettings