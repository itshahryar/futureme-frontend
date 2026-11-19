import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '@/store/slices/authSlice'
import {
  useGetSkillAnalysisQuery,
  useGenerateSkillAnalysisMutation,
  useUpdateLearnedSkillMutation,
} from '@/store/api/aiLearningApiSlice'
import { useGetStudentProfileQuery } from '@/store/api/onboardingApiSlice'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Select from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import Loading from '@/components/ui/Loading'
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
  Clock,
  RefreshCw,
  BookOpen,
  Check,
  Lightbulb,
  GraduationCap,
  Sparkles,
  Search,
  ShieldCheck,
  ChevronRight,
  Plus,
  Zap,
} from 'lucide-react'
import {
  GrowthRocket3D,
} from '@/components/illustrations3d'

export default function SkillAnalysisPage() {
  const navigate = useNavigate()
  const user = useSelector(selectCurrentUser)
  const isStudent = user?.role === 'STUDENT'

  const [selectedRole, setSelectedRole] = useState('')
  const [activeFilter, setActiveFilter] = useState('all') // 'all' | 'missing' | 'upgrade' | 'ready' | 'focus'
  const [missingSkillRelationFilter, setMissingSkillRelationFilter] = useState('all') // 'all' | 'related' | 'career'
  const [searchQuery, setSearchQuery] = useState('')
  const [successToast, setSuccessToast] = useState('')

  // Skill Update Modal State
  const [skillModalOpen, setSkillModalOpen] = useState(false)
  const [skillToUpdate, setSkillToUpdate] = useState('')
  const [skillProficiency, setSkillProficiency] = useState('Intermediate')

  // API Hooks
  const { data: profileData } = useGetStudentProfileQuery(undefined, { skip: !isStudent })
  const profile = profileData?.profile

  const {
    data: analysisData,
    isLoading: loadingAnalysis,
    refetch: refetchAnalysis,
  } = useGetSkillAnalysisQuery(selectedRole || undefined, {
    skip: !isStudent,
  })

  const [generateSkillAnalysis, { isLoading: isGeneratingAnalysis }] = useGenerateSkillAnalysisMutation()
  const [updateLearnedSkillApi, { isLoading: isUpdatingSkill }] = useUpdateLearnedSkillMutation()

  const analysis = analysisData?.analysis

  const safeParseArray = (val) => {
    if (!val) return []
    if (Array.isArray(val)) return val
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val)
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }
    return []
  }

  const missingSkills = useMemo(() => safeParseArray(analysis?.missingSkills), [analysis])
  const proficientSkills = useMemo(() => safeParseArray(analysis?.proficientSkills), [analysis])
  const skillsToUpgrade = useMemo(() => safeParseArray(analysis?.skillsToUpgrade), [analysis])
  const strengths = useMemo(() => safeParseArray(analysis?.strengths), [analysis])
  const strategicActionPlan = useMemo(() => safeParseArray(analysis?.actionPlan || analysis?.recommendedFocusAreas), [analysis])

  // Extract unique career interests
  const careerOptions = useMemo(() => {
    const list = []
    if (Array.isArray(profile?.careerInterests)) {
      profile.careerInterests.forEach((c, idx) => {
        const title = typeof c === 'string' ? c : c?.title
        const level = typeof c === 'object' && c?.level ? c.level : (idx === 0 ? 'Primary' : 'Secondary')
        if (title && !list.some((item) => item.title.toLowerCase() === title.toLowerCase())) {
          list.push({ title, level })
        }
      })
    }
    if (list.length === 0) {
      if (analysis?.targetRole) {
        list.push({ title: analysis.targetRole, level: 'Primary' })
      } else {
        list.push(
          { title: 'Frontend Developer', level: 'Primary' },
          { title: 'Full-Stack Developer', level: 'Secondary' },
          { title: 'Backend Developer', level: 'Secondary' }
        )
      }
    }
    return list
  }, [profile, analysis])

  const currentRole = selectedRole || careerOptions[0]?.title || analysis?.targetRole || 'Software Engineer'

  // Helper to distinguish whether a missing skill is related to existing skills
  const getSkillRelation = (sk) => {
    if (!sk) {
      return { isRelated: false, relatedTo: null, description: 'Role requirement.' }
    }

    if (sk.relationType && sk.relatedToSkill) {
      return {
        isRelated: sk.relationType === 'RELATED_UPGRADE',
        relatedTo: sk.relatedToSkill,
        description:
          sk.reasoning ||
          `Based on your existing experience in ${sk.relatedToSkill}, mastering ${sk.name || ''} is a high-yield enhancement.`,
      }
    }

    const skillNameStr = typeof sk === 'string' ? sk : sk?.name || ''
    const lower = skillNameStr.toLowerCase()

    const allKnownSkills = [
      ...proficientSkills.map((s) => (typeof s === 'string' ? s : s?.name || '')),
      ...skillsToUpgrade.map((s) => (typeof s === 'string' ? s : s?.name || '')),
      ...(profile?.skills || []).map((s) => (typeof s === 'string' ? s : s?.name || '')),
    ].filter(Boolean)

    const matchesKnown = allKnownSkills.find((ks) => {
      const ksStr = typeof ks === 'string' ? ks : ks?.name || ''
      const ksLower = ksStr.toLowerCase()
      if (!ksLower) return false
      if (lower.includes('react') && ksLower.includes('javascript')) return true
      if (lower.includes('typescript') && ksLower.includes('javascript')) return true
      if (lower.includes('next') && ksLower.includes('react')) return true
      if (lower.includes('tailwind') && (ksLower.includes('css') || ksLower.includes('html'))) return true
      if (lower.includes('node') && ksLower.includes('javascript')) return true
      if (lower.includes('express') && (ksLower.includes('node') || ksLower.includes('javascript'))) return true
      if (lower.includes('docker') && ksLower.includes('linux')) return true
      return false
    })

    if (matchesKnown) {
      return {
        isRelated: true,
        relatedTo: matchesKnown,
        description: `Directly builds upon your verified skills in ${matchesKnown}.`,
      }
    }

    return {
      isRelated: false,
      relatedTo: null,
      description: `Core prerequisite for competitive ${currentRole} positions.`,
    }
  }

  // Missing Skills Breakdown
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

  const totalEvaluatedSkills = proficientSkills.length + skillsToUpgrade.length + missingSkills.length

  // Filtered skills list
  const filteredSkillsList = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    let items = []

    if (activeFilter === 'all' || activeFilter === 'missing') {
      const missingMapped = missingSkills
        .map((sk) => {
          const item = typeof sk === 'string' ? { name: sk } : sk
          return {
            ...item,
            type: 'missing',
            relation: getSkillRelation(item),
          }
        })
        .filter((sk) => {
          if (missingSkillRelationFilter === 'related') return sk.relation?.isRelated
          if (missingSkillRelationFilter === 'career') return !sk.relation?.isRelated
          return true
        })
      items.push(...missingMapped)
    }

    if (activeFilter === 'all' || activeFilter === 'upgrade') {
      const upgradeMapped = skillsToUpgrade.map((sk) => {
        const item = typeof sk === 'string' ? { name: sk } : sk
        return {
          ...item,
          type: 'upgrade',
        }
      })
      items.push(...upgradeMapped)
    }

    if (activeFilter === 'all' || activeFilter === 'ready') {
      const readyMapped = proficientSkills.map((sk) => {
        if (typeof sk === 'string') {
          return { name: sk, type: 'ready', currentLevel: 'Proficient' }
        }
        return { ...sk, type: 'ready' }
      })
      items.push(...readyMapped)
    }

    if (query) {
      items = items.filter(
        (sk) =>
          sk.name?.toLowerCase().includes(query) ||
          sk.reasoning?.toLowerCase().includes(query) ||
          sk.gap?.toLowerCase().includes(query) ||
          sk.importance?.toLowerCase().includes(query)
      )
    }

    return items
  }, [missingSkills, skillsToUpgrade, proficientSkills, activeFilter, missingSkillRelationFilter, searchQuery])

  const showToast = (msg) => {
    setSuccessToast(msg)
    setTimeout(() => setSuccessToast('') && 0, 4500)
  }

  const handleRunAnalysis = async (targetRoleOverride) => {
    const role = targetRoleOverride || currentRole
    try {
      await generateSkillAnalysis({ targetRole: role }).unwrap()
      showToast(`Skill benchmark calibrated for ${role}!`)
    } catch (err) {
      console.error('Failed to generate skill analysis:', err)
    }
  }

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
    <div className="space-y-5 max-w-5xl pb-16">
      {/* Toast Alert Notification */}
      {successToast && (
        <div className="p-3.5 rounded-xl bg-slate-900 text-white text-xs font-medium flex items-center justify-between shadow-xl animate-in fade-in slide-in-from-top-2 border border-slate-700">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast('')} className="text-slate-400 hover:text-white px-1 cursor-pointer">
            &times;
          </button>
        </div>
      )}

      {/* Header Bar with Career Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Skill Gap Analysis
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-xl font-normal">
            Real-time market audit comparing your profile against industry standards for {currentRole}.
          </p>
        </div>

        {/* Global Controls & Integrated Career Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="min-w-[210px]">
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
            className="text-xs font-medium border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 gap-1.5 h-9 rounded-xl bg-white cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Roadmap
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
          <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
          <div className="text-xs">
            <span className="font-semibold text-indigo-950">Auditing skills for {currentRole}...</span> Updating your capability matrix.
          </div>
        </div>
      )}

      {/* Empty State */}
      {!analysis && !loadingAnalysis && (
        <div className="bento-card p-10 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-150">
            <Target className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-semibold text-slate-900">No Benchmark Data for {currentRole}</h3>
            <p className="text-xs text-slate-500 font-normal">
              Run an automated AI skill audit to compare your profile with market expectations for this career.
            </p>
          </div>
          <Button
            onClick={() => handleRunAnalysis(currentRole)}
            disabled={isGeneratingAnalysis}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl gap-2 shadow-xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4" /> Run Skill Audit for {currentRole}
          </Button>
        </div>
      )}

      {/* Active Analysis Dashboard: Compact, Proportionate Career Readiness */}
      {analysis && (
        <div className="space-y-4">
          {/* Compact Readiness Strip */}
          <div className="bento-card p-4 sm:p-4.5 bg-linear-to-br from-indigo-50/40 via-white to-purple-50/20 space-y-3">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              {/* Left: Compact Radial Match Score */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90 drop-shadow-2xs" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100"
                      strokeWidth="3.5"
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
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-xs font-bold text-slate-900 leading-none">
                      {analysis.matchScore}%
                    </span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900">Readiness</span>
                    <Badge
                      className={
                        analysis.matchScore >= 75
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 text-[11px] font-medium'
                          : analysis.matchScore >= 50
                          ? 'bg-indigo-50 text-indigo-800 border-indigo-200 text-[11px] font-medium'
                          : 'bg-amber-50 text-amber-800 border-amber-200 text-[11px] font-medium'
                      }
                    >
                      {analysis.matchScore >= 75 ? 'Job Ready' : analysis.matchScore >= 50 ? 'Strong Foundation' : 'Foundation Building'}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-slate-500 font-normal flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Timeline: <strong className="text-slate-700 font-medium">{analysis.estimatedTimeToReadiness || '8–12 weeks'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Center: Executive Summary */}
              <div className="flex-1 max-w-xl">
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {analysis.summary}
                </p>
              </div>

              {/* Right: 3-Stat Skill Pill Counter */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-150 text-center">
                  <div className="text-xs font-bold text-emerald-700">{proficientSkills.length}</div>
                  <div className="text-[10px] text-emerald-600 font-medium">Job Ready</div>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-150 text-center">
                  <div className="text-xs font-bold text-amber-700">{skillsToUpgrade.length}</div>
                  <div className="text-[10px] text-amber-600 font-medium">To Upgrade</div>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-150 text-center">
                  <div className="text-xs font-bold text-rose-700">{missingSkills.length}</div>
                  <div className="text-[10px] text-rose-600 font-medium">Missing</div>
                </div>
              </div>
            </div>

            {/* Verified Strengths Strip */}
            {strengths.length > 0 && (
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-400 font-medium mr-1">Strengths:</span>
                {strengths.slice(0, 6).map((st, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
                  >
                    <Check className="w-3 h-3 text-emerald-600" />
                    {st}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Segmented Filter Pills & Live Search Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-violet-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                All Skills ({totalEvaluatedSkills})
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('missing')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeFilter === 'missing'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>Missing Skills</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeFilter === 'missing' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700'
                }`}>
                  {missingSkills.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('upgrade')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeFilter === 'upgrade'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>Needs Upgrade</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeFilter === 'upgrade' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
                }`}>
                  {skillsToUpgrade.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('ready')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeFilter === 'ready'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>Job Ready</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeFilter === 'ready' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {proficientSkills.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('focus')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeFilter === 'focus'
                    ? 'bg-violet-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Action Plan</span>
              </button>
            </div>

            {/* Live Search Input */}
            {activeFilter !== 'focus' && (
              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="Search skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-xs h-8.5 bg-white border-slate-200 rounded-xl w-full"
                />
              </div>
            )}
          </div>

          {/* Missing Skills Sub-Filter */}
          {activeFilter === 'missing' && (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-150/50 text-xs">
              <span className="text-slate-500 font-medium pl-1">Prerequisite Type:</span>
              <button
                type="button"
                onClick={() => setMissingSkillRelationFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  missingSkillRelationFilter === 'all'
                    ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All ({missingSkills.length})
              </button>
              <button
                type="button"
                onClick={() => setMissingSkillRelationFilter('related')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  missingSkillRelationFilter === 'related'
                    ? 'bg-sky-100 text-sky-800 font-semibold border border-sky-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Related to Known Skills ({missingSkillsStats.relatedCount})
              </button>
              <button
                type="button"
                onClick={() => setMissingSkillRelationFilter('career')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  missingSkillRelationFilter === 'career'
                    ? 'bg-purple-100 text-purple-800 font-semibold border border-purple-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Core Prerequisites ({missingSkillsStats.careerCount})
              </button>
            </div>
          )}

          {/* Skill Matrix List */}
          {activeFilter !== 'focus' ? (
            <div className="space-y-3">
              {filteredSkillsList.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-white border border-slate-200 text-xs text-slate-400 italic">
                  No skills found matching this filter or search query.
                </div>
              ) : (
                filteredSkillsList.map((sk, idx) => {
                  const isMissing = sk.type === 'missing'
                  const isUpgrade = sk.type === 'upgrade'
                  const isReady = sk.type === 'ready'

                  return (
                    <div key={idx} className="bento-card p-3 sm:p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      {/* Left: Skill Diagnostics */}
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold text-slate-900">{sk.name}</span>

                          {/* Status Badges */}
                          {isMissing && (
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                              Missing Skill
                            </span>
                          )}
                          {isUpgrade && (
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                              Upgrade Needed
                            </span>
                          )}
                          {isReady && (
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center">
                              <ShieldCheck className="w-3 h-3 mr-1" /> Job Ready
                            </span>
                          )}

                          {/* Relationship Intelligence */}
                          {isMissing && sk.relation?.isRelated && (
                            <span className="text-[11px] font-medium text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                              Builds on {sk.relation.relatedTo}
                            </span>
                          )}

                          {/* Priority Pill */}
                          {sk.priority && (
                            <span
                              className={`text-[9px] font-medium px-1.5 py-0.2 rounded-md uppercase tracking-wider ${
                                sk.priority.toLowerCase() === 'high'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {sk.priority}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-500 leading-relaxed font-normal">
                          {isMissing
                            ? sk.relation?.description || sk.reasoning || sk.importance || 'Target role prerequisite.'
                            : isUpgrade
                            ? sk.gap || sk.reasoning || `Practice hands-on projects to reach ${sk.requiredLevel || 'Intermediate'}.`
                            : sk.reasoning || 'Matches industry requirements for this role.'}
                        </p>
                      </div>

                      {/* Right: Progression Indicators & Update Action */}
                      <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                        {isUpgrade && (
                          <div className="flex items-center gap-1.5 text-xs font-medium">
                            <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg text-xs">
                              {sk.currentLevel}
                            </span>
                            <span className="text-slate-300">&rarr;</span>
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 text-xs">
                              {sk.requiredLevel || 'Intermediate'}
                            </span>
                          </div>
                        )}

                        {isMissing && (
                          <div className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                            Target: <span className="text-slate-700 font-semibold">{sk.requiredLevel || 'Intermediate'}</span>
                          </div>
                        )}

                        {isReady && (
                          <div className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                            {sk.currentLevel || 'Intermediate'}
                          </div>
                        )}

                        {(isMissing || isUpgrade) && (
                          <Button
                            onClick={() => handleOpenSkillUpdate(sk.name, sk.requiredLevel || 'Intermediate')}
                            variant="outline"
                            size="sm"
                            className="text-xs font-medium border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 rounded-lg h-7.5 px-2.5 gap-1 cursor-pointer bg-white"
                          >
                            <Plus className="w-3.5 h-3.5" />
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
            /* Strategic Action Plan */
            <div className="bento-card p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800">
                    Recommended Sequence of Next Steps
                  </h3>
                </div>
                <GrowthRocket3D className="w-9 h-9 shrink-0 animate-float-delayed hidden sm:block" size={36} />
              </div>

              {strategicActionPlan.length === 0 ? (
                <div className="text-xs text-slate-400 italic">
                  Continue checking off milestones in your learning roadmap.
                </div>
              ) : (
                <div className="space-y-3">
                  {strategicActionPlan.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-150 flex items-start gap-3"
                    >
                      <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-semibold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="space-y-0.5 flex-1">
                        <div className="text-xs font-semibold text-slate-900">
                          {typeof step === 'string' ? step : step.action || step.title}
                        </div>
                        {typeof step === 'object' && step.details && (
                          <p className="text-xs text-slate-500 font-normal leading-relaxed">{step.details}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Jump to Roadmap Footer Banner */}
          <div className="p-4 rounded-2xl bg-linear-to-r from-indigo-50/70 to-purple-50/50 border border-indigo-150 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-slate-700">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="font-normal">
                Want to learn missing skills step-by-step? Access study guides and unlock 12-question mastery quizzes.
              </span>
            </div>
            <Button
              onClick={() => navigate('/dashboard/learning-roadmap')}
              variant="outline"
              className="text-xs font-semibold text-indigo-600 border-indigo-200 hover:bg-white gap-1.5 h-8.5 rounded-xl shrink-0 cursor-pointer shadow-2xs"
            >
              Open Roadmap
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal: Direct User Skill Update */}
      <Dialog open={skillModalOpen} onOpenChange={setSkillModalOpen}>
        <DialogContent className="max-w-md p-6 rounded-2xl">
          <DialogHeader>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-150 text-indigo-600 flex items-center justify-center font-bold mb-1">
              <GraduationCap className="w-5 h-5" />
            </div>
            <DialogTitle className="text-base font-semibold text-slate-900">
              Update Skill Proficiency
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-normal">
              Record this skill directly into your student profile to update your market benchmark.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Skill</label>
              <Input
                type="text"
                value={skillToUpdate}
                onChange={(e) => setSkillToUpdate(e.target.value)}
                className="text-xs h-9 bg-slate-50 border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1.5">Select Current Level</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'Beginner', desc: 'Foundations & syntax' },
                  { key: 'Intermediate', desc: 'Projects & workflows' },
                  { key: 'Advanced', desc: 'Production systems' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setSkillProficiency(item.key)}
                    className={`py-2 px-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      skillProficiency === item.key
                        ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 shadow-2xs font-semibold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white font-normal'
                    }`}
                  >
                    <div className="text-xs leading-none">{item.key}</div>
                    <div className="text-[10px] text-slate-400 mt-1 leading-tight">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setSkillModalOpen(false)}
              className="text-xs cursor-pointer h-9 rounded-xl border-slate-200"
            >
              Cancel
            </Button>
            <Button
              disabled={isUpdatingSkill}
              onClick={handleConfirmSkillUpdate}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-1.5 cursor-pointer h-9 rounded-xl shadow-xs"
            >
              {isUpdatingSkill ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              Save to Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
