import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '@/store/slices/authSlice'
import {
  useGetOnboardingConfigQuery,
  useGetStudentProfileQuery,
  useSaveOnboardingStepMutation,
  useCompleteOnboardingMutation,
} from '@/store/api/onboardingApiSlice'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Loading from '@/components/ui/Loading'
import Select from '@/components/ui/select'
import {
  GraduationCap,
  Sparkles,
  User,
  BookOpen,
  Briefcase,
  Heart,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Plus,
  Trash2,
  ExternalLink,
  Save,
  Trophy,
  ArrowRight,
  AlertCircle,
  Building2,
  Laptop,
  Globe,
  Calendar,
  Award,
} from 'lucide-react'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export default function Onboarding() {
  const navigate = useNavigate()
  const currentUser = useSelector(selectCurrentUser)

  // Fetch dynamic config & student profile
  const { data: configData, isLoading: loadingConfig } = useGetOnboardingConfigQuery()
  const { data: profileData, isLoading: loadingProfile } = useGetStudentProfileQuery()
  const [saveStepApi, { isLoading: isSavingStep }] = useSaveOnboardingStepMutation()
  const [completeOnboardingApi, { isLoading: isCompleting }] = useCompleteOnboardingMutation()

  // State
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [validationError, setValidationError] = useState('')

  // Form State: 1. About Yourself
  const [personalInfo, setPersonalInfo] = useState({
    headline: '',
    bio: '',
  })

  // Form State: 2. Academic Background
  const [academic, setAcademic] = useState({
    school: '',
    degree: '',
    fieldOfStudy: '',
    startMonth: '',
    startYear: '',
    endMonth: '',
    endYear: '',
    grade: '',
    activities: '',
  })

  // Form State: 3. Skills
  const [selectedSkills, setSelectedSkills] = useState([]) // [{ name, category, proficiency, skillId }]
  const [customSkillInput, setCustomSkillInput] = useState('')
  const [customProficiency, setCustomProficiency] = useState('Intermediate')
  const [skillCategoryFilter, setSkillCategoryFilter] = useState('ALL')
  const [skillSearch, setSkillSearch] = useState('')

  // Form State: 4. Projects & Experience
  const [projects, setProjects] = useState([])
  const [experiences, setExperiences] = useState([])
  const [certifications, setCertifications] = useState([])

  // Modal / Temp states for adding projects & experiences
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    technologies: '',
    projectUrl: '',
    githubUrl: '',
  })
  const [newExp, setNewExp] = useState({
    companyName: '',
    roleTitle: '',
    employmentType: 'Internship',
    location: '',
    isCurrent: true,
  })
  const [newCert, setNewCert] = useState({
    title: '',
    issuer: '',
    type: 'Certification',
    credentialUrl: '',
  })

  // Form State: 5. Interests & Goals
  const [interests, setInterests] = useState({
    workPreferences: ['Remote', 'Hybrid'],
    areasOfInterest: [],
    careerInterests: [],
    shortTermGoal: '',
    longTermGoal: '',
  })
  const [customAreaInput, setCustomAreaInput] = useState('')
  const [customCareerInput, setCustomCareerInput] = useState('')

  // Populate initial state from user and saved profile
  useEffect(() => {
    if (profileData?.profile) {
      const p = profileData.profile
      setPersonalInfo({
        headline: p.headline || '',
        bio: p.bio || '',
      })

      setAcademic({
        school: p.school || p.university || '',
        degree: p.degree || p.currentDegree || '',
        fieldOfStudy: p.fieldOfStudy || '',
        startMonth: p.startMonth || '',
        startYear: p.startYear || '',
        endMonth: p.endMonth || '',
        endYear: p.endYear || (p.expectedGraduationYear ? String(p.expectedGraduationYear) : ''),
        grade: p.grade || '',
        activities: p.activities || '',
      })

      setInterests({
        workPreferences: p.workPreferences?.length ? p.workPreferences : ['Remote'],
        areasOfInterest: p.areasOfInterest || [],
        careerInterests: p.careerInterests || [],
        shortTermGoal: p.shortTermGoal || '',
        longTermGoal: p.longTermGoal || '',
      })

      if (profileData.skills?.length) {
        setSelectedSkills(
          profileData.skills.map((s) => ({
            name: s.name,
            category: s.category || 'General',
            proficiency: s.proficiency || 'Intermediate',
            skillId: s.skillId || null,
          }))
        )
      }

      if (profileData.projects?.length) {
        setProjects(profileData.projects)
      }
      if (profileData.experiences?.length) {
        setExperiences(profileData.experiences)
      }
      if (profileData.certifications?.length) {
        setCertifications(profileData.certifications)
      }
    }
  }, [profileData, currentUser])

  const sections = configData?.sections || []
  const currentSection = sections[currentStepIndex]

  if (loadingConfig || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Loading
          variant="card"
          size="lg"
          message="Preparing your personalized onboarding..."
          description="Fetching your career preferences and dynamic step configuration."
        />
      </div>
    )
  }

  if (sections.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white p-6 rounded-2xl border border-gray-200 text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h2 className="text-lg font-bold text-gray-900">Onboarding Complete</h2>
          <p className="text-sm text-gray-600">
            No active onboarding steps are required right now. You can jump directly into your dashboard!
          </p>
          <Button onClick={() => navigate('/dashboard')} className="w-full bg-[#4F46E5] text-white">
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  // Helper icons per section key
  const getSectionIcon = (key) => {
    switch (key) {
      case 'personal_info':
        return User
      case 'academic_background':
        return GraduationCap
      case 'skills':
        return Sparkles
      case 'experience':
        return Briefcase
      case 'projects':
        return BookOpen
      case 'projects_experience':
        return Briefcase
      case 'interests_goals':
        return Heart
      default:
        return BookOpen
    }
  }

  // Validate current step according to Admin fieldsConfig
  const validateStep = () => {
    setValidationError('')
    if (!currentSection) return true
    const fields = currentSection.fieldsConfig || {}

    if (currentSection.key === 'personal_info') {
      if (fields.headline?.required && !personalInfo.headline?.trim()) {
        setValidationError('Title / Headline is required')
        return false
      }
      if (fields.bio?.required && !personalInfo.bio?.trim()) {
        setValidationError('Bio / About is required')
        return false
      }
    } else if (currentSection.key === 'academic_background') {
      if (fields.school?.required && !academic.school?.trim()) {
        setValidationError('School is required')
        return false
      }
      if (fields.degree?.required && !academic.degree?.trim()) {
        setValidationError('Degree is required')
        return false
      }
      if (fields.fieldOfStudy?.required && !academic.fieldOfStudy?.trim()) {
        setValidationError('Field of study is required')
        return false
      }
    } else if (currentSection.key === 'skills') {
      const minRequired = fields.minSkillsRequired !== undefined ? Math.min(fields.minSkillsRequired, 1) : 1
      if (selectedSkills.length < minRequired) {
        setValidationError(`Please select or add at least 1 skill`)
        return false
      }
    } else if (currentSection.key === 'experience') {
      const expReq = fields.experienceRequired === true || fields.experienceRequired?.required === true
      if (expReq && experiences.length === 0) {
        setValidationError('Please add at least one internship or work experience')
        return false
      }
    } else if (currentSection.key === 'projects' || currentSection.key === 'projects_experience') {
      const projReq = fields.projectsRequired === true || fields.projectsRequired?.required === true
      if (projReq && projects.length === 0) {
        setValidationError('Please add at least one project')
        return false
      }
    } else if (currentSection.key === 'interests_goals') {
      if (interests.workPreferences.length === 0) {
        setValidationError('Please select at least one work preference (Remote, Onsite, or Hybrid)')
        return false
      }
      if (interests.areasOfInterest.length === 0) {
        setValidationError('Please select at least one area of interest')
        return false
      }
      if (interests.areasOfInterest.length > 3) {
        setValidationError('You can select at most 3 areas of interest')
        return false
      }
      if (interests.careerInterests.length === 0) {
        setValidationError('Please select at least one target career path')
        return false
      }
      if (interests.careerInterests.length > 3) {
        setValidationError('You can select at most 3 target career paths')
        return false
      }
      if (!interests.shortTermGoal?.trim()) {
        setValidationError('Short-term career goal is required')
        return false
      }
      if (!interests.longTermGoal?.trim()) {
        setValidationError('Long-term career vision is required')
        return false
      }
    }

    return true
  }

  // --- INTERESTS & PREFERENCES HELPERS (Primary & Secondary, Max 3) ---
  const allSuggestedAreas = [
    ...(configData?.areasOfInterest || []),
    'Web Technologies',
    'Artificial Intelligence & ML',
    'Data Science & Analytics',
    'Cloud Computing & DevOps',
    'Mobile App Development',
    'Cybersecurity & Networking',
    'UI/UX Design & Product',
    'Database Systems',
  ].filter((v, i, a) => a.indexOf(v) === i)

  const allSuggestedCareers = [
    ...(configData?.careerInterests || []),
    'Frontend Developer',
    'Full Stack Developer',
    'Backend Engineer',
    'DevOps Engineer',
    'Data Scientist',
    'Mobile App Developer',
    'AI / ML Engineer',
    'UI/UX Designer',
  ].filter((v, i, a) => a.indexOf(v) === i)

  const handleToggleWorkPref = (wp) => {
    const current = interests.workPreferences || []
    if (current.includes(wp)) {
      setInterests({ ...interests, workPreferences: current.filter((p) => p !== wp) })
    } else {
      setInterests({ ...interests, workPreferences: [...current, wp] })
    }
  }

  const handleSetPrimaryWorkPref = (wp) => {
    const current = interests.workPreferences || []
    if (!current.includes(wp)) return
    setInterests({
      ...interests,
      workPreferences: [wp, ...current.filter((p) => p !== wp)],
    })
  }

  const handleToggleArea = (area) => {
    const current = interests.areasOfInterest || []
    if (current.includes(area)) {
      setInterests({
        ...interests,
        areasOfInterest: current.filter((a) => a !== area),
      })
    } else {
      if (current.length >= 3) {
        setValidationError('You can select at most 3 areas of interest')
        return
      }
      setValidationError('')
      setInterests({
        ...interests,
        areasOfInterest: [...current, area],
      })
    }
  }

  const handleSetPrimaryArea = (area) => {
    const current = interests.areasOfInterest || []
    if (!current.includes(area)) return
    setInterests({
      ...interests,
      areasOfInterest: [area, ...current.filter((a) => a !== area)],
    })
  }

  const handleAddCustomArea = (e) => {
    e?.preventDefault()
    const trimmed = customAreaInput.trim()
    if (!trimmed) return
    const current = interests.areasOfInterest || []
    if (current.some((a) => a.toLowerCase() === trimmed.toLowerCase())) {
      setValidationError(`"${trimmed}" is already added`)
      return
    }
    if (current.length >= 3) {
      setValidationError('You can select at most 3 areas of interest')
      return
    }
    setValidationError('')
    setInterests({
      ...interests,
      areasOfInterest: [...current, trimmed],
    })
    setCustomAreaInput('')
  }

  const handleToggleCareer = (career) => {
    const current = interests.careerInterests || []
    if (current.includes(career)) {
      setInterests({
        ...interests,
        careerInterests: current.filter((c) => c !== career),
      })
    } else {
      if (current.length >= 3) {
        setValidationError('You can select at most 3 target career paths')
        return
      }
      setValidationError('')
      setInterests({
        ...interests,
        careerInterests: [...current, career],
      })
    }
  }

  const handleSetPrimaryCareer = (career) => {
    const current = interests.careerInterests || []
    if (!current.includes(career)) return
    setInterests({
      ...interests,
      careerInterests: [career, ...current.filter((c) => c !== career)],
    })
  }

  const handleAddCustomCareer = (e) => {
    e?.preventDefault()
    const trimmed = customCareerInput.trim()
    if (!trimmed) return
    const current = interests.careerInterests || []
    if (current.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setValidationError(`"${trimmed}" is already added`)
      return
    }
    if (current.length >= 3) {
      setValidationError('You can select at most 3 target career paths')
      return
    }
    setValidationError('')
    setInterests({
      ...interests,
      careerInterests: [...current, trimmed],
    })
    setCustomCareerInput('')
  }

  // Save current step data
  const handleSaveStep = async (advance = true) => {
    if (!validateStep()) return

    const nextSection = advance ? sections[currentStepIndex + 1] : null
    let stepPayload = {
      sectionKey: currentSection.key,
      nextStepKey: nextSection ? nextSection.key : currentSection.key,
      data: {},
    }

    if (currentSection.key === 'personal_info') {
      stepPayload.data = personalInfo
    } else if (currentSection.key === 'academic_background') {
      stepPayload.data = academic
    } else if (currentSection.key === 'skills') {
      stepPayload.data = { skills: selectedSkills }
    } else if (currentSection.key === 'experience') {
      stepPayload.data = { experiences }
    } else if (currentSection.key === 'projects') {
      stepPayload.data = { projects, certifications }
    } else if (currentSection.key === 'projects_experience') {
      stepPayload.data = { projects, experiences, certifications }
    } else if (currentSection.key === 'interests_goals') {
      stepPayload.data = interests
    }

    try {
      await saveStepApi(stepPayload).unwrap()

      if (advance) {
        if (currentStepIndex < sections.length - 1) {
          setCurrentStepIndex((prev) => prev + 1)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
          // Final step -> Complete onboarding
          await completeOnboardingApi().unwrap()
          setIsCompleted(true)
        }
      }
    } catch (err) {
      setValidationError(err?.data?.error || 'Failed to save progress. Please try again.')
    }
  }

  // Celebration Completion View
  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-indigo-50/70 via-white to-indigo-50/40 p-4">
        <div className="max-w-lg w-full bg-white p-8 rounded-3xl border border-indigo-100 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner animate-bounce">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Onboarding Complete!
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              Congratulations, <span className="font-semibold text-gray-900">{currentUser?.firstName || 'Student'}</span>! Your career profile has been successfully built.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl text-left border border-gray-100 space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Institution</span>
              <span className="font-semibold text-gray-900">{academic.school || 'Completed'}</span>
            </div>
            {academic.degree && (
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Degree</span>
                <span className="font-semibold text-gray-900">{academic.degree}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Skills Logged</span>
              <span className="font-semibold text-[#4F46E5]">{selectedSkills.length} skills</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={() => navigate('/dashboard/profile')}
              variant="outline"
              className="flex-1 py-5 text-sm font-semibold rounded-xl"
            >
              View My Profile
            </Button>
            <Button
              onClick={() => navigate('/dashboard')}
              className="flex-1 py-5 text-sm font-semibold rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white gap-2 shadow-md shadow-indigo-100"
            >
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const progressPercentage = Math.round(((currentStepIndex + 1) / sections.length) * 100)

  // Skill toggling helper
  const handleToggleCatalogSkill = (skill) => {
    const exists = selectedSkills.find((s) => s.name.toLowerCase() === skill.name.toLowerCase())
    if (exists) {
      setSelectedSkills(selectedSkills.filter((s) => s.name.toLowerCase() !== skill.name.toLowerCase()))
    } else {
      setSelectedSkills([
        ...selectedSkills,
        {
          name: skill.name,
          category: skill.category,
          proficiency: 'Intermediate',
          skillId: skill.id,
        },
      ])
    }
  }

  // Add custom skill helper
  const handleAddCustomSkill = (e) => {
    e.preventDefault()
    if (!customSkillInput.trim()) return
    const exists = selectedSkills.some((s) => s.name.toLowerCase() === customSkillInput.trim().toLowerCase())
    if (!exists) {
      setSelectedSkills([
        ...selectedSkills,
        {
          name: customSkillInput.trim(),
          category: 'Custom',
          proficiency: customProficiency,
          skillId: null,
        },
      ])
    }
    setCustomSkillInput('')
  }

  // Project helpers
  const handleAddProject = (e) => {
    e.preventDefault()
    if (!newProject.title.trim()) return
    setProjects([
      ...projects,
      {
        id: 'temp-' + Date.now(),
        title: newProject.title.trim(),
        description: newProject.description.trim(),
        technologies: newProject.technologies ? newProject.technologies.split(',').map((t) => t.trim()).filter(Boolean) : [],
        projectUrl: newProject.projectUrl.trim(),
        githubUrl: newProject.githubUrl.trim(),
      },
    ])
    setNewProject({ title: '', description: '', technologies: '', projectUrl: '', githubUrl: '' })
  }

  // Experience helpers
  const handleAddExp = (e) => {
    e.preventDefault()
    if (!newExp.companyName.trim() || !newExp.roleTitle.trim()) return
    setExperiences([
      ...experiences,
      {
        id: 'temp-' + Date.now(),
        companyName: newExp.companyName.trim(),
        roleTitle: newExp.roleTitle.trim(),
        employmentType: newExp.employmentType,
        location: newExp.location.trim(),
        isCurrent: newExp.isCurrent,
      },
    ])
    setNewExp({ companyName: '', roleTitle: '', employmentType: 'Internship', location: '', isCurrent: true })
  }

  // Certification helpers
  const handleAddCert = (e) => {
    e.preventDefault()
    if (!newCert.title.trim()) return
    setCertifications([
      ...certifications,
      {
        id: 'temp-' + Date.now(),
        title: newCert.title.trim(),
        issuer: newCert.issuer.trim(),
        type: newCert.type,
        credentialUrl: newCert.credentialUrl.trim(),
      },
    ])
    setNewCert({ title: '', issuer: '', type: 'Certification', credentialUrl: '' })
  }

  const catalogSkills = configData?.skills || []
  const filteredCatalogSkills = catalogSkills.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(skillSearch.toLowerCase())
    const matchesCategory = skillCategoryFilter === 'ALL' || s.category === skillCategoryFilter
    return matchesSearch && matchesCategory
  })
  const skillCategories = ['ALL', ...new Set(catalogSkills.map((s) => s.category).filter(Boolean))]

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Top Bar with Logo & Save Draft Button */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-[#4F46E5] to-[#6366F1] flex items-center justify-center text-white font-bold shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-gray-900 tracking-tight text-sm">FutureMe</span>
              <span className="text-[11px] text-gray-400 block -mt-0.5">Student Career Profile Onboarding</span>
            </div>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full bg-gray-100 h-1">
          <div
            className="bg-[#4F46E5] h-1 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 mt-8 space-y-6">
        {/* Step Indicator Header */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              Step {currentStepIndex + 1} of {sections.length}
            </span>
          </div>

          {/* Stepper Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {sections.map((sec, idx) => {
              const Icon = getSectionIcon(sec.key)
              const isPast = idx < currentStepIndex
              const isCurrent = idx === currentStepIndex

              return (
                <div
                  key={sec.key}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                    isCurrent
                      ? 'bg-indigo-50/80 border-indigo-300 text-indigo-700 font-semibold shadow-xs ring-1 ring-indigo-200'
                      : isPast
                      ? 'bg-slate-50 border-slate-200 text-slate-700'
                      : 'bg-white/60 border-slate-100 text-slate-400'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                      isCurrent
                        ? 'bg-indigo-600 text-white'
                        : isPast
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : idx + 1}
                  </div>
                  <span className="text-[11px] truncate font-medium">{sec.title}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Validation Alert */}
        {validationError && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs sm:text-sm flex items-center gap-3 shadow-xs animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-medium">{validationError}</span>
          </div>
        )}

        {/* Step Content Card */}
        <div className="bg-white p-6 sm:p-9 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100 shadow-2xs">
                {(() => {
                  const Icon = getSectionIcon(currentSection.key)
                  return <Icon className="w-5 h-5" />
                })()}
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{currentSection.title}</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">{currentSection.description}</p>
              </div>
            </div>
          </div>

          {/* SECTION 1: ABOUT YOURSELF */}
          {currentSection.key === 'personal_info' && (
            <div className="space-y-6">
              {currentSection.fieldsConfig?.headline?.enabled !== false && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                      Title / Headline
                      {currentSection.fieldsConfig?.headline?.required ? (
                        <span className="text-rose-500 font-bold">*</span>
                      ) : (
                        <span className="text-[11px] font-normal text-slate-400">(Optional)</span>
                      )}
                    </label>
                    <span className="text-[11px] text-slate-400">e.g. Role | Key Specialty</span>
                  </div>
                  <input
                    type="text"
                    value={personalInfo.headline}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, headline: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 transition-all shadow-xs"
                    placeholder="e.g. Software Engineer | Computer Science Student"
                  />
                </div>
              )}

              {currentSection.fieldsConfig?.bio?.enabled !== false && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                      Bio / About Yourself
                      {currentSection.fieldsConfig?.bio?.required ? (
                        <span className="text-rose-500 font-bold">*</span>
                      ) : (
                        <span className="text-[11px] font-normal text-slate-400">(Optional)</span>
                      )}
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {personalInfo.bio?.length || 0} characters
                    </span>
                  </div>
                  <textarea
                    rows={5}
                    value={personalInfo.bio}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, bio: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 transition-all shadow-xs resize-none leading-relaxed"
                    placeholder="Tell us about yourself, your background, your passions, and what drives your career goals..."
                  />
                </div>
              )}
            </div>
          )}

          {/* SECTION 2: ACADEMIC BACKGROUND */}
          {currentSection.key === 'academic_background' && (
            <div className="space-y-5">
              {/* School */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  School / Institution
                  <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  value={academic.school}
                  onChange={(e) => setAcademic({ ...academic, school: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 transition-all shadow-xs"
                  placeholder="Ex: Boston University"
                />
              </div>

              {/* Degree & Field of Study */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    Degree
                    {currentSection.fieldsConfig?.degree?.required ? (
                      <span className="text-rose-500 font-bold">*</span>
                    ) : (
                      <span className="text-[11px] font-normal text-slate-400">(Optional)</span>
                    )}
                  </label>
                  <input
                    type="text"
                    list="degree-catalog-list"
                    value={academic.degree}
                    onChange={(e) => setAcademic({ ...academic, degree: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 transition-all shadow-xs"
                    placeholder="Ex: Bachelor of Science"
                  />
                  {configData?.degrees?.length > 0 && (
                    <datalist id="degree-catalog-list">
                      {configData.degrees.map((deg) => (
                        <option key={deg} value={deg} />
                      ))}
                    </datalist>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    Field of Study
                    {currentSection.fieldsConfig?.fieldOfStudy?.required ? (
                      <span className="text-rose-500 font-bold">*</span>
                    ) : (
                      <span className="text-[11px] font-normal text-slate-400">(Optional)</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={academic.fieldOfStudy}
                    onChange={(e) => setAcademic({ ...academic, fieldOfStudy: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 transition-all shadow-xs"
                    placeholder="Ex: Business or Computer Science"
                  />
                </div>
              </div>

              {/* Start Date & End Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-50/60 rounded-xl border border-slate-200/70 space-y-2">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Start Date
                    {currentSection.fieldsConfig?.startDate?.required && (
                      <span className="text-rose-500 font-bold">*</span>
                    )}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={academic.startMonth}
                      onChange={(e) => setAcademic({ ...academic, startMonth: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 transition-all shadow-xs"
                    >
                      <option value="">Month</option>
                      {MONTHS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1970"
                      max="2035"
                      placeholder="Year"
                      value={academic.startYear}
                      onChange={(e) => setAcademic({ ...academic, startYear: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 transition-all shadow-xs"
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50/60 rounded-xl border border-slate-200/70 space-y-2">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    End Date (or expected)
                    {currentSection.fieldsConfig?.endDate?.required && (
                      <span className="text-rose-500 font-bold">*</span>
                    )}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={academic.endMonth}
                      onChange={(e) => setAcademic({ ...academic, endMonth: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 transition-all shadow-xs"
                    >
                      <option value="">Month</option>
                      {MONTHS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1970"
                      max="2035"
                      placeholder="Year"
                      value={academic.endYear}
                      onChange={(e) => setAcademic({ ...academic, endYear: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 transition-all shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Grade / GPA */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  Grade / GPA
                  {currentSection.fieldsConfig?.grade?.required ? (
                    <span className="text-rose-500 font-bold">*</span>
                  ) : (
                    <span className="text-[11px] font-normal text-slate-400">(Optional)</span>
                  )}
                </label>
                <input
                  type="text"
                  value={academic.grade}
                  onChange={(e) => setAcademic({ ...academic, grade: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 transition-all shadow-xs"
                  placeholder="Ex: 3.8 GPA or Grade A"
                />
              </div>

              {/* Activities and societies */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  Activities and Societies
                  {currentSection.fieldsConfig?.activities?.required ? (
                    <span className="text-rose-500 font-bold">*</span>
                  ) : (
                    <span className="text-[11px] font-normal text-slate-400">(Optional)</span>
                  )}
                </label>
                <textarea
                  rows={3}
                  value={academic.activities}
                  onChange={(e) => setAcademic({ ...academic, activities: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 transition-all shadow-xs resize-none"
                  placeholder="Ex: Alpha Phi Omega, Marching Band, ACM Student Chapter, Volleyball"
                />
              </div>
            </div>
          )}

          {/* SECTION 3: SKILLS */}
          {currentSection.key === 'skills' && (
            <div className="space-y-6">
              {/* Selected Skills summary */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Selected Skills
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {selectedSkills.length}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Choose your level: Beginner &bull; Intermediate &bull; Advanced
                  </span>
                </div>

                {selectedSkills.length === 0 ? (
                  <div className="p-6 bg-slate-50/70 rounded-2xl border border-dashed border-slate-300 text-center space-y-1.5">
                    <Sparkles className="w-6 h-6 text-indigo-400 mx-auto" />
                    <p className="text-xs font-medium text-slate-600">No skills selected yet</p>
                    <p className="text-[11px] text-slate-400">
                      Choose popular skills from the catalog below or add your custom skills.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2.5">
                    {selectedSkills.map((sk) => {
                      const profColors = {
                        Beginner: 'bg-sky-50 text-sky-700 border-sky-200',
                        Intermediate: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                        Advanced: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                      }
                      return (
                        <div
                          key={sk.name}
                          className="pl-3 pr-2 py-1.5 rounded-xl border border-slate-200/90 bg-white shadow-2xs flex items-center gap-2 transition-all hover:border-slate-300"
                        >
                          <span className="text-xs font-semibold text-slate-800">{sk.name}</span>
                          <select
                            value={sk.proficiency}
                            onChange={(e) => {
                              const newProf = e.target.value
                              setSelectedSkills(
                                selectedSkills.map((s) => (s.name === sk.name ? { ...s, proficiency: newProf } : s))
                              )
                            }}
                            className={`text-[11px] font-semibold py-0.5 px-2 rounded-lg border focus:outline-hidden cursor-pointer ${
                              profColors[sk.proficiency] || 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => setSelectedSkills(selectedSkills.filter((s) => s.name !== sk.name))}
                            className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Add Custom Skill Form */}
              <div className="p-4 sm:p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Add a Custom Skill</span>
                  <span className="text-[11px] text-slate-400">Can't find a skill in the catalog? Add your own</span>
                </div>
                <form onSubmit={handleAddCustomSkill} className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="text"
                    placeholder="Enter skill name (e.g. Flutter, PyTorch, C++, Figma)"
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 flex-1 shadow-2xs"
                  />
                  <div className="sm:w-36">
                    <Select
                      value={customProficiency}
                      onChange={(val) => setCustomProficiency(val)}
                      options={[
                        { value: 'Beginner', label: 'Beginner' },
                        { value: 'Intermediate', label: 'Intermediate' },
                        { value: 'Advanced', label: 'Advanced' },
                      ]}
                    />
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-2 rounded-xl gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Skill
                  </Button>
                </form>
              </div>

              {/* Predefined Skills Catalog Selector */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Browse Skills Catalog
                  </span>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                    {skillCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSkillCategoryFilter(cat)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                          skillCategoryFilter === cat
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto p-1">
                  {filteredCatalogSkills.map((sk) => {
                    const isSelected = selectedSkills.some((s) => s.name.toLowerCase() === sk.name.toLowerCase())
                    return (
                      <button
                        key={sk.id || sk.name}
                        type="button"
                        onClick={() => handleToggleCatalogSkill(sk)}
                        className={`p-2.5 rounded-xl border text-xs font-medium text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <span className="truncate">{sk.name}</span>
                        {isSelected ? (
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-white" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: EXPERIENCE */}
          {currentSection.key === 'experience' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Work & Internship Experience ({experiences.length})
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400">Optional</span>
                </div>

                {experiences.length === 0 ? (
                  <div className="p-6 bg-slate-50/70 rounded-2xl border border-dashed border-slate-300 text-center space-y-1">
                    <p className="text-xs font-medium text-slate-600">No work experience added yet</p>
                    <p className="text-[11px] text-slate-400">
                      Add internships, part-time jobs, or freelance gigs below, or click Save & Continue to proceed.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {experiences.map((exp, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1 relative group hover:border-slate-300 transition-all"
                      >
                        <div className="flex items-center justify-between pr-8">
                          <h4 className="text-sm font-bold text-slate-900">{exp.roleTitle}</h4>
                          <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                            {exp.employmentType}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-600 flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {exp.companyName}
                          {exp.location && (
                            <>
                              <span className="text-slate-300">&bull;</span>
                              <span className="text-slate-500">{exp.location}</span>
                            </>
                          )}
                        </p>
                        <button
                          type="button"
                          onClick={() => setExperiences(experiences.filter((_, i) => i !== idx))}
                          className="absolute right-3.5 top-3.5 text-slate-400 hover:text-rose-600 transition-colors p-1"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Experience form */}
                <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3.5">
                  <span className="text-xs font-bold text-slate-800">Add New Work or Internship</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Company Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Google, TechCorp, Local Agency"
                        value={newExp.companyName}
                        onChange={(e) => setNewExp({ ...newExp, companyName: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 shadow-2xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Role / Job Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Frontend Developer Intern"
                        value={newExp.roleTitle}
                        onChange={(e) => setNewExp({ ...newExp, roleTitle: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 shadow-2xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Employment Type</label>
                      <select
                        value={newExp.employmentType}
                        onChange={(e) => setNewExp({ ...newExp, employmentType: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-indigo-500 shadow-2xs"
                      >
                        <option value="Internship">Internship</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Freelance">Freelance</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Location</label>
                      <input
                        type="text"
                        placeholder="e.g. Remote or City"
                        value={newExp.location}
                        onChange={(e) => setNewExp({ ...newExp, location: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 shadow-2xs"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddExp}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-2 rounded-xl gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Experience to List
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: PROJECTS */}
          {(currentSection.key === 'projects' || currentSection.key === 'projects_experience') && (
            <div className="space-y-6">
              {/* Projects Sub-section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-900">Projects ({projects.length})</h3>
                  </div>
                  <span className="text-[11px] text-slate-400">Optional</span>
                </div>

                {projects.length === 0 ? (
                  <div className="p-6 bg-slate-50/70 rounded-2xl border border-dashed border-slate-300 text-center space-y-1">
                    <p className="text-xs font-medium text-slate-600">No projects added yet</p>
                    <p className="text-[11px] text-slate-400">
                      Showcase course projects, capstone, or personal hacks below.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {projects.map((proj, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1.5 relative group hover:border-slate-300 transition-all"
                      >
                        <button
                          type="button"
                          onClick={() => setProjects(projects.filter((_, i) => i !== idx))}
                          className="absolute right-3.5 top-3.5 text-slate-400 hover:text-rose-600 transition-colors p-1"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <h4 className="text-sm font-bold text-slate-900">{proj.title}</h4>
                        <p className="text-xs text-slate-600">{proj.description}</p>
                        {proj.technologies?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {proj.technologies.map((t, ti) => (
                              <Badge key={ti} variant="secondary" className="text-[10px] bg-slate-50 border border-slate-200 text-slate-700">
                                {t}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-3 pt-1 text-xs">
                          {proj.projectUrl && (
                            <a
                              href={proj.projectUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" /> Live Demo
                            </a>
                          )}
                          {proj.githubUrl && (
                            <a
                              href={proj.githubUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-600 hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" /> GitHub Repo
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add project mini form */}
                <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3.5">
                  <span className="text-xs font-bold text-slate-800">Add a Project</span>
                  <div className="space-y-2.5">
                    <input
                      type="text"
                      placeholder="Project Name / Title"
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 shadow-2xs"
                    />
                    <textarea
                      rows={2}
                      placeholder="Project description, problem solved, and key features"
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 shadow-2xs resize-none"
                    />
                    <input
                      type="text"
                      placeholder="Technologies used (comma separated, e.g. React, Node.js, PostgreSQL)"
                      value={newProject.technologies}
                      onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 shadow-2xs"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <input
                        type="url"
                        placeholder="Live Demo Link (optional)"
                        value={newProject.projectUrl}
                        onChange={(e) => setNewProject({ ...newProject, projectUrl: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 shadow-2xs"
                      />
                      <input
                        type="url"
                        placeholder="GitHub / Repo Link (optional)"
                        value={newProject.githubUrl}
                        onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 shadow-2xs"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddProject}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-2 rounded-xl gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Project to List
                  </Button>
                </div>
              </div>

              {/* Certifications & Achievements Sub-section */}
              <div className="space-y-3 pt-5 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Certifications & Achievements ({certifications.length})
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400">Optional</span>
                </div>

                {certifications.length > 0 && (
                  <div className="space-y-2">
                    {certifications.map((c, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-xs"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{c.title}</p>
                          <p className="text-xs text-slate-500">
                            <span className="font-medium text-indigo-600">{c.type}</span>
                            {c.issuer && ` &bull; Issued by ${c.issuer}`}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCertifications(certifications.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3.5">
                  <span className="text-xs font-bold text-slate-800">Add Certification / Award</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <input
                      type="text"
                      placeholder="Title / Name (e.g. AWS Certified Cloud Practitioner)"
                      value={newCert.title}
                      onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 sm:col-span-2 shadow-2xs"
                    />
                    <select
                      value={newCert.type}
                      onChange={(e) => setNewCert({ ...newCert, type: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-indigo-500 shadow-2xs"
                    >
                      <option value="Certification">Certification</option>
                      <option value="Achievement">Achievement / Award</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Issuer (e.g. AWS, Coursera, Hackathon)"
                      value={newCert.issuer}
                      onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 shadow-2xs"
                    />
                    <input
                      type="url"
                      placeholder="Credential URL (Optional)"
                      value={newCert.credentialUrl}
                      onChange={(e) => setNewCert({ ...newCert, credentialUrl: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 sm:col-span-2 shadow-2xs"
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddCert}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-2 rounded-xl gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Certification
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: INTERESTS, PREFERENCES & GOALS */}
          {currentSection.key === 'interests_goals' && (
            <div className="space-y-6">
              {/* Work Preferences */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                    Work Preferences <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <p className="text-[11px] text-slate-400">First selected is Primary</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Remote', icon: Laptop, desc: 'Work from anywhere' },
                    { label: 'Onsite', icon: Building2, desc: 'Office based' },
                    { label: 'Hybrid', icon: Globe, desc: 'Flexible mix' },
                  ].map(({ label, icon: Icon, desc }) => {
                    const idx = interests.workPreferences.indexOf(label)
                    const selected = idx > -1
                    const isPrimary = idx === 0
                    return (
                      <div
                        key={label}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                          selected
                            ? 'bg-indigo-50/90 border-indigo-300 text-indigo-900 shadow-xs ring-1 ring-indigo-200'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/60'
                        }`}
                      >
                        <div
                          className="flex items-start justify-between cursor-pointer"
                          onClick={() => handleToggleWorkPref(label)}
                        >
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                              selected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          {selected && (
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                isPrimary ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-indigo-200/80 text-indigo-800'
                              }`}
                            >
                              {isPrimary ? '★ Primary' : 'Secondary'}
                            </span>
                          )}
                        </div>
                        <div
                          className="cursor-pointer"
                          onClick={() => handleToggleWorkPref(label)}
                        >
                          <p className="text-sm font-semibold">{label}</p>
                          <p className="text-[11px] text-slate-400 font-normal">{desc}</p>
                        </div>
                        {selected && !isPrimary && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryWorkPref(label)}
                            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 py-1 px-2 rounded-lg bg-white border border-indigo-200 hover:bg-indigo-50 transition-colors w-full text-center"
                          >
                            Set as Primary
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Areas of Interest (Max 3, Primary & Secondary) */}
              <div className="space-y-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                      Areas of Interest <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Select up to 3 domains. The first selection is Primary, and others are Secondary.
                    </p>
                  </div>
                  <Badge
                    className={
                      interests.areasOfInterest.length >= 3
                        ? 'bg-amber-50 text-amber-700 border-amber-200 text-xs font-bold'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-100 text-xs'
                    }
                  >
                    {interests.areasOfInterest.length} / 3 Selected
                  </Badge>
                </div>

                {/* Active Selections */}
                {interests.areasOfInterest.length > 0 && (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Active Selections
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {interests.areasOfInterest.map((area, idx) => {
                        const isPrimary = idx === 0
                        return (
                          <div
                            key={area}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                              isPrimary
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            }`}
                          >
                            <span>{area}</span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                isPrimary ? 'bg-white/25 text-white' : 'bg-indigo-200 text-indigo-800'
                              }`}
                            >
                              {isPrimary ? '★ Primary' : 'Secondary'}
                            </span>
                            {!isPrimary && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryArea(area)}
                                className="text-[10px] font-bold text-indigo-700 hover:text-indigo-900 underline ml-1"
                                title="Promote to Primary"
                              >
                                Set Primary
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleToggleArea(area)}
                              className="hover:text-rose-500 ml-1 font-bold"
                              title="Remove"
                            >
                              &times;
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Catalog Options */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-600 block">Quick Recommendations:</span>
                  <div className="flex flex-wrap gap-2">
                    {allSuggestedAreas.map((area) => {
                      const isSelected = interests.areasOfInterest.includes(area)
                      return (
                        <button
                          key={area}
                          type="button"
                          onClick={() => handleToggleArea(area)}
                          disabled={!isSelected && interests.areasOfInterest.length >= 3}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : interests.areasOfInterest.length >= 3
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {area} {isSelected ? '✓' : '+'}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Custom Area Input */}
                {interests.areasOfInterest.length < 3 && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Or type custom interest domain (e.g. Cloud Security, Embedded Systems)"
                      value={customAreaInput}
                      onChange={(e) => setCustomAreaInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddCustomArea()
                        }
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
                    />
                    <Button
                      type="button"
                      onClick={handleAddCustomArea}
                      size="sm"
                      variant="outline"
                      className="text-xs shrink-0 gap-1 rounded-xl border-slate-200 hover:bg-slate-50"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </Button>
                  </div>
                )}
              </div>

              {/* Target Career Paths (Max 3, Primary & Secondary) */}
              <div className="space-y-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                      Target Career Paths <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Select up to 3 target roles. The first selection is Primary, and others are Secondary.
                    </p>
                  </div>
                  <Badge
                    className={
                      interests.careerInterests.length >= 3
                        ? 'bg-amber-50 text-amber-700 border-amber-200 text-xs font-bold'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-100 text-xs'
                    }
                  >
                    {interests.careerInterests.length} / 3 Selected
                  </Badge>
                </div>

                {/* Active Selections */}
                {interests.careerInterests.length > 0 && (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Active Selections
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {interests.careerInterests.map((career, idx) => {
                        const isPrimary = idx === 0
                        return (
                          <div
                            key={career}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                              isPrimary
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            <span>{career}</span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                isPrimary ? 'bg-white/25 text-white' : 'bg-emerald-200 text-emerald-800'
                              }`}
                            >
                              {isPrimary ? '★ Primary' : 'Secondary'}
                            </span>
                            {!isPrimary && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryCareer(career)}
                                className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 underline ml-1"
                                title="Promote to Primary"
                              >
                                Set Primary
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleToggleCareer(career)}
                              className="hover:text-rose-500 ml-1 font-bold"
                              title="Remove"
                            >
                              &times;
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Catalog Options */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-600 block">Quick Recommendations:</span>
                  <div className="flex flex-wrap gap-2">
                    {allSuggestedCareers.map((career) => {
                      const isSelected = interests.careerInterests.includes(career)
                      return (
                        <button
                          key={career}
                          type="button"
                          onClick={() => handleToggleCareer(career)}
                          disabled={!isSelected && interests.careerInterests.length >= 3}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : interests.careerInterests.length >= 3
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {career} {isSelected ? '✓' : '+'}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Custom Career Input */}
                {interests.careerInterests.length < 3 && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Or type custom career path (e.g. Solution Architect, Security Analyst)"
                      value={customCareerInput}
                      onChange={(e) => setCustomCareerInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddCustomCareer()
                        }
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
                    />
                    <Button
                      type="button"
                      onClick={handleAddCustomCareer}
                      size="sm"
                      variant="outline"
                      className="text-xs shrink-0 gap-1 rounded-xl border-slate-200 hover:bg-slate-50"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </Button>
                  </div>
                )}
              </div>

              {/* Goals */}
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                    Short-Term Career Goal (Next 6-12 months) <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={interests.shortTermGoal}
                    onChange={(e) => setInterests({ ...interests, shortTermGoal: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 transition-all shadow-xs resize-none"
                    placeholder="e.g. Secure a Summer Internship in Software Development, master React and Tailwind CSS..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                    Long-Term Career Vision (3-5 years) <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={interests.longTermGoal}
                    onChange={(e) => setInterests({ ...interests, longTermGoal: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 transition-all shadow-xs resize-none"
                    placeholder="e.g. Grow into a Senior Full-Stack Engineer, lead engineering teams, or build an AI startup..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={currentStepIndex === 0 || isSavingStep}
              onClick={() => {
                setValidationError('')
                setCurrentStepIndex((prev) => Math.max(0, prev - 1))
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="text-xs font-medium text-slate-700 px-4 py-2.5 rounded-xl border-slate-200 hover:bg-slate-50 gap-1.5 transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>

            <Button
              type="button"
              onClick={() => handleSaveStep(true)}
              disabled={isSavingStep || isCompleting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold px-7 py-2.5 rounded-xl gap-2 shadow-sm shadow-indigo-200 transition-all cursor-pointer"
            >
              {currentStepIndex === sections.length - 1 ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  {isCompleting ? 'Finalizing Profile...' : 'Complete Onboarding'}
                </>
              ) : (
                <>
                  <span>Save & Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
