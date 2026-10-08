import { useSelector } from 'react-redux'
import { selectCurrentUser } from '@/store/slices/authSlice'
import { LayoutDashboard } from 'lucide-react'

export default function DashboardHome() {
  const user = useSelector(selectCurrentUser)
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.name || 'User'

  return (
    <div className="space-y-5">
      
      {/* Page Header */}
      <div>
        <h1 className="page-title flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-[#4F46E5]" />
          Dashboard Overview
        </h1>
        <p className="page-subtitle mt-1">
          Welcome back, {displayName}! Overview of your career exploration portal.
        </p>
      </div>

      {/* Welcome Card (Clean & Professional SaaS Standard) */}
      <div className="p-4 sm:p-5 rounded-xl bg-white border border-[#E5E7EB] shadow-xs">
        <h2 className="section-title text-[#111827]">
          Welcome to FutureMe
        </h2>
        <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
          Your personal platform for career readiness, skills mapping, and growth tracking. Use the sidebar to explore registered users, customize your profile, or manage account settings.
        </p>
      </div>

    </div>
  )
}
