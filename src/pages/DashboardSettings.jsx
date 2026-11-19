import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectCurrentUser, setCredentials } from '@/store/slices/authSlice'
import { useUpdateProfileMutation, useChangePasswordMutation } from '@/store/api/authApiSlice'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card3DTilt } from '@/components/illustrations3d'
import { User, CheckCircle2, AlertCircle, Lock, KeyRound, Eye, EyeOff, Settings, ShieldCheck } from 'lucide-react'

export default function DashboardSettings() {
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation()
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation()

  const parseNames = (fullName = '') => {
    const parts = (fullName || '').trim().split(' ')
    const firstName = parts[0] || ''
    const lastName = parts.slice(1).join(' ') || ''
    return { firstName, lastName }
  }

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [feedback, setFeedback] = useState({ type: '', text: '' })

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordFeedback, setPasswordFeedback] = useState({ type: '', text: '' })

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
    <div className="space-y-5 max-w-5xl pb-16">
      {/* Page Header */}
      <div>
        <h1 className="page-title flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600" />
          Account Settings
        </h1>
        <p className="page-subtitle mt-1">
          Manage your personal identity, contact credentials, and account security.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 max-w-3xl">
        {/* Profile Information Bento Card */}
        <Card3DTilt maxTilt={2}>
          <div className="bento-card p-4 sm:p-4.5 space-y-3.5 rounded-xl">
            <div className="flex items-center justify-between border-b border-slate-150 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-slate-900">Profile Information</h2>
                  <p className="text-[11px] text-slate-500">Update your name and primary details.</p>
                </div>
              </div>
              <span className="badge-3d px-2 py-0.5 text-[9.5px] bg-indigo-50 text-indigo-700 border border-indigo-200">
                {user?.role || 'User'}
              </span>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              {feedback.text && (
                <div
                  className={`flex items-center gap-2 p-2.5 rounded-lg text-xs border ${
                    feedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{feedback.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="firstName" className="text-[11px] font-semibold text-slate-700">
                    First Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="h-8.5 text-xs bg-slate-50 border-slate-200 focus:bg-white rounded-lg"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="lastName" className="text-[11px] font-semibold text-slate-700">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="h-8.5 text-xs bg-slate-50 border-slate-200 focus:bg-white rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email" className="text-[11px] font-semibold text-slate-700">
                      Email Address
                    </Label>
                    <span className="inline-flex items-center gap-1 text-[9.5px] text-slate-400">
                      <Lock className="w-2.5 h-2.5" /> Read-only
                    </span>
                  </div>
                  <Input
                    id="email"
                    value={user?.email || ''}
                    readOnly
                    disabled
                    className="h-8.5 text-xs bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200 rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="role" className="text-[11px] font-semibold text-slate-700">
                      System Role
                    </Label>
                    <span className="inline-flex items-center gap-1 text-[9.5px] text-slate-400">
                      <Lock className="w-2.5 h-2.5" /> Read-only
                    </span>
                  </div>
                  <Input
                    id="role"
                    value={user?.role || ''}
                    readOnly
                    disabled
                    className="h-8.5 text-xs bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  disabled={isUpdating}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg h-7.5 px-3.5 cursor-pointer shadow-xs"
                >
                  {isUpdating ? 'Saving Changes...' : 'Save Profile Details'}
                </Button>
              </div>
            </form>
          </div>
        </Card3DTilt>

        {/* Account Password & Security Bento Card */}
        <Card3DTilt maxTilt={2}>
          <div className="bento-card p-4 sm:p-4.5 space-y-3.5 rounded-xl">
            <div className="flex items-center justify-between border-b border-slate-150 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-slate-900">Account Security</h2>
                  <p className="text-[11px] text-slate-500">Update your access password and review security.</p>
                </div>
              </div>
              <span className="badge-3d px-2 py-0.5 text-[9.5px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3 h-3 mr-1" /> HTTP-Only Cookies
              </span>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              {passwordFeedback.text && (
                <div
                  className={`flex items-center gap-2 p-2.5 rounded-lg text-xs border ${
                    passwordFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {passwordFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{passwordFeedback.text}</span>
                </div>
              )}

              <div className="space-y-2.5">
                <div className="space-y-1">
                  <Label htmlFor="currentPassword" className="text-[11px] font-semibold text-slate-700">
                    Current Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-8.5 text-xs bg-slate-50 border-slate-200 focus:bg-white rounded-lg pr-9"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="newPassword" className="text-[11px] font-semibold text-slate-700">
                      New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-8.5 text-xs bg-slate-50 border-slate-200 focus:bg-white rounded-lg pr-9"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="confirmPassword" className="text-[11px] font-semibold text-slate-700">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-8.5 text-xs bg-slate-50 border-slate-200 focus:bg-white rounded-lg pr-9"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  disabled={isChangingPassword}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg h-7.5 px-3.5 cursor-pointer shadow-xs"
                >
                  {isChangingPassword ? 'Updating Password...' : 'Change Password'}
                </Button>
              </div>
            </form>
          </div>
        </Card3DTilt>
      </div>
    </div>
  )
}
