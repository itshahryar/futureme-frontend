import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { selectCurrentUser, logoutUser, setCredentials } from '@/store/slices/authSlice'
import { useLogoutMutation, useGetMeQuery } from '@/store/api/authApiSlice'
import { useGetStudentProfileQuery } from '@/store/api/onboardingApiSlice'
import { Button } from '@/components/ui/button'
import Loading from '@/components/ui/Loading'
import {
  GraduationCap,
  Home,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
  Sliders,
  Sparkles,
  Target,
  BookOpen,
  Compass,
  Flame,
} from 'lucide-react'
import { MentorBot3D } from '@/components/illustrations3d'

export default function DashboardLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('futureme_sidebar_collapsed') === 'true'
    } catch {
      return false
    }
  })

  // Verify session via HTTP-only cookie
  const { data: meData } = useGetMeQuery()
  const [logoutApi, { isLoading: isLoggingOut }] = useLogoutMutation()

  useEffect(() => {
    if (meData?.user) {
      dispatch(setCredentials({ user: meData.user }))
    }
  }, [meData, dispatch])

  const user = meData?.user || currentUser

  // Prevent student from accessing the dashboard until onboarding is completed
  const isStudent = user?.role === 'STUDENT'
  const { data: profileData, isLoading: loadingProfile } = useGetStudentProfileQuery(undefined, {
    skip: !isStudent,
  })

  useEffect(() => {
    if (isStudent && !loadingProfile) {
      const isOnboarded = profileData?.profile ? profileData.profile.isOnboarded : user?.isOnboarded
      if (isOnboarded === false) {
        navigate('/onboarding', { replace: true })
      }
    }
  }, [isStudent, loadingProfile, profileData, user?.isOnboarded, navigate])

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem('futureme_sidebar_collapsed', String(next))
      } catch {}
      return next
    })
  }

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap()
    } catch {
      // Clear state even if network fails
    } finally {
      dispatch(logoutUser())
      navigate('/login')
    }
  }

  // Only show blocking fullscreen loader if onboarding status is not yet known
  const onboardingKnown = user?.isOnboarded !== undefined || profileData?.profile !== undefined
  if (isStudent && loadingProfile && !onboardingKnown) {
    return (
      <Loading
        variant="fullscreen"
        message="Loading your workspace..."
        description="Initializing your student career portal."
      />
    )
  }

  if (isLoggingOut) {
    return (
      <Loading
        variant="fullscreen"
        message="Signing out..."
        description="Safely ending your session."
      />
    )
  }

  // Navigation items for both STUDENT and ADMIN
  const navItems = [
    {
      name: 'Overview',
      to: '/dashboard',
      icon: Home,
      end: true,
      badge: null,
    },
    ...(user?.role === 'STUDENT'
      ? [
          {
            name: 'Career Profile',
            to: '/dashboard/profile',
            icon: GraduationCap,
            end: false,
            badge: null,
          },
          {
            name: 'Skill Gap Analysis',
            to: '/dashboard/skill-analysis',
            icon: Target,
            end: false,
            badge: null,
          },
          {
            name: 'Learning Roadmap',
            to: '/dashboard/learning-roadmap',
            icon: BookOpen,
            end: false,
            badge: null,
          },
        ]
      : []),
    ...(user?.role === 'ADMIN'
      ? [
          {
            name: 'Users Roster',
            to: '/dashboard/users',
            icon: Users,
            end: false,
            badge: null,
          },
          {
            name: 'Onboarding Hub',
            to: '/dashboard/admin/onboarding',
            icon: Sliders,
            end: false,
            badge: 'Admin',
          },
        ]
      : []),
    {
      name: 'Settings',
      to: '/dashboard/settings',
      icon: Settings,
      end: false,
      badge: null,
    },
  ]

  // Avatar initials
  const getInitials = (u) => {
    if (!u) return 'U'
    if (typeof u === 'string') {
      return u.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2)
    }
    const f = u.firstName ? u.firstName[0] : ''
    const l = u.lastName ? u.lastName[0] : ''
    if (f || l) return (f + l).toUpperCase()
    if (u.name) {
      return u.name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2)
    }
    return 'U'
  }

  // Get current section name for header breadcrumb
  const currentSection = location.pathname.includes('/settings')
    ? 'Settings'
    : location.pathname.includes('/users')
    ? 'Users Roster'
    : location.pathname.includes('/skill-analysis')
    ? 'Skill Gap Analysis'
    : location.pathname.includes('/learning-roadmap') || location.pathname.includes('/learning-path')
    ? 'Learning Roadmap'
    : location.pathname.includes('/profile')
    ? 'Career Profile'
    : location.pathname.includes('/admin/onboarding')
    ? 'Onboarding Hub'
    : 'Overview'

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.name || 'Explorer'

  const studentNotOnboarded =
    isStudent &&
    ((profileData?.profile && !profileData.profile.isOnboarded) ||
      (user && user.isOnboarded === false && !profileData?.profile?.isOnboarded))

  if (studentNotOnboarded) {
    return (
      <Loading
        variant="fullscreen"
        message="Redirecting to onboarding..."
        description="Please complete your student profile to access your dashboard."
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex selection:bg-indigo-500 selection:text-white">
      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-xs cursor-pointer transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar with Desktop Collapse Toggle */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 md:z-30 h-screen bg-white/95 backdrop-blur-md border-r border-slate-200/80 flex flex-col shrink-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isCollapsed ? 'md:w-16' : 'md:w-56'
        } w-56 ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div
          className={`h-14 border-b border-slate-200/80 flex items-center ${
            isCollapsed ? 'md:justify-center px-2.5' : 'justify-between px-3'
          }`}
        >
          {!isCollapsed ? (
            <>
              <div
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 overflow-hidden cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform shrink-0">
                  <Compass className="w-4.5 h-4.5 text-white animate-spinSlow" style={{ animationDuration: '24s' }} />
                </div>
                <div className="leading-tight truncate">
                  <div className="font-bold text-slate-900 text-xs tracking-tight">
                    FutureMe
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">Career Studio</div>
                </div>
              </div>

              {/* Desktop Collapse Button */}
              <button
                onClick={toggleCollapse}
                className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <div className="flex items-center justify-center w-full">
              <button
                onClick={toggleCollapse}
                className="hidden md:flex p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Mobile close button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1.5 text-slate-500 hover:text-slate-900 cursor-pointer rounded-lg hover:bg-slate-100"
            aria-label="Close mobile menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Items Area */}
        <div className={`flex-1 space-y-3 overflow-y-auto ${isCollapsed ? 'p-1.5' : 'p-2.5'}`}>
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-2.5 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Navigation</span>
                <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
              </div>
            )}
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  title={item.name}
                  className={({ isActive }) =>
                    `group relative flex items-center rounded-xl text-xs font-semibold transition-all duration-200 ${
                      isCollapsed ? 'justify-center p-2' : 'justify-between px-3 py-2'
                    } ${
                      isActive
                        ? 'bg-linear-to-r from-indigo-50 to-purple-50 text-indigo-700 font-semibold shadow-xs border border-indigo-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className={`flex items-center ${isCollapsed ? '' : 'gap-2.5'}`}>
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                            isActive
                              ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-500/30'
                              : 'text-slate-500 group-hover:text-indigo-600 group-hover:bg-indigo-50'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        {!isCollapsed && <span className="tracking-tight">{item.name}</span>}
                      </div>

                      {!isCollapsed && isActive && (
                        <ChevronRight className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      )}
                    </>
                  )}
                </NavLink>
              )
            })}
          </div>
        </div>

        {/* Subtle 3D AI Companion Widget (At the bottom, above the information card) */}
        {!isCollapsed && isStudent && (
          <div className="px-2 pb-2">
            <div className="p-2 rounded-xl bg-linear-to-br from-indigo-50/70 to-purple-50/40 border border-indigo-150/70 flex items-center gap-2 shadow-2xs">
              <MentorBot3D className="w-7 h-7 shrink-0 animate-float-slow" size={28} />
              <div className="min-w-0">
                <div className="text-[10.5px] font-semibold text-slate-800 flex items-center gap-1 leading-tight">
                  <span>AI Assistant</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="text-[9.5px] text-slate-500 truncate mt-0.5">Career Guidance Ready</div>
              </div>
            </div>
          </div>
        )}

        {/* User Capsule & Sign Out (Bottom Information Card) */}
        <div
          className={`border-t border-slate-200/80 bg-slate-50/60 ${
            isCollapsed ? 'p-1.5 space-y-1.5' : 'p-2 space-y-2'
          }`}
        >
          {!isCollapsed ? (
            <>
              <div className="flex items-center gap-2 p-1 rounded-lg hover:bg-white transition-colors">
                <div className="relative">
                  <div className="w-7 h-7 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 text-white font-bold text-[11px] flex items-center justify-center shadow-xs shrink-0">
                    {getInitials(user)}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border-2 border-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-slate-900 truncate leading-tight">{displayName}</p>
                  <p className="text-[9.5px] text-slate-500 truncate">{user?.email || 'student@futureme.edu'}</p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full justify-center gap-1.5 text-[11px] h-7 text-slate-700 hover:text-red-600 hover:border-red-200 hover:bg-red-50 bg-white border-slate-200 shadow-2xs rounded-lg cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
                <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1.5 py-1">
              <div
                className="w-7 h-7 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 text-white font-bold text-[11px] flex items-center justify-center shadow-xs cursor-default"
                title={`${displayName} (${user?.email})`}
              >
                {getInitials(user)}
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Sticky Dashboard Header */}
        <header className="sticky top-0 z-20 h-14 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-5 lg:px-6 flex items-center justify-between shadow-xs">
          {/* Left: Mobile Toggle & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span className="font-bold text-slate-900 tracking-tight">FutureMe</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-600 font-semibold">{currentSection}</span>
            </div>
          </div>

          {/* Right: Notifications & User Capsule */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Notification Bell */}
            <button
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            </button>

            {/* User Capsule */}
            <div className="flex items-center pl-2 border-l border-slate-200">
              <div
                onClick={() => navigate(isStudent ? '/dashboard/profile' : '/dashboard/settings')}
                className="w-8 h-8 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 text-white font-bold text-xs flex items-center justify-center cursor-pointer shadow-xs hover:ring-2 hover:ring-indigo-300 transition-all"
                title={`${displayName} (${user?.role || 'User'})`}
              >
                {getInitials(user)}
              </div>
            </div>
          </div>
        </header>

        {/* Content Outlet (Natural flow without forced large center margin) */}
        <main className="flex-1 p-3 sm:p-4 lg:p-5 w-full">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
