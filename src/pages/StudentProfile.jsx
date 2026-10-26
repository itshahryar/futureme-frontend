import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useGetStudentProfileQuery,
  useUpdateProfileMutation,
  useGetOnboardingConfigQuery,
  useAddProjectMutation,
  useDeleteProjectMutation,
  useAddExperienceMutation,
  useDeleteExperienceMutation,
  useAddCertificationMutation,
  useDeleteCertificationMutation,
} from '@/store/api/onboardingApiSlice'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
} from 'lucide-react'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export default function StudentProfile() {
  const navigate = useNavigate()
  const { data: profileData, isLoading } = useGetStudentProfileQuery()
  const { data: configData } = useGetOnboardingConfigQuery()
  const [updateProfileApi, { isLoading: isUpdating }] = useUpdateProfileMutation()
  const [addProjectApi] = useAddProjectMutation()
  const [deleteProjectApi] = useDeleteProjectMutation()
  const [addExperienceApi] = useAddExperienceMutation()
  const [deleteExperienceApi] = useDeleteExperienceMutation()
  const [addCertApi] = useAddCertificationMutation()
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

  // Modal / Inline forms
  const [newProj, setNewProj] = useState({ title: '', description: '', technologies: '', projectUrl: '', githubUrl: '' })
  const [newExp, setNewExp] = useState({ companyName: '', roleTitle: '', employmentType: 'Internship', location: '' })
  const [newCert, setNewCert] = useState({ title: '', issuer: '', type: 'Certification' })

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
        startYear: p.startYear || '',
        endMonth: p.endMonth || '',
        endYear: p.endYear || (p.expectedGraduationYear ? String(p.expectedGraduationYear) : ''),
        grade: p.grade || '',
        activities: p.activities || '',
        workPreferences: p.workPreferences || [],
        areasOfInterest: p.areasOfInterest || [],
        careerInterests: p.careerInterests || [],
        shortTermGoal: p.shortTermGoal || '',
        longTermGoal: p.longTermGoal || '',
      })
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

  const handleSaveProfile = async (e) => {
    e?.preventDefault()
    try {
      await updateProfileApi(formData).unwrap()
      showNotification('Profile updated successfully!')
    } catch {
      showNotification('Failed to update profile', true)
    }
  }

  const handleAddProject = async (e) => {
    e.preventDefault()
    if (!newProj.title.trim()) return
    try {
      await addProjectApi({
        ...newProj,
        technologies: newProj.technologies ? newProj.technologies.split(',').map((t) => t.trim()).filter(Boolean) : [],
      }).unwrap()
      setNewProj({ title: '', description: '', technologies: '', projectUrl: '', githubUrl: '' })
      showNotification('Project added')
    } catch {
      showNotification('Failed to add project', true)
    }
  }

  const handleAddExperience = async (e) => {
    e.preventDefault()
    if (!newExp.companyName.trim() || !newExp.roleTitle.trim()) return
    try {
      await addExperienceApi(newExp).unwrap()
      setNewExp({ companyName: '', roleTitle: '', employmentType: 'Internship', location: '' })
      showNotification('Experience added')
    } catch {
      showNotification('Failed to add experience', true)
    }
  }

  const handleAddCert = async (e) => {
    e.preventDefault()
    if (!newCert.title.trim()) return
    try {
      await addCertApi(newCert).unwrap()
      setNewCert({ title: '', issuer: '', type: 'Certification' })
      showNotification('Certification added')
    } catch {
      showNotification('Failed to add certification', true)
    }
  }

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-3 border-[#4F46E5] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-gray-500 font-medium">Loading profile...</p>
      </div>
    )
  }

  const user = profileData?.user || {}
  const profile = profileData?.profile || {}
  const skills = profileData?.skills || []
  const projects = profileData?.projects || []
  const experiences = profileData?.experiences || []
  const certifications = profileData?.certifications || []
  const completionPercentage = profile.completionPercentage || 0

  const initials = [user.firstName?.[0], user.lastName?.[0]].filter(Boolean).join('') || 'U'

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Notifications */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Profile Header Hero Card */}
      <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-white text-xl font-bold shadow-md shadow-indigo-100">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">
                {user.fullName || 'Student User'}
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
            <p className="text-xs text-gray-500 mt-0.5">
              {profile.currentDegree || 'Student'} &bull; {profile.university || 'University'}
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

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 whitespace-nowrap border-b-2 ${
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
          className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 whitespace-nowrap border-b-2 ${
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
          className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 whitespace-nowrap border-b-2 ${
            activeTab === 'skills'
              ? 'border-[#4F46E5] text-[#4F46E5]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Skills ({skills.length})
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 whitespace-nowrap border-b-2 ${
            activeTab === 'projects'
              ? 'border-[#4F46E5] text-[#4F46E5]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Projects & Experience
        </button>
        <button
          onClick={() => setActiveTab('interests')}
          className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 whitespace-nowrap border-b-2 ${
            activeTab === 'interests'
              ? 'border-[#4F46E5] text-[#4F46E5]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Heart className="w-4 h-4" />
          Preferences & Goals
        </button>
      </div>

      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Bio & Headline card */}
          <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3">
            {profile.headline && (
              <div className="pb-3 border-b border-gray-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Headline</span>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">{profile.headline}</p>
              </div>
            )}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">About Me</h3>
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                {profile.bio || 'No bio set yet. Click "Academic & Contact" tab to add your bio.'}
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
              <div className="text-xs space-y-1.5">
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
                    <span className="font-semibold text-gray-700">Grade:</span> {profile.grade}
                  </p>
                )}
                {profile.activities && (
                  <p>
                    <span className="font-semibold text-gray-700">Activities & Societies:</span> {profile.activities}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Skills Summary */}
            <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#4F46E5]" />
                Top Skills
              </h3>
              {skills.length === 0 ? (
                <p className="text-xs text-gray-400">No skills added yet.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {skills.slice(0, 10).map((sk) => (
                    <Badge key={sk.name} variant="secondary" className="text-[11px] bg-indigo-50 text-[#4F46E5] border border-indigo-100">
                      {sk.name} ({sk.proficiency})
                    </Badge>
                  ))}
                  {skills.length > 10 && (
                    <span className="text-[10px] text-gray-400 self-center">+{skills.length - 10} more</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: ACADEMIC & CONTACT FORM */}
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
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="input-field text-xs"
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
                placeholder="e.g. Software Engineering Student | Web Developer"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">School</label>
            <input
              type="text"
              value={formData.school}
              onChange={(e) => setFormData({ ...formData, school: e.target.value })}
              className="input-field text-xs"
              placeholder="Ex: Boston University"
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
                placeholder="Ex: Bachelor of Science"
              />
              {configData?.degrees?.length > 0 && (
                <datalist id="profile-degree-list">
                  {configData.degrees.map((deg) => (
                    <option key={deg} value={deg} />
                  ))}
                </datalist>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Field of study</label>
              <input
                type="text"
                value={formData.fieldOfStudy}
                onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })}
                className="input-field text-xs"
                placeholder="Ex: Business"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Start date</label>
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
              <label className="text-xs font-semibold text-gray-700">End date (or expected)</label>
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

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">Grade</label>
            <input
              type="text"
              value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              className="input-field text-xs"
              placeholder="Ex: 3.8 GPA or Grade A"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">Activities and societies</label>
            <textarea
              rows={3}
              value={formData.activities}
              onChange={(e) => setFormData({ ...formData, activities: e.target.value })}
              className="input-field text-xs resize-none"
              placeholder="Ex: Alpha Phi Omega, Marching Band, Volleyball"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">Bio / About Me</label>
            <textarea
              rows={4}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="input-field text-xs resize-none"
              placeholder="Introduce yourself, your passions, and your career goals..."
            />
          </div>

          <Button type="submit" disabled={isUpdating} className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs gap-1.5">
            <Save className="w-3.5 h-3.5" /> Save Changes
          </Button>
        </form>
      )}

      {/* TAB: SKILLS */}
      {activeTab === 'skills' && (
        <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Your Skills & Proficiencies</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/onboarding')}
              className="text-xs text-[#4F46E5]"
            >
              Modify via Skills Selector
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {skills.map((sk) => (
              <div key={sk.name} className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-900">{sk.name}</p>
                  <p className="text-[10px] text-gray-400">{sk.category}</p>
                </div>
                <Badge
                  className={
                    sk.proficiency === 'Advanced'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : sk.proficiency === 'Intermediate'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }
                >
                  {sk.proficiency}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: PROJECTS & EXPERIENCE */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          {/* Projects */}
          <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900">Portfolio Projects</h3>
            <div className="space-y-2.5">
              {projects.map((proj) => (
                <div key={proj.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-900">{proj.title}</p>
                    <p className="text-xs text-gray-600">{proj.description}</p>
                    {proj.technologies?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {proj.technologies.map((t, idx) => (
                          <Badge key={idx} variant="secondary" className="text-[10px] bg-white">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => deleteProjectApi(proj.id)}
                    className="text-gray-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddProject} className="p-4 bg-gray-50/50 rounded-xl border border-dashed border-gray-300 space-y-2">
              <span className="text-xs font-semibold text-gray-700 block">Add New Project</span>
              <input
                type="text"
                placeholder="Project Title"
                value={newProj.title}
                onChange={(e) => setNewProj({ ...newProj, title: e.target.value })}
                className="input-field text-xs"
              />
              <textarea
                rows={2}
                placeholder="Description"
                value={newProj.description}
                onChange={(e) => setNewProj({ ...newProj, description: e.target.value })}
                className="input-field text-xs resize-none"
              />
              <input
                type="text"
                placeholder="Technologies (comma separated)"
                value={newProj.technologies}
                onChange={(e) => setNewProj({ ...newProj, technologies: e.target.value })}
                className="input-field text-xs"
              />
              <Button type="submit" size="sm" className="bg-[#4F46E5] text-white text-xs gap-1">
                <Plus className="w-3.5 h-3.5" /> Add Project
              </Button>
            </form>
          </div>

          {/* Experience */}
          <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900">Work Experience & Internships</h3>
            <div className="space-y-2.5">
              {experiences.map((exp) => (
                <div key={exp.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-900">{exp.roleTitle} @ {exp.companyName}</p>
                    <p className="text-[11px] text-gray-500">{exp.employmentType} &bull; {exp.location || 'Remote'}</p>
                  </div>
                  <button onClick={() => deleteExperienceApi(exp.id)} className="text-gray-400 hover:text-rose-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddExperience} className="p-4 bg-gray-50/50 rounded-xl border border-dashed border-gray-300 space-y-2">
              <span className="text-xs font-semibold text-gray-700 block">Add Work or Internship</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Company"
                  value={newExp.companyName}
                  onChange={(e) => setNewExp({ ...newExp, companyName: e.target.value })}
                  className="input-field text-xs"
                />
                <input
                  type="text"
                  placeholder="Role"
                  value={newExp.roleTitle}
                  onChange={(e) => setNewExp({ ...newExp, roleTitle: e.target.value })}
                  className="input-field text-xs"
                />
              </div>
              <Button type="submit" size="sm" className="bg-[#4F46E5] text-white text-xs gap-1">
                <Plus className="w-3.5 h-3.5" /> Add Experience
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* TAB: PREFERENCES & GOALS */}
      {activeTab === 'interests' && (
        <form onSubmit={handleSaveProfile} className="p-6 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-700">Work Preferences</label>
            <div className="flex gap-2">
              {['Remote', 'Onsite', 'Hybrid'].map((wp) => {
                const selected = formData.workPreferences.includes(wp)
                return (
                  <button
                    key={wp}
                    type="button"
                    onClick={() => {
                      if (selected) {
                        setFormData({ ...formData, workPreferences: formData.workPreferences.filter((p) => p !== wp) })
                      } else {
                        setFormData({ ...formData, workPreferences: [...formData.workPreferences, wp] })
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                      selected ? 'bg-[#4F46E5] text-white border-[#4F46E5]' : 'bg-white text-gray-700 border-gray-200'
                    }`}
                  >
                    {wp}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-700">Areas of Interest</label>
            <div className="flex flex-wrap gap-1.5">
              {(configData?.areasOfInterest || []).map((area) => {
                const selected = formData.areasOfInterest.includes(area)
                return (
                  <button
                    key={area}
                    type="button"
                    onClick={() => {
                      if (selected) {
                        setFormData({ ...formData, areasOfInterest: formData.areasOfInterest.filter((a) => a !== area) })
                      } else {
                        setFormData({ ...formData, areasOfInterest: [...formData.areasOfInterest, area] })
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                      selected ? 'bg-[#4F46E5] text-white border-[#4F46E5]' : 'bg-white text-gray-700 border-gray-200'
                    }`}
                  >
                    {area}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">Short-Term Goal</label>
            <textarea
              rows={2}
              value={formData.shortTermGoal}
              onChange={(e) => setFormData({ ...formData, shortTermGoal: e.target.value })}
              className="input-field text-xs resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">Long-Term Goal</label>
            <textarea
              rows={2}
              value={formData.longTermGoal}
              onChange={(e) => setFormData({ ...formData, longTermGoal: e.target.value })}
              className="input-field text-xs resize-none"
            />
          </div>

          <Button type="submit" disabled={isUpdating} className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs gap-1.5">
            <Save className="w-3.5 h-3.5" /> Save Preferences
          </Button>
        </form>
      )}
    </div>
  )
}
