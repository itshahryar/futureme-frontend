import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useLoginMutation } from '@/store/api/authApiSlice'
import { setCredentials, savePreferences, selectPreferences } from '@/store/slices/authSlice'
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
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Check
} from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const preferences = useSelector(selectPreferences)

  const [login, { isLoading }] = useLoginMutation()

  const [email, setEmail] = useState(preferences.rememberEmail || '')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(!!preferences.rememberEmail)
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
      // RTK Query mutation sends credentials; backend sets HTTP-only cookie
      const res = await login({ email, password }).unwrap()

      // Save user to Redux global state & localStorage cache
      dispatch(setCredentials({ user: res.user }))

      // Save preferences in localStorage via Redux action
      dispatch(
        savePreferences({
          rememberEmail: rememberMe ? email : '',
        })
      )

      navigate('/dashboard')
    } catch (err) {
      const errMsg = err?.data?.error || err?.message || 'Login failed. Please verify your credentials.'
      setError(errMsg)
    }
  }

  const fillQuickCredentials = (role) => {
    setError('')
    if (role === 'STUDENT') {
      setEmail('neon.student@futureme.edu')
      setPassword('mypassword123')
    } else {
      setEmail('admin@futureme.edu')
      setPassword('admin123')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/40 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 text-white shadow-md">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Welcome back
          </h1>
          <p className="text-sm text-slate-500">
            Sign in via RTK Query & secure HTTP-only cookies
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-slate-200 shadow-xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold text-slate-900">
              Sign In
            </CardTitle>
            <CardDescription className="text-slate-500 text-xs">
              Enter your credentials to access your dashboard
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

              {/* Email Field */}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@futureme.edu"
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#forgot"
                    onClick={(e) => { e.preventDefault(); setError('Password reset link has been simulated.'); }}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-9 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
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

              {/* Remember Me Checkbox */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-950 cursor-pointer"
                />
                <label htmlFor="remember" className="text-xs text-slate-600 select-none cursor-pointer">
                  Remember my email (localStorage)
                </label>
              </div>

              {/* Quick Fill Demo Roles */}
              <div className="pt-2 border-t border-slate-100">
                <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2">
                  Quick Neon DB Credentials
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => fillQuickCredentials('STUDENT')}
                    className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 transition-colors cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Neon Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillQuickCredentials('ADMIN')}
                    className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-100 transition-colors cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Admin User</span>
                  </button>
                </div>
              </div>

            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-2">
              <Button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-md transition-all h-10"
                disabled={isLoading}
              >
                {isLoading ? 'Authenticating...' : 'Sign In'}
                {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>

              <div className="text-center text-xs text-slate-500">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-slate-900 hover:underline"
                >
                  Create an account
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

      </div>
    </div>
  )
}
