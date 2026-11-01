import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useGetStudentProfileQuery,
  useUpdateProfileMutation,
  useSaveProfilePreferencesMutation,
  useGetOnboardingConfigQuery,
  useSaveProfileSkillsMutation,
  useAddSkillMutation,
  useUpdateSkillMutation,
  useDeleteSkillMutation,
  useAddProjectMutation,
  useDeleteProjectMutation,
  useAddExperienceMutation,
  useDeleteExperienceMutation,
  useAddCertificationMutation,
  useDeleteCertificationMutation,
} from '@/store/api/onboardingApiSlice'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Loading from '@/components/ui/Loading'
import Select from '@/components/ui/select'
import {
  User,
  GraduationCap,
  Sparkles,
  Briefcase,
  Heart,
  CheckCircle2,
  Trophy,
  ExternalLink,
  Plus,
  Trash2,
  Save,
  ArrowRight,
  AlertCircle,
  Building2,
  Calendar,
  Award,
  Globe,
  GitBranch,
  Target,
} from 'lucide-react'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const PROFICIENCY_LEVELS = ['Beginner', 'Intermediate', 'Advanced']
const EMPLOYMENT_TYPES = ['Internship', 'Full-time', 'Part-time', 'Contract', 'Freelance']

const profColors = {
  Beginner: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Intermediate: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Advanced: 'bg-purple-50 text-purple-700 border-purple-200',
}

export default function StudentProfile() {
  const navigate = useNavigate()
  const { data: profileData, isLoading, refetch: refetchProfile } = useGetStudentProfileQuery()
  const { data: configData } = useGetOnboardingConfigQuery()
  const [updateProfileApi, { isLoading: isUpdating }] = useUpdateProfileMutation()
  const [saveProfilePreferencesApi, { isLoading: isSavingPreferences }] = useSaveProfilePreferencesMutation()

  // Skills bulk save mutation
  const [saveProfileSkillsApi, { isLoading: isSavingSkills }] = useSaveProfileSkillsMutation()

  // Project, Experience & Cert mutations
  const [addProjectApi, { isLoading: isAddingProj }] = useAddProjectMutation()
  const [deleteProjectApi] = useDeleteProjectMutation()

  const [addExperienceApi, { isLoading: isAddingExp }] = useAddExperienceMutation()
  const [deleteExperienceApi] = useDeleteExperienceMutation()

  const [addCertApi, { isLoading: isAddingCert }] = useAddCertificationMutation()
  const [deleteCertApi] = useDeleteCertificationMutation()

  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'academic' | 'skills' | 'projects' | 'interests'
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    headline: '',
    bio: '',
    school: '',
    degree: '',
    fieldOfStudy: '',
    startMonth: '',
    startYear: '',
    endMonth: '',
    endYear: '',
    grade: '',
    activities: '',
    workPreferences: [],
    areasOfInterest: [],
    careerInterests: [],
    shortTermGoal: '',
    longTermGoal: '',
  })

  // Custom inputs for Preferences
  const [customAreaInput, setCustomAreaInput] = useState('')
  const [customCareerInput, setCustomCareerInput] = useState('')

  // Skills State (managed locally and persisted via "Save Skills" button)
  const [selectedSkills, setSelectedSkills] = useState([])
  const [skillCategoryFilter, setSkillCategoryFilter] = useState('All')
  const [customSkillInput, setCustomSkillInput] = useState('')
  const [customProficiency, setCustomProficiency] = useState('Intermediate')

  // Sub-resource inline states
  const [newProj, setNewProj] = useState({
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
    description: '',
  })
  const [newCert, setNewCert] = useState({
    title: '',
    issuer: '',
    type: 'Certification',
    issueDate: '',
    credentialUrl: '',
    description: '',
  })

  useEffect(() => {
    if (profileData) {
      const u = profileData.user || {}
      const p = profileData.profile || {}
      setFormData({
        firstName: u.firstName || '',
        lastName: u.lastName || '',
        phone: p.phone || '',
        headline: p.headline || '',
        bio: p.bio || '',
        school: p.school || p.university || '',
        degree: p.degree || p.currentDegree || '',
        fieldOfStudy: p.fieldOfStudy || '',
        startMonth: p.startMonth || '',
        startYear: p.startYear ? String(p.startYear) : '',
        endMonth: p.endMonth || '',
        endYear: p.endYear ? String(p.endYear) : (p.expectedGraduationYear ? String(p.expectedGraduationYear) : ''),
        grade: p.grade || '',
        activities: p.activities || '',
        workPreferences: Array.isArray(p.workPreferences) ? p.workPreferences : [],
        areasOfInterest: Array.isArray(p.areasOfInterest) ? p.areasOfInterest : [],
        careerInterests: Array.isArray(p.careerInterests) ? p.careerInterests : [],
        shortTermGoal: p.shortTermGoal || '',
        longTermGoal: p.longTermGoal || '',
      })

      const rawSkills = profileData.skills || []
      setSelectedSkills(
        rawSkills.map((s) => ({
          skillId: s.skillId || null,
          name: s.name,
          category: s.category || 'Skill',
          proficiency: s.proficiency || 'Intermediate',
        }))
      )
    }
  }, [profileData])

  const showNotification = (msg, isErr = false) => {
    if (isErr) {
      setErrorMsg(msg)
      setTimeout(() => setErrorMsg(''), 4000)
    } else {
      setSuccessMsg(msg)
      setTimeout(() => setSuccessMsg(''), 4000)
    }
  }

  // Available options from config
  const catalogSkills = configData?.skills || []
  const availableDegrees = configData?.degrees || ['BS Computer Science']
  const availableAreas = configData?.areasOfInterest?.length ? configData.areasOfInterest : ['Web Technologies']
  const availableCareers = configData?.careerInterests?.length ? configData.careerInterests : ['Frontend Developer']

  // Combined options with common suggestions
  const allSuggestedAreas = [
    ...new Set([
      ...availableAreas,
      'Web Technologies',
      'Mobile App Development',
      'Artificial Intelligence',
      'Cloud Computing',
      'Cybersecurity',
      'Data Science',
    ]),
  ]

  const allSuggestedCareers = [
    ...new Set([
      ...availableCareers,
      'Frontend Developer',
      'Full-Stack Developer',
      'Backend Developer',
      'React Developer',
      'Software Engineer',
      'UI/UX Designer',
    ]),
  ]

  const user = profileData?.user || {}
  const profile = profileData?.profile || {}
  const projects = profileData?.projects || []
  const experiences = profileData?.experiences || []
  const certifications = profileData?.certifications || []
  const completionPercentage = profile.completionPercentage || 0

  const initials = [user.firstName?.[0], user.lastName?.[0]].filter(Boolean).join('') || 'U'

  // --- SAVE PROFILE (Academic, Bio, Contact) ---
  const handleSaveProfile = async (e) => {
    e?.preventDefault()
    try {
      await updateProfileApi(formData).unwrap()
      if (typeof refetchProfile === 'function') {
        await refetchProfile()
      }
      showNotification('Profile updated and synchronized successfully!')
    } catch {
      showNotification('Failed to update profile. Please try again.', true)
    }
  }

  // --- SAVE PREFERENCES & GOALS ---
  const handleSavePreferences = async (e) => {
    e?.preventDefault()
    try {
      // Auto-include pending custom area input if typed and < 3
      let updatedAreas = [...(formData.areasOfInterest || [])]
      const trimmedArea = customAreaInput.trim()
      if (
        trimmedArea &&
        updatedAreas.length < 3 &&
        !updatedAreas.some((a) => a.toLowerCase() === trimmedArea.toLowerCase())
      ) {
        updatedAreas.push(trimmedArea)
        setCustomAreaInput('')
      }

      // Auto-include pending custom career input if typed and < 3
      let updatedCareers = [...(formData.careerInterests || [])]
      const trimmedCareer = customCareerInput.trim()
      if (
        trimmedCareer &&
        updatedCareers.length < 3 &&
        !updatedCareers.some((c) => c.toLowerCase() === trimmedCareer.toLowerCase())
      ) {
        updatedCareers.push(trimmedCareer)
        setCustomCareerInput('')
      }

      const payload = {
        workPreferences: formData.workPreferences || [],
        areasOfInterest: updatedAreas,
        careerInterests: updatedCareers,
        shortTermGoal: formData.shortTermGoal || '',
        longTermGoal: formData.longTermGoal || '',
      }

      // Optimistically update local formData state
      setFormData((prev) => ({
        ...prev,
        ...payload,
      }))

      await saveProfilePreferencesApi(payload).unwrap()
      if (typeof refetchProfile === 'function') {
        await refetchProfile()
      }
      showNotification('Preferences & Goals saved and synchronized successfully!')
    } catch (err) {
      console.error('Failed to save preferences:', err)
      showNotification('Failed to save preferences. Please try again.', true)
    }
  }

  // --- WORK PREFERENCES HANDLERS (Primary & Secondary) ---
  const handleToggleWorkPref = (wp) => {
    const current = formData.workPreferences || []
    if (current.includes(wp)) {
      setFormData({
        ...formData,
        workPreferences: current.filter((p) => p !== wp),
      })
    } else {
      setFormData({
        ...formData,
        workPreferences: [...current, wp],
      })
    }
  }

  const handleSetPrimaryWorkPref = (wp) => {
    const current = formData.workPreferences || []
    if (!current.includes(wp)) return
    const filtered = current.filter((p) => p !== wp)
    setFormData({
      ...formData,
      workPreferences: [wp, ...filtered],
    })
  }

  // --- AREAS OF INTEREST HANDLERS (At most 3, Primary & Secondary) ---
  const handleToggleArea = (area) => {
    const current = formData.areasOfInterest || []
    if (current.includes(area)) {
      setFormData({
        ...formData,
        areasOfInterest: current.filter((a) => a !== area),
      })
    } else {
      if (current.length >= 3) {
        showNotification('You can select at most 3 areas of interest', true)
        return
      }
      setFormData({
        ...formData,
        areasOfInterest: [...current, area],
      })
    }
  }

  const handleSetPrimaryArea = (area) => {
    const current = formData.areasOfInterest || []
    if (!current.includes(area)) return
    const filtered = current.filter((a) => a !== area)
    setFormData({
      ...formData,
      areasOfInterest: [area, ...filtered],
    })
  }

  const handleAddCustomArea = (e) => {
    e?.preventDefault()
    const trimmed = customAreaInput.trim()
    if (!trimmed) return
    const current = formData.areasOfInterest || []
    if (current.some((a) => a.toLowerCase() === trimmed.toLowerCase())) {
      showNotification(`"${trimmed}" is already added`, true)
      return
    }
    if (current.length >= 3) {
      showNotification('You can select at most 3 areas of interest', true)
      return
    }
    setFormData({
      ...formData,
      areasOfInterest: [...current, trimmed],
    })
    setCustomAreaInput('')
  }

  // --- TARGET CAREER PATHS HANDLERS (At most 3, Primary & Secondary) ---
  const handleToggleCareer = (career) => {
    const current = formData.careerInterests || []
    if (current.includes(career)) {
      setFormData({
        ...formData,
        careerInterests: current.filter((c) => c !== career),
      })
    } else {
      if (current.length >= 3) {
        showNotification('You can select at most 3 target career paths', true)
        return
      }
      setFormData({
        ...formData,
        careerInterests: [...current, career],
      })
    }
  }

  const handleSetPrimaryCareer = (career) => {
    const current = formData.careerInterests || []
    if (!current.includes(career)) return
    const filtered = current.filter((c) => c !== career)
    setFormData({
      ...formData,
      careerInterests: [career, ...filtered],
    })
  }

  const handleAddCustomCareer = (e) => {
    e?.preventDefault()
    const trimmed = customCareerInput.trim()
    if (!trimmed) return
    const current = formData.careerInterests || []
    if (current.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      showNotification(`"${trimmed}" is already added`, true)
      return
    }
    if (current.length >= 3) {
      showNotification('You can select at most 3 target career paths', true)
      return
    }
    setFormData({
      ...formData,
      careerInterests: [...current, trimmed],
    })
    setCustomCareerInput('')
  }

  // --- SKILLS HANDLERS (LOCAL STATE + PERSIST VIA SAVE BUTTON) ---
  const skillCategories = ['All', ...new Set(catalogSkills.map((s) => s.category).filter(Boolean))]

  const filteredCatalogSkills =
    skillCategoryFilter === 'All'
      ? catalogSkills
      : catalogSkills.filter((s) => s.category === skillCategoryFilter)

  const isSkillSelected = (catalogSkill) => {
    return selectedSkills.some(
      (s) =>
        (s.skillId && s.skillId === catalogSkill.id) ||
        (s.name && s.name.toLowerCase() === catalogSkill.name.toLowerCase())
    )
  }

  const handleToggleCatalogSkill = (catalogSkill) => {
    const isAlreadySelected = isSkillSelected(catalogSkill)
    if (isAlreadySelected) {
      setSelectedSkills(
        selectedSkills.filter(
          (s) =>
            !(
              (s.skillId && s.skillId === catalogSkill.id) ||
              (s.name && s.name.toLowerCase() === catalogSkill.name.toLowerCase())
            )
        )
      )
    } else {
      setSelectedSkills([
        ...selectedSkills,
        {
          skillId: catalogSkill.id,
          name: catalogSkill.name,
          category: catalogSkill.category || 'Skill',
          proficiency: 'Intermediate',
        },
      ])
    }
  }

  const handleAddCustomSkill = (e) => {
    e?.preventDefault()
    const trimmed = customSkillInput.trim()
    if (!trimmed) {
      showNotification('Please enter a skill name', true)
      return
    }

    const alreadyExists = selectedSkills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())
    if (alreadyExists) {
      showNotification(`"${trimmed}" is already added to your skills`, true)
      return
    }

    const matchingCatalog = catalogSkills.find((c) => c.name.toLowerCase() === trimmed.toLowerCase())

    setSelectedSkills([
      ...selectedSkills,
      {
        skillId: matchingCatalog ? matchingCatalog.id : null,
        name: trimmed,
        category: matchingCatalog?.category || 'Custom',
        proficiency: customProficiency,
      },
    ])
    setCustomSkillInput('')
    setCustomProficiency('Intermediate')
    showNotification(`Added "${trimmed}" to selected skills. Click "Save Skills" to save changes.`)
  }

  const handleUpdateSkillProficiency = (skillName, newProf) => {
    setSelectedSkills(
      selectedSkills.map((s) => (s.name === skillName ? { ...s, proficiency: newProf } : s))
    )
  }

  const handleRemoveSkill = (skillName) => {
    setSelectedSkills(selectedSkills.filter((s) => s.name !== skillName))
  }

  const handleSaveAllSkills = async () => {
    try {
      await saveProfileSkillsApi(selectedSkills).unwrap()
      showNotification('Skills saved and synchronized successfully!')
    } catch {
      showNotification('Failed to save skills. Please try again.', true)
    }
  }

  // --- PROJECTS HANDLERS ---
  const handleAddProject = async (e) => {
    e.preventDefault()
    if (!newProj.title.trim()) {
      showNotification('Project title is required', true)
      return
    }
    try {
      await addProjectApi({
        ...newProj,
        technologies: newProj.technologies
          ? newProj.technologies.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
      }).unwrap()
      setNewProj({ title: '', description: '', technologies: '', projectUrl: '', githubUrl: '' })
      showNotification('Project added successfully!')
    } catch {
      showNotification('Failed to add project', true)
    }
  }

  const handleDeleteProject = async (id) => {
    try {
      await deleteProjectApi(id).unwrap()
      showNotification('Project removed')
    } catch {
      showNotification('Failed to remove project', true)
    }
  }

  // --- EXPERIENCES HANDLERS ---
  const handleAddExperience = async (e) => {
    e.preventDefault()
    if (!newExp.companyName.trim() || !newExp.roleTitle.trim()) {
      showNotification('Company name and role title are required', true)
      return
    }
    try {
      await addExperienceApi(newExp).unwrap()
      setNewExp({ companyName: '', roleTitle: '', employmentType: 'Internship', location: '', description: '' })
      showNotification('Experience added successfully!')
    } catch {
      showNotification('Failed to add experience', true)
    }
  }

  const handleDeleteExperience = async (id) => {
    try {
      await deleteExperienceApi(id).unwrap()
      showNotification('Experience removed')
    } catch {
      showNotification('Failed to remove experience', true)
    }
  }

  // --- CERTIFICATIONS HANDLERS ---
  const handleAddCert = async (e) => {
    e.preventDefault()
    if (!newCert.title.trim()) {
      showNotification('Certification/Achievement title is required', true)
      return
    }
    try {
      await addCertApi(newCert).unwrap()
      setNewCert({ title: '', issuer: '', type: 'Certification', issueDate: '', credentialUrl: '', description: '' })
      showNotification('Certification added successfully!')
    } catch {
      showNotification('Failed to add certification', true)
    }
  }

  const handleDeleteCert = async (id) => {
    try {
      await deleteCertApi(id).unwrap()
      showNotification('Certification removed')
    } catch {
      showNotification('Failed to remove certification', true)
    }
  }

  if (isLoading) {
    return (
      <Loading
        variant="page"
        message="Loading your student profile..."
        description="Fetching your education history, skills, projects, and career preferences."
      />
    )
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Notifications */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Profile Header Hero Card */}
      <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-white text-xl font-bold shadow-md shadow-indigo-100 shrink-0">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">
                {user.fullName || [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Student User'}
              </h1>
              <Badge
                className={
                  profile.isOnboarded
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]'
                    : 'bg-amber-50 text-amber-700 border-amber-200 text-[10px]'
                }
              >
                {profile.isOnboarded ? 'Onboarding Completed' : 'Onboarding In Progress'}
              </Badge>
            </div>
            <p className="text-xs text-gray-600 mt-0.5">
              {profile.degree || profile.currentDegree || 'Student'} &bull; {profile.school || profile.university || 'University'}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">{user.email}</p>
          </div>
        </div>

        {/* Completion Gauge */}
        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-gray-700 gap-4">
              <span>Profile Strength</span>
              <span className="text-[#4F46E5] font-bold">{completionPercentage}%</span>
            </div>
            <div className="w-36 h-2 bg-gray-200 rounded-full overflow-hidden mt-1.5">
              <div
                className="h-full bg-[#4F46E5] transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
          {!profile.isOnboarded && (
            <Button
              size="sm"
              onClick={() => navigate('/onboarding')}
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs gap-1.5 rounded-lg"
            >
              Resume Wizard <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 whitespace-nowrap border-b-2 transition-all ${
            activeTab === 'overview'
              ? 'border-[#4F46E5] text-[#4F46E5]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <User className="w-4 h-4" />
          Overview & Bio
        </button>
        <button
          onClick={() => setActiveTab('academic')}
          className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 whitespace-nowrap border-b-2 transition-all ${
            activeTab === 'academic'
              ? 'border-[#4F46E5] text-[#4F46E5]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Academic & Contact
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 whitespace-nowrap border-b-2 transition-all ${
            activeTab === 'skills'
              ? 'border-[#4F46E5] text-[#4F46E5]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Skills ({selectedSkills.length})
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 whitespace-nowrap border-b-2 transition-all ${
            activeTab === 'projects'
              ? 'border-[#4F46E5] text-[#4F46E5]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Projects & Experience ({projects.length + experiences.length + certifications.length})
        </button>
        <button
          onClick={() => setActiveTab('interests')}
          className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 whitespace-nowrap border-b-2 transition-all ${
            activeTab === 'interests'
              ? 'border-[#4F46E5] text-[#4F46E5]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Heart className="w-4 h-4" />
          Preferences & Goals
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Bio & Headline card */}
          <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-4">
            {profile.headline ? (
              <div className="pb-3 border-b border-gray-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Headline</span>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">{profile.headline}</p>
              </div>
            ) : null}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">About Me</h3>
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                {profile.bio || 'No bio set yet. Head to "Academic & Contact" tab to introduce yourself and set your bio.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quick Academic Summary */}
            <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#4F46E5]" />
                Academic Background
              </h3>
              <div className="text-xs space-y-2">
                <p>
                  <span className="font-semibold text-gray-700">School:</span> {profile.school || profile.university || 'Not set'}
                </p>
                <p>
                  <span className="font-semibold text-gray-700">Degree:</span> {profile.degree || profile.currentDegree || 'Not selected'}
                </p>
                {profile.fieldOfStudy && (
                  <p>
                    <span className="font-semibold text-gray-700">Field of Study:</span> {profile.fieldOfStudy}
                  </p>
                )}
                {(profile.startYear || profile.endYear) && (
                  <p>
                    <span className="font-semibold text-gray-700">Timeline:</span>{' '}
                    {[profile.startMonth, profile.startYear].filter(Boolean).join(' ') || 'Start'} &mdash;{' '}
                    {[profile.endMonth, profile.endYear].filter(Boolean).join(' ') || 'Expected'}
                  </p>
                )}
                {profile.grade && (
                  <p>
                    <span className="font-semibold text-gray-700">Grade / CGPA:</span> {profile.grade}
                  </p>
                )}
                {profile.activities && (
                  <p>
                    <span className="font-semibold text-gray-700">Activities:</span> {profile.activities}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Skills Summary */}
            <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#4F46E5]" />
                  Skills ({selectedSkills.length})
                </h3>
                <button
                  onClick={() => setActiveTab('skills')}
                  className="text-[11px] font-semibold text-[#4F46E5] hover:underline"
                >
                  Manage
                </button>
              </div>
              {selectedSkills.length === 0 ? (
                <p className="text-xs text-gray-400">No skills added yet.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {selectedSkills.map((sk) => (
                    <Badge
                      key={sk.name}
                      variant="secondary"
                      className="text-[11px] bg-indigo-50 text-[#4F46E5] border border-indigo-100"
                    >
                      {sk.name} &bull; <span className="opacity-75">{sk.proficiency}</span>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Preferences & Target Careers Card (With Primary & Secondary Badges) */}
          <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                <Target className="w-4 h-4 text-[#4F46E5]" />
                Career Preferences & Goals
              </h3>
              <button
                onClick={() => setActiveTab('interests')}
                className="text-[11px] font-semibold text-[#4F46E5] hover:underline"
              >
                Edit Goals
              </button>
            </div>

            {(() => {
              const displayWorkPrefs = profile.workPreferences?.length ? profile.workPreferences : (formData.workPreferences || [])
              const displayAreas = profile.areasOfInterest?.length ? profile.areasOfInterest : (formData.areasOfInterest || [])
              const displayCareers = profile.careerInterests?.length ? profile.careerInterests : (formData.careerInterests || [])
              const displayShortGoal = profile.shortTermGoal || formData.shortTermGoal
              const displayLongGoal = profile.longTermGoal || formData.longTermGoal

              return (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="font-semibold text-gray-700 block mb-1">Work Preferences:</span>
                      {displayWorkPrefs.length ? (
                        <div className="flex flex-wrap gap-1.5">
                          {displayWorkPrefs.map((wp, idx) => (
                            <Badge
                              key={wp}
                              className={
                                idx === 0
                                  ? 'bg-[#4F46E5] text-white border-0 text-[10px] font-bold'
                                  : 'bg-indigo-50 text-[#4F46E5] border-indigo-100 text-[10px]'
                              }
                            >
                              {wp} {idx === 0 ? '(Primary)' : '(Secondary)'}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">Not selected</span>
                      )}
                    </div>

                    <div>
                      <span className="font-semibold text-gray-700 block mb-1">Areas of Interest (Max 3):</span>
                      {displayAreas.length ? (
                        <div className="flex flex-wrap gap-1.5">
                          {displayAreas.map((a, idx) => (
                            <Badge
                              key={a}
                              className={
                                idx === 0
                                  ? 'bg-[#4F46E5] text-white border-0 text-[10px] font-bold'
                                  : 'bg-indigo-50 text-[#4F46E5] border-indigo-100 text-[10px]'
                              }
                            >
                              {a} {idx === 0 ? '(Primary)' : '(Secondary)'}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">Not selected</span>
                      )}
                    </div>

                    <div>
                      <span className="font-semibold text-gray-700 block mb-1">Target Roles (Max 3):</span>
                      {displayCareers.length ? (
                        <div className="flex flex-wrap gap-1.5">
                          {displayCareers.map((c, idx) => (
                            <Badge
                              key={c}
                              className={
                                idx === 0
                                  ? 'bg-[#4F46E5] text-white border-0 text-[10px] font-bold'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]'
                              }
                            >
                              {c} {idx === 0 ? '(Primary)' : '(Secondary)'}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">Not selected</span>
                      )}
                    </div>
                  </div>

                  {(displayShortGoal || displayLongGoal) && (
                    <div className="pt-3 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {displayShortGoal && (
                        <div>
                          <span className="font-semibold text-gray-700 block mb-0.5">Short-Term Goal:</span>
                          <p className="text-gray-600">{displayShortGoal}</p>
                        </div>
                      )}
                      {displayLongGoal && (
                        <div>
                          <span className="font-semibold text-gray-700 block mb-0.5">Long-Term Goal:</span>
                          <p className="text-gray-600">{displayLongGoal}</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )
            })()}
          </div>
        </div>
      )}

      {/* TAB 2: ACADEMIC & CONTACT FORM */}
      {activeTab === 'academic' && (
        <form onSubmit={handleSaveProfile} className="p-6 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="input-field text-xs"
                placeholder="First Name"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="input-field text-xs"
                placeholder="Last Name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field text-xs"
                placeholder="+92 300 1234567"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Professional Headline</label>
              <input
                type="text"
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                className="input-field text-xs"
                placeholder="e.g. BSCS Student | Frontend Developer | Aspiring Software Engineer"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">School / University</label>
            <input
              type="text"
              value={formData.school}
              onChange={(e) => setFormData({ ...formData, school: e.target.value })}
              className="input-field text-xs"
              placeholder="Ex: Riphah International University"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Degree</label>
              <input
                type="text"
                list="profile-degree-list"
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                className="input-field text-xs"
                placeholder="Ex: BS Computer Science"
              />
              <datalist id="profile-degree-list">
                {availableDegrees.map((deg) => (
                  <option key={deg} value={deg} />
                ))}
              </datalist>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Field of Study</label>
              <input
                type="text"
                value={formData.fieldOfStudy}
                onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })}
                className="input-field text-xs"
                placeholder="Ex: Computer Science / Software Engineering"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Start Date</label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={formData.startMonth}
                  onChange={(e) => setFormData({ ...formData, startMonth: e.target.value })}
                  className="input-field text-xs"
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
                  value={formData.startYear}
                  onChange={(e) => setFormData({ ...formData, startYear: e.target.value })}
                  className="input-field text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">End Date (or Expected)</label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={formData.endMonth}
                  onChange={(e) => setFormData({ ...formData, endMonth: e.target.value })}
                  className="input-field text-xs"
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
                  value={formData.endYear}
                  onChange={(e) => setFormData({ ...formData, endYear: e.target.value })}
                  className="input-field text-xs"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Grade / CGPA</label>
              <input
                type="text"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="input-field text-xs"
                placeholder="Ex: 3.8 CGPA"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Activities and Societies</label>
              <input
                type="text"
                value={formData.activities}
                onChange={(e) => setFormData({ ...formData, activities: e.target.value })}
                className="input-field text-xs"
                placeholder="Ex: Coding Club, ACM Student Chapter"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">Bio / About Me</label>
            <textarea
              rows={4}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="input-field text-xs resize-none"
              placeholder="Introduce yourself, your passions, technical interests, and goals..."
            />
          </div>

          <Button
            type="submit"
            disabled={isUpdating}
            className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs gap-1.5 px-5 py-2.5 rounded-xl shadow-xs"
          >
            <Save className="w-3.5 h-3.5" /> {isUpdating ? 'Saving Changes...' : 'Save Academic & Contact Changes'}
          </Button>
        </form>
      )}

      {/* TAB 3: SKILLS MANAGEMENT (CLEAN, MINIMAL, WITH SAVE BUTTON) */}
      {activeTab === 'skills' && (
        <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#4F46E5]" />
                Your Skills
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Select skills from the list or add your own, choose your skill level, and save your changes.
              </p>
            </div>
            <Badge className="bg-indigo-50 text-[#4F46E5] border-indigo-100 text-xs">
              {selectedSkills.length} Selected
            </Badge>
          </div>

          {/* 1. Browse Catalog Skills (Quick Selection) */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Browse Skills Catalog
              </span>
              {skillCategories.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                  {skillCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSkillCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                        skillCategoryFilter === cat
                          ? 'bg-[#4F46E5] text-white shadow-2xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {filteredCatalogSkills.map((sk) => {
                const isSelected = isSkillSelected(sk)
                return (
                  <button
                    key={sk.id || sk.name}
                    type="button"
                    onClick={() => handleToggleCatalogSkill(sk)}
                    className={`p-3 rounded-xl border text-xs font-semibold text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-[#4F46E5] text-white border-[#4F46E5] shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:bg-gray-50/60'
                    }`}
                  >
                    <span className="truncate">{sk.name}</span>
                    {isSelected ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
                    ) : (
                      <Plus className="w-4 h-4 shrink-0 text-gray-400" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 2. Add Custom Skill Form */}
          <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-200/80 space-y-3">
            <span className="text-xs font-bold text-gray-800 block">Add Custom Skill</span>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <div className="sm:col-span-6">
                <input
                  type="text"
                  placeholder="e.g. Python, Flutter, TypeScript, Figma"
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddCustomSkill()
                    }
                  }}
                  className="input-field text-xs w-full"
                />
              </div>
              <div className="sm:col-span-3">
                <Select
                  value={customProficiency}
                  onChange={(val) => setCustomProficiency(val)}
                  options={PROFICIENCY_LEVELS.map((lvl) => ({
                    value: lvl,
                    label: lvl,
                  }))}
                />
              </div>
              <div className="sm:col-span-3">
                <Button
                  type="button"
                  onClick={handleAddCustomSkill}
                  className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs w-full gap-1.5 rounded-xl h-9"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Skill
                </Button>
              </div>
            </div>
          </div>

          {/* 3. Selected Skills List (With inline proficiency update & remove) */}
          <div className="space-y-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Your Selected Skills ({selectedSkills.length})
              </span>
              <span className="text-[11px] text-gray-400">Click &ldquo;Save Skills&rdquo; below to persist all changes</span>
            </div>

            {selectedSkills.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Sparkles className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-gray-600">No skills selected yet</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Select a skill from the catalog above or add a custom skill.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {selectedSkills.map((sk) => (
                  <div
                    key={sk.name}
                    className="p-3.5 bg-white rounded-xl border border-gray-200 shadow-2xs hover:border-indigo-200 transition-all flex flex-col justify-between gap-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-gray-900">{sk.name}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{sk.category || 'Skill'}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(sk.name)}
                        className="text-gray-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Remove skill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
                      <span className="text-[10px] text-gray-500 font-medium">Level:</span>
                      <select
                        value={sk.proficiency}
                        onChange={(e) => handleUpdateSkillProficiency(sk.name, e.target.value)}
                        className={`text-[11px] font-semibold py-1 px-2.5 rounded-lg border focus:outline-hidden cursor-pointer ${
                          profColors[sk.proficiency] || 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        {PROFICIENCY_LEVELS.map((lvl) => (
                          <option key={lvl} value={lvl}>
                            {lvl}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. THE SAVE SKILLS BUTTON */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <Button
              type="button"
              onClick={handleSaveAllSkills}
              disabled={isSavingSkills}
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-xs gap-2"
            >
              <Save className="w-3.5 h-3.5" /> {isSavingSkills ? 'Saving Skills...' : 'Save Skills'}
            </Button>
            <span className="text-[11px] text-gray-400">
              {selectedSkills.length} skill{selectedSkills.length === 1 ? '' : 's'} ready to sync
            </span>
          </div>
        </div>
      )}

      {/* TAB 4: PROJECTS, EXPERIENCE & CERTIFICATIONS */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          {/* --- 1. Portfolio Projects --- */}
          <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Portfolio Projects</h3>
                <p className="text-xs text-gray-500 mt-0.5">Showcase your coding projects and open source work.</p>
              </div>
              <Badge className="bg-indigo-50 text-[#4F46E5] border-indigo-100 text-xs">
                {projects.length} Project{projects.length === 1 ? '' : 's'}
              </Badge>
            </div>

            {projects.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No projects added yet.</p>
            ) : (
              <div className="space-y-3">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-gray-900">{proj.title}</p>
                      {proj.description && <p className="text-xs text-gray-600 leading-relaxed">{proj.description}</p>}
                      {proj.technologies?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {proj.technologies.map((t, idx) => (
                            <Badge key={idx} variant="secondary" className="text-[10px] bg-white border border-gray-200 text-gray-700">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-3 pt-1 text-[11px]">
                        {proj.projectUrl && (
                          <a
                            href={proj.projectUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#4F46E5] font-semibold flex items-center gap-1 hover:underline"
                          >
                            <Globe className="w-3 h-3" /> Live Demo
                          </a>
                        )}
                        {proj.githubUrl && (
                          <a
                            href={proj.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-gray-700 font-semibold flex items-center gap-1 hover:underline"
                          >
                            <GitBranch className="w-3 h-3" /> Source Code
                          </a>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteProject(proj.id)}
                      className="text-gray-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Project Form */}
            <form
              onSubmit={handleAddProject}
              className="p-4 bg-gray-50/50 rounded-xl border border-dashed border-gray-300 space-y-2.5"
            >
              <span className="text-xs font-bold text-gray-800 block">Add New Project</span>
              <input
                type="text"
                placeholder="Project Title *"
                value={newProj.title}
                onChange={(e) => setNewProj({ ...newProj, title: e.target.value })}
                className="input-field text-xs"
              />
              <textarea
                rows={2}
                placeholder="Description of the project, features, and your contribution"
                value={newProj.description}
                onChange={(e) => setNewProj({ ...newProj, description: e.target.value })}
                className="input-field text-xs resize-none"
              />
              <input
                type="text"
                placeholder="Technologies used (comma separated, e.g. React, Node.js, PostgreSQL)"
                value={newProj.technologies}
                onChange={(e) => setNewProj({ ...newProj, technologies: e.target.value })}
                className="input-field text-xs"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="url"
                  placeholder="Live Project URL (optional)"
                  value={newProj.projectUrl}
                  onChange={(e) => setNewProj({ ...newProj, projectUrl: e.target.value })}
                  className="input-field text-xs"
                />
                <input
                  type="url"
                  placeholder="GitHub Repository URL (optional)"
                  value={newProj.githubUrl}
                  onChange={(e) => setNewProj({ ...newProj, githubUrl: e.target.value })}
                  className="input-field text-xs"
                />
              </div>
              <Button type="submit" disabled={isAddingProj} size="sm" className="bg-[#4F46E5] text-white text-xs gap-1">
                <Plus className="w-3.5 h-3.5" /> {isAddingProj ? 'Adding...' : 'Add Project'}
              </Button>
            </form>
          </div>

          {/* --- 2. Work Experience & Internships --- */}
          <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Work Experience & Internships</h3>
                <p className="text-xs text-gray-500 mt-0.5">Detail past or current internships, part-time, or full-time jobs.</p>
              </div>
              <Badge className="bg-indigo-50 text-[#4F46E5] border-indigo-100 text-xs">
                {experiences.length} Experience{experiences.length === 1 ? '' : 's'}
              </Badge>
            </div>

            {experiences.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No work experiences added yet.</p>
            ) : (
              <div className="space-y-3">
                {experiences.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-gray-900">
                        {exp.roleTitle} @ <span className="text-[#4F46E5]">{exp.companyName}</span>
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {exp.employmentType} &bull; {exp.location || 'Remote'}
                      </p>
                      {exp.description && <p className="text-xs text-gray-600 leading-relaxed mt-1">{exp.description}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteExperience(exp.id)}
                      className="text-gray-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Experience Form */}
            <form
              onSubmit={handleAddExperience}
              className="p-4 bg-gray-50/50 rounded-xl border border-dashed border-gray-300 space-y-2.5"
            >
              <span className="text-xs font-bold text-gray-800 block">Add Work or Internship</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Company Name *"
                  value={newExp.companyName}
                  onChange={(e) => setNewExp({ ...newExp, companyName: e.target.value })}
                  className="input-field text-xs"
                />
                <input
                  type="text"
                  placeholder="Role Title *"
                  value={newExp.roleTitle}
                  onChange={(e) => setNewExp({ ...newExp, roleTitle: e.target.value })}
                  className="input-field text-xs"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select
                  value={newExp.employmentType}
                  onChange={(e) => setNewExp({ ...newExp, employmentType: e.target.value })}
                  className="input-field text-xs"
                >
                  {EMPLOYMENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Location (e.g. Remote, Lahore, Islamabad)"
                  value={newExp.location}
                  onChange={(e) => setNewExp({ ...newExp, location: e.target.value })}
                  className="input-field text-xs"
                />
              </div>
              <textarea
                rows={2}
                placeholder="Brief description of responsibilities and achievements"
                value={newExp.description}
                onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
                className="input-field text-xs resize-none"
              />
              <Button type="submit" disabled={isAddingExp} size="sm" className="bg-[#4F46E5] text-white text-xs gap-1">
                <Plus className="w-3.5 h-3.5" /> {isAddingExp ? 'Adding...' : 'Add Experience'}
              </Button>
            </form>
          </div>

          {/* --- 3. Certifications & Achievements --- */}
          <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Certifications & Achievements</h3>
                <p className="text-xs text-gray-500 mt-0.5">Certificates, awards, hackathons, and credentials.</p>
              </div>
              <Badge className="bg-indigo-50 text-[#4F46E5] border-indigo-100 text-xs">
                {certifications.length} Item{certifications.length === 1 ? '' : 's'}
              </Badge>
            </div>

            {certifications.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No certifications or achievements added yet.</p>
            ) : (
              <div className="space-y-3">
                {certifications.map((cert) => (
                  <div
                    key={cert.id}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-gray-900">{cert.title}</p>
                        <Badge
                          className={
                            cert.type === 'Achievement'
                              ? 'bg-amber-50 text-amber-700 border-amber-200 text-[10px]'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]'
                          }
                        >
                          {cert.type}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-gray-500">
                        {cert.issuer ? `Issued by ${cert.issuer}` : 'Self-certified'}
                        {cert.issueDate ? ` \u2022 ${cert.issueDate.split('T')[0]}` : ''}
                      </p>
                      {cert.credentialUrl && (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#4F46E5] font-semibold text-[11px] flex items-center gap-1 hover:underline mt-1"
                        >
                          <ExternalLink className="w-3 h-3" /> View Credential
                        </a>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteCert(cert.id)}
                      className="text-gray-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Certification Form */}
            <form
              onSubmit={handleAddCert}
              className="p-4 bg-gray-50/50 rounded-xl border border-dashed border-gray-300 space-y-2.5"
            >
              <span className="text-xs font-bold text-gray-800 block">Add Certification or Achievement</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Title (e.g. Meta Frontend Developer, 1st Place Hackathon) *"
                  value={newCert.title}
                  onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
                  className="input-field text-xs"
                />
                <input
                  type="text"
                  placeholder="Issuing Organization (e.g. Coursera, Google, Microsoft)"
                  value={newCert.issuer}
                  onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                  className="input-field text-xs"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select
                  value={newCert.type}
                  onChange={(e) => setNewCert({ ...newCert, type: e.target.value })}
                  className="input-field text-xs"
                >
                  <option value="Certification">Certification</option>
                  <option value="Achievement">Achievement</option>
                </select>
                <input
                  type="url"
                  placeholder="Credential URL (optional)"
                  value={newCert.credentialUrl}
                  onChange={(e) => setNewCert({ ...newCert, credentialUrl: e.target.value })}
                  className="input-field text-xs"
                />
              </div>
              <Button type="submit" disabled={isAddingCert} size="sm" className="bg-[#4F46E5] text-white text-xs gap-1">
                <Plus className="w-3.5 h-3.5" /> {isAddingCert ? 'Adding...' : 'Add Credential'}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 5: PREFERENCES & GOALS (PRIMARY & SECONDARY + AT MOST 3) */}
      {activeTab === 'interests' && (
        <form onSubmit={handleSavePreferences} className="p-6 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-6">
          {/* 1. Work Preferences (Primary & Secondary) */}
          <div className="space-y-3 p-4 bg-gray-50/70 rounded-2xl border border-gray-200/80">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-gray-800 uppercase tracking-wider block">
                  Work Preferences
                </label>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Select your preferred work modes. When multiple are chosen, the first is Primary and others are Secondary.
                </p>
              </div>
              <Badge className="bg-indigo-50 text-[#4F46E5] border-indigo-100 text-xs">
                {formData.workPreferences.length} Selected
              </Badge>
            </div>

            {/* Selection Buttons */}
            <div className="flex flex-wrap gap-2.5">
              {['Remote', 'Hybrid', 'Onsite'].map((wp) => {
                const idx = formData.workPreferences.indexOf(wp)
                const isSelected = idx > -1
                const isPrimary = idx === 0
                return (
                  <div key={wp} className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleToggleWorkPref(wp)}
                      className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all flex items-center gap-2 ${
                        isSelected
                          ? isPrimary
                            ? 'bg-[#4F46E5] text-white border-[#4F46E5] shadow-xs'
                            : 'bg-indigo-50 text-[#4F46E5] border-indigo-200'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span>{wp}</span>
                      {isSelected ? (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                            isPrimary ? 'bg-white/25 text-white' : 'bg-indigo-200 text-indigo-800'
                          }`}
                        >
                          {isPrimary ? '★ Primary' : 'Secondary'}
                        </span>
                      ) : (
                        <Plus className="w-3 h-3 text-gray-400" />
                      )}
                    </button>
                    {isSelected && !isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryWorkPref(wp)}
                        className="text-[10px] font-bold text-[#4F46E5] hover:underline px-2 py-1.5 bg-white border border-indigo-200 rounded-lg shadow-2xs"
                        title="Set as Primary"
                      >
                        Set Primary
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* 2. Areas of Interest (Max 3, Primary & Secondary) */}
          <div className="space-y-3 p-4 bg-gray-50/70 rounded-2xl border border-gray-200/80">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-gray-800 uppercase tracking-wider block">
                  Areas of Interest
                </label>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Select at most 3 domains. The first selection is Primary, and others are Secondary.
                </p>
              </div>
              <Badge
                className={
                  formData.areasOfInterest.length >= 3
                    ? 'bg-amber-50 text-amber-700 border-amber-200 text-xs font-bold'
                    : 'bg-indigo-50 text-[#4F46E5] border-indigo-100 text-xs'
                }
              >
                {formData.areasOfInterest.length} / 3 Selected
              </Badge>
            </div>

            {/* Active Selections */}
            {formData.areasOfInterest.length > 0 && (
              <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                  Active Selections
                </span>
                <div className="flex flex-wrap gap-2">
                  {formData.areasOfInterest.map((area, idx) => {
                    const isPrimary = idx === 0
                    return (
                      <div
                        key={area}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                          isPrimary
                            ? 'bg-[#4F46E5] text-white border-[#4F46E5] shadow-xs'
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
              <span className="text-[11px] font-semibold text-gray-600 block">Catalog Options:</span>
              <div className="flex flex-wrap gap-2">
                {allSuggestedAreas.map((area) => {
                  const isSelected = formData.areasOfInterest.includes(area)
                  return (
                    <button
                      key={area}
                      type="button"
                      onClick={() => handleToggleArea(area)}
                      disabled={!isSelected && formData.areasOfInterest.length >= 3}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-[#4F46E5] text-white border-[#4F46E5] shadow-xs'
                          : formData.areasOfInterest.length >= 3
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {area} {isSelected ? '✓' : '+'}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Custom Area Input */}
            {formData.areasOfInterest.length < 3 && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Or type a custom area of interest (e.g. DevOps, Blockchain)"
                  value={customAreaInput}
                  onChange={(e) => setCustomAreaInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddCustomArea()
                    }
                  }}
                  className="input-field text-xs flex-1"
                />
                <Button
                  type="button"
                  onClick={handleAddCustomArea}
                  size="sm"
                  variant="outline"
                  className="text-xs shrink-0 gap-1 rounded-xl"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </Button>
              </div>
            )}
          </div>

          {/* 3. Target Career Paths (Max 3, Primary & Secondary) */}
          <div className="space-y-3 p-4 bg-gray-50/70 rounded-2xl border border-gray-200/80">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-gray-800 uppercase tracking-wider block">
                  Target Career Paths
                </label>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Select at most 3 target roles. The first selection is Primary, and others are Secondary.
                </p>
              </div>
              <Badge
                className={
                  formData.careerInterests.length >= 3
                    ? 'bg-amber-50 text-amber-700 border-amber-200 text-xs font-bold'
                    : 'bg-indigo-50 text-[#4F46E5] border-indigo-100 text-xs'
                }
              >
                {formData.careerInterests.length} / 3 Selected
              </Badge>
            </div>

            {/* Active Selections */}
            {formData.careerInterests.length > 0 && (
              <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                  Active Selections
                </span>
                <div className="flex flex-wrap gap-2">
                  {formData.careerInterests.map((career, idx) => {
                    const isPrimary = idx === 0
                    return (
                      <div
                        key={career}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                          isPrimary
                            ? 'bg-[#4F46E5] text-white border-[#4F46E5] shadow-xs'
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
              <span className="text-[11px] font-semibold text-gray-600 block">Catalog Options:</span>
              <div className="flex flex-wrap gap-2">
                {allSuggestedCareers.map((career) => {
                  const isSelected = formData.careerInterests.includes(career)
                  return (
                    <button
                      key={career}
                      type="button"
                      onClick={() => handleToggleCareer(career)}
                      disabled={!isSelected && formData.careerInterests.length >= 3}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-[#4F46E5] text-white border-[#4F46E5] shadow-xs'
                          : formData.careerInterests.length >= 3
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {career} {isSelected ? '✓' : '+'}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Custom Career Input */}
            {formData.careerInterests.length < 3 && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Or type a custom career role (e.g. Full-Stack Engineer, Machine Learning Engineer)"
                  value={customCareerInput}
                  onChange={(e) => setCustomCareerInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddCustomCareer()
                    }
                  }}
                  className="input-field text-xs flex-1"
                />
                <Button
                  type="button"
                  onClick={handleAddCustomCareer}
                  size="sm"
                  variant="outline"
                  className="text-xs shrink-0 gap-1 rounded-xl"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </Button>
              </div>
            )}
          </div>

          {/* Short-Term Goal */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">Short-Term Goal (Next 6-12 Months)</label>
            <textarea
              rows={2}
              value={formData.shortTermGoal}
              onChange={(e) => setFormData({ ...formData, shortTermGoal: e.target.value })}
              className="input-field text-xs resize-none"
              placeholder="e.g. Secure a Frontend Developer internship, master React & TypeScript"
            />
          </div>

          {/* Long-Term Goal */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">Long-Term Goal (3-5 Years)</label>
            <textarea
              rows={2}
              value={formData.longTermGoal}
              onChange={(e) => setFormData({ ...formData, longTermGoal: e.target.value })}
              className="input-field text-xs resize-none"
              placeholder="e.g. Lead frontend development teams and build enterprise scale applications"
            />
          </div>

          <Button
            type="submit"
            disabled={isSavingPreferences}
            className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs gap-1.5 px-5 py-2.5 rounded-xl shadow-xs cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" /> {isSavingPreferences ? 'Saving Preferences...' : 'Save Preferences & Goals'}
          </Button>
        </form>
      )}
    </div>
  )
}
