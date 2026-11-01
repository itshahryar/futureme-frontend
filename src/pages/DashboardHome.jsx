import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { selectCurrentUser } from '@/store/slices/authSlice'
import { useGetStudentProfileQuery } from '@/store/api/onboardingApiSlice'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Loading from '@/components/ui/Loading'
import {
  LayoutDashboard,
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Sliders,
  Users,
  Compass,
  Target,
  BookOpen,
} from 'lucide-react'

export default function DashboardHome() {
  const navigate = useNavigate()
  const user = useSelector(selectCurrentUser)
  const isStudent = user?.role === 'STUDENT'
  const isAdmin = user?.role === 'ADMIN'

  const { data: profileData, isLoading: loadingProfile } = useGetStudentProfileQuery(undefined, {
    skip: !isStudent,
  })

  const profile = profileData?.profile
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.name || 'User'
  const completionPercentage = profile?.completionPercentage || 0

  if (loadingProfile) {
    return (
      <Loading
        variant="page"
        message="Loading your dashboard..."
        description="Gathering your profile status, career goals, and personalized roadmaps."
      />
    )
  }

  return (
    <div className="space-y-6 max-w-5xl">
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

      {/* STUDENT: Onboarding Incomplete Banner */}
      {isStudent && profile && !profile.isOnboarded && (
        <div className="p-6 rounded-2xl bg-linear-to-r from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 text-white border-0 text-[11px] font-semibold backdrop-blur-xs">
                Action Required
              </Badge>
              <span className="text-xs text-indigo-100">Step 1 of your journey</span>
            </div>
            <h2 className="text-lg font-bold tracking-tight">Complete Your Student Profile & Onboarding</h2>
            <p className="text-xs text-indigo-100 leading-relaxed">
              Tell us about your university, degree, skills, and career goals so FutureMe can build your personalized profile.
            </p>
          </div>

          <Button
            onClick={() => navigate('/onboarding')}
            className="bg-white hover:bg-slate-50 text-[#4F46E5] font-bold text-xs px-5 py-5 rounded-xl gap-2 shadow-md shrink-0"
          >
            Start Onboarding <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* STUDENT: Completed Onboarding Profile Snapshot */}
      {isStudent && profile && profile.isOnboarded && (
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 font-bold shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-900">Career Profile Active</h3>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                  Onboarded
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {profile.currentDegree} &bull; {profile.university}
              </p>
            </div>
          </div>

          <Button
            onClick={() => navigate('/dashboard/profile')}
            variant="outline"
            size="sm"
            className="text-xs font-semibold text-[#4F46E5] gap-1.5"
          >
            View / Edit Profile <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}

      {/* STUDENT: AI Skill Analysis & Learning Path Hero Card */}
      {isStudent && profile && profile.isOnboarded && (
        <div className="p-6 rounded-2xl bg-linear-to-r from-indigo-50/60 via-purple-50/30 to-white border border-indigo-150 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-900">AI Skill Analysis & Learning Path</h3>
                <Badge className="bg-indigo-100 text-[#4F46E5] border-0 text-[10px] font-bold">
                  AI Powered
                </Badge>
              </div>
              <p className="text-xs text-gray-600 max-w-xl leading-relaxed">
                See how your skills match real jobs, find what skills you need to learn, and follow your step-by-step learning roadmap.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              onClick={() => navigate('/dashboard/skill-analysis')}
              variant="outline"
              className="text-xs font-semibold px-3 py-2 rounded-xl gap-1.5 border-gray-200 hover:border-indigo-300 hover:text-[#4F46E5] cursor-pointer"
            >
              <Target className="w-3.5 h-3.5" /> Skill Gap Analysis
            </Button>
            <Button
              onClick={() => navigate('/dashboard/learning-roadmap')}
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold px-4 py-2 rounded-xl gap-1.5 shadow-xs cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" /> Learning Roadmap <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* ADMIN: Quick Onboarding Manager Snapshot */}
      {isAdmin && (
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center border border-indigo-100 font-bold shrink-0">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Onboarding Configuration Hub</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Customize onboarding sections, toggle required fields, and manage degrees or skills catalogs.
              </p>
            </div>
          </div>

          <Button
            onClick={() => navigate('/dashboard/admin/onboarding')}
            className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold gap-1.5 rounded-xl shadow-xs shrink-0"
          >
            <Sliders className="w-3.5 h-3.5" /> Manage Onboarding
          </Button>
        </div>
      )}

      {/* General Information Card */}
      <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-3">
        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#4F46E5]" />
          About FutureMe Platform
        </h2>
        <p className="text-xs text-gray-600 leading-relaxed">
          FutureMe guides students through career preparation, skill development, and industry alignment. Module 2 collects your academic background, skills, experiences, and preferences to build an authentic foundation for your future career growth.
        </p>
      </div>
    </div>
  )
}
