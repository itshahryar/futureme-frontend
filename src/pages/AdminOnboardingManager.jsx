import { useState } from 'react'
import {
  useGetAdminSectionsQuery,
  useUpdateAdminSectionMutation,
  useReorderAdminSectionsMutation,
  useGetAdminCatalogsQuery,
  useAddCatalogDegreeMutation,
  useUpdateCatalogDegreeMutation,
  useDeleteCatalogDegreeMutation,
  useAddCatalogSkillMutation,
  useUpdateCatalogSkillMutation,
  useDeleteCatalogSkillMutation,
  useAddCatalogOptionMutation,
  useUpdateCatalogOptionMutation,
  useDeleteCatalogOptionMutation,
  useGetAdminOnboardingStatsQuery,
} from '@/store/api/onboardingApiSlice'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Loading from '@/components/ui/Loading'
import {
  Sliders,
  GraduationCap,
  Sparkles,
  Heart,
  BarChart3,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Search,
  Users,
  Clock,
  Briefcase,
  AlertCircle,
  Settings2,
  BookOpen,
} from 'lucide-react'

const FIELD_ORDER_BY_SECTION = {
  personal_info: ['headline', 'bio'],
  academic_background: [
    'school',
    'degree',
    'fieldOfStudy',
    'startDate',
    'endDate',
    'grade',
    'activities',
  ],
  experience: ['experienceRequired'],
  projects: ['projectsRequired', 'certificationsRequired'],
}

export default function AdminOnboardingManager() {
  const [activeTab, setActiveTab] = useState('sections') // 'sections' | 'degrees' | 'skills' | 'options' | 'stats'
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Queries
  const { data: sectionsData, isLoading: loadingSections } = useGetAdminSectionsQuery()
  const { data: catalogsData, isLoading: loadingCatalogs } = useGetAdminCatalogsQuery()
  const { data: statsData, isLoading: loadingStats } = useGetAdminOnboardingStatsQuery()

  // Mutations
  const [updateSection, { isLoading: isUpdatingSection }] = useUpdateAdminSectionMutation()
  const [reorderSections] = useReorderAdminSectionsMutation()
  const [addDegree] = useAddCatalogDegreeMutation()
  const [updateDegree] = useUpdateCatalogDegreeMutation()
  const [deleteDegree] = useDeleteCatalogDegreeMutation()
  const [addSkill] = useAddCatalogSkillMutation()
  const [updateSkill] = useUpdateCatalogSkillMutation()
  const [deleteSkill] = useDeleteCatalogSkillMutation()
  const [addOption] = useAddCatalogOptionMutation()
  const [updateOption] = useUpdateCatalogOptionMutation()
  const [deleteOption] = useDeleteCatalogOptionMutation()

  // Local state for forms
  const [newDegree, setNewDegree] = useState({ name: '', department: '' })
  const [newSkill, setNewSkill] = useState({ name: '', category: '' })
  const [newOption, setNewOption] = useState({ type: 'AREA_OF_INTEREST', label: '' })
  const [skillSearch, setSkillSearch] = useState('')
  const [skillCategoryFilter, setSkillCategoryFilter] = useState('ALL')
  const [degreeSearch, setDegreeSearch] = useState('')

  const showNotification = (msg, isErr = false) => {
    if (isErr) {
      setErrorMessage(msg)
      setTimeout(() => setErrorMessage(''), 4000)
    } else {
      setSuccessMessage(msg)
      setTimeout(() => setSuccessMessage(''), 4000)
    }
  }

  // Handle section toggle
  const handleToggleSection = async (section) => {
    try {
      await updateSection({
        key: section.key,
        isEnabled: !section.isEnabled,
      }).unwrap()
      showNotification(`Section "${section.title}" ${!section.isEnabled ? 'enabled' : 'disabled'}`)
    } catch {
      showNotification('Failed to update section status', true)
    }
  }

  // Handle section move up / down
  const handleMoveSection = async (index, direction) => {
    const sections = [...(sectionsData?.sections || [])]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= sections.length) return

    const temp = sections[index]
    sections[index] = sections[targetIndex]
    sections[targetIndex] = temp

    const reordered = sections.map((sec, idx) => ({
      key: sec.key,
      stepOrder: idx + 1,
    }))

    try {
      await reorderSections(reordered).unwrap()
      showNotification('Section order updated')
    } catch {
      showNotification('Failed to reorder sections', true)
    }
  }

  // Handle field requirement toggle (Required / Optional)
  const handleToggleFieldRequirement = async (section, fieldKey) => {
    const currentConfig = { ...(section.fieldsConfig || {}) }
    const fieldObj = currentConfig[fieldKey] || { required: false, enabled: true }

    // Toggle directly between Required (true) and Optional (false)
    const nextRequired = !fieldObj.required

    currentConfig[fieldKey] = {
      ...fieldObj,
      required: nextRequired,
      enabled: true,
    }

    try {
      await updateSection({
        key: section.key,
        fieldsConfig: currentConfig,
      }).unwrap()
      showNotification(`${fieldObj.label || fieldKey} is now ${nextRequired ? 'Required' : 'Optional'}`)
    } catch {
      showNotification('Failed to update field configuration', true)
    }
  }

  // Handle Add Degree
  const handleAddDegree = async (e) => {
    e.preventDefault()
    if (!newDegree.name.trim()) return
    try {
      await addDegree(newDegree).unwrap()
      setNewDegree({ name: '', department: '' })
      showNotification('Degree added to catalog')
    } catch (err) {
      showNotification(err?.data?.error || 'Failed to add degree', true)
    }
  }

  // Handle Add Skill
  const handleAddSkill = async (e) => {
    e.preventDefault()
    if (!newSkill.name.trim() || !newSkill.category.trim()) return
    try {
      await addSkill(newSkill).unwrap()
      setNewSkill({ name: '', category: '' })
      showNotification('Skill added to catalog')
    } catch (err) {
      showNotification(err?.data?.error || 'Failed to add skill', true)
    }
  }

  // Handle Add Option
  const handleAddOption = async (e) => {
    e.preventDefault()
    if (!newOption.label.trim()) return
    try {
      await addOption(newOption).unwrap()
      setNewOption({ type: newOption.type, label: '' })
      showNotification('Option added to catalog')
    } catch (err) {
      showNotification(err?.data?.error || 'Failed to add option', true)
    }
  }

  const sections = sectionsData?.sections || []
  const degrees = catalogsData?.degrees || []
  const skills = catalogsData?.skills || []
  const options = catalogsData?.options || []
  const stats = statsData || {}

  const filteredDegrees = degrees.filter((d) =>
    d.name.toLowerCase().includes(degreeSearch.toLowerCase())
  )

  const filteredSkills = skills.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(skillSearch.toLowerCase())
    const matchesCategory = skillCategoryFilter === 'ALL' || s.category === skillCategoryFilter
    return matchesSearch && matchesCategory
  })

  const skillCategories = ['ALL', ...new Set(skills.map((s) => s.category).filter(Boolean))]

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#4F46E5]" />
            Onboarding & Profile Controller
          </h1>
          <p className="page-subtitle mt-1">
            Configure what students see during onboarding, manage standard degree and skill catalogs, and monitor progress.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-sm flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('sections')}
          className={`pb-3 px-3 text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap border-b-2 ${
            activeTab === 'sections'
              ? 'border-[#4F46E5] text-[#4F46E5]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Settings2 className="w-4 h-4" />
          Sections & Rules ({sections.length})
        </button>

        <button
          onClick={() => setActiveTab('degrees')}
          className={`pb-3 px-3 text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap border-b-2 ${
            activeTab === 'degrees'
              ? 'border-[#4F46E5] text-[#4F46E5]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Degrees Catalog ({degrees.length})
        </button>


        <button
          onClick={() => setActiveTab('skills')}
          className={`pb-3 px-3 text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap border-b-2 ${
            activeTab === 'skills'
              ? 'border-[#4F46E5] text-[#4F46E5]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Skills Catalog ({skills.length})
        </button>

        <button
          onClick={() => setActiveTab('options')}
          className={`pb-3 px-3 text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap border-b-2 ${
            activeTab === 'options'
              ? 'border-[#4F46E5] text-[#4F46E5]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Heart className="w-4 h-4" />
          Interests & Preferences
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`pb-3 px-3 text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap border-b-2 ${
            activeTab === 'stats'
              ? 'border-[#4F46E5] text-[#4F46E5]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Onboarding Analytics
        </button>
      </div>

      {/* TAB 1: SECTIONS & STEP CONFIGURATION */}
      {activeTab === 'sections' && (
        <div className="space-y-4">


          {loadingSections ? (
            <Loading
              variant="card"
              message="Loading section configuration..."
              description="Retrieving dynamic onboarding steps and form fields."
            />
          ) : (
            <div className="space-y-3">
              {sections.map((section, idx) => (
                <div
                  key={section.id || section.key}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    section.isEnabled
                      ? 'bg-white border-gray-200 shadow-2xs'
                      : 'bg-gray-50/70 border-gray-200/70 opacity-75'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-gray-900">{section.title}</h3>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                              section.isEnabled
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${section.isEnabled ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                            {section.isEnabled ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{section.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleToggleSection(section)}
                        disabled={isUpdatingSection}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                          section.isEnabled
                            ? 'border-gray-200 text-gray-700 hover:bg-gray-50'
                            : 'border-indigo-600 bg-[#4F46E5] text-white hover:bg-[#4338CA]'
                        }`}
                      >
                        {section.isEnabled ? (
                          <>
                            <ToggleRight className="w-4 h-4 text-emerald-600" /> Disable Section
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-4 h-4" /> Enable Section
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Minimal Field-level requirement toggles */}
                  {section.fieldsConfig && Object.keys(section.fieldsConfig).length > 0 && (
                    <div className="mt-4 pt-3.5 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                          Field Requirements
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          const order = FIELD_ORDER_BY_SECTION[section.key] || []
                          const entries = Object.entries(section.fieldsConfig).filter(
                            ([, fVal]) => typeof fVal === 'object' && fVal !== null
                          )
                          entries.sort(([a], [b]) => {
                            const idxA = order.indexOf(a)
                            const idxB = order.indexOf(b)
                            if (idxA !== -1 && idxB !== -1) return idxA - idxB
                            if (idxA !== -1) return -1
                            if (idxB !== -1) return 1
                            return 0
                          })

                          return entries.map(([fKey, fVal]) => {
                            const isReq = !!fVal.required

                            return (
                              <div
                                key={fKey}
                                className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-gray-200/80 bg-gray-50/60"
                              >
                                <span className="text-xs font-medium text-gray-700">
                                  {fVal.label || fKey}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleToggleFieldRequirement(section, fKey)}
                                  className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                                    isReq ? 'bg-[#4F46E5]' : 'bg-gray-300'
                                  }`}
                                  title={isReq ? 'Click to make Optional' : 'Click to make Required'}
                                >
                                  <span
                                    className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out mt-0.5 ml-0.5 ${
                                      isReq ? 'translate-x-3' : 'translate-x-0'
                                    }`}
                                  />
                                </button>
                                <span
                                  className={`text-[10px] font-medium ${
                                    isReq ? 'text-indigo-600' : 'text-gray-400'
                                  }`}
                                >
                                  {isReq ? 'Required' : 'Optional'}
                                </span>
                              </div>
                            )
                          })
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DEGREES CATALOG */}
      {activeTab === 'degrees' && (
        <div className="space-y-5">
          <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Add New Degree to Dropdown</h3>
            <form onSubmit={handleAddDegree} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Degree Name (e.g. BS Data Science)"
                value={newDegree.name}
                onChange={(e) => setNewDegree({ ...newDegree, name: e.target.value })}
                className="input-field text-sm flex-1"
                required
              />
              <input
                type="text"
                placeholder="Department (e.g. Computing, Business, Engineering)"
                value={newDegree.department}
                onChange={(e) => setNewDegree({ ...newDegree, department: e.target.value })}
                className="input-field text-sm sm:w-72"
              />
              <Button type="submit" size="sm" className="bg-[#4F46E5] hover:bg-[#4338CA] text-white gap-1.5">
                <Plus className="w-4 h-4" /> Add Degree
              </Button>
            </form>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search degrees..."
                value={degreeSearch}
                onChange={(e) => setDegreeSearch(e.target.value)}
                className="input-field pl-9 text-xs"
              />
            </div>
            <span className="text-xs text-gray-500 font-medium">
              Showing {filteredDegrees.length} of {degrees.length} degrees
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredDegrees.map((deg) => (
              <div
                key={deg.id}
                className="p-3.5 bg-white rounded-xl border border-gray-200 flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{deg.name}</p>
                  <p className="text-[11px] text-gray-500 truncate">{deg.department || 'General'}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => updateDegree({ id: deg.id, isActive: !deg.isActive })}
                    className={`p-1.5 rounded-lg border text-xs ${
                      deg.isActive
                        ? 'border-emerald-200 text-emerald-700 bg-emerald-50'
                        : 'border-gray-200 text-gray-400 bg-gray-50'
                    }`}
                    title={deg.isActive ? 'Active (Click to disable)' : 'Inactive (Click to enable)'}
                  >
                    {deg.isActive ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => deleteDegree(deg.id)}
                    className="p-1.5 rounded-lg border border-rose-100 text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                    title="Delete Degree"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}



      {/* TAB 3: SKILLS CATALOG */}
      {activeTab === 'skills' && (
        <div className="space-y-5">
          <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Add New Skill to Catalog</h3>
            <form onSubmit={handleAddSkill} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Skill Name (e.g. Rust, Kotlin, Docker)"
                value={newSkill.name}
                onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                className="input-field text-sm flex-1"
                required
              />
              <input
                type="text"
                list="skill-categories-datalist"
                placeholder="Category (e.g. Frontend, Mobile, Cloud, AI)"
                value={newSkill.category}
                onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                className="input-field text-sm sm:w-64"
                required
              />
              <datalist id="skill-categories-datalist">
                {skillCategories.filter((c) => c !== 'ALL').map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
              <Button type="submit" size="sm" className="bg-[#4F46E5] hover:bg-[#4338CA] text-white gap-1.5">
                <Plus className="w-4 h-4" /> Add Skill
              </Button>
            </form>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search skills..."
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                className="input-field pl-9 text-xs"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {skillCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSkillCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
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

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {filteredSkills.map((sk) => (
              <div
                key={sk.id}
                className="p-3 bg-white rounded-xl border border-gray-200 flex items-center justify-between gap-2 shadow-2xs"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{sk.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">{sk.category}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => updateSkill({ id: sk.id, isActive: !sk.isActive })}
                    className={`p-1 rounded text-xs ${
                      sk.isActive ? 'text-emerald-600' : 'text-gray-300'
                    }`}
                    title={sk.isActive ? 'Active' : 'Disabled'}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteSkill(sk.id)}
                    className="p-1 rounded text-gray-300 hover:text-rose-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: OPTIONS (INTERESTS, CAREER, WORK PREFERENCES) */}
      {activeTab === 'options' && (
        <div className="space-y-6">
          <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Add Option Tag</h3>
            <form onSubmit={handleAddOption} className="flex flex-col sm:flex-row gap-3">
              <select
                value={newOption.type}
                onChange={(e) => setNewOption({ ...newOption, type: e.target.value })}
                className="input-field text-sm sm:w-60"
              >
                <option value="AREA_OF_INTEREST">Area of Interest</option>
                <option value="CAREER_INTEREST">Career Interest</option>
                <option value="WORK_PREFERENCE">Work Preference</option>
              </select>
              <input
                type="text"
                placeholder="Option Label (e.g. Cloud Architecture, DevOps)"
                value={newOption.label}
                onChange={(e) => setNewOption({ ...newOption, label: e.target.value })}
                className="input-field text-sm flex-1"
                required
              />
              <Button type="submit" size="sm" className="bg-[#4F46E5] hover:bg-[#4338CA] text-white gap-1.5">
                <Plus className="w-4 h-4" /> Add Option
              </Button>
            </form>
          </div>

          {['AREA_OF_INTEREST', 'CAREER_INTEREST', 'WORK_PREFERENCE'].map((typeKey) => {
            const groupOptions = options.filter((o) => o.type === typeKey)
            const titleMap = {
              AREA_OF_INTEREST: 'Areas of Interest Options',
              CAREER_INTEREST: 'Career Interests Options',
              WORK_PREFERENCE: 'Work Preferences Options',
            }

            return (
              <div key={typeKey} className="p-5 bg-white rounded-xl border border-gray-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900">{titleMap[typeKey]}</h4>
                  <span className="text-xs text-gray-400">{groupOptions.length} available</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {groupOptions.map((opt) => (
                    <div
                      key={opt.id}
                      className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-2 ${
                        opt.isActive
                          ? 'bg-gray-50 border-gray-200 text-gray-800'
                          : 'bg-gray-100 border-gray-200 text-gray-400 line-through'
                      }`}
                    >
                      <span>{opt.label}</span>
                      <button
                        onClick={() => updateOption({ id: opt.id, isActive: !opt.isActive })}
                        className="text-gray-400 hover:text-gray-700"
                        title={opt.isActive ? 'Active (Click to disable)' : 'Disabled'}
                      >
                        {opt.isActive ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => deleteOption(opt.id)}
                        className="text-gray-400 hover:text-rose-600"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* TAB 5: ONBOARDING ANALYTICS & STATS */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Total Registered Students</span>
                <Users className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalStudents || 0}</p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-emerald-700">Completed Onboarding</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-emerald-700 mt-2">{stats.onboardedCount || 0}</p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-amber-700">In Progress / Pending</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-amber-700 mt-2">{stats.inProgressCount || 0}</p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#4F46E5]">Overall Completion Rate</span>
                <BarChart3 className="w-4 h-4 text-[#4F46E5]" />
              </div>
              <p className="text-2xl font-bold text-[#4F46E5] mt-2">{stats.completionRate || 0}%</p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#4F46E5]" />
              Student Drop-off by Onboarding Step
            </h3>
            <p className="text-xs text-gray-500">
              Shows where students who haven't completed onboarding are currently stopped:
            </p>

            <div className="space-y-3">
              {sections.map((sec) => {
                const match = (stats.stepBreakdown || []).find((b) => b.currentStepKey === sec.key)
                const count = match ? parseInt(match.count, 10) : 0
                const percent = stats.inProgressCount > 0 ? Math.round((count / stats.inProgressCount) * 100) : 0

                return (
                  <div key={sec.key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium text-gray-700">
                      <span>{sec.title}</span>
                      <span>{count} students ({percent}%)</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#4F46E5] transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
