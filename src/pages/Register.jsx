import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useRegisterMutation } from '@/store/api/authApiSlice'
import { setCredentials, savePreferences } from '@/store/slices/authSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import {
  GraduationCap,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Shield,
  BookOpen,
  CheckCircle2
} from 'lucide-react'

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
      // RTK Query mutation sends payload; backend saves to Neon PostgreSQL & sets HTTP-only cookie
      const res = await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        role,
      }).unwrap()

      // Save user to Redux global state & localStorage cache
      dispatch(setCredentials({ user: res.user }))

      // Save preferred role in localStorage preferences
      dispatch(savePreferences({ lastSelectedRole: role }))

      navigate('/dashboard')
    } catch (err) {
      const errMsg = err?.data?.error || err?.message || 'Registration failed. Please try again.'
      setError(errMsg)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/40 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-lg space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#4F46E5] text-white shadow-md shadow-indigo-100">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#111827]">
            Create an Account
          </h1>
          <p className="text-sm text-[#6B7280]">
            Stored in Neon PostgreSQL with RTK Query and HTTP-only cookies
          </p>
        </div>

        {/* Register Card */}
        <Card className="border-[#E5E7EB] shadow-xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold text-[#111827]">
              Sign Up
            </CardTitle>
            <CardDescription className="text-[#6B7280] text-xs">
              Fill in your details below to set up your account
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              
              {/* Error Alert */}
              {error && (
                <div className="flex items-start gap-2 p-3 text-xs rounded-lg bg-red-50 text-red-700 border border-red-200">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Role Selection */}
              <div className="space-y-2">
                <Label>Select Account Role</Label>
                <div className="grid grid-cols-2 gap-3">
                  
                  {/* Student Role Option */}
                  <button
                    type="button"
                    onClick={() => setRole('STUDENT')}
                    className={`flex flex-col items-start p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                      role === 'STUDENT'
                        ? 'border-[#4F46E5] bg-[#EEF2FF] ring-2 ring-[#4F46E5]/20'
                        : 'border-[#E5E7EB] hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-[#4F46E5]">
                        <BookOpen className="w-4 h-4" />
                        STUDENT
                      </span>
                      {role === 'STUDENT' && (
                        <CheckCircle2 className="w-4 h-4 text-[#4F46E5]" />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 leading-snug">
                      Access learning tracks, roadmaps, and career insights
                    </span>
                  </button>

                  {/* Admin Role Option */}
                  <button
                    type="button"
                    onClick={() => setRole('ADMIN')}
                    className={`flex flex-col items-start p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                      role === 'ADMIN'
                        ? 'border-purple-600 bg-purple-50/70 ring-2 ring-purple-600/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-purple-700">
                        <Shield className="w-4 h-4" />
                        ADMIN
                      </span>
                      {role === 'ADMIN' && (
                        <CheckCircle2 className="w-4 h-4 text-purple-600" />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 leading-snug">
                      Manage platform users, contents, and system permissions
                    </span>
                  </button>

                </div>
              </div>

              {/* First Name & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Jane"
                      className="pl-9"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      autoComplete="given-name"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    autoComplete="family-name"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="jane@futureme.edu"
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimum 6 characters"
                    className="pl-9 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Repeat your password"
                    className="pl-9"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>

            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-2">
              <Button
                type="submit"
                className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white font-medium shadow-xs transition-all h-9 text-xs sm:text-sm cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : `Sign Up as ${role}`}
                {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>

              <div className="text-center text-xs text-slate-500">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-slate-900 hover:underline"
                >
                  Sign In instead
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

      </div>
    </div>
  )
}
