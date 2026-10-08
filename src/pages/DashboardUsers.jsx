import { useState, useMemo, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '@/store/slices/authSlice'
import { useGetUsersQuery, useUpdateUserByAdminMutation } from '@/store/api/usersApiSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Users,
  Search,
  Edit3,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Shield,
  GraduationCap,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const PAGE_SIZE = 15

// Helper to calculate pagination page numbers with smart ellipsis
const getPageNumbers = (current, total) => {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  if (current <= 3) {
    return [1, 2, 3, 4, '...', total]
  }
  if (current >= total - 2) {
    return [1, '...', total - 3, total - 2, total - 1, total]
  }
  return [1, '...', current - 1, current, current + 1, '...', total]
}

export default function DashboardUsers() {
  const currentUser = useSelector(selectCurrentUser)
  const isAdmin = currentUser?.role === 'ADMIN'

  // Pagination & filter state
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL') // ALL | STUDENT | ADMIN

  // Debounce search input to avoid unnecessary network queries for large datasets
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Reset page when role tab changes
  const handleRoleFilterChange = (role) => {
    setRoleFilter(role)
    setPage(1)
  }

  // Fetch paginated users from API with 5-minute caching
  const { data, isLoading, isError, error, isFetching } = useGetUsersQuery(
    {
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch,
      role: roleFilter,
    },
    {
      skip: !isAdmin,
    }
  )

  const [updateUser, { isLoading: isUpdating }] = useUpdateUserByAdminMutation()

  // Extract paginated users and system-wide counts from API response
  const users = data?.users || []
  const pagination = data?.pagination || {
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
    hasMore: false,
  }

  // System-wide counts for Total Users, Students, Administrators cards
  const counts = useMemo(() => {
    if (data?.counts) {
      return {
        total: Number(data.counts.total ?? pagination.total),
        students: Number(data.counts.students ?? 0),
        admins: Number(data.counts.admins ?? 0),
      }
    }
    const list = data?.users || []
    return {
      total: pagination.total || list.length,
      students: list.filter((u) => u.role === 'STUDENT').length,
      admins: list.filter((u) => u.role === 'ADMIN').length,
    }
  }, [data, pagination.total])

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [editFirstName, setEditFirstName] = useState('')
  const [editLastName, setEditLastName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editIsActive, setEditIsActive] = useState(true)
  const [modalFeedback, setModalFeedback] = useState({ type: '', text: '' })

  // Open edit modal for student
  const handleOpenEdit = (user) => {
    if (user.role === 'ADMIN') return // Disallow opening edit for admins
    setSelectedUser(user)
    setEditFirstName(user.firstName || '')
    setEditLastName(user.lastName || '')
    setEditEmail(user.email || '')
    setEditIsActive(user.isActive !== false)
    setModalFeedback({ type: '', text: '' })
    setEditModalOpen(true)
  }

  // Save updated user
  const handleSaveUser = async (e) => {
    e.preventDefault()
    setModalFeedback({ type: '', text: '' })

    if (!selectedUser) return

    if (!editFirstName.trim()) {
      setModalFeedback({ type: 'error', text: 'First name is required.' })
      return
    }

    if (!editEmail.trim()) {
      setModalFeedback({ type: 'error', text: 'Email is required.' })
      return
    }

    try {
      await updateUser({
        id: selectedUser.id,
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        email: editEmail.trim(),
        isActive: editIsActive,
      }).unwrap()

      setModalFeedback({ type: 'success', text: 'User details updated successfully!' })
      setTimeout(() => {
        setEditModalOpen(false)
        setSelectedUser(null)
      }, 1200)
    } catch (err) {
      setModalFeedback({
        type: 'error',
        text: err?.data?.error || 'Failed to update user. Please try again.',
      })
    }
  }

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return '—'
    }
  }

  // If non-admin accesses page
  if (!isAdmin) {
    return (
      <div className="p-8 rounded-xl bg-white border border-[#E5E7EB] text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-red-50 text-[#DC2626] mx-auto flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-[#111827]">Access Restricted</h2>
        <p className="text-xs text-[#6B7280] max-w-sm mx-auto">
          You do not have administrative privileges to view the Users Management console.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      
      {/* Page Header */}
      <div>
        <h1 className="page-title flex items-center gap-2">
          <Users className="w-5 h-5 text-[#4F46E5]" />
          Users Management
        </h1>
        <p className="page-subtitle mt-0.5">
          Review registered platform accounts and manage student profiles.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-white border border-[#E5E7EB] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-[#6B7280]">Total Users</p>
            <p className="text-xl font-bold text-[#111827] mt-0.5">{counts.total}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-[#E5E7EB] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-[#6B7280]">Students</p>
            <p className="text-xl font-bold text-[#111827] mt-0.5">{counts.students}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
            <GraduationCap className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-[#E5E7EB] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-[#6B7280]">Administrators</p>
            <p className="text-xl font-bold text-[#111827] mt-0.5">{counts.admins}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
            <Shield className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 rounded-xl bg-white border border-[#E5E7EB] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-2.5 pointer-events-none" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
            className="pl-9 h-8 text-xs bg-white text-[#111827] border-[#E5E7EB] focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
          />
        </div>

        {/* Role Filter Tabs */}
        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Users' },
            { id: 'STUDENT', label: 'Students' },
            { id: 'ADMIN', label: 'Admins' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleRoleFilterChange(tab.id)}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
                roleFilter === tab.id
                  ? 'bg-[#EEF2FF] text-[#4F46E5] border border-indigo-200'
                  : 'text-[#6B7280] hover:text-[#111827] hover:bg-slate-50 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </div>

      {/* Users Table Card */}
      <div className="rounded-xl bg-white border border-[#E5E7EB] shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#6B7280]">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#4F46E5] mb-2" />
            Loading registered users...
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-xs text-[#DC2626]">
            {error?.data?.error || 'Failed to load users from Neon PostgreSQL database.'}
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#6B7280]">
            No users match the search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E5E7EB] text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">
                  <th className="py-2.5 px-4">User</th>
                  <th className="py-2.5 px-4">Role</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Joined</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-xs">
                {users.map((u) => {
                  const isUserAdmin = u.role === 'ADMIN'
                  const fullName = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.name || 'User'

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      
                      {/* User Info */}
                      <td className="py-3 px-4">
                        <p className="font-semibold text-[#111827] truncate">
                          {fullName}
                        </p>
                        <p className="text-[11px] text-[#6B7280] truncate">
                          {u.email}
                        </p>
                      </td>

                      {/* Role */}
                      <td className="py-3 px-4">
                        <Badge variant={isUserAdmin ? 'admin' : 'student'} className="text-[10px] px-2 py-0">
                          {u.role}
                        </Badge>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {u.isActive !== false ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#16A34A]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#DC2626]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="py-3 px-4 text-[#6B7280]">
                        {formatDate(u.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        {isUserAdmin ? (
                          <span className="text-[#9CA3AF] text-xs select-none">—</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 text-[#6B7280] hover:text-[#4F46E5] hover:bg-[#EEF2FF] rounded-md transition-colors cursor-pointer inline-flex items-center justify-center"
                            title={`Edit ${fullName}`}
                            aria-label={`Edit ${fullName}`}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                      </td>

                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!isLoading && !isError && pagination.total > 0 && (
          <div className="px-4 py-3 border-t border-[#E5E7EB] bg-[#F8FAFC] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-[#6B7280]">
              Showing <span className="font-semibold text-[#111827]">{(page - 1) * PAGE_SIZE + 1}</span> to{' '}
              <span className="font-semibold text-[#111827]">
                {Math.min(page * PAGE_SIZE, pagination.total)}
              </span>{' '}
              of <span className="font-semibold text-[#111827]">{pagination.total}</span> users
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || isFetching}
                  className="px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] bg-white text-[#6B7280] hover:text-[#111827] hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1 font-medium cursor-pointer"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-1">
                  {getPageNumbers(page, pagination.totalPages).map((p, idx) =>
                    p === '...' ? (
                      <span key={`ellipsis-${idx}`} className="px-1.5 py-1 text-[#6B7280] select-none">
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPage(p)}
                        disabled={isFetching}
                        className={`min-w-7 h-7 px-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                          page === p
                            ? 'bg-[#4F46E5] text-white shadow-xs'
                            : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] hover:bg-slate-50'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page >= pagination.totalPages || isFetching}
                  className="px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] bg-white text-[#6B7280] hover:text-[#111827] hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1 font-medium cursor-pointer"
                  aria-label="Next page"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="max-w-md bg-white border-[#E5E7EB] p-5"
        >
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="section-title text-[#111827]">
              Edit Student Details
            </DialogTitle>
            <DialogDescription className="section-desc">
              Modify the student profile details. Administrators cannot be edited.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveUser} className="space-y-4 pt-1">
            
            {/* Modal Feedback Alert */}
            {modalFeedback.text && (
              <div
                className={`flex items-center gap-2 p-2.5 rounded-lg text-xs border ${
                  modalFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                {modalFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{modalFeedback.text}</span>
              </div>
            )}

            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="editFirstName" className="field-label">
                  First Name <span className="text-[#DC2626]">*</span>
                </Label>
                <Input
                  id="editFirstName"
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  placeholder="First name"
                  className="h-8 text-xs bg-white text-[#111827] border-[#E5E7EB] focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="editLastName" className="field-label">
                  Last Name
                </Label>
                <Input
                  id="editLastName"
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  placeholder="Last name"
                  className="h-8 text-xs bg-white text-[#111827] border-[#E5E7EB] focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <Label htmlFor="editEmail" className="field-label">
                Email Address <span className="text-[#DC2626]">*</span>
              </Label>
              <Input
                id="editEmail"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="name@futureme.edu"
                className="h-8 text-xs bg-white text-[#111827] border-[#E5E7EB] focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
                required
              />
            </div>

            {/* Account Status Toggle */}
            <div className="space-y-1">
              <Label className="field-label">Account Status</Label>
              <div className="flex items-center gap-3 pt-1">
                <label className="flex items-center gap-1.5 text-xs text-[#111827] cursor-pointer">
                  <input
                    type="radio"
                    name="accountStatus"
                    checked={editIsActive === true}
                    onChange={() => setEditIsActive(true)}
                    className="text-[#4F46E5] focus:ring-[#4F46E5]"
                  />
                  <span>Active</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-[#6B7280] cursor-pointer">
                  <input
                    type="radio"
                    name="accountStatus"
                    checked={editIsActive === false}
                    onChange={() => setEditIsActive(false)}
                    className="text-[#4F46E5] focus:ring-[#4F46E5]"
                  />
                  <span>Inactive (Deactivated)</span>
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <DialogFooter className="pt-2 border-t border-[#E5E7EB] gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditModalOpen(false)}
                className="h-8 text-xs border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isUpdating}
                className="h-8 text-xs px-4 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-medium cursor-pointer transition-colors"
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>

          </form>
        </DialogContent>
      </Dialog>

    </div>
  )
}
