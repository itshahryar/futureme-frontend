import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useRegisterMutation } from '@/store/api/authApiSlice'
import { setCredentials, savePreferences } from '@/store/slices/authSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import NetworkBackground from '@/components/ui/NetworkBackground'

export default function Register() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [register, { isLoading }] = useRegisterMutation()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('STUDENT') // STUDENT or ADMIN
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!firstName.trim() || !email.trim() || !password) {
      setError('Please fill in first name, email, and password.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      const res = await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        role,
      }).unwrap()

      dispatch(setCredentials({ user: res.user }))
      dispatch(savePreferences({ lastSelectedRole: role }))
      navigate('/dashboard')
    } catch (err) {
      const errMsg = err?.data?.error || err?.message || 'Registration failed. Please try again.'
      setError(errMsg)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 py-8 overflow-hidden">
      <NetworkBackground />
      <div className="relative z-10 w-full max-w-sm space-y-6">
        
        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
            Sign Up
          </h1>
          <p className="text-xs text-[#6B7280]">
            Create your account to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Error Alert */}
          {error && (
            <div className="flex items-start gap-2 p-3 text-xs rounded-lg bg-red-50 text-red-700 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Role Selection */}
          <div className="space-y-1">
            <Label className="field-label">Account Role</Label>
            <div className="flex items-center gap-4 pt-0.5">
              <label className="flex items-center gap-1.5 text-xs text-[#111827] cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="STUDENT"
                  checked={role === 'STUDENT'}
                  onChange={() => setRole('STUDENT')}
                  className="text-[#4F46E5] focus:ring-[#4F46E5]"
                />
                <span>Student</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs text-[#111827] cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="ADMIN"
                  checked={role === 'ADMIN'}
                  onChange={() => setRole('ADMIN')}
                  className="text-[#4F46E5] focus:ring-[#4F46E5]"
                />
                <span>Admin</span>
              </label>
            </div>
          </div>

          {/* First Name & Last Name */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="firstName" className="field-label">
                First Name <span className="text-[#DC2626]">*</span>
              </Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Jane"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
                className="h-9 text-xs bg-white text-[#111827] border-[#E5E7EB] focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lastName" className="field-label">
                Last Name
              </Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
                className="h-9 text-xs bg-white text-[#111827] border-[#E5E7EB] focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <Label htmlFor="email" className="field-label">
              Email Address <span className="text-[#DC2626]">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="jane@futureme.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="h-9 text-xs bg-white text-[#111827] border-[#E5E7EB] focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <Label htmlFor="password" className="field-label">
              Password <span className="text-[#DC2626]">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="h-9 text-xs bg-white text-[#111827] border-[#E5E7EB] focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] pr-9"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2.5 text-[#6B7280] hover:text-[#111827] cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <Label htmlFor="confirmPassword" className="field-label">
              Confirm Password <span className="text-[#DC2626]">*</span>
            </Label>
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className="h-9 text-xs bg-white text-[#111827] border-[#E5E7EB] focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
              required
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white font-medium h-9 text-xs cursor-pointer transition-colors"
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </Button>

          {/* Switch to Login */}
          <div className="text-center text-xs text-[#6B7280] pt-1">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-[#111827] hover:underline"
            >
              Sign In
            </Link>
          </div>

        </form>

      </div>
    </div>
  )
}
