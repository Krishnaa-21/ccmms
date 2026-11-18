import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi.js';
import { complaintApi } from '../../api/complaintApi.js';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { PriorityBadge } from '../../components/common/PriorityBadge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  Columns,
  Sparkles,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpDown,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  X,
  MessageSquare,
  Building2,
  User,
  MapPin,
  Calendar,
  Eye,
  CornerDownRight,
  Send,
  Lock,
  RotateCcw,
  ShieldCheck,
  ArrowRight,
  Layers,
  GitMerge
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_LIST = [
  'All',
  'Submitted',
  'Under Review',
  'Assigned',
  'In Progress',
  'Awaiting Parts',
  'Resolved',
  'Closed',
  'Rejected'
];

const KANBAN_COLUMNS = [
  'Submitted',
  'Under Review',
  'Assigned',
  'In Progress',
  'Awaiting Parts',
  'Resolved',
  'Closed'
];

const PRIORITY_LIST = ['All', 'Urgent', 'High', 'Medium', 'Low'];

const BUILDINGS = [
  'All',
  'Main Academic Block',
  'Library',
  'Hostel Block A',
  'Hostel Block B',
  'Computer Lab 1',
  'Physics Lab',
  'Seminar Hall',
  'Canteen',
  'Sports Complex',
  'Admin Office',
  'Parking Area'
];

export default function ManageComplaintsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // View mode: 'table' or 'kanban'
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('ccmms_admin_view') || 'table');

  // Filters State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(searchParams.get('status') || 'All');
  const [priority, setPriority] = useState('All');
  const [building, setBuilding] = useState('All');
  const [assigneeId, setAssigneeId] = useState('All');
  const [overdueOnly, setOverdueOnly] = useState(searchParams.get('filter') === 'attention');
  const [page, setPage] = useState(1);
  const limit = 15;

  // Row Selection State
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkAssignModal, setBulkAssignModal] = useState(false);
  const [selectedBulkStaff, setSelectedBulkStaff] = useState('');
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [mergeParentId, setMergeParentId] = useState('');
  const [mergeChildIds, setMergeChildIds] = useState([]);
  const [mergeReason, setMergeReason] = useState('Duplicate report of same physical issue');

  // Detail Drawer / Modal State
  const [activeTicketId, setActiveTicketId] = useState(searchParams.get('id') || null);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [reassignStaffId, setReassignStaffId] = useState('');
  const [reassignReason, setReassignReason] = useState('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Column Visibility
  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    title: true,
    category: true,
    location: true,
    priority: true,
    status: true,
    assignee: true,
    created: true,
    actions: true
  });

  // Queries: Staff list for assignment
  const { data: usersRes } = useQuery({
    queryKey: ['admin-staff-users'],
    queryFn: () => adminApi.getUsers({ role: 'staff', limit: 50 })
  });
  const staffUsers = Array.isArray(usersRes?.data) ? usersRes.data : (usersRes?.data?.users || []);

  // Query: Categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => complaintApi.getCategories()
  });

  // Main Complaints Query
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-complaints-list', page, search, status, priority, building, assigneeId, overdueOnly],
    queryFn: () =>
      complaintApi.getComplaints({
        page,
        limit,
        search: search.trim() || undefined,
        status: status !== 'All' ? status : undefined,
        priority: priority !== 'All' ? priority : undefined,
        building: building !== 'All' ? building : undefined,
        assignee: assigneeId !== 'All' ? assigneeId : undefined,
        overdueOnly: overdueOnly ? true : undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      })
  });

  const complaints = Array.isArray(data?.data) ? data.data : (data?.data?.complaints || []);
  const pagination = data?.pagination || data?.data?.pagination || { total: complaints.length, page: 1, limit, totalPages: 1 };

  // Query: Detail for selected complaint
  const { data: activeDetailRes, refetch: refetchActiveDetail } = useQuery({
    queryKey: ['admin-active-complaint', activeTicketId],
    queryFn: () => complaintApi.getComplaintById(activeTicketId),
    enabled: !!activeTicketId
  });
  const activeComplaint = activeDetailRes?.data?.complaint || activeDetailRes?.data;
  const activeHistory = activeDetailRes?.data?.history || activeDetailRes?.data?.statusHistory || [];
  const activeComments = activeDetailRes?.data?.comments || [];
  const activeFeedback = activeDetailRes?.data?.feedback || activeComplaint?.feedback;

  // Handle View Mode switch
  const handleViewChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('ccmms_admin_view', mode);
  };

  // Row Selection logic
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(complaints.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Quick Inline Priority Change
  const handleInlinePriority = async (complaintId, newPriority) => {
    try {
      await adminApi.changePriority(complaintId, {
        priority: newPriority,
        reason: 'Quick table edit by Administrator'
      });
      toast.success(`Priority set to ${newPriority}`);
      refetch();
    } catch (err) {
      toast.error('Failed to change priority');
    }
  };

  // Quick Inline Assignee Change
  const handleInlineAssignee = async (complaintId, newStaffId) => {
    try {
      await adminApi.assignComplaint(complaintId, {
        staffId: newStaffId,
        reason: 'Inline table reassignment by Administrator'
      });
      toast.success('Technician assigned successfully');
      refetch();
    } catch (err) {
      toast.error('Failed to reassign technician');
    }
  };

  // Bulk Actions
  const handleBulkAssignSubmit = async () => {
    if (!selectedBulkStaff) {
      toast.error('Please choose a technician');
      return;
    }
    try {
      await adminApi.bulkAssign(selectedIds, selectedBulkStaff, 'Bulk dispatch by Administrator');
      toast.success(`Assigned ${selectedIds.length} tickets to technician`);
      setBulkAssignModal(false);
      setSelectedIds([]);
      refetch();
    } catch (err) {
      toast.error('Failed bulk assignment');
    }
  };

  const handleBulkPriorityChange = async (newPriority) => {
    try {
      await adminApi.bulkPriority(selectedIds, newPriority, 'Bulk priority update');
      toast.success(`Updated ${selectedIds.length} tickets to ${newPriority} priority`);
      setSelectedIds([]);
      refetch();
    } catch (err) {
      toast.error('Failed bulk priority change');
    }
  };

  const handleBulkClose = async () => {
    try {
      await adminApi.bulkClose(selectedIds, 'Bulk closed by Administrator');
      toast.success(`Closed ${selectedIds.length} tickets`);
      setSelectedIds([]);
      refetch();
    } catch (err) {
      toast.error('Failed bulk closure (tickets must be Resolved)');
    }
  };

  const handleOpenMergeModal = () => {
    if (selectedIds.length < 2) {
      toast.error('Select at least two tickets to merge');
      return;
    }
    setMergeParentId(selectedIds[0]);
    setMergeChildIds(selectedIds.slice(1));
    setMergeModalOpen(true);
  };

  const handleConfirmMerge = async () => {
    if (!mergeParentId || mergeChildIds.length === 0) {
      toast.error('Please specify a master parent ticket and child duplicates');
      return;
    }
    try {
      const res = await complaintApi.mergeComplaints(mergeParentId, {
        duplicateIds: mergeChildIds,
        reason: mergeReason
      });
      toast.success(res.message || 'Duplicate tickets successfully merged');
      setSelectedIds([]);
      setMergeModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to merge tickets');
    }
  };

  // Kanban Stage Shift
  const handleKanbanMove = async (complaintId, targetStatus) => {
    try {
      await adminApi.changeStatus(complaintId, {
        status: targetStatus,
        notes: `Kanban board transition to ${targetStatus}`
      });
      toast.success(`Moved ticket to ${targetStatus}`);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || `Cannot transition directly to ${targetStatus}`);
    }
  };

  // Detail Drawer Action Handlers
  const handleReassignSubmit = async () => {
    if (!reassignStaffId) return;
    try {
      await adminApi.assignComplaint(activeTicketId, {
        staffId: reassignStaffId,
        reason: reassignReason || 'Reassigned via Admin detail drawer'
      });
      toast.success('Ticket reassigned');
      setReassignModalOpen(false);
      setReassignReason('');
      refetchActiveDetail();
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed reassignment');
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }
    try {
      await adminApi.changeStatus(activeTicketId, {
        status: 'Rejected',
        notes: rejectReason,
        rejectionReason: rejectReason
      });
      toast.success('Ticket rejected');
      setRejectModalOpen(false);
      setRejectReason('');
      refetchActiveDetail();
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed rejection');
    }
  };

  const handleCloseTicket = async () => {
    try {
      await adminApi.closeComplaint(activeTicketId, { notes: 'Verified and closed by Administrator' });
      toast.success('Ticket successfully closed');
      refetchActiveDetail();
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to close ticket');
    }
  };

  const handlePostAdminComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      await complaintApi.addComment(activeTicketId, {
        content: newCommentText.trim(),
        isInternal: isInternalComment
      });
      setNewCommentText('');
      toast.success(isInternalComment ? 'Internal note added' : 'Public comment posted');
      refetchActiveDetail();
    } catch (err) {
      toast.error('Failed to post comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 dark:text-white">
            Campus Complaints &amp; Work Orders
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Dispatch, reassign, prioritize, and verify maintenance requests across all campus zones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle: Table vs Kanban */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => handleViewChange('table')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => handleViewChange('kanban')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
          </div>

          <a
            href="/api/export/complaints.csv"
            download
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </a>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search reference #, title, student name, or location..."
              className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => {
                setStatus('Submitted');
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                status === 'Submitted'
                  ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-950 dark:border-blue-800'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              Needs Review
            </button>
            <button
              onClick={() => {
                setOverdueOnly(!overdueOnly);
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                overdueOnly
                  ? 'bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-950 dark:border-rose-800'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              SLA Overdue
            </button>
            <button
              onClick={() => {
                setPriority('Urgent');
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                priority === 'Urgent'
                  ? 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-950 dark:border-amber-800'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              Urgent Priority
            </button>
          </div>
        </div>

        {/* Filters Dropdown Row */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Status */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            >
              {STATUS_LIST.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium">Priority:</span>
            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                setPage(1);
              }}
              className="py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            >
              {PRIORITY_LIST.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Building */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium">Building:</span>
            <select
              value={building}
              onChange={(e) => {
                setBuilding(e.target.value);
                setPage(1);
              }}
              className="py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 max-w-[150px] truncate"
            >
              {BUILDINGS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Assignee */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium">Assignee:</span>
            <select
              value={assigneeId}
              onChange={(e) => {
                setAssigneeId(e.target.value);
                setPage(1);
              }}
              className="py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 max-w-[150px] truncate"
            >
              <option value="All">All Staff</option>
              {staffUsers.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.specialty || 'General'})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setSearch('');
              setStatus('All');
              setPriority('All');
              setBuilding('All');
              setAssigneeId('All');
              setOverdueOnly(false);
              setPage(1);
            }}
            className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium underline ml-auto"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Floating Bulk Action Bar (When rows selected) */}
      {selectedIds.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-primary-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg animate-slide-up">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="px-2 py-0.5 rounded-full bg-primary-800 text-teal-300 font-bold">
              {selectedIds.length} Selected
            </span>
            <span>Bulk actions applicable to selection:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBulkAssignModal(true)}
              className="bg-primary-900/80 text-white border-primary-700 hover:bg-primary-800"
            >
              <UserCheck className="w-3.5 h-3.5 mr-1" />
              Assign Staff
            </Button>

            <div className="relative group">
              <Button
                variant="outline"
                size="sm"
                className="bg-primary-900/80 text-white border-primary-700 hover:bg-primary-800"
              >
                Change Priority
              </Button>
              <div className="hidden group-hover:flex absolute right-0 bottom-full mb-1 flex-col bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-lg z-50 text-xs">
                {['Urgent', 'High', 'Medium', 'Low'].map((p) => (
                  <button
                    key={p}
                    onClick={() => handleBulkPriorityChange(p)}
                    className="px-3 py-1.5 hover:bg-slate-800 text-left rounded-lg text-slate-200"
                  >
                    Set {p}
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkClose}
              className="bg-emerald-950/80 text-emerald-300 border-emerald-800 hover:bg-emerald-900"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Close Resolved
            </Button>

            {selectedIds.length >= 2 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenMergeModal}
                className="bg-amber-950/80 text-amber-300 border-amber-800 hover:bg-amber-900"
              >
                <GitMerge className="w-3.5 h-3.5 mr-1" />
                Merge Duplicates
              </Button>
            )}

            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-slate-400 hover:text-white px-2 py-1"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* VIEW 1: DATA TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3.5 w-8">
                    <input
                      type="checkbox"
                      checked={
                        complaints.length > 0 && selectedIds.length === complaints.length
                      }
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 dark:border-slate-700 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  <th className="py-3 px-3">Ticket Ref</th>
                  <th className="py-3 px-3">Subject &amp; Requester</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Assignee</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Logged</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      Loading complaints records...
                    </td>
                  </tr>
                ) : complaints.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      No complaints match the selected filter criteria.
                    </td>
                  </tr>
                ) : (
                  complaints.map((c) => {
                    const isSelected = selectedIds.includes(c.id);
                    return (
                      <tr
                        key={c.id}
                        className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                          isSelected ? 'bg-primary-50/40 dark:bg-primary-950/20' : ''
                        }`}
                      >
                        <td className="py-3 px-3.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleRow(c.id)}
                            className="rounded border-slate-300 dark:border-slate-700 text-primary-600 focus:ring-primary-500"
                          />
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-primary-700 dark:text-primary-400">
                          {c.referenceNumber || c.trackingNumber}
                        </td>
                        <td className="py-3 px-3 max-w-xs">
                          <button
                            onClick={() => setActiveTicketId(c.id)}
                            className="font-bold text-slate-900 dark:text-white hover:underline text-left block truncate"
                          >
                            {c.title}
                          </button>
                          <span className="text-[11px] text-slate-400 block truncate">
                            By {c.createdBy?.name || 'Requester'} • {c.categoryName || 'General'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          <span className="font-medium text-slate-800 dark:text-slate-200 block truncate max-w-[130px]">
                            {c.location?.building}
                          </span>
                          <span className="text-[10px] text-slate-400">{c.location?.room}</span>
                        </td>
                        {/* Inline Priority Dropdown */}
                        <td className="py-3 px-3">
                          <select
                            value={c.priority}
                            onChange={(e) => handleInlinePriority(c.id, e.target.value)}
                            className="text-[11px] font-semibold py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 cursor-pointer"
                          >
                            {['Urgent', 'High', 'Medium', 'Low'].map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                        </td>
                        {/* Inline Assignee Dropdown */}
                        <td className="py-3 px-3">
                          <select
                            value={c.assignedTo?.id || ''}
                            onChange={(e) => handleInlineAssignee(c.id, e.target.value)}
                            className="text-[11px] py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 max-w-[140px] truncate cursor-pointer"
                          >
                            <option value="">Unassigned</option>
                            {staffUsers.map((st) => (
                              <option key={st.id} value={st.id}>
                                {st.name} ({st.specialty || 'General'})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="py-3 px-3 text-slate-400 text-[11px]">
                          {formatDate(c.createdAt)}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActiveTicketId(c.id)}
                          >
                            Inspect
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-500">
                Page {page} of {pagination.totalPages} ({pagination.total} total)
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
      )}

      {/* VIEW 2: KANBAN BOARD VIEW */}
      {viewMode === 'kanban' && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-[1400px]">
            {KANBAN_COLUMNS.map((colStatus) => {
              const colComplaints = complaints.filter(
                (c) => c.status.toLowerCase() === colStatus.toLowerCase()
              );

              return (
                <div
                  key={colStatus}
                  className="flex-1 bg-slate-100/70 dark:bg-slate-900/60 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 flex flex-col max-h-[780px]"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      {colStatus}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-2xs">
                      {colComplaints.length}
                    </span>
                  </div>

                  {/* Cards List */}
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                    {colComplaints.map((ticket) => (
                      <div
                        key={ticket.id}
                        onClick={() => setActiveTicketId(ticket.id)}
                        className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-2"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono text-[11px] font-bold text-primary-700 dark:text-primary-400">
                            {ticket.referenceNumber}
                          </span>
                          <PriorityBadge priority={ticket.priority} />
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                          {ticket.title}
                        </h4>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                          <span className="truncate max-w-[120px]">
                            {ticket.location?.building}
                          </span>
                          {ticket.assignedTo ? (
                            <span className="text-teal-600 dark:text-teal-400 font-semibold truncate max-w-[100px]">
                              {ticket.assignedTo.name?.split(' ')[0]}
                            </span>
                          ) : (
                            <span className="text-amber-600 text-[10px]">Unassigned</span>
                          )}
                        </div>

                        {/* Column Mover Shortcuts */}
                        <div
                          className="pt-1.5 flex justify-between items-center text-[10px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {colStatus === 'Submitted' && (
                            <button
                              onClick={() => handleKanbanMove(ticket.id, 'Under Review')}
                              className="text-primary-600 hover:underline font-semibold"
                            >
                              → Review
                            </button>
                          )}
                          {colStatus === 'Under Review' && (
                            <button
                              onClick={() => handleKanbanMove(ticket.id, 'Assigned')}
                              className="text-primary-600 hover:underline font-semibold"
                            >
                              → Assign
                            </button>
                          )}
                          {colStatus === 'Assigned' && (
                            <button
                              onClick={() => handleKanbanMove(ticket.id, 'In Progress')}
                              className="text-primary-600 hover:underline font-semibold"
                            >
                              → Start
                            </button>
                          )}
                          {colStatus === 'In Progress' && (
                            <button
                              onClick={() => handleKanbanMove(ticket.id, 'Resolved')}
                              className="text-emerald-600 hover:underline font-semibold"
                            >
                              → Resolve
                            </button>
                          )}
                          {colStatus === 'Resolved' && (
                            <button
                              onClick={() => handleKanbanMove(ticket.id, 'Closed')}
                              className="text-emerald-600 hover:underline font-semibold"
                            >
                              → Close
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DETAIL DRAWER / MODAL FOR SELECTED COMPLAINT */}
      {activeTicketId && activeComplaint && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 h-full overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border-l border-slate-200 dark:border-slate-800 animate-slide-left">
            {/* Drawer Top Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="font-mono text-xs font-bold text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-950 px-2 py-0.5 rounded border border-primary-200 dark:border-primary-900">
                  {activeComplaint.referenceNumber}
                </span>
                <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white mt-2">
                  {activeComplaint.title}
                </h2>
              </div>
              <button
                onClick={() => setActiveTicketId(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status / Priority & SLA */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <StatusBadge status={activeComplaint.status} />
                <PriorityBadge priority={activeComplaint.priority} />
              </div>
              <span className="text-xs text-slate-500">
                SLA: <strong>{activeComplaint.slaHours || 24} hours</strong>
              </span>
            </div>

            {/* Admin Action Controls Bar */}
            <div className="p-4 rounded-xl bg-primary-50/50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-900/60 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-900 dark:text-primary-300 block">
                Administrative Actions
              </span>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReassignModalOpen(true)}
                >
                  <UserCheck className="w-3.5 h-3.5 mr-1" />
                  Reassign Staff
                </Button>
                {activeComplaint.status === 'Resolved' && (
                  <Button variant="primary" size="sm" onClick={handleCloseTicket}>
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Approve &amp; Close
                  </Button>
                )}
                {!['Resolved', 'Closed', 'Rejected'].includes(activeComplaint.status) && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setRejectModalOpen(true)}
                  >
                    Reject Issue
                  </Button>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-slate-500 font-semibold uppercase tracking-wider block mb-1">
                  Full Description
                </span>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap text-sm">
                  {activeComplaint.description}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block mb-0.5">Location:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {activeComplaint.location?.building}, {activeComplaint.location?.room}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block mb-0.5">Requester:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {activeComplaint.createdBy?.name} ({activeComplaint.createdBy?.role})
                  </span>
                </div>
              </div>

              {/* Assigned Staff */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block mb-0.5">Assigned Technician:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {activeComplaint.assignedTo?.name || 'Unassigned'}
                  </span>
                  {activeComplaint.assignedTo && (
                    <span className="text-[11px] text-teal-600 block">
                      {activeComplaint.assignedTo.specialty}
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReassignModalOpen(true)}
                >
                  Change
                </Button>
              </div>

              {/* Photo Evidence */}
              {activeComplaint.attachments?.length > 0 && (
                <div>
                  <span className="text-slate-500 font-semibold uppercase tracking-wider block mb-2">
                    Evidence Attachments ({activeComplaint.attachments.length})
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {activeComplaint.attachments.map((att, i) => (
                      <img
                        key={i}
                        src={att.path || att.url || att}
                        alt="Evidence"
                        className="rounded-lg border border-slate-200 dark:border-slate-800 aspect-video object-cover"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* History Timeline */}
              <div>
                <span className="text-slate-500 font-semibold uppercase tracking-wider block mb-2">
                  Status History Trail
                </span>
                <div className="relative pl-5 space-y-3 border-l-2 border-slate-200 dark:border-slate-800">
                  {activeHistory.map((h, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full bg-primary-600 ring-2 ring-white dark:ring-slate-900" />
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {h.status}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {h.changedBy?.name || 'System'} • {formatDate(h.changedAt)}
                      </span>
                      {h.notes && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 italic mt-0.5">
                          "{h.notes}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Comments & Internal Notes Thread */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-slate-500 font-semibold uppercase tracking-wider block">
                  Discussion &amp; Internal Notes ({activeComments.length})
                </span>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {activeComments.map((comm) => (
                    <div
                      key={comm.id}
                      className={`p-3 rounded-xl border ${
                        comm.isInternal
                          ? 'bg-amber-50/70 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900/60'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {comm.user?.name}
                          </span>
                          {comm.isInternal && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-200 flex items-center gap-0.5">
                              <Lock className="w-2.5 h-2.5" /> Internal
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {formatDate(comm.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {comm.content}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Comment Composer with Internal Note Checkbox */}
                <form onSubmit={handlePostAdminComment} className="pt-2 space-y-2">
                  <textarea
                    rows={2}
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Write a reply or internal note..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-400">
                      <input
                        type="checkbox"
                        checked={isInternalComment}
                        onChange={(e) => setIsInternalComment(e.target.checked)}
                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="font-medium text-[11px] flex items-center gap-1 text-amber-700 dark:text-amber-400">
                        <Lock className="w-3 h-3" /> Mark Internal (Staff &amp; Admin only)
                      </span>
                    </label>

                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      loading={isSubmittingComment}
                      disabled={!newCommentText.trim()}
                    >
                      <Send className="w-3.5 h-3.5 mr-1" />
                      Post
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Assign Modal */}
      {bulkAssignModal && (
        <Modal
          isOpen={bulkAssignModal}
          onClose={() => setBulkAssignModal(false)}
          title={`Bulk Dispatch (${selectedIds.length} tickets)`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-400">
              Select the maintenance technician to receive these {selectedIds.length} complaints:
            </p>
            <select
              value={selectedBulkStaff}
              onChange={(e) => setSelectedBulkStaff(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              <option value="">Select Technician...</option>
              {staffUsers.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.specialty || 'General'}) - Active load: {st.activeCount || 0}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setBulkAssignModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleBulkAssignSubmit}>
                Confirm Dispatch
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reassign Single Ticket Modal */}
      {reassignModalOpen && (
        <Modal
          isOpen={reassignModalOpen}
          onClose={() => setReassignModalOpen(false)}
          title="Reassign Maintenance Technician"
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Select Technician
              </label>
              <select
                value={reassignStaffId}
                onChange={(e) => setReassignStaffId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="">Select Technician...</option>
                {staffUsers.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.specialty || 'General'})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Reassignment Reason (Optional)
              </label>
              <textarea
                rows={2}
                value={reassignReason}
                onChange={(e) => setReassignReason(e.target.value)}
                placeholder="e.g. Workload balancing, specialized tool requirement"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setReassignModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleReassignSubmit}>
                Save Assignment
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reject Ticket Modal */}
      {rejectModalOpen && (
        <Modal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          title="Reject Campus Complaint"
          size="md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-400">
              Provide a clear reason for rejecting this ticket. The requester will be notified.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Outside campus jurisdiction, duplicate submission, insufficient details"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setRejectModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleRejectSubmit}>
                Confirm Rejection
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Duplicate Merging Modal */}
      {mergeModalOpen && (
        <Modal
          isOpen={mergeModalOpen}
          onClose={() => setMergeModalOpen(false)}
          title="Merge Duplicate Complaints"
          size="md"
        >
          <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
            <p className="leading-relaxed">
              Merging consolidates multiple reports of the same physical fault into a single master ticket.
              Duplicate tickets will follow the master ticket's status and their reporters will be notified.
            </p>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Master Parent Ticket *
              </label>
              <select
                value={mergeParentId}
                onChange={(e) => {
                  const newParent = e.target.value;
                  setMergeParentId(newParent);
                  setMergeChildIds(selectedIds.filter((id) => id !== newParent));
                }}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                {selectedIds.map((id) => {
                  const ticket = complaints.find((c) => c.id === id);
                  return (
                    <option key={id} value={id}>
                      {ticket ? `${ticket.referenceNumber || ticket.trackingNumber} - ${ticket.title}` : id}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Child Tickets to Merge ({mergeChildIds.length})
              </label>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1 max-h-32 overflow-y-auto font-mono text-[11px]">
                {mergeChildIds.map((cid) => {
                  const t = complaints.find((c) => c.id === cid);
                  return (
                    <div key={cid} className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>{t ? `${t.referenceNumber || t.trackingNumber} - ${t.title}` : cid}</span>
                      <span className="text-[10px] text-amber-600 font-sans font-semibold">Will be marked Merged</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Merge Explanation Note
              </label>
              <input
                type="text"
                value={mergeReason}
                onChange={(e) => setMergeReason(e.target.value)}
                placeholder="e.g. Identical fan failure reported in Room 204"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" size="sm" onClick={() => setMergeModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmMerge}>
                Confirm &amp; Merge Tickets
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

