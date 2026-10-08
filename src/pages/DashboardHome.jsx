import { useSelector } from 'react-redux'
import { selectCurrentUser } from '@/store/slices/authSlice'

export default function DashboardHome() {
  const user = useSelector(selectCurrentUser)

  return (
    <div className="space-y-4">
      
      {/* Welcome Card (Clean & Professional White Theme) */}
      <div className="p-4 sm:p-5 rounded-xl bg-white border border-[#E5E7EB] shadow-xs">
        <h1 className="page-title">
          Welcome back, {user?.firstName || user?.name || 'User'}!
        </h1>
        <p className="page-subtitle mt-1">
          Welcome to your FutureMe dashboard.
        </p>
      </div>

    </div>
  )
}
