import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { selectCurrentUser, logoutUser, setCredentials } from '@/store/slices/authSlice'
import { useLogoutMutation, useGetMeQuery } from '@/store/api/authApiSlice'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  GraduationCap,
  LogOut,
  User,
  Mail,
  Shield,
  Key,
  Calendar,
  CheckCircle,
  Database,
  BookOpen,
  Settings,
  Sparkles,
  Cookie,
  Server
} from 'lucide-react'
import { useEffect } from 'react'

export default function Dashboard() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)

  // Validate session via HTTP-only cookie using RTK Query
  const { data: meData, error: meError } = useGetMeQuery()
  const [logoutApi, { isLoading: isLoggingOut }] = useLogoutMutation()

  useEffect(() => {
    if (meData?.user) {
      dispatch(setCredentials({ user: meData.user }))
    }
  }, [meData, dispatch])

  const user = meData?.user || currentUser

  if (!user && !meData) {
    navigate('/login')
    return null
  }

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap()
    } catch {
      // Clear client state even if backend is unreachable
    } finally {
      dispatch(logoutUser())
      navigate('/login')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Just now'
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      
      {/* Top Navbar */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-900 text-white">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">FutureMe</span>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant={user?.role === 'ADMIN' ? 'admin' : 'student'}>
              {user?.role}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="gap-2 text-slate-700 hover:text-red-600 hover:border-red-200 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              {isLoggingOut ? 'Signing out...' : 'Sign Out'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white shadow-lg">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/10 text-white text-xs font-medium mb-1">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              Redux Toolkit + RTK Query Active
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-slate-300 text-sm">
              Authenticated via <span className="font-semibold text-emerald-400">HTTP-Only JWT Cookie</span> and stored in Neon PostgreSQL.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {user?.role === 'ADMIN' ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs">
                <Settings className="w-4 h-4" />
                <span>Admin Privileges Active</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs">
                <BookOpen className="w-4 h-4" />
                <span>Student Learning Workspace</span>
              </div>
            )}
          </div>
        </div>

        {/* Stack Status Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center gap-2.5">
            <Server className="w-4 h-4 text-indigo-600 shrink-0" />
            <div>
              <div className="font-semibold text-slate-800">PostgreSQL</div>
              <div className="text-[11px] text-slate-500">Neon Database</div>
            </div>
          </div>
          <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center gap-2.5">
            <Cookie className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <div className="font-semibold text-slate-800">HTTP-Only Cookie</div>
              <div className="text-[11px] text-slate-500">JWT Authentication</div>
            </div>
          </div>
          <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center gap-2.5">
            <Database className="w-4 h-4 text-purple-600 shrink-0" />
            <div>
              <div className="font-semibold text-slate-800">Redux Toolkit</div>
              <div className="text-[11px] text-slate-500">Global Store</div>
            </div>
          </div>
          <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <div className="font-semibold text-slate-800">RTK Query</div>
              <div className="text-[11px] text-slate-500">API Calls & Caching</div>
            </div>
          </div>
        </div>

        {/* User Schema & Model Breakdown */}
        <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
          <CardHeader className="bg-slate-50/60 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Database className="w-5 h-5 text-indigo-600" />
                  User Record in Neon PostgreSQL
                </CardTitle>
                <CardDescription className="text-xs">
                  Active database record attributes matching the project user schema
                </CardDescription>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>isActive: {user?.isActive ? 'true' : 'false'}</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Field: ID */}
              <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" />
                  id
                </div>
                <div className="font-mono text-xs text-slate-800 break-all font-medium">
                  {user?.id}
                </div>
              </div>

              {/* Field: Name */}
              <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  name
                </div>
                <div className="text-sm font-semibold text-slate-900">
                  {user?.name}
                </div>
              </div>

              {/* Field: Email */}
              <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  email
                </div>
                <div className="text-sm text-slate-800">
                  {user?.email}
                </div>
              </div>

              {/* Field: Role */}
              <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  role
                </div>
                <div>
                  <Badge variant={user?.role === 'ADMIN' ? 'admin' : 'student'}>
                    {user?.role}
                  </Badge>
                </div>
              </div>

              {/* Field: passwordHash */}
              <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" />
                  passwordHash
                </div>
                <div className="font-mono text-xs text-slate-500">
                  [Stored securely in Neon with bcrypt]
                </div>
              </div>

              {/* Field: isActive */}
              <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  isActive
                </div>
                <div className="text-sm font-semibold text-emerald-600">
                  {String(user?.isActive)} (Active)
                </div>
              </div>

              {/* Field: createdAt */}
              <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  createdAt
                </div>
                <div className="text-xs text-slate-700 font-medium">
                  {formatDate(user?.createdAt)}
                </div>
              </div>

              {/* Field: updatedAt */}
              <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  updatedAt
                </div>
                <div className="text-xs text-slate-700 font-medium">
                  {formatDate(user?.updatedAt)}
                </div>
              </div>

            </div>
          </CardContent>
          <CardFooter className="bg-slate-50/40 border-t border-slate-100 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
            <span>Synchronized via RTK Query cache with Neon PostgreSQL</span>
            <span className="font-mono">Ready for production</span>
          </CardFooter>
        </Card>

      </main>
    </div>
  )
}
