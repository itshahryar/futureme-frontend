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
  RealisticTrophyMastery,
  MilestoneBeacon3D,
  RealisticLearningStack,
} from '@/components/illustrations3d'
import {
  BookOpen,
  Sparkles,
  Target,
  CheckCircle2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Check,
  HelpCircle,
  GraduationCap,
  Copy,
  CheckCheck,
  FileText,
  ArrowRight,
  Award,
  Lock,
  RotateCcw,
} from 'lucide-react'
import confetti from 'canvas-confetti'

export default function LearningRoadmapPage() {
  const navigate = useNavigate()
  const user = useSelector(selectCurrentUser)
  const isStudent = user?.role === 'STUDENT'

  // UI State
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
  const [quizResult, setQuizResult] = useState(null)
  const [quizReviewFilter, setQuizReviewFilter] = useState('all') // 'all' | 'incorrect' | 'correct'

  // Skill Update Modal
  const [skillModalOpen, setSkillModalOpen] = useState(false)
  const [skillToUpdate, setSkillToUpdate] = useState('')
  const [skillProficiency, setSkillProficiency] = useState('Intermediate')

  // RTK Queries & Mutations
  const { data: profileData } = useGetStudentProfileQuery(undefined, {
    skip: !isStudent,
  })
  const profile = profileData?.profile

  const [selectedRole, setSelectedRole] = useState('')
  const { data: analysisData } = useGetSkillAnalysisQuery(undefined, { skip: !isStudent })
  const {
    data: learningPathData,
    isLoading: loadingPath,
    refetch: refetchPath,
  } = useGetLearningPathQuery(selectedRole || undefined, { skip: !isStudent })
  const { data: assessmentsData, refetch: refetchSubmissions } = useGetMyAssessmentsQuery(undefined, { skip: !isStudent })
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
    return list
  }, [profile, analysis])

  const currentRole = selectedRole || careerOptions[0]?.title || learningPath?.targetRole || analysis?.targetRole || 'Software Engineer'

  // Milestones list
  const milestones = useMemo(() => {
    if (!learningPath?.milestones) return []
    return Array.isArray(learningPath.milestones)
      ? learningPath.milestones
      : JSON.parse(learningPath.milestones || '[]')
  }, [learningPath])

  // Flattened topics across all milestones
  const allTopics = useMemo(() => {
    const list = []
    milestones.forEach((m, mIdx) => {
      (m.topics || []).forEach((t, tIdx) => {
        list.push({
          ...t,
          topicKey: t.id || `topic-${m.milestoneNumber || mIdx + 1}-${tIdx}`,
          milestoneNumber: m.milestoneNumber || mIdx + 1,
          milestoneTitle: m.title,
        })
      })
    })
    return list
  }, [milestones])

  // Count total subtopics and completed subtopics (with 0ms optimistic overrides)
  const { totalSubtopics, completedSubtopics, progressPercentage } = useMemo(() => {
    let total = 0
    let completed = 0

    allTopics.forEach((t) => {
      const subs = t.subtopics || []
      total += subs.length
      subs.forEach((s) => {
        const isDone = optimisticOverrides[s.id] !== undefined
          ? optimisticOverrides[s.id]
          : Boolean(s.isCompleted)
        if (isDone) completed++
      })
    })

    const pct = total > 0 ? Math.round((completed / total) * 100) : 0
    return { totalSubtopics: total, completedSubtopics: completed, progressPercentage: pct }
  }, [allTopics, optimisticOverrides])

  // Submissions map
  const submissionsMap = useMemo(() => {
    const map = {}
    const assessments = assessmentsData?.assessments || assessmentsData?.submissions || []
    if (Array.isArray(assessments)) {
      assessments.forEach((sub) => {
        if (!map[sub.topicId] || sub.score > map[sub.topicId].score) {
          map[sub.topicId] = sub
        }
      })
    }
    return map
  }, [assessmentsData])

  const passedQuizzesCount = useMemo(() => {
    return Object.values(submissionsMap).filter((s) => s.passed).length
  }, [submissionsMap])

  // Filtered milestones based on phase pill
  const filteredMilestones = useMemo(() => {
    if (selectedMilestoneFilter === 'all') return milestones
    return milestones.filter((m, idx) => (m.milestoneNumber || idx + 1) === Number(selectedMilestoneFilter))
  }, [milestones, selectedMilestoneFilter])

  // Helpers
  const showToast = (msg) => {
    setSuccessToast(msg)
    setTimeout(() => setSuccessToast('') && 0, 4500)
  }

  const handleRegeneratePath = async () => {
    try {
      await generateLearningPath({ targetRole: currentRole }).unwrap()
      showToast(`Personalized roadmap generated for ${currentRole}!`)
      refetchPath()
    } catch (err) {
      console.error('Failed to regenerate roadmap:', err)
    }
  }

  // 0ms Optimistic Subtopic Toggle
  const toggleSubtopic = async (subtopicId, currentVal) => {
    const nextVal = !currentVal
    setOptimisticOverrides((prev) => ({ ...prev, [subtopicId]: nextVal }))

    try {
      await updateSubtopicStatus({
        pathId: learningPath?.id,
        subtopicId,
        completed: nextVal,
      }).unwrap()
    } catch (err) {
      console.error('Failed to toggle subtopic:', err)
      setOptimisticOverrides((prev) => {
        const copy = { ...prev }
        delete copy[subtopicId]
        return copy
      })
    }
  }

  // Mark all subtopics complete for a topic
  const handleMarkAllLessonsComplete = async (topic) => {
    const subs = topic.subtopics || []
    const newOverrides = { ...optimisticOverrides }
    subs.forEach((s) => {
      newOverrides[s.id] = true
    })
    setOptimisticOverrides(newOverrides)

    for (const s of subs) {
      try {
        await updateSubtopicStatus({
          pathId: learningPath?.id,
          subtopicId: s.id,
          completed: true,
        }).unwrap()
      } catch (e) {
        console.error(e)
      }
    }
    showToast(`All lessons completed for ${topic.title}!`)
  }

  // Topic progress calculation
  const getTopicLessonProgress = (topic) => {
    const subs = topic.subtopics || []
    const total = subs.length
    if (total === 0) return { total: 0, done: 0, isFinished: true, percent: 100 }

    let done = 0
    subs.forEach((s) => {
      const isDone = optimisticOverrides[s.id] !== undefined
        ? optimisticOverrides[s.id]
        : Boolean(s.isCompleted)
      if (isDone) done++
    })

    const isFinished = done === total
    const percent = Math.round((done / total) * 100)
    return { total, done, isFinished, percent }
  }

  // Open Content Study Guide Modal
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
    setContentModalOpen(false)
    setActiveQuizTopic(topic)
    setQuizAnswers({})
    setQuizResult(null)
    setQuizReviewFilter('all')
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

  const handleRetakeQuiz = () => {
    setQuizAnswers({})
    setQuizResult(null)
    setQuizReviewFilter('all')
  }

  const handleSelectQuizAnswer = (qId, optionText) => {
    if (quizResult) return
    setQuizAnswers((prev) => ({ ...prev, [qId]: optionText }))
  }

  const handleSubmitQuiz = async () => {
    if (!quizData?.questions || !activeQuizTopic) return

    const formattedAnswers = quizData.questions.map((q) => ({
      questionId: q.id,
      selectedAnswer: quizAnswers[q.id] || '',
    }))

    try {
      const res = await submitAssessmentApi({
        topicId: activeQuizTopic.id,
        answers: formattedAnswers,
        quizId: quizData.id,
      }).unwrap()

      const sub = res.submission || res
      setQuizResult(sub)
      refetchSubmissions()

      if (sub.passed) {
        try {
          confetti({
            particleCount: 75,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#4F46E5', '#10B981', '#F59E0B', '#38BDF8'],
          })
        } catch {}
      }
    } catch (err) {
      console.error('Failed to submit quiz:', err)
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
      {/* Toast Alert */}
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
            Learning Roadmap
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-xl font-normal">
            Structured step-by-step milestones, verified study guides, and 12-question scenario assessments for {currentRole}.
          </p>
        </div>

        {/* Action Controls & Career Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="min-w-[210px]">
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
            className="text-xs font-medium border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 gap-1.5 h-9 rounded-xl bg-white cursor-pointer"
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
        <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-indigo-950 flex items-center gap-3 text-xs animate-pulse">
          <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
          <div>
            <span className="font-semibold">Tailoring your curriculum...</span> Organizing multi-week milestones, study guides, and practice quizzes.
          </div>
        </div>
      )}

      {/* Empty State */}
      {!learningPath && !loadingPath && (
        <div className="bento-card p-10 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-150">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-semibold text-slate-900">No Learning Roadmap Created Yet</h3>
            <p className="text-xs text-slate-500 font-normal">
              Generate a custom step-by-step curriculum for <span className="font-semibold text-slate-800">{currentRole}</span> with interactive lessons and practical assessments.
            </p>
          </div>
          <Button
            onClick={handleRegeneratePath}
            disabled={isGeneratingPath}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl gap-2 shadow-xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4" /> Generate Curriculum for {currentRole}
          </Button>
        </div>
      )}

      {/* Active Roadmap View */}
      {learningPath && (
        <div className="space-y-4">
          {/* Sleek, Compact Progress Header with 3D Beacon Accent */}
          <div className="bento-card p-3.5 sm:p-4 rounded-xl bg-linear-to-br from-indigo-50/40 via-white to-purple-50/20 space-y-2.5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-900">Roadmap Progress</span>
                  <span className="text-slate-300">&bull;</span>
                  <span className="text-xs font-medium text-indigo-600">{currentRole}</span>
                </div>
                <div className="text-[11px] text-slate-500 font-normal">
                  {completedSubtopics} of {totalSubtopics} lessons checked off &bull; {passedQuizzesCount} of {allTopics.length} assessments passed
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <MilestoneBeacon3D className="w-10 h-10 shrink-0 animate-float-slow hidden sm:block" size={40} />
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-slate-900">
                    {progressPercentage}%
                  </span>
                  <span className="text-xs text-slate-400 font-normal">complete</span>
                </div>
              </div>
            </div>

            {/* Slender, elegant progress bar */}
            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-linear-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* View Switcher Tabs (Lighter Violet / Indigo Tone) */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveView('roadmap')}
                className={`px-3.5 py-2 rounded-lg text-xs transition-all cursor-pointer ${
                  activeView === 'roadmap'
                    ? 'bg-violet-500 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
                }`}
              >
                Milestones & Topics ({allTopics.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveView('assessments')}
                className={`px-3.5 py-2 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeView === 'assessments'
                    ? 'bg-violet-500 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>My Assessments</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                  activeView === 'assessments' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'
                }`}>
                  {passedQuizzesCount}
                </span>
              </button>
            </div>
          </div>

          {/* VIEW 1: ROADMAP MILESTONES */}
          {activeView === 'roadmap' && (
            <div className="space-y-3">
              {/* Milestone Phase Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200/80 pb-2">
                <button
                  type="button"
                  onClick={() => setSelectedMilestoneFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                    selectedMilestoneFilter === 'all'
                      ? 'bg-violet-500 text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
                  }`}
                >
                  All Milestones ({milestones.length})
                </button>
                {milestones.map((m, idx) => {
                  const mNum = m.milestoneNumber || idx + 1
                  const isSelected = selectedMilestoneFilter === mNum
                  return (
                    <button
                      key={m.id || idx}
                      type="button"
                      onClick={() => setSelectedMilestoneFilter(mNum)}
                      className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-violet-500 text-white shadow-xs font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
                      }`}
                    >
                      Phase {mNum}
                    </button>
                  )
                })}
              </div>

              {/* Milestones List (Clean, Compact Cards) */}
              <div className="space-y-2">
                {filteredMilestones.map((m, mIdx) => {
                  const mNum = m.milestoneNumber || mIdx + 1
                  const isCollapsed =
                    collapsedMilestones[m.id || mIdx] !== undefined
                      ? collapsedMilestones[m.id || mIdx]
                      : selectedMilestoneFilter === 'all' && mIdx > 0
                  const topics = m.topics || []

                  return (
                    <div key={m.id || mIdx} className="bento-card rounded-xl overflow-hidden">
                      {/* Milestone Header */}
                      <div
                        onClick={() =>
                          setCollapsedMilestones((prev) => ({
                            ...prev,
                            [m.id || mIdx]: !isCollapsed,
                          }))
                        }
                        className="px-3 py-2 bg-slate-50/70 hover:bg-slate-100/70 transition-colors flex items-center justify-between gap-2.5 cursor-pointer border-b border-slate-150"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-5.5 h-5.5 rounded-md bg-indigo-600 text-white font-semibold text-[10px] flex items-center justify-center shadow-xs shrink-0">
                            P{mNum}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10.5px] font-semibold text-indigo-600">
                                Milestone {mNum}
                              </span>
                              <span className="text-slate-300">&bull;</span>
                              <span className="text-[10px] text-slate-400 font-normal">
                                Weeks {m.weekStart || mNum * 2 - 1}–{m.weekEnd || mNum * 2}
                              </span>
                            </div>
                            <h3 className="text-xs font-semibold text-slate-900 leading-tight">{m.title}</h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">
                            {topics.length} Topics
                          </span>
                          {isCollapsed ? (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                          ) : (
                            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                      </div>

                      {/* Milestone Topics */}
                      {!isCollapsed && (
                        <div className="p-2 sm:p-2.5 space-y-1.5 divide-y divide-slate-100">
                          {topics.map((t, tIdx) => {
                            const { total, done, isFinished } = getTopicLessonProgress(t)
                            const isTopicExpanded = expandedTopics[t.id || tIdx]
                            const subtopics = t.subtopics || []
                            const submission = submissionsMap[t.id]
                            const isQuizPassed = Boolean(submission?.passed)

                            return (
                              <div key={t.id || tIdx} className={tIdx > 0 ? 'pt-1.5' : ''}>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                                  {/* Topic Title & Badges */}
                                  <div className="space-y-0.5 flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      <span className="text-xs font-semibold text-slate-900">
                                        {t.title}
                                      </span>
                                      {t.difficulty && (
                                        <span className={`text-[9px] font-medium px-1.5 py-0.2 rounded-full ${
                                          t.difficulty.toLowerCase() === 'easy'
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                            : t.difficulty.toLowerCase() === 'hard'
                                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                                        }`}>
                                          {t.difficulty}
                                        </span>
                                      )}
                                      {isQuizPassed && (
                                        <span className="text-[10px] font-medium px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center">
                                          <Check className="w-2.5 h-2.5 mr-0.5" /> Quiz Passed ({submission.score}%)
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10.5px] text-slate-500 font-normal line-clamp-1">{t.description}</p>
                                  </div>

                                  {/* Action Buttons (Study Guide & Quiz) */}
                                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleOpenContent(t)}
                                      className="text-[10.5px] font-medium border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 rounded-lg h-6.5 px-2 gap-1 cursor-pointer bg-white"
                                    >
                                      <BookOpen className="w-3 h-3" />
                                      Study Guide
                                    </Button>

                                    <Button
                                      size="sm"
                                      onClick={() => handleOpenQuiz(t)}
                                      className={`text-[10.5px] font-medium rounded-lg h-6.5 px-2 gap-1 cursor-pointer shadow-2xs ${
                                        isQuizPassed
                                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-semibold'
                                          : isFinished
                                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white font-semibold'
                                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                                      }`}
                                    >
                                      {isQuizPassed ? (
                                        <>
                                          <CheckCircle2 className="w-3 h-3" /> Retake
                                        </>
                                      ) : isFinished ? (
                                        <>
                                          <HelpCircle className="w-3 h-3" /> Take Quiz
                                        </>
                                      ) : (
                                        <>
                                          <Lock className="w-3 h-3" /> Quiz ({done}/{total})
                                        </>
                                      )}
                                    </Button>

                                    {/* Subtopics Toggle */}
                                    {subtopics.length > 0 && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setExpandedTopics((prev) => ({
                                            ...prev,
                                            [t.id || tIdx]: !prev[t.id || tIdx],
                                          }))
                                        }
                                        className="p-1 text-slate-400 hover:text-slate-800 rounded-md hover:bg-slate-100 cursor-pointer"
                                        title="Toggle lesson subtopics"
                                      >
                                        {isTopicExpanded ? (
                                          <ChevronUp className="w-3.5 h-3.5" />
                                        ) : (
                                          <ChevronDown className="w-3.5 h-3.5" />
                                        )}
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Expandable Subtopics List with 0ms Checkmarks */}
                                {isTopicExpanded && subtopics.length > 0 && (
                                  <div className="mt-2 pl-3 border-l-2 border-indigo-200 py-1.5 px-2 bg-slate-50/70 rounded-r-lg space-y-1">
                                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
                                      <span>Lessons ({done}/{total})</span>
                                      {!isFinished && (
                                        <button
                                          type="button"
                                          onClick={() => handleMarkAllLessonsComplete(t)}
                                          className="text-indigo-600 hover:underline cursor-pointer text-[10px] font-medium"
                                        >
                                          Mark all complete
                                        </button>
                                      )}
                                    </div>
                                    {subtopics.map((sub, sIdx) => {
                                      const isDone =
                                        optimisticOverrides[sub.id] !== undefined
                                          ? optimisticOverrides[sub.id]
                                          : Boolean(sub.isCompleted)
                                      return (
                                        <label
                                          key={sub.id || sIdx}
                                          className="flex items-center gap-2 text-[11px] text-slate-700 cursor-pointer select-none hover:text-slate-900"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={isDone}
                                            onChange={() => toggleSubtopic(sub.id, isDone)}
                                            className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                                          />
                                          <span className={isDone ? 'line-through text-slate-400 font-normal' : 'font-normal'}>
                                            {sub.title}
                                          </span>
                                        </label>
                                      )
                                    })}
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
            </div>
          )}

          {/* VIEW 2: MY ASSESSMENTS HISTORY */}
          {activeView === 'assessments' && (
            <div className="bento-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-semibold text-slate-900">My Assessment Attempts</h3>
                </div>
                <span className="text-xs text-slate-500 font-normal">
                  {passedQuizzesCount} passed out of {allTopics.length} total topics
                </span>
              </div>

              {Object.keys(submissionsMap).length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 italic">
                  No assessments completed yet. Finish all lessons for a topic to unlock its 12-question quiz!
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {Object.values(submissionsMap).map((sub, idx) => (
                    <div key={sub.id || idx} className="py-3 flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-900">{sub.topicTitle}</span>
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              sub.passed
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {sub.passed ? 'Passed' : 'Needs Review'} ({sub.score}%)
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-normal">
                          {sub.correctAnswers || 0} of {sub.totalQuestions || 12} correct answers
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {sub.passed && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenSkillUpdate(sub.topicTitle)}
                            className="text-xs font-medium border-slate-200 text-slate-700 hover:text-indigo-600 rounded-xl h-8 gap-1 cursor-pointer bg-white"
                          >
                            <GraduationCap className="w-3.5 h-3.5" /> Add to Profile
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => {
                            const topicObj = allTopics.find((t) => t.id === sub.topicId) || {
                              id: sub.topicId,
                              title: sub.topicTitle,
                            }
                            handleOpenQuiz(topicObj)
                          }}
                          className="text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-8 gap-1 cursor-pointer"
                        >
                          Review Quiz
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: VERIFIED STUDY GUIDE CONTENT                     */}
      {/* ======================================================== */}
      <Dialog open={contentModalOpen} onOpenChange={setContentModalOpen}>
        <DialogContent className="max-w-lg sm:max-w-xl max-h-[75vh] overflow-y-auto p-4 sm:p-5 rounded-xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                  Curriculum Study Guide
                </span>
              </div>
              <RealisticLearningStack className="w-9 h-9 shrink-0 animate-float-slow hidden sm:block" size={36} />
            </div>
            <DialogTitle className="text-base font-bold text-slate-900 mt-1">
              {activeContentTopic?.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-normal">
              Verified industry concepts, architectural blueprints, and curated reading resources.
            </DialogDescription>
          </DialogHeader>

          {isLoadingContent ? (
            <div className="py-10 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin" />
              <p className="text-xs text-slate-500 font-normal">Generating in-depth study guide...</p>
            </div>
          ) : topicContent ? (
            <div className="space-y-3 pt-1 text-xs">
              {/* Concept Overview */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-150 space-y-1">
                <span className="font-semibold text-slate-900 block text-xs">Core Overview</span>
                <p className="text-slate-600 leading-relaxed font-normal text-xs">
                  {topicContent.summary || topicContent.overview}
                </p>
              </div>

              {/* Key Concept Takeaways */}
              {Array.isArray(topicContent.keyConcepts) && topicContent.keyConcepts.length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-semibold text-slate-900 block text-xs">Key Principles</span>
                  <div className="space-y-1">
                    {topicContent.keyConcepts.map((k, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-slate-600 font-normal text-xs">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{typeof k === 'string' ? k : k.concept || k.title || k.point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Code Snippet */}
              {Array.isArray(topicContent.codeExamples) && topicContent.codeExamples.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 text-xs">Code Architecture Example</span>
                    <button
                      type="button"
                      onClick={() => {
                        const codeStr = topicContent.codeExamples.map((c) => c.code || c).join('\n')
                        navigator.clipboard.writeText(codeStr)
                        setCopiedCodeIdx('all')
                        setTimeout(() => setCopiedCodeIdx(null), 2000)
                      }}
                      className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer font-medium text-[11px]"
                    >
                      {copiedCodeIdx === 'all' ? (
                        <CheckCheck className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>{copiedCodeIdx === 'all' ? 'Copied' : 'Copy Code'}</span>
                    </button>
                  </div>
                  <pre className="p-2.5 rounded-lg bg-slate-900 text-slate-100 font-mono text-[10px] max-h-36 overflow-auto leading-relaxed">
                    <code>{topicContent.codeExamples.map((c) => c.code || c).join('\n\n')}</code>
                  </pre>
                </div>
              )}

              {/* Curated Resources */}
              {Array.isArray(topicContent.resources) && topicContent.resources.length > 0 && (
                <div className="space-y-1.5 pt-1 border-t border-slate-150">
                  <span className="font-semibold text-slate-900 block text-xs">Official Documentation & References</span>
                  <div className="space-y-1">
                    {topicContent.resources.map((r, idx) => (
                      <a
                        key={idx}
                        href={typeof r === 'string' ? r : r.url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-md bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 flex items-center justify-between border border-indigo-150 text-xs transition-colors"
                      >
                        <span className="font-medium truncate max-w-sm">
                          {typeof r === 'string' ? r : r.title || r.url}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-400 italic">
              Study guide could not be retrieved. Please try again.
            </div>
          )}

          <DialogFooter className="mt-3 pt-2.5 border-t border-slate-150 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setContentModalOpen(false)}
              className="text-xs cursor-pointer h-8 rounded-lg border-slate-200"
            >
              Close
            </Button>
            {activeContentTopic && (
              <Button
                onClick={() => {
                  setContentModalOpen(false)
                  handleOpenQuiz(activeContentTopic)
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-1.5 cursor-pointer h-8 rounded-lg shadow-xs"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Proceed to Quiz
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* ======================================================== */}
      {/* MODAL 2: 12-QUESTION SCENARIO MASTERY QUIZ                */}
      {/* ======================================================== */}
      <Dialog open={quizModalOpen} onOpenChange={setQuizModalOpen}>
        <DialogContent className="max-w-lg sm:max-w-xl max-h-[78vh] overflow-y-auto p-4 sm:p-5 rounded-xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                Assessment Benchmark (70% Passing Threshold)
              </span>
            </div>
            <DialogTitle className="text-base font-bold text-slate-900 mt-1">
              {activeQuizTopic?.title} Assessment
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-normal">
              12 scenario questions to test readiness. Passing saves verified skills to your profile.
            </DialogDescription>
          </DialogHeader>

          {isLoadingAssessment && (
            <div className="py-10 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin" />
              <p className="text-xs text-slate-500 font-normal">Generating 12-question scenario assessment...</p>
            </div>
          )}

          {/* Active Quiz Questions View */}
          {!isLoadingAssessment && quizData && !quizResult && (
            <div className="space-y-3.5 pt-1">
              <div className="flex items-center justify-between text-xs text-slate-500 p-2 rounded-lg bg-slate-50 border border-slate-150">
                <span className="font-medium text-slate-700">Questions: {quizData.questions?.length || 12} scenarios</span>
                <span>Answered: {Object.keys(quizAnswers).length} of {quizData.questions?.length || 12}</span>
              </div>

              <div className="space-y-2.5 max-h-[44vh] overflow-y-auto pr-1">
                {quizData.questions?.map((q, qIdx) => {
                  const selected = quizAnswers[q.id]
                  return (
                    <div key={q.id || qIdx} className="p-2.5 sm:p-3 rounded-lg border border-slate-200 bg-white space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="w-4.5 h-4.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {qIdx + 1}
                        </span>
                        <div className="text-xs font-medium text-slate-900 leading-snug">
                          {q.question}
                        </div>
                      </div>

                      <div className="space-y-1.5 pl-6.5">
                        {q.options?.map((opt, optIdx) => {
                          const isOptSelected = selected === opt
                          return (
                            <label
                              key={optIdx}
                              onClick={() => handleSelectQuizAnswer(q.id, opt)}
                              className={`flex items-center gap-2 p-1.5 px-2 rounded-md border text-xs cursor-pointer transition-colors ${
                                isOptSelected
                                  ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 font-medium'
                                  : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white font-normal'
                              }`}
                            >
                              <div
                                className={`w-3 h-3 rounded-full border flex items-center justify-center shrink-0 ${
                                  isOptSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                                }`}
                              >
                                {isOptSelected && <div className="w-1 h-1 rounded-full bg-white" />}
                              </div>
                              <span className="leading-snug text-[11.5px]">{opt}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="pt-2.5 border-t border-slate-150 flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setQuizModalOpen(false)}
                  className="text-xs cursor-pointer h-8 rounded-lg border-slate-200"
                >
                  Cancel
                </Button>

                <Button
                  disabled={isSubmittingAssessment || Object.keys(quizAnswers).length === 0}
                  onClick={handleSubmitQuiz}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-1.5 cursor-pointer h-8 rounded-lg shadow-xs"
                >
                  {isSubmittingAssessment ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  Submit Assessment ({Object.keys(quizAnswers).length}/{quizData.questions?.length || 12})
                </Button>
              </div>
            </div>
          )}

          {/* Results View with Realistic Trophy on Passing */}
          {quizResult && (() => {
            const results = quizResult.results || []
            const totalCount = results.length || quizResult.totalQuestions || 12
            const correctCount = quizResult.correctCount !== undefined
              ? quizResult.correctCount
              : results.filter((r) => r.isCorrect).length
            const incorrectCount = totalCount - correctCount
            const passed = quizResult.passed

            const filteredReviewResults = results.filter((r) => {
              if (quizReviewFilter === 'incorrect') return !r.isCorrect
              if (quizReviewFilter === 'correct') return r.isCorrect
              return true
            })

            return (
              <div className="space-y-3 pt-1">
                {/* Celebration Banner on Passing */}
                {passed && (
                  <div className="p-3.5 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between shadow-md shadow-emerald-500/15">
                    <div className="space-y-0.5">
                      <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-white/20 text-white">
                        Assessment Passed!
                      </span>
                      <h3 className="text-lg font-bold">Score: {quizResult.score}%</h3>
                      <p className="text-[11px] text-emerald-100 font-normal">
                        You passed with {correctCount} of {totalCount} correct answers!
                      </p>
                    </div>

                    <div className="shrink-0">
                      <RealisticTrophyMastery className="w-14 h-14 animate-float-slow" size={56} />
                    </div>
                  </div>
                )}

                {/* Score Pill Bar */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-medium text-slate-800 text-[11px]">
                    Correct: <strong className="text-emerald-600 font-semibold">{correctCount}</strong> &bull; Wrong: <strong className="text-rose-600 font-semibold">{incorrectCount}</strong>
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setQuizReviewFilter('all')}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-medium cursor-pointer ${
                        quizReviewFilter === 'all' ? 'bg-violet-500 text-white font-semibold' : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      All ({totalCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuizReviewFilter('incorrect')}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-medium cursor-pointer ${
                        quizReviewFilter === 'incorrect' ? 'bg-rose-600 text-white font-semibold' : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Wrong ({incorrectCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuizReviewFilter('correct')}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-medium cursor-pointer ${
                        quizReviewFilter === 'correct' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Correct ({correctCount})
                    </button>
                  </div>
                </div>

                {/* Answer Differences & Explanations */}
                <div className="space-y-2 max-h-[35vh] overflow-y-auto pr-1">
                  {filteredReviewResults.map((r, rIdx) => (
                    <div
                      key={r.questionId || rIdx}
                      className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                        r.isCorrect
                          ? 'bg-emerald-50/40 border-emerald-200 text-slate-800'
                          : 'bg-rose-50/40 border-rose-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold text-[11px]">
                        <span>Question {rIdx + 1}</span>
                        <span className={r.isCorrect ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-semibold'}>
                          {r.isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                      <p className="font-medium text-slate-900 text-xs leading-snug">{r.question}</p>

                      <div className="space-y-0.5 pt-0.5 text-[10.5px]">
                        <div>Your Answer: <strong className={r.isCorrect ? 'text-emerald-700 font-medium' : 'text-rose-700 font-medium'}>{r.userAnswer || 'Not answered'}</strong></div>
                        {!r.isCorrect && (
                          <div>Correct Answer: <strong className="text-emerald-700 font-medium">{r.correctAnswer}</strong></div>
                        )}
                        {r.explanation && (
                          <div className="text-slate-600 italic font-normal">{r.explanation}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions (Upgrade Skill & Retake) */}
                <div className="flex items-center justify-between pt-2.5 border-t border-slate-200">
                  <Button
                    variant="outline"
                    onClick={handleRetakeQuiz}
                    className="text-xs font-medium rounded-lg h-8 px-3 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" /> Retake Quiz
                  </Button>

                  {passed && (
                    <Button
                      onClick={() => handleOpenSkillUpdate(activeQuizTopic?.title || 'Skill')}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg h-8 px-3 gap-1.5 shadow-xs cursor-pointer"
                    >
                      <GraduationCap className="w-4 h-4" /> Upgrade Profile Skill
                    </Button>
                  )}
                </div>
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>

      {/* Skill Update Modal */}
      <Dialog open={skillModalOpen} onOpenChange={setSkillModalOpen}>
        <DialogContent className="max-w-sm sm:max-w-md p-4 sm:p-5 rounded-xl">
          <DialogHeader>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-150 text-indigo-600 flex items-center justify-center font-bold mb-1">
              <GraduationCap className="w-4 h-4" />
            </div>
            <DialogTitle className="text-base font-semibold text-slate-900">
              Upgrade Profile Skill
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-normal">
              Elevate your verified capability on your profile after passing this assessment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-1">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Skill</label>
              <Input
                type="text"
                value={skillToUpdate}
                onChange={(e) => setSkillToUpdate(e.target.value)}
                className="text-xs h-8.5 bg-slate-50 border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Proficiency Level</label>
              <div className="grid grid-cols-3 gap-2">
                {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSkillProficiency(lvl)}
                    className={`py-1.5 px-2 rounded-lg border text-center transition-all cursor-pointer text-xs ${
                      skillProficiency === lvl
                        ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 font-semibold shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white font-normal'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setSkillModalOpen(false)}
              className="text-xs cursor-pointer h-8 px-3 rounded-lg border-slate-200"
            >
              Cancel
            </Button>
            <Button
              disabled={isUpdatingSkill}
              onClick={handleConfirmSkillUpdate}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-1.5 cursor-pointer h-8 px-3 rounded-lg shadow-xs"
            >
              {isUpdatingSkill ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Elevate Skill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
