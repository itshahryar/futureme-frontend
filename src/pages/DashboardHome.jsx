import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { selectCurrentUser } from '@/store/slices/authSlice'
import { useGetStudentProfileQuery } from '@/store/api/onboardingApiSlice'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Loading from '@/components/ui/Loading'
import {
  RealisticStudentHero,
  SkillMatrixRadar3D,
  CurriculumRoadmap3D,
  Card3DTilt,
} from '@/components/illustrations3d'
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Sliders,
  Target,
  BookOpen,
  GraduationCap,
  Users,
  Layers,
  Award,
  Zap,
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
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.name || 'Explorer'

  const targetRole =
    profile?.careerInterests?.[0]?.title ||
    (typeof profile?.careerInterests?.[0] === 'string' ? profile?.careerInterests?.[0] : null) ||
    'Software Engineer'

  const skillsCount = Array.isArray(profile?.skills) ? profile.skills.length : 0
  const projectsCount = Array.isArray(profile?.projects) ? profile.projects.length : 0
  const certsCount = Array.isArray(profile?.certifications) ? profile.certifications.length : 0

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
    <div className="space-y-5 max-w-5xl pb-16">
      {/* STUDENT: Onboarding Incomplete Banner */}
      {isStudent && profile && !profile.isOnboarded && (
        <Card3DTilt maxTilt={3}>
          <div className="p-4 sm:p-5 rounded-xl bg-linear-to-r from-indigo-600 to-purple-700 text-white shadow-lg shadow-indigo-500/15 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-indigo-400/30">
            <div className="space-y-1 max-w-lg">
              <div className="flex items-center gap-2">
                <Badge className="bg-white/20 text-white border-0 text-[10px] font-semibold">
                  Setup Required
                </Badge>
                <span className="text-[11px] text-indigo-100">Step 1 of your journey</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">Complete Your Student Profile</h2>
              <p className="text-xs text-indigo-100 leading-relaxed font-normal">
                Add your degree, skills, and target career to unlock your AI readiness audit.
              </p>
            </div>

            <Button
              onClick={() => navigate('/onboarding')}
              className="bg-white hover:bg-slate-50 text-indigo-700 font-semibold text-xs px-4 py-2 rounded-lg gap-1.5 shadow-sm shrink-0 cursor-pointer h-8"
            >
              Start Onboarding <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </Card3DTilt>
      )}

      {/* STUDENT ONBOARDED: Clean, Minimal Bento Overview */}
      {isStudent && profile && profile.isOnboarded && (
        <div className="space-y-4">
          {/* Bento Hero Card: Realistic Character & Minimal Greeting */}
          <Card3DTilt maxTilt={2}>
            <div className="bento-card p-4 sm:p-4.5 bg-linear-to-br from-indigo-50/70 via-white to-purple-50/40 relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-center justify-between gap-3 relative z-10">
                <div className="space-y-1.5 text-center md:text-left max-w-md">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                    Welcome back, {displayName}!
                  </h1>

                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    Career path aligned for <span className="text-indigo-600 font-semibold">{targetRole}</span>. Audit your skill gap, study guides, and take quizzes.
                  </p>
                </div>

                {/* 3D Character Illustration */}
                <div className="shrink-0 flex items-center justify-center">
                  <RealisticStudentHero className="w-28 h-28 sm:w-36 sm:h-36 animate-float-slow" size={144} />
                </div>
              </div>
            </div>
          </Card3DTilt>

          {/* Bento Row 2: 4-Pillar Stat Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* Stat 1: Verified Skills */}
            <div
              onClick={() => navigate('/dashboard/profile')}
              className="bento-card bento-card-interactive p-3 flex items-center gap-2.5 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-150 shadow-2xs">
                <Target className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-base font-bold text-slate-900 leading-none">{skillsCount}</div>
                <div className="text-[10.5px] text-slate-500 mt-1 truncate font-normal">Skills</div>
              </div>
            </div>

            {/* Stat 2: Projects */}
            <div
              onClick={() => navigate('/dashboard/profile')}
              className="bento-card bento-card-interactive p-3 flex items-center gap-2.5 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-150 shadow-2xs">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-base font-bold text-slate-900 leading-none">{projectsCount}</div>
                <div className="text-[10.5px] text-slate-500 mt-1 truncate font-normal">Projects</div>
              </div>
            </div>

            {/* Stat 3: Certifications */}
            <div
              onClick={() => navigate('/dashboard/profile')}
              className="bento-card bento-card-interactive p-3 flex items-center gap-2.5 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-150 shadow-2xs">
                <Award className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-base font-bold text-slate-900 leading-none">{certsCount}</div>
                <div className="text-[10.5px] text-slate-500 mt-1 truncate font-normal">Certifications</div>
              </div>
            </div>

            {/* Stat 4: Readiness Status */}
            <div
              onClick={() => navigate('/dashboard/skill-analysis')}
              className="bento-card bento-card-interactive p-3 flex items-center gap-2.5 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-150 shadow-2xs">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-emerald-700 leading-none">Calibrated</div>
                <div className="text-[10.5px] text-slate-500 mt-1 truncate font-normal">{targetRole}</div>
              </div>
            </div>
          </div>

          {/* Bento Row 3: Actionable Next Steps (Crisp & Minimal) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Action Card 1: Skill Gap Analysis */}
            <div className="bento-card p-3.5 sm:p-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 text-[10.5px] font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-600" /> Competency Matrix
                  </span>
                  <SkillMatrixRadar3D className="w-9 h-9 shrink-0 animate-float-slow hidden sm:block" size={36} />
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-150">
                    <Target className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Skill Gap Benchmarking</h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed font-normal">
                      Compare your skills against industry standards for {targetRole} and uncover missing prerequisites.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-normal">
                  Target: <strong className="text-slate-800 font-semibold">{targetRole}</strong>
                </span>
                <Button
                  onClick={() => navigate('/dashboard/skill-analysis')}
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg gap-1 cursor-pointer shadow-xs h-7 px-2.5"
                >
                  Inspect Gaps <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Action Card 2: Learning Roadmap */}
            <div className="bento-card p-3.5 sm:p-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 text-[10.5px] font-medium rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-purple-600" /> Multi-Week Path
                  </span>
                  <CurriculumRoadmap3D className="w-9 h-9 shrink-0 animate-float-delayed hidden sm:block" size={36} />
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-150">
                    <GraduationCap className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Personalized Learning Roadmap</h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed font-normal">
                      Structured milestones with study guides and 12-question scenario quizzes to verify capability.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-normal">
                  Benchmark: <strong className="text-emerald-600 font-semibold">70% passing</strong>
                </span>
                <Button
                  onClick={() => navigate('/dashboard/learning-roadmap')}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg gap-1 cursor-pointer shadow-xs h-7 px-2.5"
                >
                  Continue Path <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN: Clean, Pristine Admin Overview */}
      {isAdmin && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Onboarding Configuration Hub */}
            <div className="bento-card p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs font-semibold">
                    University Admin
                  </Badge>
                  <Sliders className="w-4 h-4 text-indigo-500" />
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-150">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">Onboarding Configuration Hub</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed font-normal">
                      Configure wizard steps, set required student fields, manage degree catalogs, and curate official skill libraries.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
                <Button
                  onClick={() => navigate('/dashboard/admin/onboarding')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl gap-1.5 cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" /> Manage Onboarding Hub
                </Button>
              </div>
            </div>

            {/* Users Roster */}
            <div className="bento-card p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-xs font-semibold">
                    Cohort Control
                  </Badge>
                  <Users className="w-4 h-4 text-purple-500" />
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-150">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">Users & Cohorts Directory</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed font-normal">
                      Audit enrolled student accounts, inspect onboarding completion, modify administrative privileges, and monitor cohorts.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
                <Button
                  onClick={() => navigate('/dashboard/users')}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl gap-1.5 cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" /> View User Directory
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
