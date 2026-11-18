import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { complaintApi } from '../../api/complaintApi.js';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { PriorityBadge } from '../../components/common/PriorityBadge.jsx';
import { FeedbackModal } from '../../components/common/FeedbackModal.jsx';
import { Button } from '../../components/ui/Button.jsx';
import {
  Search,
  Filter,
  Plus,
  LayoutGrid,
  List,
  Clock,
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ThumbsUp,
  X,
  Sparkles,
  ArrowUpDown,
  CheckCircle2
} from 'lucide-react';

const STATUS_OPTIONS = [
  'All',
  'Submitted',
  'Assigned',
  'In Progress',
  'Resolved',
  'Closed',
  'Reopened',
  'Rejected'
];

const PRIORITY_OPTIONS = ['All', 'Low', 'Medium', 'High', 'Emergency'];

export default function MyComplaintsPage() {
  const navigate = useNavigate();

  // View mode: 'card' or 'table'
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('ccmms_view_mode') || 'card');

  // Filters State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [priority, setPriority] = useState('All');
  const [categoryId, setCategoryId] = useState('All');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;

  // Feedback modal
  const [feedbackTicket, setFeedbackTicket] = useState(null);

  const handleViewChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('ccmms_view_mode', mode);
  };

  // Categories Query
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => complaintApi.getCategories()
  });

  // Complaints Query
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['my-complaints', page, status, priority, categoryId, overdueOnly, search],
    queryFn: () =>
      complaintApi.getComplaints({
        page,
        limit,
        search: search.trim() || undefined,
        status: status !== 'All' ? status : undefined,
        priority: priority !== 'All' ? priority : undefined,
        categoryId: categoryId !== 'All' ? categoryId : undefined,
        overdueOnly: overdueOnly ? true : undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      })
  });

  const complaints = Array.isArray(data?.data) ? data.data : (data?.data?.complaints || []);
  const pagination = data?.pagination || data?.data?.pagination || { total: complaints.length, page: 1, limit: 10, totalPages: 1 };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const resetFilters = () => {
    setSearch('');
    setStatus('All');
    setPriority('All');
    setCategoryId('All');
    setOverdueOnly(false);
    setPage(1);
  };

  const hasActiveFilters = search || status !== 'All' || priority !== 'All' || categoryId !== 'All' || overdueOnly;

  return (
    <div className="space-y-6">
      {/* Header & Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 dark:text-white">
            My Maintenance Complaints
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Track real-time progress, technician assignments, and SLA resolution for all your logged tickets.
          </p>
        </div>

        <Link to="/student/new-complaint">
          <Button variant="primary" size="md" className="shrink-0">
            <Plus className="w-4 h-4 mr-1.5" />
            <span>New Complaint</span>
          </Button>
        </Link>
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
              placeholder="Search by ticket ID, title, building, or description..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1.5 self-end lg:self-auto bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => handleViewChange('card')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'card'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              type="button"
              onClick={() => handleViewChange('table')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns Strip */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Status */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-600"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Priority:</span>
            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                setPage(1);
              }}
              className="py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-600"
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          {categories.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Category:</span>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setPage(1);
                }}
                className="py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-600"
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Overdue checkbox toggle */}
          <label className="flex items-center gap-1.5 cursor-pointer ml-auto text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={overdueOnly}
              onChange={(e) => {
                setOverdueOnly(e.target.checked);
                setPage(1);
              }}
              className="w-3.5 h-3.5 text-rose-600 rounded border-slate-300 dark:border-slate-700 focus:ring-rose-500"
            />
            <span className="font-semibold text-rose-600 dark:text-rose-400">Overdue SLA Only</span>
          </label>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium underline ml-2"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Content Rendering: Loading, Empty, or Results */}
      {isLoading ? (
        <div className="p-16 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Retrieving tickets...</p>
        </div>
      ) : complaints.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Filter className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold font-serif text-slate-900 dark:text-white">
              No matching complaints found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              {hasActiveFilters
                ? 'Try adjusting your search query, status, or category filters.'
                : 'You have not submitted any complaints yet. Report an issue to get started.'}
            </p>
          </div>
          {hasActiveFilters ? (
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Clear All Filters
            </Button>
          ) : (
            <Link to="/student/new-complaint">
              <Button variant="primary" size="md">
                <Plus className="w-4 h-4 mr-1.5" />
                Report Campus Issue
              </Button>
            </Link>
          )}
        </div>
      ) : viewMode === 'card' ? (
        /* CARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {complaints.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="font-mono text-xs font-semibold text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-2 py-0.5 rounded-md border border-primary-200 dark:border-primary-900">
                    {c.referenceNumber || c.trackingNumber}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={c.status} />
                    <PriorityBadge priority={c.priority} />
                  </div>
                </div>

                <Link to={`/student/complaints/${c.id}`} className="group">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
                    {c.title}
                  </h3>
                </Link>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {c.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {c.location?.building} • {c.location?.room}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(c.createdAt)}
                    </span>
                  </div>

                  {c.assignedTo && (
                    <div className="flex items-center justify-between text-[11px] text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 px-2 py-1 rounded-lg">
                      <span>Technician: {c.assignedTo.name}</span>
                      <span>{c.assignedTo.specialty}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {c.upvotesCount > 0 && (
                    <span className="text-xs text-teal-600 dark:text-teal-400 flex items-center gap-1 font-medium">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      {c.upvotesCount}
                    </span>
                  )}
                  {c.feedback && (
                    <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 font-semibold">
                      ★ {c.feedback.rating}/5
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {['Resolved', 'Closed'].includes(c.status) && !c.feedback && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFeedbackTicket(c)}
                      className="border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1" />
                      Rate
                    </Button>
                  )}
                  <Link to={`/student/complaints/${c.id}`}>
                    <Button variant="ghost" size="sm">
                      Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Logged</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-primary-700 dark:text-primary-400">
                      {c.referenceNumber || c.trackingNumber}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                      <Link to={`/student/complaints/${c.id}`} className="hover:underline">
                        {c.title}
                      </Link>
                    </td>
                    <td className="py-3 px-4">{c.categoryName || 'General'}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {c.location?.building} • {c.location?.room}
                    </td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-500">{formatDate(c.createdAt)}</td>
                    <td className="py-3 px-4 text-right">
                      <Link to={`/student/complaints/${c.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Bar */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm text-xs">
          <span className="text-slate-500">
            Showing <strong className="text-slate-800 dark:text-slate-200">{(page - 1) * limit + 1}</strong> to{' '}
            <strong className="text-slate-800 dark:text-slate-200">
              {Math.min(page * limit, pagination.total)}
            </strong>{' '}
            of <strong className="text-slate-800 dark:text-slate-200">{pagination.total}</strong> tickets
          </span>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <span className="px-3 py-1 font-semibold text-slate-700 dark:text-slate-300">
              Page {page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackTicket && (
        <FeedbackModal
          complaintId={feedbackTicket.id}
          referenceNumber={feedbackTicket.referenceNumber || feedbackTicket.trackingNumber}
          isOpen={!!feedbackTicket}
          onClose={() => setFeedbackTicket(null)}
          onSuccess={() => {
            setFeedbackTicket(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}

