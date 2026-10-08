import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectCurrentUser, setCredentials } from '@/store/slices/authSlice'
import { useUpdateProfileMutation, useChangePasswordMutation } from '@/store/api/authApiSlice'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { User, CheckCircle2, AlertCircle, Lock, KeyRound, Eye, EyeOff, Settings } from 'lucide-react'

export default function DashboardSettings() {
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation()
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation()

  // Parse full name into first and last name
  const parseNames = (fullName = '') => {
    const parts = (fullName || '').trim().split(' ')
    const firstName = parts[0] || ''
    const lastName = parts.slice(1).join(' ') || ''
    return { firstName, lastName }
  }

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [feedback, setFeedback] = useState({ type: '', text: '' })

  // Change password states
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordFeedback, setPasswordFeedback] = useState({ type: '', text: '' })

  // Synchronize local form state with user data
  useEffect(() => {
    if (user) {
      if (user.firstName !== undefined || user.lastName !== undefined) {
        setFirstName(user.firstName || '')
        setLastName(user.lastName || '')
      } else if (user.name) {
        const { firstName: fName, lastName: lName } = parseNames(user.name)
        setFirstName(fName)
        setLastName(lName)
      }
    }
  }, [user])

  const handleSave = async (e) => {
    e.preventDefault()
    setFeedback({ type: '', text: '' })

    if (!firstName.trim()) {
      setFeedback({ type: 'error', text: 'First name is required.' })
      return
    }

    try {
      const res = await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      }).unwrap()

      if (res?.user) {
        dispatch(setCredentials({ user: res.user }))
      }

      setFeedback({ type: 'success', text: 'Profile updated successfully!' })
      setTimeout(() => {
        setFeedback((prev) => (prev.type === 'success' ? { type: '', text: '' } : prev))
      }, 3500)
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err?.data?.error || 'Failed to update profile. Please try again.',
      })
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordFeedback({ type: '', text: '' })

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordFeedback({ type: 'error', text: 'Please fill in all password fields.' })
      return
    }

    if (newPassword.length < 6) {
      setPasswordFeedback({ type: 'error', text: 'New password must be at least 6 characters.' })
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ type: 'error', text: 'New passwords do not match.' })
      return
    }

    try {
      const res = await changePassword({ currentPassword, newPassword }).unwrap()
      setPasswordFeedback({ type: 'success', text: res?.message || 'Password changed successfully!' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => {
        setPasswordFeedback((prev) => (prev.type === 'success' ? { type: '', text: '' } : prev))
      }, 3500)
    } catch (err) {
      setPasswordFeedback({
        type: 'error',
        text: err?.data?.error || 'Failed to change password. Please check your current password.',
      })
    }
  }

  return (
    <div className="space-y-5">
      
      {/* Page Header */}
      <div>
        <h1 className="page-title flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#4F46E5]" />
          Account Settings
        </h1>
        <p className="page-subtitle mt-1">
          Manage your personal details and account security.
        </p>
      </div>

      {/* Profile Overview Card */}
      <Card className="rounded-xl border-[#E5E7EB] shadow-xs bg-white">
        <CardHeader className="p-4 sm:p-5 border-b border-[#E5E7EB]">
          <div>
            <CardTitle className="section-title flex items-center gap-2">
              <User className="w-4 h-4 text-[#111827]" />
              Profile Information
            </CardTitle>
            <CardDescription className="section-desc mt-0.5">
              Update your personal details.
            </CardDescription>
          </div>
        </CardHeader>
        
        <form onSubmit={handleSave}>
          <CardContent className="p-4 sm:p-5 space-y-4">
            
            {/* Feedback Alert */}
            {feedback.text && (
              <div
                className={`flex items-center gap-2 p-2.5 rounded-lg text-xs border ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{feedback.text}</span>
              </div>
            )}

            {/* Profile Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* First Name (Editable) */}
              <div className="space-y-1">
                <Label htmlFor="firstName" className="field-label">
                  First Name <span className="text-[#DC2626]">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="h-8 text-xs bg-white text-[#111827] border-[#E5E7EB] focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
                  required
                />
              </div>

              {/* Last Name (Editable) */}
              <div className="space-y-1">
                <Label htmlFor="lastName" className="field-label">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="h-8 text-xs bg-white text-[#111827] border-[#E5E7EB] focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
                />
              </div>

              {/* Email Address (Read-Only) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email" className="field-label">
                    Email Address
                  </Label>
                  <span className="inline-flex items-center gap-1 text-[10px] text-[#6B7280] font-normal">
                    <Lock className="w-2.5 h-2.5" /> Read-only
                  </span>
                </div>
                <Input
                  id="email"
                  value={user?.email || ''}
                  readOnly
                  disabled
                  className="h-8 text-xs bg-[#F8FAFC] text-[#6B7280] cursor-not-allowed border-[#E5E7EB]"
                />
              </div>

              {/* Role (Read-Only) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="role" className="field-label">
                    Role
                  </Label>
                  <span className="inline-flex items-center gap-1 text-[10px] text-[#6B7280] font-normal">
                    <Lock className="w-2.5 h-2.5" /> Read-only
                  </span>
                </div>
                <Input
                  id="role"
                  value={user?.role || ''}
                  readOnly
                  disabled
                  className="h-8 text-xs bg-[#F8FAFC] text-[#6B7280] cursor-not-allowed border-[#E5E7EB]"
                />
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-end">
              <Button
                type="submit"
                size="sm"
                disabled={isUpdating}
                className="h-8 text-xs px-4 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-medium cursor-pointer shrink-0 transition-colors"
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>

          </CardContent>
        </form>
      </Card>

      {/* Change Password Card */}
      <Card className="rounded-xl border-[#E5E7EB] shadow-xs bg-white">
        <CardHeader className="p-4 sm:p-5 border-b border-[#E5E7EB]">
          <div>
            <CardTitle className="section-title flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#111827]" />
              Change Password
            </CardTitle>
            <CardDescription className="section-desc mt-0.5">
              Update your password to keep your account secure.
            </CardDescription>
          </div>
        </CardHeader>
        
        <form onSubmit={handlePasswordSubmit}>
          <CardContent className="p-4 sm:p-5 space-y-4">
            
            {/* Feedback Alert */}
            {passwordFeedback.text && (
              <div
                className={`flex items-center gap-2 p-2.5 rounded-lg text-xs border ${
                  passwordFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                {passwordFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{passwordFeedback.text}</span>
              </div>
            )}

            {/* Password Fields Grid */}
            <div className="space-y-3.5">
              
              {/* Current Password */}
              <div className="space-y-1">
                <Label htmlFor="currentPassword" className="field-label">
                  Current Password <span className="text-[#DC2626]">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="h-8 text-xs bg-white text-[#111827] border-[#E5E7EB] focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] pr-8"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-2.5 top-2 text-[#6B7280] hover:text-[#111827] cursor-pointer"
                    aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                  >
                    {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* New Password & Confirm New Password Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <Label htmlFor="newPassword" className="field-label">
                    New Password <span className="text-[#DC2626]">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="h-8 text-xs bg-white text-[#111827] border-[#E5E7EB] focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] pr-8"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2.5 top-2 text-[#6B7280] hover:text-[#111827] cursor-pointer"
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="confirmPassword" className="field-label">
                    Confirm New Password <span className="text-[#DC2626]">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="h-8 text-xs bg-white text-[#111827] border-[#E5E7EB] focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] pr-8"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-2 text-[#6B7280] hover:text-[#111827] cursor-pointer"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-end">
              <Button
                type="submit"
                size="sm"
                disabled={isChangingPassword}
                className="h-8 text-xs px-4 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-medium cursor-pointer shrink-0 transition-colors"
              >
                {isChangingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </div>

          </CardContent>
        </form>
      </Card>

    </div>
  )
}
