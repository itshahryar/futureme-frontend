import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useLoginMutation } from '@/store/api/authApiSlice'
import { setCredentials } from '@/store/slices/authSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import NetworkBackground from '@/components/ui/NetworkBackground'

export default function Login() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [login, { isLoading }] = useLoginMutation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in both email and password.')
      return
    }

    try {
      const res = await login({ email, password }).unwrap()
      dispatch(setCredentials({ user: res.user }))
      navigate('/dashboard')
    } catch (err) {
      const errMsg = err?.data?.error || err?.message || 'Login failed. Please verify your credentials.'
      setError(errMsg)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 overflow-hidden">
      <NetworkBackground />
      <div className="relative z-10 w-full max-w-sm space-y-6">
        
        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
            Sign In
          </h1>
          <p className="text-xs text-[#6B7280]">
            Enter your credentials to access your dashboard
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

          {/* Email Field */}
          <div className="space-y-1">
            <Label htmlFor="email" className="field-label">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@futureme.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="h-9 text-xs bg-white text-[#111827] border-[#E5E7EB] focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
              required
            />
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="field-label">Password</Label>
              <a
                href="#forgot"
                onClick={(e) => { e.preventDefault(); setError('Password reset instructions sent to your email.'); }}
                className="text-xs text-[#4F46E5] hover:text-[#4338CA] font-medium"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
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


          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white font-medium h-9 text-xs cursor-pointer transition-colors"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>

          {/* Switch to Register */}
          <div className="text-center text-xs text-[#6B7280] pt-1">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-[#111827] hover:underline"
            >
              Sign Up
            </Link>
          </div>

        </form>

      </div>
    </div>
  )
}
