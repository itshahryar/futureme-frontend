import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectCurrentUser, setCredentials } from '@/store/slices/authSlice'
import { useUpdateProfileMutation } from '@/store/api/authApiSlice'
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
import { User, CheckCircle2, AlertCircle, Lock } from 'lucide-react'

export default function DashboardSettings() {
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation()

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

  return (
    <div className="space-y-4">
      
      {/* Settings Header (Consistent standards) */}
      <div className="space-y-0.5">
        <h1 className="page-title">
          Account Settings
        </h1>
        <p className="page-subtitle">
          Manage your account profile details.
        </p>
      </div>

      {/* Profile Overview Card (Compact sizing) */}
      <Card className="border-[#E5E7EB] shadow-xs bg-white">
        <CardHeader className="p-3.5 sm:p-4 pb-2.5 border-b border-[#E5E7EB]">
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
          <CardContent className="p-3.5 sm:p-4 space-y-4">
            
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

    </div>
  )
}
