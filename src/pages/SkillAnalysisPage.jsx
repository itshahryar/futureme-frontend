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
  Sparkles,
  Search,
  ShieldCheck,
  Zap,
  ChevronRight,
  Plus,
} from 'lucide-react'

export default function SkillAnalysisPage() {
  const navigate = useNavigate()
  const user = useSelector(selectCurrentUser)
  const [selectedRole, setSelectedRole] = useState('')
  const [activeFilter, setActiveFilter] = useState('all') // 'all' | 'missing' | 'upgrade' | 'ready' | 'focus'
  const [missingSkillRelationFilter, setMissingSkillRelationFilter] = useState('all') // 'all' | 'related' | 'career'
  const [searchQuery, setSearchQuery] = useState('')
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
        description: 'Builds directly on your React knowledge and is easier to learn.',
      }
    }

    return {
      isRelated: false,
      relatedTo: null,
      description: `Core prerequisite expected by industry employers for ${currentRole}.`,
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

  // Total evaluated skills count
  const totalEvaluatedSkills = proficientSkills.length + skillsToUpgrade.length + missingSkills.length

  // Filtered skills based on activeFilter, search, and missing relation filter
  const filteredSkillsList = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    let items = []

    if (activeFilter === 'all' || activeFilter === 'missing') {
      const missingFormatted = missingSkills
        .filter((sk) => {
          if (activeFilter === 'missing' && missingSkillRelationFilter !== 'all') {
            const rel = getSkillRelation(sk)
            if (missingSkillRelationFilter === 'related') return rel.isRelated
            if (missingSkillRelationFilter === 'career') return !rel.isRelated
          }
          return true
        })
        .map((sk) => ({
          ...sk,
          type: 'missing',
          statusLabel: 'Missing',
          relation: getSkillRelation(sk),
        }))
      items = [...items, ...missingFormatted]
    }

    if (activeFilter === 'all' || activeFilter === 'upgrade') {
      const upgradeFormatted = skillsToUpgrade.map((sk) => ({
        ...sk,
        type: 'upgrade',
        statusLabel: 'Needs Upgrade',
      }))
      items = [...items, ...upgradeFormatted]
    }

    if (activeFilter === 'all' || activeFilter === 'ready') {
      const readyFormatted = proficientSkills.map((sk) => ({
        ...sk,
        type: 'ready',
        statusLabel: 'Job Ready',
      }))
      items = [...items, ...readyFormatted]
    }

    if (query) {
      items = items.filter((item) =>
        (item.name || '').toLowerCase().includes(query) ||
        (item.reasoning || '').toLowerCase().includes(query) ||
        (item.gap || '').toLowerCase().includes(query)
      )
    }

    return items
  }, [
    activeFilter,
    missingSkillRelationFilter,
    searchQuery,
    missingSkills,
    skillsToUpgrade,
    proficientSkills,
    currentRole,
  ])

  const showToast = (msg) => {
    setSuccessToast(msg)
    setTimeout(() => setSuccessToast(''), 4500)
  }

  // --- ACTIONS ---
  const handleRunAnalysis = async (targetRoleOverride) => {
    const role = targetRoleOverride || currentRole
    try {
      await generateSkillAnalysis({ targetRole: role }).unwrap()
      showToast(`Skill benchmark updated for ${role}!`)
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
      showToast(res.message || `Skill "${skillToUpdate}" marked as ${skillProficiency}!`)
    } catch (err) {
      console.error('Failed to update skill:', err)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      {/* Toast Alert Notification */}
      {successToast && (
        <div className="p-3.5 rounded-xl bg-slate-900 text-white text-xs font-medium flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast('')} className="text-slate-400 hover:text-white px-1">
            &times;
          </button>
        </div>
      )}

      {/* Modern, Clean Executive Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Capability Matrix
            </span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-xs font-medium text-slate-500">
              Target Role: {currentRole}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Skill Gap Analysis
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Real-time benchmark comparing your current profile against industry standards for {currentRole}.
          </p>
        </div>

        {/* Global Controls & Integrated Career Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="min-w-[200px]">
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

          <Button
            onClick={() => navigate('/dashboard/learning-roadmap')}
            variant="outline"
            className="text-xs font-medium border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 gap-1.5 h-9 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Learning Roadmap
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loadingAnalysis && (
        <Loading
          variant="ai"
          message={`Benchmarking your skills for ${currentRole}...`}
          description="Comparing your background with live industry requirements and calculating your readiness score."
        />
      )}

      {/* Generating Banner */}
      {isGeneratingAnalysis && (
        <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-indigo-900 flex items-center gap-3 animate-pulse">
          <RefreshCw className="w-4 h-4 text-[#4F46E5] animate-spin" />
          <div className="text-xs">
            <span className="font-semibold text-indigo-950">Auditing skills for {currentRole}...</span> Updating your capability matrix.
          </div>
        </div>
      )}

      {/* Empty State */}
      {!analysis && !loadingAnalysis && (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center border border-indigo-100">
            <Target className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-900">No Benchmark Data for {currentRole}</h3>
            <p className="text-xs text-slate-500">
              Run an automated AI skill audit to compare your profile with market expectations for this career.
            </p>
          </div>
          <Button
            onClick={() => handleRunAnalysis(currentRole)}
            disabled={isGeneratingAnalysis}
            className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold px-5 py-2.5 rounded-xl gap-2 shadow-xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4" /> Run Skill Audit for {currentRole}
          </Button>
        </div>
      )}

      {/* Active Analysis Dashboard */}
      {analysis && (
        <div className="space-y-6">
          {/* ========================================================= */}
          {/* 1. SINGLE EXECUTIVE READINESS STRIP (ZERO DUPLICATION)    */}
          {/* ========================================================= */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            {/* Match Gauge & Status */}
            <div className="md:col-span-4 flex items-center gap-4 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-5">
              <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={
                      analysis.matchScore >= 75
                        ? 'text-emerald-500'
                        : analysis.matchScore >= 50
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
                  <span className="text-xl font-black text-slate-900 tracking-tight">
                    {analysis.matchScore}%
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Match
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <Badge
                  className={
                    analysis.matchScore >= 75
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-bold'
                      : analysis.matchScore >= 50
                      ? 'bg-indigo-50 text-indigo-800 border-indigo-200 text-[10px] font-bold'
                      : 'bg-amber-50 text-amber-800 border-amber-200 text-[10px] font-bold'
                  }
                >
                  {analysis.matchScore >= 75 ? 'Job Ready' : analysis.matchScore >= 50 ? 'Strong Foundation' : 'Foundation Building'}
                </Badge>
                <div className="text-xs font-semibold text-slate-800">
                  {currentRole}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Est: <strong className="text-slate-700">{analysis.estimatedTimeToReadiness || '8-12 weeks'}</strong></span>
                </div>
              </div>
            </div>

            {/* AI Career Synthesis & Strengths */}
            <div className="md:col-span-8 space-y-2.5">
              <p className="text-xs text-slate-600 leading-relaxed">
                {analysis.summary}
              </p>

              {strengths.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                    Verified Strengths:
                  </span>
                  {strengths.slice(0, 6).map((st, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-150"
                    >
                      <Check className="w-2.5 h-2.5 text-emerald-600" />
                      {st}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* 2. UNIFIED FILTER STRIP (SEGMENTED TABS + SEARCH)         */}
          {/* ========================================================= */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                All Skills ({totalEvaluatedSkills})
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('missing')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeFilter === 'missing'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>Missing Skills</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeFilter === 'missing' ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-700'
                }`}>
                  {missingSkills.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('upgrade')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeFilter === 'upgrade'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>Needs Upgrade</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeFilter === 'upgrade' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-700'
                }`}>
                  {skillsToUpgrade.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('ready')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeFilter === 'ready'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>Job Ready</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeFilter === 'ready' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'
                }`}>
                  {proficientSkills.length}
                </span>
              </button>

              {recommendedFocusAreas.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveFilter('focus')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeFilter === 'focus'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Action Plan</span>
                </button>
              )}
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-56 shrink-0">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search skills..."
                className="pl-8 text-xs h-8 bg-slate-50 border-slate-200 focus:bg-white"
              />
            </div>
          </div>

          {/* Sub-Filter for Missing Skills Category */}
          {activeFilter === 'missing' && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Show:</span>
              <button
                type="button"
                onClick={() => setMissingSkillRelationFilter('all')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                  missingSkillRelationFilter === 'all'
                    ? 'bg-slate-200 text-slate-800 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All Missing ({missingSkills.length})
              </button>
              <button
                type="button"
                onClick={() => setMissingSkillRelationFilter('related')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                  missingSkillRelationFilter === 'related'
                    ? 'bg-sky-100 text-sky-800 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Connected to Existing ({missingSkillsStats.relatedCount})
              </button>
              <button
                type="button"
                onClick={() => setMissingSkillRelationFilter('career')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                  missingSkillRelationFilter === 'career'
                    ? 'bg-purple-100 text-purple-800 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Core Prerequisites ({missingSkillsStats.careerCount})
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. SKILL MATRIX ITEMS LIST (MINIMAL, ELEGANT ROWS)        */}
          {/* ========================================================= */}
          {activeFilter !== 'focus' ? (
            <div className="space-y-3">
              {filteredSkillsList.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-white border border-slate-200 text-xs text-slate-400 italic">
                  No skills found matching this filter or search query.
                </div>
              ) : (
                filteredSkillsList.map((sk, idx) => {
                  const isMissing = sk.type === 'missing'
                  const isUpgrade = sk.type === 'upgrade'
                  const isReady = sk.type === 'ready'

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      {/* Left: Skill Identity & Diagnostics */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">
                            {sk.name}
                          </span>

                          {/* Status Pill */}
                          {isMissing && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                              Missing Skill
                            </span>
                          )}
                          {isUpgrade && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                              Upgrade Needed
                            </span>
                          )}
                          {isReady && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <ShieldCheck className="w-3 h-3" />
                              Job Ready
                            </span>
                          )}

                          {/* Relation Tag for Missing Skills */}
                          {isMissing && sk.relation?.isRelated && (
                            <span className="text-[10px] font-medium text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                              Connected to {sk.relation.relatedTo}
                            </span>
                          )}

                          {/* Priority Pill */}
                          {sk.priority && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                sk.priority.toLowerCase() === 'high'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {sk.priority}
                            </span>
                          )}
                        </div>

                        {/* Concise Context / Rationale */}
                        <p className="text-xs text-slate-500 leading-snug">
                          {isMissing
                            ? sk.relation?.description || sk.reasoning || sk.importance || 'Target role prerequisite.'
                            : isUpgrade
                            ? sk.gap || sk.reasoning || `Practice hands-on projects to reach ${sk.requiredLevel || 'Intermediate'}.`
                            : sk.reasoning || 'Matches industry requirements for this role.'}
                        </p>
                      </div>

                      {/* Right: Progression Metrics & Direct Action */}
                      <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                        {/* Target Progression Indicators */}
                        {isUpgrade && (
                          <div className="flex items-center gap-1.5 text-xs font-semibold">
                            <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              {sk.currentLevel}
                            </span>
                            <span className="text-slate-300">&rarr;</span>
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              {sk.requiredLevel || 'Intermediate'}
                            </span>
                          </div>
                        )}

                        {isMissing && (
                          <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            Target: {sk.requiredLevel || 'Intermediate'}
                          </div>
                        )}

                        {isReady && (
                          <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            {sk.currentLevel || 'Intermediate'}
                          </div>
                        )}

                        {/* Action Buttons */}
                        {(isMissing || isUpgrade) && (
                          <Button
                            onClick={() => handleOpenSkillUpdate(sk.name, sk.requiredLevel || 'Intermediate')}
                            variant="outline"
                            className="text-xs font-medium border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 h-8 gap-1.5 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            {isMissing ? 'I Know This' : 'Update Level'}
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          ) : (
            /* ========================================================= */
            /* 4. STRATEGIC ACTION PLAN & RECOMMENDATIONS                */
            /* ========================================================= */
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Recommended Sequence of Next Steps
                </h3>
              </div>

              <div className="space-y-3">
                {recommendedFocusAreas.map((area, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-150 text-xs text-slate-700"
                  >
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-[#4F46E5] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="space-y-1 flex-1">
                      <p className="font-medium text-slate-900 leading-snug">{area}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  onClick={() => navigate('/dashboard/learning-roadmap')}
                  className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold gap-1.5 h-9 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Study in Learning Roadmap
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* Quick Bottom Roadmap Link Strip */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-slate-600">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                Want to learn the missing skills step-by-step? Access interactive lessons and 12-question quizzes.
              </span>
            </div>
            <Button
              onClick={() => navigate('/dashboard/learning-roadmap')}
              variant="outline"
              className="text-xs font-semibold text-indigo-600 border-indigo-200 hover:bg-indigo-50 gap-1.5 h-8 shrink-0 cursor-pointer"
            >
              Open Roadmap
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: DIRECT USER SKILL UPDATE (MINIMAL & SLEEK)          */}
      {/* ========================================================= */}
      <Dialog open={skillModalOpen} onOpenChange={setSkillModalOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-[#4F46E5] flex items-center justify-center font-bold mb-1">
              <GraduationCap className="w-4.5 h-4.5" />
            </div>
            <DialogTitle className="text-base font-bold text-slate-900">
              Update Skill Proficiency
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Record your verified experience. This immediately updates your profile and recalibrates your match score.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Skill</label>
              <Input
                type="text"
                value={skillToUpdate}
                onChange={(e) => setSkillToUpdate(e.target.value)}
                className="text-xs h-9 bg-slate-50 border-slate-200"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Select Current Level</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'Beginner', desc: 'Foundations & syntax' },
                  { key: 'Intermediate', desc: 'Can build projects' },
                  { key: 'Advanced', desc: 'Production-ready' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setSkillProficiency(item.key)}
                    className={`py-2 px-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      skillProficiency === item.key
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="text-xs font-bold">{item.key}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setSkillModalOpen(false)}
              className="text-xs cursor-pointer h-9 border-slate-200"
            >
              Cancel
            </Button>
            <Button
              disabled={isUpdatingSkill}
              onClick={handleConfirmSkillUpdate}
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold gap-1.5 cursor-pointer h-9 shadow-xs"
            >
              {isUpdatingSkill ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              Save & Recalibrate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
