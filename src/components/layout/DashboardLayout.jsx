import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { selectCurrentUser, logoutUser, setCredentials } from '@/store/slices/authSlice'
import { useLogoutMutation, useGetMeQuery } from '@/store/api/authApiSlice'
import { Button } from '@/components/ui/button'
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
  PanelLeftOpen
} from 'lucide-react'

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

  // Navigation items for both STUDENT and ADMIN
  const navItems = [
    {
      name: 'Home',
      to: '/dashboard',
      icon: Home,
      end: true,
    },
    ...(user?.role === 'ADMIN'
      ? [
          {
            name: 'Users',
            to: '/dashboard/users',
            icon: Users,
            end: false,
          },
        ]
      : []),
    {
      name: 'Settings',
      to: '/dashboard/settings',
      icon: Settings,
      end: false,
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
    ? 'Users'
    : 'Home'
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.name || 'User'

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      
      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 md:hidden backdrop-blur-xs"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar with Desktop Collapse Toggle */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 md:z-30 h-screen bg-white border-r border-[#E5E7EB] flex flex-col shrink-0 transition-all duration-200 ease-in-out ${
          isCollapsed ? 'md:w-16' : 'md:w-56'
        } w-56 ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header & Collapse Button */}
        <div
          className={`h-16 border-b border-[#E5E7EB] flex items-center ${
            isCollapsed ? 'md:justify-center px-3' : 'justify-between px-3.5'
          }`}
        >
          {!isCollapsed ? (
            <>
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-[#4F46E5] text-white flex items-center justify-center shadow-xs shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="leading-tight truncate">
                  <div className="font-bold text-[#111827] text-sm tracking-tight">FutureMe</div>
                  <div className="text-[10px] text-[#6B7280] font-medium">Portal</div>
                </div>
              </div>

              {/* Desktop Collapse Button */}
              <button
                onClick={toggleCollapse}
                className="hidden md:flex p-1.5 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </>
          ) : (
            /* Desktop Expand Button when collapsed */
            <div className="flex items-center justify-center w-full">
              <button
                onClick={toggleCollapse}
                className="hidden md:flex p-2 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-slate-100 transition-colors cursor-pointer"
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <PanelLeftOpen className="w-5 h-5 text-slate-700" />
              </button>
            </div>
          )}

          {/* Mobile close button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1 text-[#6B7280] hover:text-[#111827] cursor-pointer"
            aria-label="Close mobile menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Area */}
        <div className={`flex-1 space-y-4 overflow-y-auto ${isCollapsed ? 'p-2' : 'p-3'}`}>
          
          {/* Main Links */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-2.5 pb-1.5 text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">
                Menu
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
                    `flex items-center rounded-lg text-xs font-medium transition-colors ${
                      isCollapsed
                        ? 'justify-center p-2.5'
                        : 'justify-between px-2.5 py-2'
                    } ${
                      isActive
                        ? 'bg-[#EEF2FF] text-[#4F46E5] font-semibold border border-indigo-100 shadow-xs'
                        : 'text-[#6B7280] hover:text-[#111827] hover:bg-slate-50'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className={`flex items-center ${isCollapsed ? '' : 'gap-2.5'}`}>
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#4F46E5]' : 'text-[#6B7280]'}`} />
                        {!isCollapsed && <span>{item.name}</span>}
                      </div>
                      {!isCollapsed && isActive && <ChevronRight className="w-3 h-3 text-[#4F46E5]" />}
                    </>
                  )}
                </NavLink>
              )
            })}
          </div>
        </div>

        {/* User Card & Sign Out (Bottom) */}
        <div className={`border-t border-[#E5E7EB] bg-slate-50/50 ${isCollapsed ? 'p-2 space-y-2' : 'p-3 space-y-2.5'}`}>
          {!isCollapsed ? (
            <>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#EEF2FF] text-[#4F46E5] border border-indigo-100 font-semibold text-xs flex items-center justify-center shrink-0">
                  {getInitials(user)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#111827] truncate leading-tight">
                    {displayName}
                  </p>
                  <p className="text-[10px] text-[#6B7280] truncate">
                    {user?.email || 'user@futureme.edu'}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full justify-center gap-1.5 text-xs h-8 text-[#111827] hover:text-red-600 hover:border-red-200 hover:bg-red-50 bg-white border-[#E5E7EB] cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
              </Button>
            </>
          ) : (
            /* Collapsed Profile & Icon-only Sign Out */
            <div className="flex flex-col items-center gap-2 py-1">
              <div
                className="w-8 h-8 rounded-full bg-[#EEF2FF] text-[#4F46E5] border border-indigo-100 font-semibold text-xs flex items-center justify-center cursor-default"
                title={`${displayName} (${user?.email})`}
              >
                {getInitials(user)}
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="p-2 rounded-lg text-[#6B7280] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </aside>

      {/* Main Layout Area (Header + Content) */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Sticky Dashboard Header */}
        <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-xs">
          
          {/* Left: Mobile Toggle & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-[#6B7280] hover:bg-slate-100 focus:outline-none cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span className="font-semibold text-[#111827]">Dashboard</span>
              <span className="text-[#6B7280]">/</span>
              <span className="text-[#6B7280] font-medium">{currentSection}</span>
            </div>
          </div>

          {/* Right: Notifications & User Capsule */}
          <div className="flex items-center gap-3">

            {/* Notification Bell */}
            <button
              className="relative p-2 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#4F46E5]"></span>
            </button>

            {/* User Capsule */}
            <div className="flex items-center pl-2 border-l border-[#E5E7EB]">
              <div
                className="w-8 h-8 rounded-full bg-[#EEF2FF] text-[#4F46E5] border border-indigo-100 font-semibold text-xs flex items-center justify-center cursor-default"
                title={`${displayName} (${user?.role || 'User'})`}
              >
                {getInitials(user)}
              </div>
            </div>

          </div>

        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>

      </div>

    </div>
  )
}
