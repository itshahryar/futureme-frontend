import { useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { selectCurrentUser } from '@/store/slices/authSlice'
import { useGetStudentProfileQuery } from '@/store/api/onboardingApiSlice'
import {
  useGetSkillAnalysisQuery,
  useGenerateSkillAnalysisMutation,
  useUpdateLearnedSkillMutation,
} from '@/store/api/aiLearningApiSlice'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import Loading from '@/components/ui/Loading'
import Select from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Target,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  RefreshCw,
  BookOpen,
  Check,
  TrendingUp,
  Lightbulb,
  GraduationCap,
  PlusCircle,
  ChevronDown,
  Sparkles,
  Layers,
} from 'lucide-react'

export default function SkillAnalysisPage() {
  const navigate = useNavigate()
  const user = useSelector(selectCurrentUser)
  const [selectedRole, setSelectedRole] = useState('')
  const [activeTab, setActiveTab] = useState('summary') // 'summary' | 'current' | 'missing'
  const [missingSkillFilter, setMissingSkillFilter] = useState('all') // 'all' | 'related' | 'career'
  const [successToast, setSuccessToast] = useState('')

  // Direct Skill Update Modal
  const [skillModalOpen, setSkillModalOpen] = useState(false)
  const [skillToUpdate, setSkillToUpdate] = useState('')
  const [skillProficiency, setSkillProficiency] = useState('Intermediate')

  // RTK Queries & Mutations
  const { data: profileData } = useGetStudentProfileQuery(undefined, {
    skip: user?.role !== 'STUDENT',
  })
  const profile = profileData?.profile

  const { data: analysisData, isLoading: loadingAnalysis } = useGetSkillAnalysisQuery(selectedRole || undefined)
  const [generateSkillAnalysis, { isLoading: isGeneratingAnalysis }] = useGenerateSkillAnalysisMutation()
  const [updateLearnedSkillApi, { isLoading: isUpdatingSkill }] = useUpdateLearnedSkillMutation()

  const analysis = analysisData?.analysis

  // Safely parse JSON properties
  const strengths = useMemo(() => {
    if (!analysis?.strengths) return []
    return Array.isArray(analysis.strengths) ? analysis.strengths : JSON.parse(analysis.strengths || '[]')
  }, [analysis])

  const proficientSkills = useMemo(() => {
    if (!analysis?.proficientSkills) return []
    return Array.isArray(analysis.proficientSkills) ? analysis.proficientSkills : JSON.parse(analysis.proficientSkills || '[]')
  }, [analysis])

  const skillsToUpgrade = useMemo(() => {
    if (!analysis?.skillsToUpgrade) return []
    return Array.isArray(analysis.skillsToUpgrade) ? analysis.skillsToUpgrade : JSON.parse(analysis.skillsToUpgrade || '[]')
  }, [analysis])

  const missingSkills = useMemo(() => {
    if (!analysis?.missingSkills) return []
    return Array.isArray(analysis.missingSkills) ? analysis.missingSkills : JSON.parse(analysis.missingSkills || '[]')
  }, [analysis])

  const recommendedFocusAreas = useMemo(() => {
    if (!analysis?.recommendedFocusAreas) return []
    return Array.isArray(analysis.recommendedFocusAreas) ? analysis.recommendedFocusAreas : JSON.parse(analysis.recommendedFocusAreas || '[]')
  }, [analysis])

  // Target career options from profile (up to 3 careers)
  const careerOptions = useMemo(() => {
    const list = []
    if (Array.isArray(profile?.careerInterests)) {
      profile.careerInterests.forEach((c, idx) => {
        const title = typeof c === 'string' ? c : c?.title
        const level = typeof c === 'object' && c?.level ? c.level : (idx === 0 ? 'Primary Choice' : 'Secondary Choice')
        if (title && !list.some((item) => item.title.toLowerCase() === title.toLowerCase())) {
          list.push({ title, level })
        }
      })
    }
    if (list.length === 0) {
      if (analysis?.targetRole) {
        list.push({ title: analysis.targetRole, level: 'Primary Choice' })
      } else {
        list.push(
          { title: 'Frontend Developer', level: 'Primary Choice' },
          { title: 'Full-Stack Developer', level: 'Secondary Choice' },
          { title: 'Backend Developer', level: 'Secondary Choice' }
        )
      }
    }
    return list.slice(0, 3)
  }, [profile, analysis])

  const currentRole = selectedRole || careerOptions[0]?.title || analysis?.targetRole || 'Software Engineer'

  // Helper to distinguish whether a missing skill is related to existing skills (e.g. React)
  // or is an independent career role prerequisite
  const getSkillRelation = (sk) => {
    if (sk.relationType && sk.relatedToSkill) {
      return {
        isRelated: sk.relationType === 'RELATED_TO_EXISTING_SKILL',
        relatedTo: sk.relatedToSkill,
        description: sk.relationDescription || `Builds on what you already know in ${sk.relatedToSkill}.`,
      }
    }

    if (sk.relationType === 'CAREER_PATH_REQUIREMENT') {
      return {
        isRelated: false,
        relatedTo: null,
        description: sk.relationDescription || `A core skill needed for any ${currentRole} job.`,
      }
    }

    // Heuristic inference based on current student skills for backwards-compatibility
    const lower = (sk.name || '').toLowerCase()
    const allKnownSkills = [
      ...(proficientSkills || []),
      ...(skillsToUpgrade || []),
      ...(profile?.skills || []),
    ].map((s) => (s.name || '').toLowerCase())

    const hasReact = allKnownSkills.some((n) => n.includes('react'))

    if (
      hasReact &&
      (lower.includes('next') ||
        lower.includes('redux') ||
        lower.includes('zustand') ||
        lower.includes('state') ||
        lower.includes('tailwind') ||
        lower.includes('performance') ||
        lower.includes('react testing') ||
        lower.includes('vite') ||
        lower.includes('frontend'))
    ) {
      return {
        isRelated: true,
        relatedTo: 'React',
        description: 'Connected to your React skill. It will be easier to learn because you already know React.',
      }
    }

    return {
      isRelated: false,
      relatedTo: null,
      description: `A core skill needed for a ${currentRole} job.`,
    }
  }

  const missingSkillsStats = useMemo(() => {
    let relatedCount = 0
    let careerCount = 0
    missingSkills.forEach((sk) => {
      const rel = getSkillRelation(sk)
      if (rel.isRelated) relatedCount++
      else careerCount++
    })
    return { relatedCount, careerCount }
  }, [missingSkills, proficientSkills, skillsToUpgrade, profile, currentRole])

  const filteredMissingSkills = useMemo(() => {
    return missingSkills.filter((sk) => {
      const rel = getSkillRelation(sk)
      if (missingSkillFilter === 'related') return rel.isRelated
      if (missingSkillFilter === 'career') return !rel.isRelated
      return true
    })
  }, [missingSkills, missingSkillFilter, proficientSkills, skillsToUpgrade, profile, currentRole])

  const showToast = (msg) => {
    setSuccessToast(msg)
    setTimeout(() => setSuccessToast(''), 4500)
  }

  // --- ACTIONS ---
  const handleRunAnalysis = async (targetRoleOverride) => {
    const role = targetRoleOverride || currentRole
    try {
      await generateSkillAnalysis({ targetRole: role }).unwrap()
      showToast(`Skill analysis updated for ${role}!`)
    } catch (err) {
      console.error('Failed to generate skill analysis:', err)
    }
  }

  // Direct Skill Update Handler
  const handleOpenSkillUpdate = (skillName, defaultProficiency = 'Intermediate') => {
    setSkillToUpdate(skillName)
    setSkillProficiency(defaultProficiency)
    setSkillModalOpen(true)
  }

  const handleConfirmSkillUpdate = async () => {
    if (!skillToUpdate) return

    try {
      const res = await updateLearnedSkillApi({
        skillName: skillToUpdate,
        proficiency: skillProficiency,
      }).unwrap()

      setSkillModalOpen(false)
      showToast(res.message || `Skill "${skillToUpdate}" updated to ${skillProficiency}!`)
    } catch (err) {
      console.error('Failed to update skill:', err)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Toast Notification Banner */}
      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-500 text-white font-medium text-xs flex items-center justify-between shadow-lg shadow-emerald-200 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast('')} className="text-white/80 hover:text-white cursor-pointer">
            &times;
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5]">
              <Target className="w-4 h-4" />
            </div>
            <h1 className="page-title text-gray-900">Skill Gap Analysis</h1>
          </div>
          <p className="page-subtitle mt-1">
            See how your skills match your dream career, what you are good at, and what you need to learn next.
          </p>
        </div>

        {/* Global CTA Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={() => handleRunAnalysis()}
            disabled={isGeneratingAnalysis}
            variant="outline"
            className="text-xs font-semibold gap-1.5 border-gray-200 hover:border-indigo-300 hover:text-[#4F46E5] cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAnalysis ? 'animate-spin' : ''}`} />
            {analysis ? 'Re-run Analysis' : 'Run Analysis'}
          </Button>

          <Button
            onClick={() => navigate('/dashboard/learning-roadmap')}
            className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold gap-1.5 shadow-xs cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            View Learning Roadmap
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Target Career Selector Bar */}
      <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-150 flex items-center justify-center text-[#4F46E5] shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Selected Career Path
            </div>
            <div className="text-sm font-extrabold text-gray-900 mt-0.5">
              {currentRole}
            </div>
          </div>
        </div>

        {/* Career Selection Dropdown (Up to 3 Chosen Careers) */}
        <div className="flex items-center gap-2.5">
          <label htmlFor="career-select" className="text-xs font-semibold text-gray-600 shrink-0">
            Switch Career:
          </label>
          <div className="min-w-[240px]">
            <Select
              id="career-select"
              value={currentRole}
              onChange={(newRole) => setSelectedRole(newRole)}
              disabled={isGeneratingAnalysis}
              options={careerOptions.map((opt) => ({
                value: opt.title,
                label: opt.title,
                badge: opt.level || null,
              }))}
            />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loadingAnalysis && (
        <Loading
          variant="ai"
          message={`Checking your skills for ${currentRole}...`}
          description="Comparing your background with industry standards and calculating your career match."
        />
      )}

      {/* Generating Banner */}
      {isGeneratingAnalysis && (
        <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-indigo-900 flex items-center gap-3 animate-pulse">
          <RefreshCw className="w-4 h-4 text-[#4F46E5] animate-spin" />
          <div className="text-xs">
            <span className="font-medium text-indigo-950">Analyzing your skills for {currentRole}...</span> Please wait a few moments.
          </div>
        </div>
      )}

      {/* Empty State */}
      {!analysis && !loadingAnalysis && (
        <div className="p-10 text-center rounded-2xl bg-white border border-gray-200 shadow-xs space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center border border-indigo-100">
            <Target className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-gray-900">No Analysis for {currentRole} Yet</h3>
            <p className="text-xs text-gray-500">
              Click the button below to see how your current skills match what companies look for in a <span className="font-semibold text-gray-800">{currentRole}</span>.
            </p>
          </div>
          <Button
            onClick={() => handleRunAnalysis(currentRole)}
            disabled={isGeneratingAnalysis}
            className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold px-5 py-2.5 rounded-xl gap-2 shadow-xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4" /> Analyze Skills for {currentRole}
          </Button>
        </div>
      )}

      {/* Active Analysis View */}
      {analysis && (
        <div className="space-y-6">
          {/* THREE CLEAN TABS NAVIGATION */}
          <div className="flex items-center gap-2 border-b border-gray-200 pb-px">
            {/* Tab 1: Career Overview Dashboard */}
            <button
              type="button"
              onClick={() => setActiveTab('summary')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'summary'
                  ? 'border-[#4F46E5] text-[#4F46E5]'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Career Overview
            </button>

            {/* Tab 2: Skills You Have */}
            <button
              type="button"
              onClick={() => setActiveTab('current')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'current'
                  ? 'border-[#4F46E5] text-[#4F46E5]'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Your Current Skills
              <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] ml-1 font-bold">
                {proficientSkills.length + skillsToUpgrade.length}
              </Badge>
            </button>

            {/* Tab 3: Skills to Learn (Alone in its own tab) */}
            <button
              type="button"
              onClick={() => setActiveTab('missing')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'missing'
                  ? 'border-[#4F46E5] text-[#4F46E5]'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Skills You Need to Learn
              <Badge className="bg-rose-50 text-rose-800 border-rose-200 text-[10px] ml-1 font-bold">
                {missingSkills.length}
              </Badge>
            </button>
          </div>

          {/* ======================================================= */}
          {/* TAB 1: OVERVIEW & SUMMARY (DASHBOARD STYLE)             */}
          {/* ======================================================= */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              {/* 4 Quick Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs space-y-1">
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Career Match</div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-gray-900">{analysis.matchScore}%</span>
                    <span className="text-[10px] font-bold text-indigo-600">
                      {analysis.matchScore >= 75 ? 'Job Ready' : analysis.matchScore >= 45 ? 'Good Start' : 'Getting Started'}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500">Based on real job requirements</div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs space-y-1">
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Skills You Know Well</div>
                  <div className="text-2xl font-black text-emerald-600">{proficientSkills.length}</div>
                  <div className="text-[11px] text-gray-500">No upgrade needed</div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs space-y-1">
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Skills to Improve</div>
                  <div className="text-2xl font-black text-amber-600">{skillsToUpgrade.length}</div>
                  <div className="text-[11px] text-gray-500">Need more practice</div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs space-y-1">
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Skills to Learn</div>
                  <div className="text-2xl font-black text-rose-600">{missingSkills.length}</div>
                  <div className="text-[11px] text-gray-500">New skills for this job</div>
                </div>
              </div>

              {/* Main Summary & Match Gauge Card */}
              <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Circular Gauge */}
                <div className="md:col-span-4 flex flex-col items-center justify-center p-5 rounded-xl bg-linear-to-b from-slate-50 to-indigo-50/30 border border-gray-100 text-center">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-gray-200"
                        strokeWidth="3.2"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={
                          analysis.matchScore >= 75
                            ? 'text-emerald-500'
                            : analysis.matchScore >= 45
                            ? 'text-indigo-600'
                            : 'text-amber-500'
                        }
                        strokeDasharray={`${analysis.matchScore}, 100`}
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-gray-900 tracking-tight">
                        {analysis.matchScore}%
                      </span>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        Match
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 text-xs font-bold text-gray-800">
                    {analysis.matchScore >= 75 ? 'Strong Match for this Job' : analysis.matchScore >= 45 ? 'Good Working Foundation' : 'Starting Your Journey'}
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-500">
                    <Clock className="w-3 h-3 text-gray-400" />
                    Estimated time to complete: <span className="font-bold text-gray-700">{analysis.estimatedTimeToReadiness || '2-3 months'}</span>
                  </div>
                </div>

                {/* AI Plain English Summary & Quick Actions */}
                <div className="md:col-span-8 space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-indigo-50 text-[#4F46E5] border-indigo-200 text-[10px] font-bold">
                        Career Summary
                      </Badge>
                      <span className="text-xs text-gray-500">&bull; Goal: {analysis.targetRole}</span>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed pt-1">
                      {analysis.summary}
                    </p>
                  </div>

                  {/* What You are Good At */}
                  {strengths.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        What You Are Already Good At
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {strengths.map((st, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
                          >
                            <Check className="w-3 h-3 text-emerald-600" />
                            {st}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <Button
                      onClick={() => setActiveTab('missing')}
                      variant="outline"
                      className="text-xs font-semibold gap-1.5 border-gray-200 hover:border-indigo-300 hover:text-[#4F46E5] cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#4F46E5]" />
                      See Skills You Need to Learn ({missingSkills.length})
                    </Button>

                    <Button
                      onClick={() => navigate('/dashboard/learning-roadmap')}
                      className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold px-4 py-2 rounded-xl gap-1.5 shadow-xs cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Open Learning Roadmap
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Recommended Next Steps */}
              {recommendedFocusAreas.length > 0 && (
                <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-3">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                      Recommended Next Steps
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {recommendedFocusAreas.map((area, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-gray-150 text-xs text-gray-700"
                      >
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-[#4F46E5] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-snug">{area}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 2: YOUR CURRENT SKILLS (PROFICIENT + TO IMPROVE)    */}
          {/* ======================================================= */}
          {activeTab === 'current' && (
            <div className="space-y-6">
              {/* Explanation header */}
              <div className="p-4 rounded-xl bg-slate-50 border border-gray-200 text-xs text-gray-600 flex items-center justify-between">
                <span>
                  Here are the skills you currently have recorded in your profile. You can see which ones are ready for work and which ones need more practice.
                </span>
                <span className="font-bold text-gray-800 shrink-0 ml-3">
                  {proficientSkills.length + skillsToUpgrade.length} Skills Listed
                </span>
              </div>

              {/* Section 1: Skills You Know Well */}
              <div className="rounded-2xl bg-white border border-emerald-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <CheckCircle2 className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">Skills You Know Well</h3>
                      <p className="caption-text text-gray-500">These skills match what companies look for in a {currentRole}</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 border-0 text-xs font-bold">
                    {proficientSkills.length} Ready
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {proficientSkills.length === 0 ? (
                    <div className="col-span-2 text-xs text-gray-400 italic py-6 text-center">
                      You don't have any job-ready skills listed yet. Start learning with the roadmap!
                    </div>
                  ) : (
                    proficientSkills.map((sk, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-150 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900 text-sm">{sk.name}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {sk.currentLevel || 'Job Ready'}
                          </span>
                        </div>
                        {sk.reasoning && (
                          <p className="text-[11px] text-gray-600 leading-snug">
                            {sk.reasoning}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Section 2: Skills to Improve */}
              <div className="rounded-2xl bg-white border border-amber-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                      <AlertTriangle className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">Skills to Improve</h3>
                      <p className="caption-text text-gray-500">You know the basics, but need more practice to be job-ready</p>
                    </div>
                  </div>
                  <Badge className="bg-amber-100 text-amber-800 border-0 text-xs font-bold">
                    {skillsToUpgrade.length} to Improve
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {skillsToUpgrade.length === 0 ? (
                    <div className="col-span-2 text-xs text-gray-400 italic py-6 text-center">
                      Great! All your existing skills match the level needed for this job.
                    </div>
                  ) : (
                    skillsToUpgrade.map((sk, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-amber-50/40 border border-amber-150 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900 text-sm">{sk.name}</span>
                          <div className="flex items-center gap-1.5 text-[10px]">
                            <span className="text-amber-800 font-semibold bg-amber-100 px-1.5 py-0.5 rounded">
                              Current: {sk.currentLevel}
                            </span>
                            <span className="text-gray-400">&rarr;</span>
                            <span className="text-emerald-800 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                              Goal: {sk.requiredLevel || 'Intermediate'}
                            </span>
                          </div>
                        </div>

                        <p className="text-[11px] text-gray-600 leading-snug">
                          {sk.gap || sk.reasoning || `Practice real projects in ${sk.name} to reach ${sk.requiredLevel || 'Intermediate'} level.`}
                        </p>

                        <div className="flex items-center justify-between pt-1 border-t border-amber-100">
                          {sk.priority && (
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                              sk.priority.toLowerCase() === 'high'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {sk.priority} Priority
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOpenSkillUpdate(sk.name, sk.requiredLevel || 'Intermediate')}
                            className="text-[10px] font-bold text-amber-900 hover:text-amber-700 bg-amber-100/90 hover:bg-amber-200 px-2 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <PlusCircle className="w-3 h-3" /> I Practiced This (Update Level)
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 3: SKILLS YOU NEED TO LEARN (ALONE IN ITS OWN TAB)  */}
          {/* ======================================================= */}
          {activeTab === 'missing' && (
            <div className="space-y-6">
              {/* Clean header explaining the separation */}
              <div className="p-5 rounded-2xl bg-white border border-rose-200 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      Skills You Need to Learn for {currentRole}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Some of these skills connect to what you already know (like React), while others are completely new tools needed for this job.
                    </p>
                  </div>

                  <Badge className="bg-rose-100 text-rose-800 border-0 text-xs font-bold self-start sm:self-auto">
                    {missingSkills.length} Skills to Learn
                  </Badge>
                </div>

                {/* Filter Pills with Simple English Labels */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setMissingSkillFilter('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      missingSkillFilter === 'all'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
                    }`}
                  >
                    All Skills to Learn ({missingSkills.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setMissingSkillFilter('related')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                      missingSkillFilter === 'related'
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200'
                    }`}
                  >
                    <span>🔗 Connected to Skills You Know ({missingSkillsStats.relatedCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMissingSkillFilter('career')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                      missingSkillFilter === 'career'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200'
                    }`}
                  >
                    <span>🎯 New Skills for this Job ({missingSkillsStats.careerCount})</span>
                  </button>
                </div>
              </div>

              {/* Skills Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMissingSkills.length === 0 ? (
                  <div className="col-span-2 text-xs text-gray-400 italic py-10 text-center bg-white rounded-2xl border border-gray-200">
                    No skills matching this filter.
                  </div>
                ) : (
                  filteredMissingSkills.map((sk, idx) => {
                    const relation = getSkillRelation(sk)

                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border space-y-2.5 text-xs transition-all shadow-xs ${
                          relation.isRelated
                            ? 'bg-sky-50/40 border-sky-200 border-l-4 border-l-sky-500'
                            : 'bg-white border-gray-200 border-l-4 border-l-purple-500'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <span className="font-bold text-gray-900 text-sm block">{sk.name}</span>
                            {relation.isRelated ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-100/90 px-2 py-0.5 rounded">
                                🔗 Connected to your {relation.relatedTo} skill
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-100/90 px-2 py-0.5 rounded">
                                🎯 Required for {currentRole}
                              </span>
                            )}
                          </div>

                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 shrink-0">
                            Goal: {sk.requiredLevel || 'Intermediate'}
                          </span>
                        </div>

                        <p className="text-xs text-gray-600 leading-relaxed">
                          {relation.description || sk.reasoning || sk.importance || 'A valuable skill for your target role.'}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-150">
                          <span className="text-[10px] font-bold text-gray-500">
                            {relation.isRelated ? (
                              <span className="text-sky-700">Easier to learn from your existing background</span>
                            ) : (
                              <span className="text-purple-700">New tool to start learning</span>
                            )}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleOpenSkillUpdate(sk.name, sk.requiredLevel || 'Intermediate')}
                            className="text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-100/80 hover:bg-emerald-200/90 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <PlusCircle className="w-3.5 h-3.5" /> I Learned This
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Bottom CTA to Roadmap */}
              <div className="p-5 rounded-2xl bg-linear-to-r from-indigo-50/70 via-purple-50/40 to-white border border-indigo-150 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                    <BookOpen className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Ready to learn these skills step by step?</h4>
                    <p className="text-[11px] text-gray-600">The AI Learning Roadmap gives you free study materials, code examples, and quizzes for each skill.</p>
                  </div>
                </div>

                <Button
                  onClick={() => navigate('/dashboard/learning-roadmap')}
                  className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold px-4 py-2 rounded-xl gap-1.5 shadow-xs shrink-0 cursor-pointer"
                >
                  Go to Roadmap <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: DIRECT USER SKILL UPDATE */}
      <Dialog open={skillModalOpen} onOpenChange={setSkillModalOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold mb-1">
              <GraduationCap className="w-5 h-5" />
            </div>
            <DialogTitle className="text-base font-bold text-gray-900">
              Update Skill in Your Profile
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Confirm that you have learned this skill. It will be added to your profile and your Career Match score will improve immediately.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Skill Name</label>
              <Input
                type="text"
                value={skillToUpdate}
                onChange={(e) => setSkillToUpdate(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Your Level in this Skill</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'Beginner', desc: 'Know the basics' },
                  { key: 'Intermediate', desc: 'Can build projects' },
                  { key: 'Advanced', desc: 'Experienced' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setSkillProficiency(item.key)}
                    className={`py-2 px-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      skillProficiency === item.key
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                    }`}
                  >
                    <div className="text-xs font-bold">{item.key}</div>
                    <div className="text-[10px] text-gray-500">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4 pt-3 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setSkillModalOpen(false)}
              className="text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              disabled={isUpdatingSkill}
              onClick={handleConfirmSkillUpdate}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5 cursor-pointer"
            >
              {isUpdatingSkill ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Save Skill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
