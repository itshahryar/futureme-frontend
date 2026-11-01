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
  Lightbulb,
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
  Layers,
  Award,
  Clock,
  AlertCircle,
} from 'lucide-react'

export default function LearningRoadmapPage() {
  const navigate = useNavigate()
  const user = useSelector(selectCurrentUser)

  const [expandedTopics, setExpandedTopics] = useState({})
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

  // Direct Skill Update Modal
  const [skillModalOpen, setSkillModalOpen] = useState(false)
  const [skillToUpdate, setSkillToUpdate] = useState('')
  const [skillProficiency, setSkillProficiency] = useState('Intermediate')

  // RTK Queries & Mutations
  const { data: profileData } = useGetStudentProfileQuery(undefined, {
    skip: user?.role !== 'STUDENT',
  })
  const profile = profileData?.profile

  const [selectedRole, setSelectedRole] = useState('')
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'curriculum' | 'quizzes'
  const [selectedMilestoneFilter, setSelectedMilestoneFilter] = useState('all') // 'all' | number

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

  // Target career options from profile (up to 3)
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

  const milestones = useMemo(() => {
    if (!learningPath?.milestones) return []
    return Array.isArray(learningPath.milestones) ? learningPath.milestones : JSON.parse(learningPath.milestones || '[]')
  }, [learningPath])

  // Progress stats
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

  // All topics flat list across milestones
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

  // Map of student's quiz submissions
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

  // Per-milestone progress calculation
  const milestoneProgress = useMemo(() => {
    return milestones.map((m, idx) => {
      let total = 0
      let done = 0
      ;(m.topics || []).forEach((t) => {
        ;(t.subtopics || []).forEach((sub) => {
          total++
          const isDone = optimisticOverrides[sub.id] !== undefined
            ? optimisticOverrides[sub.id]
            : Boolean(sub.isCompleted)
          if (isDone) done++
        })
      })
      const isComplete = total > 0 && done === total
      const percent = total > 0 ? Math.round((done / total) * 100) : 0
      return {
        milestoneNumber: m.milestoneNumber || idx + 1,
        title: m.title,
        weekRange: m.weekRange || `Phase ${idx + 1}`,
        goal: m.goal,
        skillsCovered: m.skillsCovered || [],
        topics: m.topics || [],
        total,
        done,
        percent,
        isComplete,
      }
    })
  }, [milestones, optimisticOverrides])

  // Active / current milestone in progress
  const activeMilestone = useMemo(() => {
    return milestoneProgress.find((mp) => !mp.isComplete) || milestoneProgress[0]
  }, [milestoneProgress])

  // Filtered milestones based on selected pill
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
      showToast('AI Learning Roadmap regenerated successfully!')
    } catch (err) {
      console.error('Failed to regenerate learning path:', err)
    }
  }

  const toggleSubtopic = (subtopicId, currentStatus) => {
    if (!learningPath?.id) return
    const nextStatus = !currentStatus

    // 0ms instant optimistic UI feedback
    setOptimisticOverrides((prev) => ({
      ...prev,
      [subtopicId]: nextStatus,
    }))

    // Background network sync
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

  // Phase 5: Open Learning Content & Resources Modal
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

  // Phase 6: Open Quiz / Assessment Modal
  const handleOpenQuiz = async (topic) => {
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

      const assessment = res.assessment
      setQuizData(assessment)
    } catch (err) {
      console.error('Failed to load quiz:', err)
    }
  }

  // Phase 6: Submit Quiz Answers
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
          <button onClick={() => setSuccessToast('')} className="text-white/80 hover:text-white">
            &times;
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5]">
              <BookOpen className="w-4 h-4" />
            </div>
            <h1 className="page-title text-gray-900">AI Learning Roadmap</h1>
          </div>
          <p className="page-subtitle mt-1">
            Your step-by-step learning path. Read simple guides, check helpful links, take quick practice quizzes, and check off what you learn.
          </p>
        </div>

        {/* Global CTA Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={() => navigate('/dashboard/skill-analysis')}
            variant="outline"
            className="text-xs font-semibold gap-1.5 border-gray-200 hover:border-indigo-300 hover:text-[#4F46E5]"
          >
            <Target className="w-3.5 h-3.5" />
            Skill Gap Analysis
          </Button>

          <Button
            onClick={handleRegeneratePath}
            disabled={isGeneratingPath}
            className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold gap-1.5 shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingPath ? 'animate-spin' : ''}`} />
            {learningPath ? 'Regenerate Roadmap' : 'Generate Roadmap'}
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
              Active Career Roadmap
            </div>
            <div className="text-sm font-extrabold text-gray-900 mt-0.5">
              {currentRole}
            </div>
          </div>
        </div>

        {/* Career Selection Dropdown (Up to 3 Chosen Careers) */}
        <div className="flex items-center gap-2.5">
          <label htmlFor="career-select-roadmap" className="text-xs font-semibold text-gray-600 shrink-0">
            Select Career:
          </label>
          <div className="min-w-[240px]">
            <Select
              id="career-select-roadmap"
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
        </div>
      </div>

      {/* Loading State */}
      {loadingPath && (
        <Loading
          variant="ai"
          message={`Loading your ${currentRole} Learning Roadmap...`}
          description="Retrieving multi-week milestones, weekly topics, and practical outcomes."
        />
      )}

      {/* Generating Banner */}
      {isGeneratingPath && (
        <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-indigo-900 flex items-center gap-3 animate-pulse">
          <RefreshCw className="w-4 h-4 text-[#4F46E5] animate-spin" />
          <div className="text-xs">
            <span className="font-medium text-indigo-950">Tailoring your learning roadmap...</span> Structuring multi-week milestones, topics, and practical outcomes.
          </div>
        </div>
      )}

      {/* Empty State */}
      {!learningPath && !loadingPath && (
        <div className="p-10 text-center rounded-2xl bg-white border border-gray-200 shadow-xs space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center border border-indigo-100">
            <BookOpen className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-gray-900">No Learning Roadmap Created Yet</h3>
            <p className="text-xs text-gray-500">
              Get a clear week-by-week learning plan with guides, lessons, and practice quizzes for <span className="font-semibold text-gray-800">{currentRole}</span>.
            </p>
          </div>
          <Button
            onClick={handleRegeneratePath}
            disabled={isGeneratingPath}
            className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold px-5 py-2.5 rounded-xl gap-2 shadow-xs"
          >
            <Sparkles className="w-4 h-4" /> Generate AI Learning Roadmap
          </Button>
        </div>
      )}

      {/* Active Roadmap View */}
      {learningPath && (
        <div className="space-y-6">
          {/* THREE CLEAN TABS NAVIGATION */}
          <div className="flex items-center gap-2 border-b border-gray-200 pb-px">
            {/* Tab 1: Roadmap Overview */}
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'border-[#4F46E5] text-[#4F46E5]'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Roadmap Overview
            </button>

            {/* Tab 2: Step-by-Step Lessons */}
            <button
              type="button"
              onClick={() => setActiveTab('curriculum')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'curriculum'
                  ? 'border-[#4F46E5] text-[#4F46E5]'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Step-by-Step Lessons
              <Badge className="bg-indigo-50 text-[#4F46E5] border-indigo-200 text-[10px] ml-1 font-bold">
                {progressStats.completedSubtopics} / {progressStats.totalSubtopics}
              </Badge>
            </button>

            {/* Tab 3: Practice Quizzes */}
            <button
              type="button"
              onClick={() => setActiveTab('quizzes')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'quizzes'
                  ? 'border-[#4F46E5] text-[#4F46E5]'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Practice Quizzes
              <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] ml-1 font-bold">
                {quizzesPassedCount} / {allTopics.length} Passed
              </Badge>
            </button>
          </div>

          {/* ======================================================= */}
          {/* TAB 1: ROADMAP OVERVIEW (DASHBOARD STYLE)               */}
          {/* ======================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 4 Clean Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Overall Progress */}
                <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      Overall Progress
                    </span>
                    <div className="text-2xl font-black text-gray-900">
                      {progressStats.percent}%
                    </div>
                    <p className="text-[11px] text-gray-500">
                      {progressStats.completedSubtopics} of {progressStats.totalSubtopics} lessons
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>

                {/* 2. Completed Lessons */}
                <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      Lessons Finished
                    </span>
                    <div className="text-2xl font-black text-emerald-600">
                      {progressStats.completedSubtopics}
                    </div>
                    <p className="text-[11px] text-gray-500">
                      {progressStats.totalSubtopics - progressStats.completedSubtopics} remaining to finish
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>

                {/* 3. Learning Phases */}
                <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      Learning Phases
                    </span>
                    <div className="text-2xl font-black text-gray-900">
                      {milestones.length}
                    </div>
                    <p className="text-[11px] text-gray-500">
                      {learningPath.totalDurationWeeks || 12} weeks total plan
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                </div>

                {/* 4. Quizzes Passed */}
                <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      Quizzes Passed
                    </span>
                    <div className="text-2xl font-black text-purple-600">
                      {quizzesPassedCount} / {allTopics.length}
                    </div>
                    <p className="text-[11px] text-gray-500">
                      {allTopics.length - quizzesPassedCount} quizzes remaining
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Course Progress Hero Card */}
              <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-indigo-50 text-[#4F46E5] border-indigo-200 text-[10px] font-bold">
                        {learningPath.targetRole}
                      </Badge>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {learningPath.totalDurationWeeks || 12} Weeks Structured Learning Plan
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                      {learningPath.title}
                    </h2>
                    <p className="text-xs text-gray-600 max-w-2xl leading-relaxed">
                      {learningPath.description}
                    </p>
                  </div>

                  <Button
                    onClick={() => {
                      setSelectedMilestoneFilter(activeMilestone?.milestoneNumber || 'all')
                      setActiveTab('curriculum')
                    }}
                    className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold px-4 py-2 rounded-xl gap-2 shadow-xs shrink-0 cursor-pointer self-start md:self-center"
                  >
                    Continue Lessons <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-700">Course Completion</span>
                    <span className="font-bold text-[#4F46E5]">{progressStats.percent}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#4F46E5] h-full rounded-full transition-all duration-300"
                      style={{ width: `${progressStats.percent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Visual Learning Journey Cards (Milestones 1 to 4) */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Your Learning Journey</h3>
                  <p className="text-xs text-gray-500">
                    Step through each phase to build strong skills and get ready for your career.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {milestoneProgress.map((mp) => (
                    <div
                      key={mp.milestoneNumber}
                      className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-200 transition-all"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-[#4F46E5] font-extrabold text-xs flex items-center justify-center shrink-0">
                              M{mp.milestoneNumber}
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-[#4F46E5] uppercase tracking-wider block">
                                {mp.weekRange}
                              </span>
                              <h4 className="text-xs font-bold text-gray-900 leading-snug">
                                {mp.title}
                              </h4>
                            </div>
                          </div>

                          {mp.isComplete ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold shrink-0">
                              Completed
                            </Badge>
                          ) : mp.done > 0 ? (
                            <Badge className="bg-indigo-50 text-[#4F46E5] border-indigo-200 text-[10px] font-bold shrink-0">
                              In Progress
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-600 border-0 text-[10px] shrink-0">
                              Up Next
                            </Badge>
                          )}
                        </div>

                        {mp.goal && (
                          <p className="text-xs text-gray-600 leading-relaxed">
                            <span className="font-semibold text-gray-800">Goal: </span>
                            {mp.goal}
                          </p>
                        )}

                        {/* Skills Covered Chips */}
                        {mp.skillsCovered && mp.skillsCovered.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1 pt-1">
                            {mp.skillsCovered.map((sk, sIdx) => (
                              <span
                                key={sIdx}
                                className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-50 text-slate-700 border border-slate-200"
                              >
                                {sk}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-500">
                            {mp.done} of {mp.total} lessons done
                          </span>
                          <span className="font-bold text-gray-800">{mp.percent}%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              mp.isComplete ? 'bg-emerald-500' : 'bg-[#4F46E5]'
                            }`}
                            style={{ width: `${mp.percent}%` }}
                          />
                        </div>

                        <Button
                          variant="ghost"
                          onClick={() => {
                            setSelectedMilestoneFilter(mp.milestoneNumber)
                            setActiveTab('curriculum')
                          }}
                          className="w-full text-xs font-semibold text-[#4F46E5] hover:bg-indigo-50 h-8 gap-1.5 mt-1 cursor-pointer"
                        >
                          View Phase Lessons <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 2: STEP-BY-STEP LESSONS (WITH PHASE FILTER PILLS)    */}
          {/* ======================================================= */}
          {activeTab === 'curriculum' && (
            <div className="space-y-5">
              {/* Phase Filter Bar */}
              <div className="p-3.5 rounded-xl bg-white border border-gray-200 shadow-xs flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-gray-500 mr-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-gray-400" />
                  Filter by Phase:
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedMilestoneFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedMilestoneFilter === 'all'
                      ? 'bg-[#4F46E5] text-white shadow-2xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All Phases ({milestones.length})
                </button>

                {milestones.map((m, mIdx) => {
                  const mNum = m.milestoneNumber || mIdx + 1
                  const isSelected = selectedMilestoneFilter === mNum
                  return (
                    <button
                      key={mNum}
                      type="button"
                      onClick={() => setSelectedMilestoneFilter(mNum)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#4F46E5] text-white shadow-2xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Phase {mNum}
                    </button>
                  )
                })}
              </div>

              {/* Milestone Cards */}
              <div className="space-y-5">
                {filteredMilestones.map((m, mIdx) => (
                  <div
                    key={m.milestoneNumber || mIdx}
                    className="rounded-2xl bg-white border border-gray-200 shadow-xs overflow-hidden"
                  >
                    {/* Milestone Header */}
                    <div className="p-5 bg-gradient-to-r from-slate-50 via-indigo-50/20 to-white border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center font-extrabold text-sm shadow-xs shrink-0">
                          M{m.milestoneNumber || mIdx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-[#4F46E5] uppercase tracking-wider">
                              {m.weekRange || `Phase ${mIdx + 1}`}
                            </span>
                            <span className="text-gray-300">&bull;</span>
                            <h3 className="text-sm font-bold text-gray-900">{m.title}</h3>
                          </div>
                          {m.goal && (
                            <p className="text-xs text-gray-600 mt-0.5 leading-snug">
                              Goal: <span className="font-medium text-gray-800">{m.goal}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Skills covered chips */}
                      {m.skillsCovered && m.skillsCovered.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                          {m.skillsCovered.map((sk, sIdx) => (
                            <Badge
                              key={sIdx}
                              className="bg-white text-gray-700 border-gray-200 text-[10px] font-medium"
                            >
                              {sk}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Topics List within Milestone */}
                    <div className="p-5 space-y-4">
                      {(m.topics || []).map((topic, tIdx) => {
                        const topicKey = topic.id || `m${m.milestoneNumber || mIdx + 1}-t${tIdx}`
                        const isExpanded = expandedTopics[topicKey] !== false // Default open

                        return (
                          <div
                            key={topicKey}
                            className="rounded-xl border border-gray-200 overflow-hidden bg-slate-50/40"
                          >
                            {/* Topic Row Header */}
                            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border-b border-gray-200">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-slate-100 text-slate-700 border-0 text-[10px]">
                                    {topic.skillCategory || 'Core Skill'}
                                  </Badge>
                                  <Badge className="bg-indigo-50 text-[#4F46E5] border-0 text-[10px]">
                                    {topic.difficulty || 'Intermediate'}
                                  </Badge>
                                  {topic.estimatedHours && (
                                    <span className="text-[11px] text-gray-500">
                                      &bull; ~{topic.estimatedHours} hrs
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-sm font-bold text-gray-900">
                                  {topic.title}
                                </h4>
                              </div>

                              {/* Action Buttons for this Topic */}
                              <div className="flex items-center gap-2 shrink-0">
                                {/* Topic Study Guide & Code Examples */}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleOpenContent(topic)}
                                  className="h-7 text-[11px] px-2.5 font-semibold text-gray-700 hover:text-[#4F46E5] hover:border-indigo-300 gap-1 cursor-pointer"
                                >
                                  <BookOpen className="w-3 h-3" /> Learn & Resources
                                </Button>

                                {/* Topic Quiz */}
                                <Button
                                  size="sm"
                                  onClick={() => handleOpenQuiz(topic)}
                                  className="h-7 text-[11px] px-2.5 font-semibold bg-[#4F46E5] hover:bg-[#4338CA] text-white gap-1 shadow-xs cursor-pointer"
                                >
                                  <HelpCircle className="w-3 h-3" /> Take Quiz
                                </Button>

                                {/* Direct Skill Update */}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleOpenSkillUpdate(topic.title.split(' ')[0] || topic.skillCategory || 'Skill')}
                                  title="I learned this skill - update my profile"
                                  className="h-7 text-[11px] px-2 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 gap-1 cursor-pointer"
                                >
                                  <PlusCircle className="w-3 h-3" /> Update Skill
                                </Button>

                                <button
                                  type="button"
                                  onClick={() => setExpandedTopics((prev) => ({ ...prev, [topicKey]: !isExpanded }))}
                                  className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>

                            {/* Subtopics List */}
                            {isExpanded && (
                              <div className="p-4 space-y-3 bg-white">
                                {(topic.subtopics || []).map((sub, sIdx) => {
                                  const subKey = sub.id || `${topicKey}-sub-${sIdx}`
                                  const isDone = optimisticOverrides[sub.id] !== undefined
                                    ? optimisticOverrides[sub.id]
                                    : Boolean(sub.isCompleted)

                                  return (
                                    <div
                                      key={subKey}
                                      onClick={() => toggleSubtopic(sub.id, isDone)}
                                      className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none group shadow-2xs ${
                                        isDone
                                          ? 'bg-emerald-50/40 border-emerald-300 hover:bg-emerald-50/60'
                                          : 'bg-white border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/10'
                                      }`}
                                    >
                                      <div className="flex items-start gap-3.5">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            toggleSubtopic(sub.id, isDone)
                                          }}
                                          className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-xs ${
                                            isDone
                                              ? 'bg-emerald-600 text-white ring-2 ring-emerald-300/60 ring-offset-1'
                                              : 'border-2 border-gray-300 hover:border-indigo-500 hover:scale-105 active:scale-95 bg-white text-transparent group-hover:border-indigo-400'
                                          }`}
                                          title={isDone ? 'Click to mark as incomplete' : 'Click to mark as complete'}
                                        >
                                          <Check className={`w-3.5 h-3.5 stroke-[3] transition-transform ${isDone ? 'scale-100 text-white' : 'scale-0'}`} />
                                        </button>

                                        <div className="space-y-1.5 flex-1 min-w-0">
                                          <div className="flex items-center justify-between">
                                            <h5
                                              className={`text-xs font-bold transition-all cursor-pointer ${
                                                isDone ? 'text-emerald-900 group-hover:text-emerald-950' : 'text-gray-900 group-hover:text-indigo-600'
                                              }`}
                                            >
                                              {sub.title}
                                            </h5>
                                            {isDone ? (
                                              <Badge className="bg-emerald-100 text-emerald-800 border-0 text-[9px] font-bold shrink-0">
                                                Completed
                                              </Badge>
                                            ) : (
                                              <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                Click to complete
                                              </span>
                                            )}
                                          </div>

                                          <p className="text-xs text-gray-600 leading-snug">
                                            {sub.description}
                                          </p>

                                          {/* Key concepts chips */}
                                          {sub.keyConcepts && sub.keyConcepts.length > 0 && (
                                            <div className="flex flex-wrap items-center gap-1 pt-1">
                                              <span className="text-[10px] text-gray-400 font-semibold mr-1">
                                                Key Topics:
                                              </span>
                                              {sub.keyConcepts.map((kc, kIdx) => (
                                                <span
                                                  key={kIdx}
                                                  className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                                                >
                                                  {kc}
                                                </span>
                                              ))}
                                            </div>
                                          )}

                                          {/* Practical Outcome */}
                                          {sub.practicalOutcome && (
                                            <div className="mt-1.5 p-2 rounded-lg bg-indigo-50/50 border border-indigo-100 text-[11px] text-indigo-950 flex items-start gap-1.5">
                                              <Lightbulb className="w-3.5 h-3.5 text-[#4F46E5] shrink-0 mt-0.5" />
                                              <div>
                                                <span className="font-bold text-[#4F46E5]">What you will build: </span>
                                                {sub.practicalOutcome}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
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
                ))}
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 3: PRACTICE QUIZZES (DEDICATED TESTING HUB)         */}
          {/* ======================================================= */}
          {activeTab === 'quizzes' && (
            <div className="space-y-5">
              {/* Quizzes Header Card */}
              <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-[#4F46E5] uppercase tracking-wider">
                      Knowledge Check
                    </span>
                    <span className="text-gray-300">&bull;</span>
                    <span className="text-xs text-gray-500">
                      {quizzesPassedCount} of {allTopics.length} Quizzes Passed
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Practice Quizzes for {currentRole}
                  </h3>
                  <p className="text-xs text-gray-500 max-w-xl">
                    Take short practice quizzes for each topic to test what you have learned and solidify your understanding.
                  </p>
                </div>

                <div className="shrink-0">
                  <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs px-3 py-1 font-bold">
                    {quizzesPassedCount} / {allTopics.length} Passed
                  </Badge>
                </div>
              </div>

              {/* Quizzes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allTopics.map((topic) => {
                  const sub = submissionsMap[topic.id]
                  const hasTaken = Boolean(sub)
                  const passed = Boolean(sub?.passed)

                  return (
                    <div
                      key={topic.topicKey}
                      className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-200 transition-all"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#4F46E5]">
                            Phase {topic.milestoneNumber} &bull; {topic.milestoneWeekRange || 'Milestone'}
                          </span>

                          {hasTaken ? (
                            passed ? (
                              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold shrink-0 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Passed ({sub.score}%)
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold shrink-0 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Score: {sub.score}% (Try again)
                              </Badge>
                            )
                          ) : (
                            <Badge className="bg-gray-100 text-gray-600 border-0 text-[10px] shrink-0">
                              Not taken yet
                            </Badge>
                          )}
                        </div>

                        <h4 className="text-xs font-bold text-gray-900 leading-snug">
                          {topic.title}
                        </h4>

                        <div className="flex items-center gap-2 pt-0.5">
                          <Badge className="bg-slate-100 text-slate-700 border-0 text-[10px]">
                            {topic.skillCategory || 'Core Skill'}
                          </Badge>
                          <Badge className="bg-indigo-50 text-[#4F46E5] border-0 text-[10px]">
                            {topic.difficulty || 'Intermediate'}
                          </Badge>
                          {topic.estimatedHours && (
                            <span className="text-[10px] text-gray-400">
                              ~{topic.estimatedHours} hrs study
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenContent(topic)}
                          className="h-8 text-xs text-gray-600 hover:text-[#4F46E5] hover:bg-indigo-50 gap-1.5 cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5" /> Review Lessons
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => handleOpenQuiz(topic)}
                          variant={passed ? 'outline' : 'default'}
                          className={`h-8 text-xs font-semibold gap-1.5 cursor-pointer shadow-xs ${
                            passed
                              ? 'border-gray-200 hover:border-indigo-300 hover:text-[#4F46E5]'
                              : 'bg-[#4F46E5] hover:bg-[#4338CA] text-white'
                          }`}
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          {hasTaken ? (passed ? 'Retake Quiz' : 'Try Again') : 'Take Quiz'}
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: PHASE 5 LEARNING MATERIALS & RESOURCES (DIALOG) */}
      {/* ======================================================== */}
      <Dialog open={contentModalOpen} onOpenChange={setContentModalOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-6">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Badge className="bg-indigo-50 text-[#4F46E5] border-indigo-200 text-[10px]">
                {activeContentTopic?.skillCategory || 'Core Skill'}
              </Badge>
              <Badge className="bg-slate-100 text-slate-700 border-0 text-[10px]">
                {activeContentTopic?.difficulty || 'Intermediate'}
              </Badge>
            </div>
            <DialogTitle className="text-base font-bold text-gray-900 pt-1">
              {activeContentTopic?.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Lesson guides, real code examples, and helpful links to learn this topic.
            </DialogDescription>
          </DialogHeader>

          {/* Tab Selector Inside Modal */}
          <div className="flex items-center gap-2 border-b border-gray-200 mt-2">
            <button
              onClick={() => setContentTab('materials')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                contentTab === 'materials'
                  ? 'border-[#4F46E5] text-[#4F46E5]'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Learning Guide & Notes
            </button>
            <button
              onClick={() => setContentTab('resources')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                contentTab === 'resources'
                  ? 'border-[#4F46E5] text-[#4F46E5]'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" /> Helpful Web Resources ({topicContent?.resources?.length || 0})
            </button>
          </div>

          {/* Loading indicator */}
          {isLoadingContent && !topicContent && (
            <Loading
              variant="card"
              message="Preparing your study materials..."
              description="Writing clear lesson guides, code examples, and helpful resources."
            />
          )}

          {/* Modal Tab 1: Detailed Learning Materials */}
          {topicContent && contentTab === 'materials' && (
            <div className="space-y-5 pt-2">
              {topicContent.overview && (
                <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs text-gray-700 leading-relaxed">
                  <span className="font-bold text-[#4F46E5]">Topic Overview: </span>
                  {topicContent.overview}
                </div>
              )}

              {topicContent.keyConcepts?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Key Concepts Breakdown
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {topicContent.keyConcepts.map((kc, idx) => (
                      <div key={idx} className="p-3 rounded-lg border border-gray-200 bg-white text-xs space-y-1">
                        <div className="font-bold text-gray-900">{kc.concept || kc.title || `Concept ${idx + 1}`}</div>
                        <p className="text-gray-600 leading-snug">{kc.summary || kc.description || kc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {topicContent.detailedContent && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#4F46E5]" /> Lesson Guide
                  </h4>
                  <div className="p-4 rounded-xl bg-slate-50 border border-gray-200 text-xs text-gray-800 leading-relaxed whitespace-pre-line font-sans">
                    {topicContent.detailedContent}
                  </div>
                </div>
              )}

              {topicContent.codeExamples?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-indigo-600" /> Real Code Example
                  </h4>
                  {topicContent.codeExamples.map((ex, cIdx) => (
                    <div key={cIdx} className="rounded-xl border border-gray-800 bg-slate-900 text-slate-100 overflow-hidden text-xs">
                      <div className="px-3.5 py-2 bg-slate-950/80 border-b border-gray-800 flex items-center justify-between">
                        <span className="font-mono text-[11px] text-slate-300">{ex.title || 'Code Snippet'}</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(ex.code)
                            setCopiedCodeIdx(cIdx)
                            setTimeout(() => setCopiedCodeIdx(null), 2000)
                          }}
                          className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white cursor-pointer"
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
                      <pre className="p-3.5 overflow-x-auto font-mono text-[11px] text-emerald-400 leading-relaxed">
                        <code>{ex.code}</code>
                      </pre>
                      {ex.explanation && (
                        <div className="p-2.5 bg-slate-950 border-t border-gray-800 text-[11px] text-slate-400">
                          {ex.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {(topicContent.bestPractices?.length > 0 || topicContent.commonPitfalls?.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {topicContent.bestPractices?.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs space-y-1.5">
                      <div className="font-bold text-emerald-900 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Best Practices
                      </div>
                      <ul className="space-y-1 list-disc list-inside text-emerald-950/80 text-[11px]">
                        {topicContent.bestPractices.map((bp, i) => (
                          <li key={i}>{bp}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {topicContent.commonPitfalls?.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-200 text-xs space-y-1.5">
                      <div className="font-bold text-rose-900 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Pitfalls to Avoid
                      </div>
                      <ul className="space-y-1 list-disc list-inside text-rose-950/80 text-[11px]">
                        {topicContent.commonPitfalls.map((pf, i) => (
                          <li key={i}>{pf}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Modal Tab 2: Curated External Resources */}
          {topicContent && contentTab === 'resources' && (
            <div className="space-y-3 pt-2">
              {(!topicContent.resources || topicContent.resources.length === 0) ? (
                <div className="text-xs text-gray-500 text-center py-6">No external links found.</div>
              ) : (
                topicContent.resources.map((res, rIdx) => (
                  <div
                    key={rIdx}
                    className="p-3.5 rounded-xl border border-gray-200 bg-white hover:border-indigo-300 transition-colors flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-gray-900">{res.title}</span>
                        <Badge className="bg-indigo-50 text-[#4F46E5] border-0 text-[9px] font-semibold">
                          {res.type || 'Resource'}
                        </Badge>
                        {res.isFree && (
                          <Badge className="bg-emerald-50 text-emerald-700 border-0 text-[9px]">
                            Free
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-600 leading-snug">{res.description}</p>
                    </div>

                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 text-gray-700 hover:text-[#4F46E5] font-semibold text-xs transition-colors shrink-0"
                    >
                      Open <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))
              )}
            </div>
          )}

          <DialogFooter className="mt-4 pt-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="text-[11px] text-gray-500">
              Ready to verify this topic? Pass the quiz to upgrade your profile skill.
            </div>
            <Button
              onClick={() => handleOpenQuiz(activeContentTopic)}
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" /> Take Topic Quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* MODAL 2: PHASE 6 QUIZ & ASSESSMENT (DIALOG)              */}
      {/* ======================================================== */}
      <Dialog open={quizModalOpen} onOpenChange={setQuizModalOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto p-6">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Badge className="bg-indigo-50 text-[#4F46E5] border-indigo-200 text-[10px]">
                Practice Quiz
              </Badge>
              <span className="text-[11px] text-gray-500">&bull; Pass Mark: 70%</span>
            </div>
            <DialogTitle className="text-base font-bold text-gray-900 pt-1">
              {activeQuizTopic?.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Answer the questions below to test what you have learned.
            </DialogDescription>
          </DialogHeader>

          {/* Loading Quiz */}
          {isLoadingAssessment && !quizData && (
            <Loading
              variant="card"
              message="Generating your topic quiz..."
              description="Preparing realistic multiple-choice questions to test your practical knowledge."
            />
          )}

          {/* Active Quiz Taking View */}
          {quizData && !quizResult && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between text-xs text-gray-500 border-b border-gray-150 pb-2">
                <span className="font-semibold text-gray-700">
                  Question {quizCurrentIdx + 1} of {quizData.questions?.length || 0}
                </span>
                <span className="text-[11px] text-indigo-600 font-medium">
                  {Object.keys(quizAnswers).length} answered
                </span>
              </div>

              {quizData.questions?.[quizCurrentIdx] && (
                <div className="space-y-3">
                  {quizData.questions[quizCurrentIdx].scenario && (
                    <div className="p-3 rounded-lg bg-slate-50 border border-gray-200 text-[11px] text-gray-600 leading-snug">
                      <span className="font-semibold text-gray-800">Scenario: </span>
                      {quizData.questions[quizCurrentIdx].scenario}
                    </div>
                  )}

                  <h4 className="text-sm font-bold text-gray-900 leading-snug">
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
                              ? 'border-[#4F46E5] bg-indigo-50 text-[#4F46E5] font-semibold'
                              : 'border-gray-200 hover:border-gray-300 text-gray-800 bg-white'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold ${
                            isSelected ? 'bg-[#4F46E5] text-white' : 'bg-slate-100 text-gray-600'
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

              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={quizCurrentIdx === 0}
                  onClick={() => setQuizCurrentIdx((prev) => Math.max(0, prev - 1))}
                  className="text-xs cursor-pointer"
                >
                  Previous
                </Button>

                {quizCurrentIdx < (quizData.questions?.length - 1) ? (
                  <Button
                    size="sm"
                    onClick={() => setQuizCurrentIdx((prev) => prev + 1)}
                    className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs cursor-pointer"
                  >
                    Next Question
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    disabled={isSubmittingAssessment}
                    onClick={handleSubmitQuiz}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5 cursor-pointer"
                  >
                    {isSubmittingAssessment ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Submit Answers
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Quiz Result View */}
          {quizResult && (
            <div className="space-y-5 pt-2">
              <div className={`p-5 rounded-2xl border text-center space-y-2 ${
                quizResult.passed
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-xs mx-auto">
                  {quizResult.passed ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                  )}
                </div>
                <h3 className="text-lg font-extrabold tracking-tight">
                  {quizResult.passed ? 'Quiz Passed! 🎉' : 'Quiz Completed'}
                </h3>
                <div className="text-xs font-medium">
                  Your Score: <span className="font-extrabold text-sm">{quizResult.score}%</span> &bull; {quizResult.correctCount} of {quizResult.totalQuestions} correct
                </div>
              </div>

              {quizResult.passed && (
                <div className="p-4 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 text-white shadow-md space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" /> Skill Upgrade Unlocked!
                  </div>
                  <p className="text-xs text-emerald-100 leading-snug">
                    Great job! You showed you know <span className="font-bold text-white">{quizResult.skillName || activeQuizTopic?.title}</span> well! Update your profile level to show what you learned.
                  </p>
                  <Button
                    onClick={() => {
                      handleOpenSkillUpdate(quizResult.skillName || activeQuizTopic?.title.split(' ')[0], 'Intermediate')
                      setQuizModalOpen(false)
                    }}
                    className="w-full bg-white text-emerald-800 hover:bg-slate-100 font-bold text-xs rounded-lg mt-1 cursor-pointer"
                  >
                    Confirm & Upgrade Profile Skill
                  </Button>
                </div>
              )}

              <div className="space-y-3 pt-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Question Review & Explanations
                </h4>
                {(quizResult.results || []).map((r, rIdx) => (
                  <div
                    key={rIdx}
                    className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                      r.isCorrect ? 'bg-emerald-50/40 border-emerald-200' : 'bg-rose-50/40 border-rose-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-gray-900">{r.question}</span>
                      <Badge className={r.isCorrect ? 'bg-emerald-100 text-emerald-800 border-0' : 'bg-rose-100 text-rose-800 border-0'}>
                        {r.isCorrect ? 'Correct' : 'Incorrect'}
                      </Badge>
                    </div>
                    {r.explanation && (
                      <p className="text-[11px] text-gray-600 leading-snug pt-0.5">
                        <span className="font-semibold text-gray-800">Explanation: </span>
                        {r.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <DialogFooter className="pt-2">
                <Button
                  onClick={() => setQuizModalOpen(false)}
                  className="bg-gray-900 hover:bg-black text-white text-xs font-semibold cursor-pointer"
                >
                  Close & Continue Roadmap
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
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold mb-1">
              <GraduationCap className="w-5 h-5" />
            </div>
            <DialogTitle className="text-base font-bold text-gray-900">
              Update Learned Skill in Profile
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
              <label className="text-xs font-semibold text-gray-700 block mb-1">Proficiency Level</label>
              <div className="grid grid-cols-3 gap-2">
                {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSkillProficiency(level)}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                      skillProficiency === level
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                    }`}
                  >
                    {level}
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
              Save Skill to Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
