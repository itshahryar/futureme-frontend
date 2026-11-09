import { useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { selectCurrentUser } from '@/store/slices/authSlice'
import { useGetStudentProfileQuery } from '@/store/api/onboardingApiSlice'
import {
  useGetSkillAnalysisQuery,
  useGetLearningPathQuery,
  useGenerateLearningPathMutation,
  useUpdateSubtopicStatusMutation,
  useGetTopicContentMutation,
  useGetTopicAssessmentMutation,
  useSubmitAssessmentMutation,
  useUpdateLearnedSkillMutation,
  useGetMyAssessmentsQuery,
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
  BookOpen,
  Sparkles,
  Target,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Check,
  Calendar,
  ExternalLink,
  Code2,
  HelpCircle,
  GraduationCap,
  Copy,
  CheckCheck,
  PlusCircle,
  FileText,
  Bookmark,
  ArrowRight,
  TrendingUp,
  Award,
  Lock,
  Layers,
  ChevronRight,
  Compass,
  PlayCircle,
} from 'lucide-react'

export default function LearningRoadmapPage() {
  const navigate = useNavigate()
  const user = useSelector(selectCurrentUser)

  // UI state
  const [activeView, setActiveView] = useState('roadmap') // 'roadmap' | 'assessments'
  const [selectedMilestoneFilter, setSelectedMilestoneFilter] = useState('all') // 'all' | number
  const [expandedTopics, setExpandedTopics] = useState({})
  const [collapsedMilestones, setCollapsedMilestones] = useState({})
  const [copiedCodeIdx, setCopiedCodeIdx] = useState(null)
  const [successToast, setSuccessToast] = useState('')
  const [optimisticOverrides, setOptimisticOverrides] = useState({})

  // Modals state
  const [contentModalOpen, setContentModalOpen] = useState(false)
  const [activeContentTopic, setActiveContentTopic] = useState(null)
  const [topicContent, setTopicContent] = useState(null)
  const [contentTab, setContentTab] = useState('materials') // 'materials' | 'resources'

  const [quizModalOpen, setQuizModalOpen] = useState(false)
  const [activeQuizTopic, setActiveQuizTopic] = useState(null)
  const [quizData, setQuizData] = useState(null)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizCurrentIdx, setQuizCurrentIdx] = useState(0)
  const [quizResult, setQuizResult] = useState(null)

  // Skill Update Modal
  const [skillModalOpen, setSkillModalOpen] = useState(false)
  const [skillToUpdate, setSkillToUpdate] = useState('')
  const [skillProficiency, setSkillProficiency] = useState('Intermediate')

  // RTK Queries & Mutations
  const { data: profileData } = useGetStudentProfileQuery(undefined, {
    skip: user?.role !== 'STUDENT',
  })
  const profile = profileData?.profile

  const [selectedRole, setSelectedRole] = useState('')
  const { data: analysisData } = useGetSkillAnalysisQuery()
  const { data: learningPathData, isLoading: loadingPath } = useGetLearningPathQuery(selectedRole || undefined)
  const { data: assessmentsData } = useGetMyAssessmentsQuery()
  const [generateLearningPath, { isLoading: isGeneratingPath }] = useGenerateLearningPathMutation()

  const [updateSubtopicStatus] = useUpdateSubtopicStatusMutation()
  const [getTopicContentApi, { isLoading: isLoadingContent }] = useGetTopicContentMutation()
  const [getTopicAssessmentApi, { isLoading: isLoadingAssessment }] = useGetTopicAssessmentMutation()
  const [submitAssessmentApi, { isLoading: isSubmittingAssessment }] = useSubmitAssessmentMutation()
  const [updateLearnedSkillApi, { isLoading: isUpdatingSkill }] = useUpdateLearnedSkillMutation()

  const analysis = analysisData?.analysis
  const learningPath = learningPathData?.learningPath

  // Available career options from student profile
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
    return list.slice(0, 3)
  }, [profile, analysis])

  const currentRole = selectedRole || careerOptions[0]?.title || learningPath?.targetRole || analysis?.targetRole || 'Software Engineer'

  // Structured milestones array
  const milestones = useMemo(() => {
    if (!learningPath?.milestones) return []
    return Array.isArray(learningPath.milestones) ? learningPath.milestones : JSON.parse(learningPath.milestones || '[]')
  }, [learningPath])

  // Overall progress stats
  const progressStats = useMemo(() => {
    let totalSubtopics = 0
    let completedSubtopics = 0

    milestones.forEach((m) => {
      (m.topics || []).forEach((t) => {
        (t.subtopics || []).forEach((sub) => {
          totalSubtopics++
          const done = optimisticOverrides[sub.id] !== undefined
            ? optimisticOverrides[sub.id]
            : Boolean(sub.isCompleted)
          if (done) completedSubtopics++
        })
      })
    })

    const percent = totalSubtopics > 0 ? Math.round((completedSubtopics / totalSubtopics) * 100) : 0
    return { totalSubtopics, completedSubtopics, percent }
  }, [milestones, optimisticOverrides])

  // Flat list of topics for easy lookup & gradebook
  const allTopics = useMemo(() => {
    const list = []
    milestones.forEach((m, mIdx) => {
      (m.topics || []).forEach((t, tIdx) => {
        list.push({
          ...t,
          topicKey: t.id || `topic-${m.milestoneNumber || mIdx + 1}-${tIdx}`,
          milestoneNumber: m.milestoneNumber || mIdx + 1,
          milestoneTitle: m.title,
          milestoneWeekRange: m.weekRange,
        })
      })
    })
    return list
  }, [milestones])

  // Quiz submissions lookup
  const submissionsMap = useMemo(() => {
    const map = {}
    const subs = assessmentsData?.submissions || []
    subs.forEach((s) => {
      if (!map[s.topicId] || new Date(s.submittedAt) > new Date(map[s.topicId].submittedAt)) {
        map[s.topicId] = s
      }
    })
    return map
  }, [assessmentsData])

  const quizzesPassedCount = useMemo(() => {
    return Object.values(submissionsMap).filter((s) => s.passed).length
  }, [submissionsMap])

  // Filtered milestones based on phase pill
  const filteredMilestones = useMemo(() => {
    if (selectedMilestoneFilter === 'all') return milestones
    return milestones.filter((m, idx) => (m.milestoneNumber || idx + 1) === selectedMilestoneFilter)
  }, [milestones, selectedMilestoneFilter])

  const showToast = (msg) => {
    setSuccessToast(msg)
    setTimeout(() => setSuccessToast(''), 4500)
  }

  // --- ACTIONS ---
  const handleRegeneratePath = async () => {
    try {
      await generateLearningPath({
        analysisId: analysis?.id,
        targetRole: currentRole,
      }).unwrap()
      showToast('Learning roadmap updated successfully!')
    } catch (err) {
      console.error('Failed to regenerate learning path:', err)
    }
  }

  const toggleSubtopic = (subtopicId, currentStatus) => {
    if (!learningPath?.id) return
    const nextStatus = !currentStatus

    // 0ms optimistic UI update
    setOptimisticOverrides((prev) => ({
      ...prev,
      [subtopicId]: nextStatus,
    }))

    updateSubtopicStatus({
      pathId: learningPath.id,
      subtopicId,
      completed: nextStatus,
    })
      .unwrap()
      .catch((err) => {
        console.error('Failed to toggle subtopic:', err)
        setOptimisticOverrides((prev) => ({
          ...prev,
          [subtopicId]: currentStatus,
        }))
      })
  }

  // Check subtopic completion progress for a topic
  const getTopicLessonProgress = (topic) => {
    const subtopics = topic?.subtopics || []
    if (subtopics.length === 0) return { total: 0, done: 0, isFinished: true, percent: 100 }
    let done = 0
    subtopics.forEach((sub) => {
      const isDone = optimisticOverrides[sub.id] !== undefined
        ? optimisticOverrides[sub.id]
        : Boolean(sub.isCompleted)
      if (isDone) done++
    })
    return {
      total: subtopics.length,
      done,
      isFinished: done === subtopics.length,
      percent: Math.round((done / subtopics.length) * 100),
    }
  }

  // Mark all subtopics of a topic complete
  const handleMarkAllLessonsComplete = async (topic) => {
    if (!learningPath?.id || !topic) return
    const subtopics = topic.subtopics || []
    if (subtopics.length === 0) return

    const nextOverrides = {}
    subtopics.forEach((sub) => {
      nextOverrides[sub.id] = true
    })
    setOptimisticOverrides((prev) => ({ ...prev, ...nextOverrides }))

    try {
      await Promise.all(
        subtopics.map((sub) =>
          updateSubtopicStatus({
            pathId: learningPath.id,
            subtopicId: sub.id,
            completed: true,
          }).unwrap()
        )
      )
      showToast(`All lessons for "${topic.title}" finished! Quiz unlocked.`)
    } catch (err) {
      console.error('Failed to mark all subtopics complete:', err)
    }
  }

  // Open Study Guide Modal
  const handleOpenContent = async (topic) => {
    setActiveContentTopic(topic)
    setContentTab('materials')
    setContentModalOpen(true)
    setTopicContent(null)

    try {
      const res = await getTopicContentApi({
        topicId: topic.id,
        topicTitle: topic.title,
        skillCategory: topic.skillCategory,
        difficulty: topic.difficulty,
        targetRole: currentRole,
        subtopics: topic.subtopics || [],
      }).unwrap()

      const mat = res.material
      setTopicContent({
        ...mat,
        keyConcepts: typeof mat.keyConcepts === 'string' ? JSON.parse(mat.keyConcepts) : mat.keyConcepts || [],
        codeExamples: typeof mat.codeExamples === 'string' ? JSON.parse(mat.codeExamples) : mat.codeExamples || [],
        bestPractices: typeof mat.bestPractices === 'string' ? JSON.parse(mat.bestPractices) : mat.bestPractices || [],
        resources: typeof mat.resources === 'string' ? JSON.parse(mat.resources) : mat.resources || [],
      })
    } catch (err) {
      console.error('Failed to load topic content:', err)
    }
  }

  // Open Quiz Modal
  const handleOpenQuiz = async (topic) => {
    const { isFinished, done, total } = getTopicLessonProgress(topic)
    if (!isFinished) {
      showToast(`Please complete all ${total} lessons for "${topic?.title}" before taking the quiz. (${done}/${total} completed)`)
      return
    }

    setContentModalOpen(false)
    setActiveQuizTopic(topic)
    setQuizAnswers({})
    setQuizCurrentIdx(0)
    setQuizResult(null)
    setQuizModalOpen(true)
    setQuizData(null)

    try {
      const res = await getTopicAssessmentApi({
        topicId: topic.id,
        topicTitle: topic.title,
        skillCategory: topic.skillCategory,
        difficulty: topic.difficulty,
        targetRole: currentRole,
      }).unwrap()

      setQuizData(res.assessment)
    } catch (err) {
      console.error('Failed to load quiz:', err)
    }
  }

  // Submit Quiz
  const handleSubmitQuiz = async () => {
    if (!activeQuizTopic?.id) return

    try {
      const res = await submitAssessmentApi({
        topicId: activeQuizTopic.id,
        answers: quizAnswers,
        pathId: learningPath?.id,
      }).unwrap()

      setQuizResult(res)
    } catch (err) {
      console.error('Failed to submit quiz:', err)
    }
  }

  // Direct Skill Update Handlers
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
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      {/* Toast Alert */}
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

      {/* Modern, Clean Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Curriculum Path
            </span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-xs font-medium text-slate-500">
              {learningPath?.totalDurationWeeks || 12} Weeks
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            AI Learning Roadmap
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Structured step-by-step milestones, verified study guides, and 12-question practice quizzes tailored for your target role.
          </p>
        </div>

        {/* Action Controls & Career Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="min-w-[200px]">
            <Select
              id="career-select"
              value={currentRole}
              onChange={(newRole) => setSelectedRole(newRole)}
              disabled={isGeneratingPath}
              options={careerOptions.map((opt) => ({
                value: opt.title,
                label: opt.title,
                badge: opt.level || null,
              }))}
            />
          </div>

          <Button
            onClick={() => navigate('/dashboard/skill-analysis')}
            variant="outline"
            className="text-xs font-medium border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 gap-1.5 h-9"
          >
            <Target className="w-3.5 h-3.5" />
            Skill Gap
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loadingPath && (
        <Loading
          variant="ai"
          message={`Loading your ${currentRole} curriculum...`}
          description="Retrieving personalized milestones, weekly topics, and practical outcomes."
        />
      )}

      {/* Generating Banner */}
      {isGeneratingPath && (
        <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 text-indigo-950 flex items-center gap-3 text-xs animate-pulse">
          <RefreshCw className="w-4 h-4 text-[#4F46E5] animate-spin shrink-0" />
          <div>
            <span className="font-semibold">Tailoring your curriculum...</span> Organizing multi-week milestones, study guides, and practice quizzes.
          </div>
        </div>
      )}

      {/* Empty State */}
      {!learningPath && !loadingPath && (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
          <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center border border-indigo-100">
            <Compass className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-900">No Learning Roadmap Created Yet</h3>
            <p className="text-xs text-slate-500">
              Generate a custom step-by-step curriculum for <span className="font-semibold text-slate-800">{currentRole}</span> with interactive lessons and practical assessments.
            </p>
          </div>
          <Button
            onClick={handleRegeneratePath}
            disabled={isGeneratingPath}
            className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold px-5 py-2.5 rounded-xl gap-2 shadow-xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4" /> Generate AI Learning Roadmap
          </Button>
        </div>
      )}

      {/* Active Roadmap Container */}
      {learningPath && (
        <div className="space-y-6">
          {/* Unified Compact Progress Strip (Single clean card, zero repetition) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Target Role
                </span>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  {currentRole}
                  <Badge className="bg-indigo-50 text-[#4F46E5] border-0 text-[10px] font-semibold">
                    {milestones.length} Phases
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Lessons</span>
                  <span className="font-bold text-slate-900">
                    {progressStats.completedSubtopics} / {progressStats.totalSubtopics}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Quizzes</span>
                  <span className="font-bold text-emerald-600">
                    {quizzesPassedCount} / {allTopics.length} Passed
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Overall</span>
                  <span className="font-bold text-[#4F46E5]">{progressStats.percent}%</span>
                </div>
              </div>
            </div>

            {/* Clean Progress Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#4F46E5] h-full rounded-full transition-all duration-300"
                style={{ width: `${progressStats.percent}%` }}
              />
            </div>
          </div>

          {/* Clean 2-Tab Navigation (Curriculum vs Quiz Mastery Record) */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-px">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveView('roadmap')}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                  activeView === 'roadmap'
                    ? 'border-[#4F46E5] text-[#4F46E5]'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Curriculum & Lessons
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-normal">
                  {allTopics.length} Topics
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('assessments')}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                  activeView === 'assessments'
                    ? 'border-[#4F46E5] text-[#4F46E5]'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                Practice Quizzes & Mastery
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                  quizzesPassedCount > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {quizzesPassedCount} Passed
                </span>
              </button>
            </div>

            {/* Quick Phase Filter Pills (Visible when in Curriculum view) */}
            {activeView === 'roadmap' && milestones.length > 1 && (
              <div className="hidden sm:flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSelectedMilestoneFilter('all')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                    selectedMilestoneFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  All
                </button>
                {milestones.map((m, idx) => {
                  const mNum = m.milestoneNumber || idx + 1
                  const isSelected = selectedMilestoneFilter === mNum
                  return (
                    <button
                      key={mNum}
                      type="button"
                      onClick={() => setSelectedMilestoneFilter(mNum)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      Phase {mNum}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* ======================================================= */}
          {/* VIEW 1: UNIFIED CURRICULUM ROADMAP                      */}
          {/* ======================================================= */}
          {activeView === 'roadmap' && (
            <div className="space-y-4">
              {filteredMilestones.map((m, mIdx) => {
                const mNum = m.milestoneNumber || mIdx + 1
                const isMilestoneCollapsed = Boolean(collapsedMilestones[mNum])

                // Calculate progress for this milestone
                let mTotal = 0
                let mDone = 0
                ;(m.topics || []).forEach((t) => {
                  ;(t.subtopics || []).forEach((sub) => {
                    mTotal++
                    const done = optimisticOverrides[sub.id] !== undefined
                      ? optimisticOverrides[sub.id]
                      : Boolean(sub.isCompleted)
                    if (done) mDone++
                  })
                })
                const mPercent = mTotal > 0 ? Math.round((mDone / mTotal) * 100) : 0
                const mComplete = mTotal > 0 && mDone === mTotal

                return (
                  <div
                    key={mNum}
                    className="rounded-2xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden"
                  >
                    {/* Phase Header */}
                    <div
                      onClick={() => setCollapsedMilestones((prev) => ({ ...prev, [mNum]: !isMilestoneCollapsed }))}
                      className="p-4 sm:px-5 sm:py-3.5 bg-slate-50/70 hover:bg-slate-50 border-b border-slate-200/80 flex items-center justify-between cursor-pointer select-none transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/80 px-2 py-0.5 rounded-md shrink-0">
                          Phase {mNum}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs font-bold text-slate-900">{m.title}</h3>
                            <span className="text-slate-400 text-[11px] hidden sm:inline">&bull; {m.weekRange || 'Milestone'}</span>
                          </div>
                          {m.goal && (
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {m.goal}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right hidden sm:block">
                          <span className="text-[11px] font-semibold text-slate-700">{mDone}/{mTotal} lessons</span>
                          <span className="text-slate-400 text-[10px] ml-1">({mPercent}%)</span>
                        </div>
                        {mComplete && (
                          <Badge className="bg-emerald-50 text-emerald-700 border-0 text-[10px] font-semibold hidden sm:inline-flex">
                            Completed
                          </Badge>
                        )}
                        <button type="button" className="text-slate-400 hover:text-slate-600">
                          {isMilestoneCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Topics List within Phase */}
                    {!isMilestoneCollapsed && (
                      <div className="divide-y divide-slate-100">
                        {(m.topics || []).map((topic, tIdx) => {
                          const topicKey = topic.id || `m${mNum}-t${tIdx}`
                          const isTopicExpanded = expandedTopics[topicKey] !== false // Default expanded for ease of reading
                          const { isFinished, done, total } = getTopicLessonProgress(topic)
                          const quizSubmission = submissionsMap[topic.id]
                          const hasPassedQuiz = Boolean(quizSubmission?.passed)

                          return (
                            <div key={topicKey} className="transition-colors hover:bg-slate-50/30">
                              {/* Topic Summary Bar */}
                              <div className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-start gap-3">
                                  {/* Status indicator icon */}
                                  <div className="mt-0.5 shrink-0">
                                    {hasPassedQuiz ? (
                                      <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center" title="Topic mastered & quiz passed">
                                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                      </div>
                                    ) : isFinished ? (
                                      <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center" title="Lessons finished, quiz ready">
                                        <Award className="w-3 h-3" />
                                      </div>
                                    ) : (
                                      <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-[10px]">
                                        {tIdx + 1}
                                      </div>
                                    )}
                                  </div>

                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className="text-xs font-bold text-slate-900">{topic.title}</h4>
                                      <Badge className="bg-slate-100 text-slate-600 border-0 text-[9px] font-medium">
                                        {topic.skillCategory || 'Core'}
                                      </Badge>
                                      {hasPassedQuiz && (
                                        <Badge className="bg-emerald-50 text-emerald-700 border-0 text-[9px] font-semibold">
                                          Passed ({quizSubmission.score}%)
                                        </Badge>
                                      )}
                                    </div>

                                    {/* Lessons count & estimated hours */}
                                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                      <span>{done} of {total} lessons checked</span>
                                      {topic.estimatedHours && (
                                        <>
                                          <span>&bull;</span>
                                          <span>~{topic.estimatedHours} hrs</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Direct Actions (No Repetition, Clean Hierarchy) */}
                                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                  {/* Action 1: Study Guide & Resources */}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleOpenContent(topic)}
                                    className="h-8 text-xs font-medium border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 gap-1.5 cursor-pointer"
                                  >
                                    <BookOpen className="w-3.5 h-3.5" /> Study Guide
                                  </Button>

                                  {/* Action 2: Practice Quiz (Unlocked once lessons are done) */}
                                  {isFinished ? (
                                    <Button
                                      size="sm"
                                      onClick={() => handleOpenQuiz(topic)}
                                      className={`h-8 text-xs font-semibold gap-1.5 cursor-pointer shadow-xs ${
                                        hasPassedQuiz
                                          ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                                          : 'bg-[#4F46E5] hover:bg-[#4338CA] text-white'
                                      }`}
                                    >
                                      <HelpCircle className="w-3.5 h-3.5" />
                                      {hasPassedQuiz ? 'Retake Quiz' : 'Take Quiz (12 Qs)'}
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      disabled
                                      title={`Finish all ${total} lessons to unlock this quiz`}
                                      className="h-8 text-[11px] font-normal text-slate-400 gap-1 cursor-not-allowed bg-slate-50"
                                    >
                                      <Lock className="w-3 h-3 text-slate-300" />
                                      Quiz Locked ({done}/{total})
                                    </Button>
                                  )}

                                  {/* Toggle lessons view */}
                                  <button
                                    type="button"
                                    onClick={() => setExpandedTopics((prev) => ({ ...prev, [topicKey]: !isTopicExpanded }))}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer ml-1"
                                    title={isTopicExpanded ? 'Collapse lessons' : 'Expand lessons'}
                                  >
                                    {isTopicExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              </div>

                              {/* Interactive Subtopics Checklist (When expanded) */}
                              {isTopicExpanded && (
                                <div className="px-5 pb-4 pt-1 space-y-1.5">
                                  {(topic.subtopics || []).map((sub, sIdx) => {
                                    const subKey = sub.id || `${topicKey}-sub-${sIdx}`
                                    const isDone = optimisticOverrides[sub.id] !== undefined
                                      ? optimisticOverrides[sub.id]
                                      : Boolean(sub.isCompleted)

                                    return (
                                      <div
                                        key={subKey}
                                        onClick={() => toggleSubtopic(sub.id, isDone)}
                                        className={`p-2.5 sm:px-3 sm:py-2 rounded-xl transition-all cursor-pointer select-none flex items-start gap-3 group ${
                                          isDone
                                            ? 'bg-slate-50/80 hover:bg-slate-100/80'
                                            : 'hover:bg-indigo-50/30'
                                        }`}
                                      >
                                        {/* Minimal rounded checkbox */}
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            toggleSubtopic(sub.id, isDone)
                                          }}
                                          className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
                                            isDone
                                              ? 'bg-emerald-600 text-white'
                                              : 'border border-slate-300 group-hover:border-indigo-500 bg-white'
                                          }`}
                                        >
                                          <Check className={`w-3 h-3 stroke-[3] ${isDone ? 'block' : 'hidden'}`} />
                                        </button>

                                        {/* Subtopic description */}
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center justify-between gap-2">
                                            <span className={`text-xs font-medium transition-colors ${
                                              isDone ? 'line-through text-slate-400' : 'text-slate-800 group-hover:text-indigo-600'
                                            }`}>
                                              {sub.title}
                                            </span>
                                            {isDone && (
                                              <span className="text-[10px] text-emerald-600 font-medium shrink-0">
                                                Done
                                              </span>
                                            )}
                                          </div>
                                          {sub.description && (
                                            <p className="text-[11px] text-slate-500 leading-snug line-clamp-1 mt-0.5">
                                              {sub.description}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    )
                                  })}

                                  {/* Mark all complete shortcut if not all done */}
                                  {!isFinished && (topic.subtopics || []).length > 1 && (
                                    <div className="pt-1 text-right">
                                      <button
                                        type="button"
                                        onClick={() => handleMarkAllLessonsComplete(topic)}
                                        className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                                      >
                                        Mark all {total} lessons as complete & unlock quiz &rarr;
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* ======================================================= */}
          {/* VIEW 2: QUIZ MASTERY & SKILL SUMMARY (GRADEBOOK)        */}
          {/* ======================================================= */}
          {activeView === 'assessments' && (
            <div className="space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Quiz History & Verified Skills</h3>
                <p className="text-xs text-slate-500">
                  Track your practice quiz scores across every topic. Passing with 70% or higher lets you confirm the skill directly to your student profile.
                </p>
              </div>

              {/* Clean Table of Topics and Quiz Status */}
              <div className="rounded-2xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {allTopics.map((topic) => {
                    const sub = submissionsMap[topic.id]
                    const hasTaken = Boolean(sub)
                    const passed = Boolean(sub?.passed)
                    const { isFinished, done, total } = getTopicLessonProgress(topic)

                    return (
                      <div
                        key={topic.topicKey}
                        className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold text-indigo-600 uppercase">
                              Phase {topic.milestoneNumber}
                            </span>
                            <span className="text-slate-300">&bull;</span>
                            <h4 className="text-xs font-bold text-slate-900">{topic.title}</h4>
                            <Badge className="bg-slate-100 text-slate-600 border-0 text-[9px]">
                              {topic.skillCategory}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Lessons status: {done}/{total} completed {isFinished ? '(Quiz unlocked)' : '(Finish lessons to take quiz)'}
                          </p>
                        </div>

                        {/* Quiz Status Badge & Direct Trigger */}
                        <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                          {hasTaken ? (
                            passed ? (
                              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold px-2.5 py-0.5">
                                Passed ({sub.score}%)
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs font-semibold px-2.5 py-0.5">
                                Score: {sub.score}% (Try again)
                              </Badge>
                            )
                          ) : (
                            <span className="text-[11px] text-slate-400">Not taken yet</span>
                          )}

                          {isFinished ? (
                            <Button
                              size="sm"
                              onClick={() => handleOpenQuiz(topic)}
                              className={`h-7 text-xs font-medium cursor-pointer ${
                                passed
                                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                  : 'bg-[#4F46E5] hover:bg-[#4338CA] text-white'
                              }`}
                            >
                              {hasTaken ? (passed ? 'Retake' : 'Try Again') : 'Take Quiz'}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled
                              className="h-7 text-[11px] text-slate-400 bg-slate-50 cursor-not-allowed"
                            >
                              <Lock className="w-3 h-3 text-slate-300 mr-1" /> Locked
                            </Button>
                          )}

                          {passed && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenSkillUpdate(topic.title.split(' ')[0] || topic.skillCategory || 'Skill')}
                              title="Update your student profile skill level"
                              className="h-7 text-xs text-emerald-700 hover:bg-emerald-50 gap-1 cursor-pointer"
                            >
                              <PlusCircle className="w-3 h-3" /> Update Skill
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: STUDY GUIDE & RESOURCES (DISTRACTION-FREE)      */}
      {/* ======================================================== */}
      <Dialog open={contentModalOpen} onOpenChange={setContentModalOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-6 sm:p-7 rounded-2xl bg-white">
          <DialogHeader className="space-y-1 pb-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                {activeContentTopic?.skillCategory || 'Core Skill'}
              </span>
              <span className="text-slate-300">&bull;</span>
              <span className="text-xs font-medium text-slate-500">
                {activeContentTopic?.difficulty || 'Intermediate'}
              </span>
              {activeContentTopic?.estimatedHours && (
                <>
                  <span className="text-slate-300">&bull;</span>
                  <span className="text-xs text-slate-500">~{activeContentTopic.estimatedHours} hrs study</span>
                </>
              )}
            </div>
            <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">
              {activeContentTopic?.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              In-depth technical walkthrough, production code implementation, and verified direct learning resources.
            </DialogDescription>
          </DialogHeader>

          {/* Clean Segmented Pill Switcher */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100/80 border border-slate-200/60 mt-1 select-none">
            <button
              type="button"
              onClick={() => setContentTab('materials')}
              className={`px-3.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                contentTab === 'materials'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Study Guide & Code
            </button>
            <button
              type="button"
              onClick={() => setContentTab('resources')}
              className={`px-3.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                contentTab === 'resources'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" /> Curated Resources ({topicContent?.resources?.length || 4})
            </button>
          </div>

          {/* Loading state */}
          {isLoadingContent && !topicContent && (
            <Loading
              variant="card"
              message="Loading study guide..."
              description="Retrieving technical walkthrough, production code snippets, and verified links."
            />
          )}

          {/* Tab 1: Study Guide & Code */}
          {topicContent && contentTab === 'materials' && (
            <div className="space-y-4 pt-2">
              {topicContent.overview && (
                <div className="p-3.5 rounded-xl bg-slate-50/80 border-l-2 border-[#4F46E5] text-xs text-slate-700 leading-relaxed font-normal">
                  <span className="font-semibold text-slate-900">Module Overview: </span>
                  {topicContent.overview}
                </div>
              )}

              {topicContent.detailedContent && (
                <div className="p-4 rounded-xl bg-slate-50/40 border border-slate-200/80 text-xs text-slate-800 leading-relaxed whitespace-pre-line font-sans">
                  {topicContent.detailedContent}
                </div>
              )}

              {/* Code Snippets */}
              {topicContent.codeExamples?.length > 0 && (
                <div className="space-y-2 pt-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-indigo-600" /> Production Code
                  </h4>
                  {topicContent.codeExamples.map((ex, cIdx) => (
                    <div key={cIdx} className="rounded-xl border border-slate-800 bg-slate-950 text-slate-100 overflow-hidden text-xs shadow-xs">
                      <div className="px-3.5 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-mono font-bold text-indigo-400 bg-indigo-950/80 px-1.5 py-0.5 rounded">
                            {ex.language || 'Code'}
                          </span>
                          <span className="font-mono text-[11px] text-slate-300">{ex.title || 'Implementation Snippet'}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(ex.code)
                            setCopiedCodeIdx(cIdx)
                            setTimeout(() => setCopiedCodeIdx(null), 2000)
                          }}
                          className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white cursor-pointer transition-colors"
                        >
                          {copiedCodeIdx === cIdx ? (
                            <>
                              <CheckCheck className="w-3 h-3 text-emerald-400" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> Copy
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-4 overflow-x-auto font-mono text-[11px] text-emerald-400 leading-relaxed">
                        <code>{ex.code}</code>
                      </pre>
                      {ex.explanation && (
                        <div className="p-2.5 bg-slate-900/60 border-t border-slate-800 text-[11px] text-slate-400">
                          {ex.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Curated Resources */}
          {topicContent && contentTab === 'resources' && (
            <div className="space-y-3 pt-2">
              {(!topicContent.resources || topicContent.resources.length === 0) ? (
                <div className="text-xs text-slate-500 text-center py-6">No external links found.</div>
              ) : (
                topicContent.resources.map((res, rIdx) => {
                  const typeLower = (res.type || '').toLowerCase()
                  const Icon =
                    typeLower.includes('video')
                      ? PlayCircle
                      : typeLower.includes('doc')
                      ? BookOpen
                      : typeLower.includes('interactive') || typeLower.includes('code')
                      ? Code2
                      : FileText

                  return (
                    <div
                      key={rIdx}
                      className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-indigo-300 transition-colors flex items-start justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#4F46E5] group-hover:text-white transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-slate-900">{res.title}</span>
                            <Badge className="bg-slate-100 text-slate-600 border-0 text-[9px] font-medium">
                              {res.type || 'Resource'}
                            </Badge>
                            {res.isFree && (
                              <Badge className="bg-emerald-50 text-emerald-700 border-0 text-[9px]">
                                Free
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 leading-snug">{res.description}</p>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {res.domain}
                          </div>
                        </div>
                      </div>

                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-[#4F46E5] font-semibold text-xs transition-colors shrink-0 cursor-pointer"
                      >
                        Open <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )
                })
              )}
            </div>
          )}

          <DialogFooter className="mt-4 pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500">
              {(() => {
                const { isFinished, done, total } = getTopicLessonProgress(activeContentTopic)
                if (isFinished) {
                  return <span className="text-emerald-700 font-medium flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-600" /> All {total} lessons completed</span>
                }
                return `${done} of ${total} lessons checked off.`
              })()}
            </div>

            <div className="flex items-center gap-2">
              {(() => {
                const { isFinished } = getTopicLessonProgress(activeContentTopic)
                if (isFinished) {
                  return (
                    <Button
                      onClick={() => handleOpenQuiz(activeContentTopic)}
                      className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold gap-1.5 cursor-pointer shadow-xs"
                    >
                      <HelpCircle className="w-3.5 h-3.5" /> Take Topic Quiz (12 Qs) &rarr;
                    </Button>
                  )
                }

                return (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMarkAllLessonsComplete(activeContentTopic)}
                    className="text-xs font-medium text-emerald-700 border-emerald-300 hover:bg-emerald-50 gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Mark Lessons Finished
                  </Button>
                )
              })()}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* MODAL 2: PRACTICE QUIZ (12 QUESTIONS, 4-4-4 DIFFICULTY) */}
      {/* ======================================================== */}
      <Dialog open={quizModalOpen} onOpenChange={setQuizModalOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto p-6 sm:p-7 rounded-2xl bg-white">
          <DialogHeader className="space-y-1 pb-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-indigo-50 text-[#4F46E5] border-indigo-200 text-[10px] font-semibold">
                  12-Question Assessment
                </Badge>
                {quizData?.questions?.[quizCurrentIdx]?.difficulty && !quizResult && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                    quizData.questions[quizCurrentIdx].difficulty.toLowerCase() === 'easy'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : quizData.questions[quizCurrentIdx].difficulty.toLowerCase() === 'medium'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {quizData.questions[quizCurrentIdx].difficulty} Question
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium text-slate-500">70% to pass</span>
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight">
              {activeQuizTopic?.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Answer all 12 scenario questions to test your practical knowledge and upgrade your profile skill.
            </DialogDescription>
          </DialogHeader>

          {/* Loading state */}
          {isLoadingAssessment && !quizData && (
            <Loading
              variant="card"
              message="Preparing quiz questions..."
              description="Structuring 12 practical scenario questions for this topic."
            />
          )}

          {/* Active Quiz Taking View */}
          {quizData && !quizResult && (
            <div className="space-y-4 pt-2">
              {/* Question Navigation Bar (1 to 12) */}
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-800">
                  Question {quizCurrentIdx + 1} of {quizData.questions?.length || 12}
                </span>
                <span className="text-[11px] text-indigo-600 font-medium">
                  {Object.keys(quizAnswers).length} of {quizData.questions?.length || 12} answered
                </span>
              </div>

              {quizData.questions && quizData.questions.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 select-none">
                  {quizData.questions.map((q, idx) => {
                    const isAnswered = quizAnswers[q.id] !== undefined
                    const isCurrent = quizCurrentIdx === idx
                    return (
                      <button
                        key={q.id || idx}
                        type="button"
                        onClick={() => setQuizCurrentIdx(idx)}
                        className={`w-7 h-7 rounded-lg text-[11px] font-bold flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                          isCurrent
                            ? 'bg-[#4F46E5] text-white ring-2 ring-indigo-200 shadow-xs'
                            : isAnswered
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    )
                  })}
                </div>
              )}

              {quizData.questions?.[quizCurrentIdx] && (
                <div className="space-y-3 pt-1">
                  {quizData.questions[quizCurrentIdx].scenario && (
                    <div className="p-3 rounded-lg bg-indigo-50/40 border-l-2 border-indigo-400 text-[11px] text-slate-600 leading-snug">
                      <span className="font-semibold text-slate-800">Context: </span>
                      {quizData.questions[quizCurrentIdx].scenario}
                    </div>
                  )}

                  <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                    {quizData.questions[quizCurrentIdx].question}
                  </h4>

                  <div className="space-y-2 pt-1">
                    {(quizData.questions[quizCurrentIdx].options || []).map((opt, optIdx) => {
                      const qId = quizData.questions[quizCurrentIdx].id
                      const isSelected = quizAnswers[qId] === optIdx

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => setQuizAnswers((prev) => ({ ...prev, [qId]: optIdx }))}
                          className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all flex items-start gap-3 cursor-pointer ${
                            isSelected
                              ? 'border-[#4F46E5] bg-indigo-50/70 text-[#4F46E5] font-semibold'
                              : 'border-slate-200 hover:border-slate-300 text-slate-800 bg-white'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold ${
                            isSelected ? 'bg-[#4F46E5] text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="leading-snug flex-1">{opt}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={quizCurrentIdx === 0}
                  onClick={() => setQuizCurrentIdx((prev) => Math.max(0, prev - 1))}
                  className="text-xs cursor-pointer h-8"
                >
                  Previous
                </Button>

                {quizCurrentIdx < (quizData.questions?.length - 1) ? (
                  <Button
                    size="sm"
                    onClick={() => setQuizCurrentIdx((prev) => prev + 1)}
                    className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs cursor-pointer h-8"
                  >
                    Next Question &rarr;
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    disabled={isSubmittingAssessment}
                    onClick={handleSubmitQuiz}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5 cursor-pointer h-8 shadow-xs"
                  >
                    {isSubmittingAssessment ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Submit Answers ({Object.keys(quizAnswers).length}/{quizData.questions?.length || 12})
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Results View */}
          {quizResult && (
            <div className="space-y-4 pt-2">
              <div className={`p-4 rounded-xl border text-center space-y-1.5 ${
                quizResult.passed
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}>
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-2xs mx-auto">
                  {quizResult.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  )}
                </div>
                <h3 className="text-base font-bold">
                  {quizResult.passed ? 'Quiz Passed! 🎉' : 'Quiz Completed'}
                </h3>
                <div className="text-xs">
                  Your Score: <span className="font-bold">{quizResult.score}%</span> &bull; {quizResult.correctCount} of {quizResult.totalQuestions} correct
                </div>
              </div>

              {quizResult.passed && (
                <div className="p-3.5 rounded-xl bg-slate-900 text-white space-y-1.5 shadow-sm">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <Sparkles className="w-4 h-4" /> Ready to Update Profile Skill
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Confirm your mastery in <span className="font-semibold text-white">{quizResult.skillName || activeQuizTopic?.title}</span> to upgrade your student profile score.
                  </p>
                  <Button
                    onClick={() => {
                      handleOpenSkillUpdate(quizResult.skillName || activeQuizTopic?.title.split(' ')[0], 'Intermediate')
                      setQuizModalOpen(false)
                    }}
                    className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-xs rounded-lg mt-1 cursor-pointer h-8"
                  >
                    Confirm & Update Profile Skill
                  </Button>
                </div>
              )}

              {/* Explanations */}
              <div className="space-y-2.5 max-h-[40vh] overflow-y-auto pr-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Question Review ({quizResult.totalQuestions || 12} Questions)
                </h4>
                {(quizResult.results || []).map((r, rIdx) => {
                  const diff = r.difficulty || (rIdx < 4 ? 'Easy' : rIdx < 8 ? 'Medium' : 'Hard')
                  return (
                    <div
                      key={rIdx}
                      className={`p-3 rounded-xl border text-xs space-y-1 ${
                        r.isCorrect ? 'bg-emerald-50/40 border-emerald-200' : 'bg-rose-50/40 border-rose-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-500 text-[10px]">Q{rIdx + 1}</span>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                            diff.toLowerCase() === 'easy'
                              ? 'bg-emerald-100 text-emerald-800'
                              : diff.toLowerCase() === 'medium'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {diff}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold ${r.isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {r.isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-900 leading-snug">{r.question}</p>
                      {r.explanation && (
                        <p className="text-[11px] text-slate-600 leading-snug pt-0.5">
                          <span className="font-medium text-slate-700">Explanation: </span>
                          {r.explanation}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>

              <DialogFooter className="pt-2">
                <Button
                  onClick={() => setQuizModalOpen(false)}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer w-full sm:w-auto h-8"
                >
                  Close & Continue
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* MODAL 3: DIRECT USER SKILL UPDATE                        */}
      {/* ======================================================== */}
      <Dialog open={skillModalOpen} onOpenChange={setSkillModalOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold mb-1">
              <GraduationCap className="w-5 h-5" />
            </div>
            <DialogTitle className="text-base font-bold text-slate-900">
              Update Skill in Profile
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Save this skill to your verified student profile to improve your role readiness score.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Skill Name</label>
              <Input
                type="text"
                value={skillToUpdate}
                onChange={(e) => setSkillToUpdate(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Proficiency Level</label>
              <div className="grid grid-cols-3 gap-2">
                {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSkillProficiency(level)}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                      skillProficiency === level
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4 pt-3 border-t border-slate-200">
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
              Save to Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
