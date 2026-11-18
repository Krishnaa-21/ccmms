import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi.js';
import { Button } from '../../components/ui/Button.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import {
  UserCheck,
  Search,
  Plus,
  Edit,
  Trash2,
  ShieldCheck,
  Building2,
  Wrench,
  Mail,
  Phone,
  Power,
  X,
  Lock,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageUsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const limit = 15;

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalUser, setEditModalUser] = useState(null);
  const [inspectUser, setInspectUser] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'Password@123',
    role: 'student',
    department: 'Computer Science & Engineering',
    specialty: '',
    phone: '',
    isAvailable: true
  });

  // Query: Users list
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-users-list', page, search, roleFilter, statusFilter],
    queryFn: () =>
      adminApi.getUsers({
        page,
        limit,
        search: search.trim() || undefined,
        role: roleFilter !== 'All' ? roleFilter.toLowerCase() : undefined,
        isActive: statusFilter === 'Active' ? true : statusFilter === 'Inactive' ? false : undefined
      })
  });

  const users = data?.data?.users || [];
  const pagination = data?.data?.pagination || { total: 0, page: 1, limit, totalPages: 1 };

  // Create User Submit
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Name, email, and password are required');
      return;
    }
    try {
      await adminApi.createUser({
        ...formData,
        email: formData.email.trim().toLowerCase()
      });
      toast.success('User account created successfully');
      setCreateModalOpen(false);
      setFormData({
        name: '',
        email: '',
        password: 'Password@123',
        role: 'student',
        department: 'Computer Science & Engineering',
        specialty: '',
        phone: '',
        isAvailable: true
      });
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    }
  };

  // Edit User Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminApi.updateUser(editModalUser.id, {
        name: editModalUser.name,
        role: editModalUser.role,
        department: editModalUser.department,
        specialty: editModalUser.specialty,
        phone: editModalUser.phone,
        isAvailable: editModalUser.isAvailable
      });
      toast.success('User profile updated');
      setEditModalUser(null);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    }
  };

  // Toggle User Active Status
  const handleToggleActive = async (user) => {
    try {
      await adminApi.updateUserStatus(user.id, !user.isActive);
      toast.success(`User ${!user.isActive ? 'activated' : 'deactivated'}`);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user status');
    }
  };

  // Delete User
  const handleDeleteUser = async (user) => {
    if (!confirm(`Are you sure you want to permanently delete ${user.name}? This cannot be undone.`)) {
      return;
    }
    try {
      await adminApi.deleteUser(user.id);
      toast.success('User record deleted');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete user');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 dark:text-white">
            Campus User &amp; Directory Administration
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Manage roles, department affiliations, technician specialty assignments, and access status.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Add Campus User</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, email, department, or specialty..."
              className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs">
            <span className="text-slate-500 font-medium">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold"
            >
              <option value="All">All Roles</option>
              <option value="student">Student</option>
              <option value="staff">Maintenance Staff</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Deactivated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Directory Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Department / Specialty</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Loading campus directory...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No users found matching query.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-2xs"
                          style={{ backgroundColor: u.avatarColor || '#1e3a8a' }}
                        >
                          {u.name?.[0]}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {u.name}
                          </span>
                          <span className="text-[11px] text-slate-400 block">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : u.role === 'staff'
                            ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                            : 'bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                        {u.department}
                      </span>
                      {u.specialty && (
                        <span className="text-[10px] text-teal-600 dark:text-teal-400 block">
                          Specialty: {u.specialty}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      <span>{u.phone || 'No phone'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleActive(u)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                          u.isActive
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                        title="Click to toggle account activation"
                      >
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditModalUser({ ...u })}
                          title="Edit user details"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(u)}
                          className="hover:text-rose-600"
                          title="Delete user"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500">
              Page {page} of {pagination.totalPages} ({pagination.total} accounts)
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              >
                Next
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {createModalOpen && (
        <Modal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title="Create New Campus Account"
          size="md"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Priya Sharma"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Campus Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  placeholder="priya@apex.edu"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Account Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold"
                >
                  <option value="student">Student / Staff Requester</option>
                  <option value="staff">Maintenance Staff (Technician)</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Department *
                </label>
                <input
                  type="text"
                  required
                  value={formData.department}
                  onChange={(e) => setFormData((p) => ({ ...p, department: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                />
              </div>

              {formData.role === 'staff' && (
                <div>
                  <label className="block font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Specialty Trade
                  </label>
                  <select
                    value={formData.specialty}
                    onChange={(e) => setFormData((p) => ({ ...p, specialty: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold"
                  >
                    <option value="">Select trade...</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="HVAC">HVAC &amp; AC</option>
                    <option value="Carpentry">Carpentry</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" type="button" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Create User
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit User Modal */}
      {editModalUser && (
        <Modal
          isOpen={!!editModalUser}
          onClose={() => setEditModalUser(null)}
          title={`Edit Account: ${editModalUser.name}`}
          size="md"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={editModalUser.name}
                onChange={(e) => setEditModalUser((p) => ({ ...p, name: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Role
                </label>
                <select
                  value={editModalUser.role}
                  onChange={(e) => setEditModalUser((p) => ({ ...p, role: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold"
                >
                  <option value="student">Student</option>
                  <option value="staff">Staff (Technician)</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={editModalUser.department}
                  onChange={(e) => setEditModalUser((p) => ({ ...p, department: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                />
              </div>
            </div>

            {editModalUser.role === 'staff' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Specialty Trade
                  </label>
                  <select
                    value={editModalUser.specialty || ''}
                    onChange={(e) => setEditModalUser((p) => ({ ...p, specialty: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold"
                  >
                    <option value="">General</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="HVAC">HVAC &amp; AC</option>
                    <option value="Carpentry">Carpentry</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Availability
                  </label>
                  <select
                    value={editModalUser.isAvailable !== false ? 'true' : 'false'}
                    onChange={(e) =>
                      setEditModalUser((p) => ({ ...p, isAvailable: e.target.value === 'true' }))
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold"
                  >
                    <option value="true">Available for Dispatch</option>
                    <option value="false">Unavailable / On Leave</option>
                  </select>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" type="button" onClick={() => setEditModalUser(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

