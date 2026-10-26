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
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#4F46E5] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-gray-600">Loading your personalized onboarding...</p>
        </div>
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
      const minRequired = fields.minSkillsRequired || 1
      if (selectedSkills.length < minRequired) {
        setValidationError(`Please select or add at least ${minRequired} skill(s)`)
        return false
      }
    } else if (currentSection.key === 'interests_goals') {
      if (fields.workPreferencesRequired && interests.workPreferences.length === 0) {
        setValidationError('Please select at least one work preference (Remote, Onsite, or Hybrid)')
        return false
      }
      if (fields.areasOfInterestRequired && interests.areasOfInterest.length === 0) {
        setValidationError('Please select at least one area of interest')
        return false
      }
    }

    return true
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
    } catch {
      setValidationError('Failed to save progress. Please try again.')
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
              Congratulations, <span className="font-semibold text-gray-900">{personalInfo.firstName || 'Student'}</span>! Your career profile has been successfully built.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl text-left border border-gray-100 space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Degree</span>
              <span className="font-semibold text-gray-900">{academic.currentDegree}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Institution</span>
              <span className="font-semibold text-gray-900">{academic.university}</span>
            </div>
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

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSaveStep(false)}
              className="text-xs text-gray-600 hover:text-gray-900 gap-1.5"
              disabled={isSavingStep}
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save & Exit</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="text-xs text-gray-500"
            >
              Dashboard
            </Button>
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
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider">
            <span>
              Step {currentStepIndex + 1} of {sections.length}
            </span>
            <span className="text-[#4F46E5] font-bold">{progressPercentage}% Completed</span>
          </div>

          {/* Stepper Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {sections.map((sec, idx) => {
              const Icon = getSectionIcon(sec.key)
              const isPast = idx < currentStepIndex
              const isCurrent = idx === currentStepIndex

              return (
                <div
                  key={sec.key}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                    isCurrent
                      ? 'bg-indigo-50/70 border-indigo-200 text-[#4F46E5] font-semibold'
                      : isPast
                      ? 'bg-white border-gray-200 text-gray-700'
                      : 'bg-gray-50/50 border-gray-100 text-gray-400'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                      isCurrent
                        ? 'bg-[#4F46E5] text-white font-bold'
                        : isPast
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                  </div>
                  <span className="text-[11px] truncate">{sec.title}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Validation Alert */}
        {validationError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Step Content Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">{currentSection.title}</h2>
            <p className="text-xs text-gray-500 mt-1">{currentSection.description}</p>
          </div>

          {/* SECTION 1: ABOUT YOURSELF */}
          {currentSection.key === 'personal_info' && (
            <div className="space-y-4">
              {currentSection.fieldsConfig?.headline?.enabled !== false && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                    Title / Headline
                    {currentSection.fieldsConfig?.headline?.required && (
                      <span className="text-rose-500 text-xs">*</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={personalInfo.headline}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, headline: e.target.value })}
                    className="input-field text-sm"
                    placeholder="e.g. Software Engineer | Computer Science Student"
                  />
                  <p className="text-[11px] text-gray-400">
                    A brief one-line headline summarizing your career focus or professional identity.
                  </p>
                </div>
              )}

              {currentSection.fieldsConfig?.bio?.enabled !== false && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                    Bio / About
                    {currentSection.fieldsConfig?.bio?.required && (
                      <span className="text-rose-500 text-xs">*</span>
                    )}
                  </label>
                  <textarea
                    rows={5}
                    value={personalInfo.bio}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, bio: e.target.value })}
                    className="input-field text-sm resize-none"
                    placeholder="Tell us about yourself, your background, your passions, and what drives your career goals..."
                  />
                </div>
              )}
            </div>
          )}

          {/* SECTION 2: ACADEMIC BACKGROUND */}
          {currentSection.key === 'academic_background' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  School
                  <span className="text-rose-500 text-xs">*</span>
                </label>
                <input
                  type="text"
                  value={academic.school}
                  onChange={(e) => setAcademic({ ...academic, school: e.target.value })}
                  className="input-field text-sm"
                  placeholder="Ex: Boston University"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                    Degree
                    {currentSection.fieldsConfig?.degree?.required && (
                      <span className="text-rose-500 text-xs">*</span>
                    )}
                  </label>
                  <input
                    type="text"
                    list="degree-catalog-list"
                    value={academic.degree}
                    onChange={(e) => setAcademic({ ...academic, degree: e.target.value })}
                    className="input-field text-sm"
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
                  <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                    Field of study
                    {currentSection.fieldsConfig?.fieldOfStudy?.required && (
                      <span className="text-rose-500 text-xs">*</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={academic.fieldOfStudy}
                    onChange={(e) => setAcademic({ ...academic, fieldOfStudy: e.target.value })}
                    className="input-field text-sm"
                    placeholder="Ex: Business"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Start date</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={academic.startMonth}
                      onChange={(e) => setAcademic({ ...academic, startMonth: e.target.value })}
                      className="input-field text-sm"
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
                      className="input-field text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">End date (or expected)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={academic.endMonth}
                      onChange={(e) => setAcademic({ ...academic, endMonth: e.target.value })}
                      className="input-field text-sm"
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
                      className="input-field text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  Grade
                </label>
                <input
                  type="text"
                  value={academic.grade}
                  onChange={(e) => setAcademic({ ...academic, grade: e.target.value })}
                  className="input-field text-sm"
                  placeholder="Ex: 3.8 GPA or Grade A"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  Activities and societies
                </label>
                <textarea
                  rows={3}
                  value={academic.activities}
                  onChange={(e) => setAcademic({ ...academic, activities: e.target.value })}
                  className="input-field text-sm resize-none"
                  placeholder="Ex: Alpha Phi Omega, Marching Band, Volleyball"
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
                  <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Your Selected Skills ({selectedSkills.length})
                  </span>
                  <span className="text-[11px] text-gray-400">
                    Set proficiency for each: Beginner, Intermediate, or Advanced
                  </span>
                </div>

                {selectedSkills.length === 0 ? (
                  <div className="p-6 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center text-xs text-gray-500">
                    No skills selected yet. Choose from the catalog below or add your custom skills.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2.5">
                    {selectedSkills.map((sk) => (
                      <div
                        key={sk.name}
                        className="p-2 pl-3 rounded-xl border border-indigo-100 bg-indigo-50/50 flex items-center gap-2 shadow-2xs"
                      >
                        <span className="text-xs font-semibold text-gray-900">{sk.name}</span>
                        <select
                          value={sk.proficiency}
                          onChange={(e) => {
                            const newProf = e.target.value
                            setSelectedSkills(
                              selectedSkills.map((s) => (s.name === sk.name ? { ...s, proficiency: newProf } : s))
                            )
                          }}
                          className="text-[11px] py-1 px-1.5 rounded-lg border border-indigo-200 bg-white font-medium text-[#4F46E5] focus:outline-hidden"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => setSelectedSkills(selectedSkills.filter((s) => s.name !== sk.name))}
                          className="text-gray-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Custom Skill Form */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                <span className="text-xs font-semibold text-gray-700">Add a Custom Skill</span>
                <form onSubmit={handleAddCustomSkill} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Enter skill name (e.g. Flutter, PyTorch, C++)"
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    className="input-field text-xs flex-1"
                  />
                  <select
                    value={customProficiency}
                    onChange={(e) => setCustomProficiency(e.target.value)}
                    className="input-field text-xs sm:w-40"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                  <Button type="submit" size="sm" className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs gap-1">
                    <Plus className="w-3.5 h-3.5" /> Add
                  </Button>
                </form>
              </div>

              {/* Predefined Skills Catalog Selector */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-gray-700">
                    Select from Predefined Skills:
                  </span>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {skillCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSkillCategoryFilter(cat)}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors ${
                          skillCategoryFilter === cat
                            ? 'bg-[#4F46E5] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-56 overflow-y-auto p-1">
                  {filteredCatalogSkills.map((sk) => {
                    const isSelected = selectedSkills.some((s) => s.name.toLowerCase() === sk.name.toLowerCase())
                    return (
                      <button
                        key={sk.id || sk.name}
                        type="button"
                        onClick={() => handleToggleCatalogSkill(sk)}
                        className={`p-2 rounded-xl border text-xs font-medium text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-[#4F46E5] text-white border-[#4F46E5] shadow-xs'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'
                        }`}
                      >
                        <span className="truncate">{sk.name}</span>
                        {isSelected ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <Plus className="w-3.5 h-3.5 shrink-0 text-gray-400" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: PROJECTS & EXPERIENCE */}
          {currentSection.key === 'projects_experience' && (
            <div className="space-y-6">
              {/* Projects Sub-section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#4F46E5]" />
                    Projects ({projects.length})
                  </h3>
                </div>

                {projects.map((proj, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1.5 relative">
                    <button
                      type="button"
                      onClick={() => setProjects(projects.filter((_, i) => i !== idx))}
                      className="absolute right-3 top-3 text-gray-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <p className="text-sm font-semibold text-gray-900">{proj.title}</p>
                    <p className="text-xs text-gray-600">{proj.description}</p>
                    {proj.technologies?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {proj.technologies.map((t, ti) => (
                          <Badge key={ti} variant="secondary" className="text-[10px] bg-white border border-gray-200">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Add project mini form */}
                <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-3">
                  <span className="text-xs font-semibold text-gray-700">Add a Project</span>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Project Name / Title"
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                      className="input-field text-xs"
                    />
                    <textarea
                      rows={2}
                      placeholder="Project description, problem solved, and key features"
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      className="input-field text-xs resize-none"
                    />
                    <input
                      type="text"
                      placeholder="Technologies used (comma separated, e.g. React, Node.js, PostgreSQL)"
                      value={newProject.technologies}
                      onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })}
                      className="input-field text-xs"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="url"
                        placeholder="Live Demo Link (optional)"
                        value={newProject.projectUrl}
                        onChange={(e) => setNewProject({ ...newProject, projectUrl: e.target.value })}
                        className="input-field text-xs"
                      />
                      <input
                        type="url"
                        placeholder="GitHub / Repo Link (optional)"
                        value={newProject.githubUrl}
                        onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                        className="input-field text-xs"
                      />
                    </div>
                  </div>
                  <Button type="button" size="sm" onClick={handleAddProject} className="bg-[#4F46E5] text-white text-xs gap-1">
                    <Plus className="w-3.5 h-3.5" /> Add Project to List
                  </Button>
                </div>
              </div>

              {/* Experiences Sub-section */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#4F46E5]" />
                  Internships & Work Experience ({experiences.length})
                </h3>

                {experiences.map((exp, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1 relative">
                    <button
                      type="button"
                      onClick={() => setExperiences(experiences.filter((_, i) => i !== idx))}
                      className="absolute right-3 top-3 text-gray-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <p className="text-sm font-semibold text-gray-900">
                      {exp.roleTitle} @ {exp.companyName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {exp.employmentType} &bull; {exp.location || 'Remote'}
                    </p>
                  </div>
                ))}

                <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-3">
                  <span className="text-xs font-semibold text-gray-700">Add Work or Internship</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Company Name"
                      value={newExp.companyName}
                      onChange={(e) => setNewExp({ ...newExp, companyName: e.target.value })}
                      className="input-field text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Role / Title (e.g. Frontend Intern)"
                      value={newExp.roleTitle}
                      onChange={(e) => setNewExp({ ...newExp, roleTitle: e.target.value })}
                      className="input-field text-xs"
                    />
                    <select
                      value={newExp.employmentType}
                      onChange={(e) => setNewExp({ ...newExp, employmentType: e.target.value })}
                      className="input-field text-xs"
                    >
                      <option value="Internship">Internship</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Freelance">Freelance</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Location (e.g. Islamabad or Remote)"
                      value={newExp.location}
                      onChange={(e) => setNewExp({ ...newExp, location: e.target.value })}
                      className="input-field text-xs"
                    />
                  </div>
                  <Button type="button" size="sm" onClick={handleAddExp} className="bg-[#4F46E5] text-white text-xs gap-1">
                    <Plus className="w-3.5 h-3.5" /> Add Experience to List
                  </Button>
                </div>
              </div>

              {/* Certifications & Achievements Sub-section */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#4F46E5]" />
                  Certifications & Achievements ({certifications.length})
                </h3>

                {certifications.map((c, idx) => (
                  <div key={idx} className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{c.title}</p>
                      <p className="text-xs text-gray-500">
                        {c.type} {c.issuer && `&bull; Issued by ${c.issuer}`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCertifications(certifications.filter((_, i) => i !== idx))}
                      className="text-gray-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-3">
                  <span className="text-xs font-semibold text-gray-700">Add Certification / Achievement</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Title / Name"
                      value={newCert.title}
                      onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
                      className="input-field text-xs sm:col-span-2"
                    />
                    <select
                      value={newCert.type}
                      onChange={(e) => setNewCert({ ...newCert, type: e.target.value })}
                      className="input-field text-xs"
                    >
                      <option value="Certification">Certification</option>
                      <option value="Achievement">Achievement / Award</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Issuer (e.g. AWS, Coursera, Hackathon)"
                      value={newCert.issuer}
                      onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                      className="input-field text-xs"
                    />
                    <input
                      type="url"
                      placeholder="Credential URL (Optional)"
                      value={newCert.credentialUrl}
                      onChange={(e) => setNewCert({ ...newCert, credentialUrl: e.target.value })}
                      className="input-field text-xs sm:col-span-2"
                    />
                  </div>
                  <Button type="button" size="sm" onClick={handleAddCert} className="bg-[#4F46E5] text-white text-xs gap-1">
                    <Plus className="w-3.5 h-3.5" /> Add to List
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: INTERESTS, PREFERENCES & GOALS */}
          {currentSection.key === 'interests_goals' && (
            <div className="space-y-6">
              {/* Work Preferences */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 block">
                  Work Preferences (Select all that apply)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(configData?.workPreferences || ['Remote', 'Onsite', 'Hybrid']).map((wp) => {
                    const selected = interests.workPreferences.includes(wp)
                    return (
                      <button
                        key={wp}
                        type="button"
                        onClick={() => {
                          if (selected) {
                            setInterests({
                              ...interests,
                              workPreferences: interests.workPreferences.filter((p) => p !== wp),
                            })
                          } else {
                            setInterests({
                              ...interests,
                              workPreferences: [...interests.workPreferences, wp],
                            })
                          }
                        }}
                        className={`p-3.5 rounded-xl border text-center transition-all ${
                          selected
                            ? 'bg-indigo-50 border-[#4F46E5] text-[#4F46E5] font-bold shadow-2xs'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <p className="text-sm">{wp}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Areas of Interest */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 block">
                  Areas of Interest (Select topics that excite you)
                </label>
                <div className="flex flex-wrap gap-2">
                  {(configData?.areasOfInterest || []).map((area) => {
                    const selected = interests.areasOfInterest.includes(area)
                    return (
                      <button
                        key={area}
                        type="button"
                        onClick={() => {
                          if (selected) {
                            setInterests({
                              ...interests,
                              areasOfInterest: interests.areasOfInterest.filter((a) => a !== area),
                            })
                          } else {
                            setInterests({
                              ...interests,
                              areasOfInterest: [...interests.areasOfInterest, area],
                            })
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                          selected
                            ? 'bg-[#4F46E5] text-white border-[#4F46E5]'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {area}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Career Interests (Optional) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-700 block">
                    Target Career Paths (Optional - you can select multiple or add later)
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(configData?.careerInterests || []).map((career) => {
                    const selected = interests.careerInterests.includes(career)
                    return (
                      <button
                        key={career}
                        type="button"
                        onClick={() => {
                          if (selected) {
                            setInterests({
                              ...interests,
                              careerInterests: interests.careerInterests.filter((c) => c !== career),
                            })
                          } else {
                            setInterests({
                              ...interests,
                              careerInterests: [...interests.careerInterests, career],
                            })
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                          selected
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {career}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Goals */}
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Short-Term Goal (Next 6-12 months)
                  </label>
                  <textarea
                    rows={2}
                    value={interests.shortTermGoal}
                    onChange={(e) => setInterests({ ...interests, shortTermGoal: e.target.value })}
                    className="input-field text-sm resize-none"
                    placeholder="e.g. Secure a Summer Internship in Software Development, master React and Tailwind CSS..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Long-Term Goal (3-5 years)
                  </label>
                  <textarea
                    rows={2}
                    value={interests.longTermGoal}
                    onChange={(e) => setInterests({ ...interests, longTermGoal: e.target.value })}
                    className="input-field text-sm resize-none"
                    placeholder="e.g. Become a Senior Full-Stack Cloud Architect or launch an AI startup..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-6 border-t border-gray-100 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={currentStepIndex === 0 || isSavingStep}
              onClick={() => {
                setValidationError('')
                setCurrentStepIndex((prev) => Math.max(0, prev - 1))
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="text-xs text-gray-700 gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>

            <Button
              type="button"
              onClick={() => handleSaveStep(true)}
              disabled={isSavingStep || isCompleting}
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs px-6 py-2 gap-1.5 shadow-md shadow-indigo-100"
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
