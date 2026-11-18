import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { staffApi } from '../../api/staffApi.js';
import { complaintApi } from '../../api/complaintApi.js';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { PriorityBadge } from '../../components/common/PriorityBadge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import {
  Wrench,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Send,
  MessageSquare,
  AlertTriangle,
  FileText,
  User,
  Phone,
  X,
  Play,
  Package,
  CheckCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function StaffTasksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'new' | 'inprogress' | 'awaiting' | 'completed'
  const [search, setSearch] = useState('');

  // Selected Task State
  const [activeTaskId, setActiveTaskId] = useState(searchParams.get('id') || null);

  // Action Modals State
  const [awaitingPartsOpen, setAwaitingPartsOpen] = useState(false);
  const [partsData, setPartsData] = useState({ partName: '', expectedDate: '', notes: '' });

  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolveData, setResolveData] = useState({
    resolutionNotes: '',
    timeSpentHours: 1,
    partsUsed: '',
    estimatedCost: 0
  });

  const [commentText, setCommentText] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);

  // 1. Fetch assigned tasks
  const { data: tasksRes, isLoading, refetch } = useQuery({
    queryKey: ['staff-all-tasks'],
    queryFn: () => staffApi.getMyTasks({ limit: 100, sortBy: 'createdAt', sortOrder: 'desc' })
  });
  const allTasks = Array.isArray(tasksRes?.data) ? tasksRes.data : (tasksRes?.data?.complaints || []);

  // 2. Fetch detail for active task
  const { data: detailRes, refetch: refetchDetail } = useQuery({
    queryKey: ['staff-task-detail', activeTaskId],
    queryFn: () => complaintApi.getComplaintById(activeTaskId),
    enabled: !!activeTaskId
  });
  const activeTask = detailRes?.data?.complaint || detailRes?.data;
  const activeComments = detailRes?.data?.comments || [];
  const activeHistory = detailRes?.data?.history || detailRes?.data?.statusHistory || [];
  const activeFeedback = detailRes?.data?.feedback || activeTask?.feedback;

  // Filter tasks by tab and search
  const filteredTasks = allTasks.filter((t) => {
    // Tab filter
    if (activeTab === 'new' && t.status !== 'Assigned') return false;
    if (activeTab === 'inprogress' && t.status !== 'In Progress') return false;
    if (activeTab === 'awaiting' && t.status !== 'Awaiting Parts') return false;
    if (activeTab === 'completed' && !['Resolved', 'Closed'].includes(t.status)) return false;

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.referenceNumber?.toLowerCase().includes(q) ||
        t.location?.building?.toLowerCase().includes(q) ||
        t.location?.room?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Action: Accept / Start Work
  const handleStartWork = async (taskId) => {
    try {
      await staffApi.startWork(taskId, 'Technician accepted work order and commenced on-site service');
      toast.success('Task status set to In Progress');
      refetch();
      if (activeTaskId) refetchDetail();
    } catch (err) {
      toast.error('Failed to update task status');
    }
  };

  // Action: Mark Awaiting Parts
  const handleAwaitingPartsSubmit = async (e) => {
    e.preventDefault();
    if (!partsData.partName.trim()) {
      toast.error('Part name or material description is required');
      return;
    }
    try {
      await staffApi.markAwaitingParts(activeTaskId, partsData);
      toast.success('Status updated: Awaiting Parts');
      setAwaitingPartsOpen(false);
      setPartsData({ partName: '', expectedDate: '', notes: '' });
      refetch();
      refetchDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  // Action: Resume from Awaiting Parts
  const handleResumeWork = async (taskId) => {
    try {
      await staffApi.resumeWork(taskId);
      toast.success('Work resumed: Status set to In Progress');
      refetch();
      if (activeTaskId) refetchDetail();
    } catch (err) {
      toast.error('Failed to resume work');
    }
  };

  // Action: Resolve Task
  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!resolveData.resolutionNotes.trim() || resolveData.resolutionNotes.length < 5) {
      toast.error('Resolution notes are mandatory (min 5 chars)');
      return;
    }
    try {
      await staffApi.resolveTask(activeTaskId, resolveData);
      toast.success('Work order marked Resolved! The student has been notified.');
      setResolveModalOpen(false);
      setResolveData({ resolutionNotes: '', timeSpentHours: 1, partsUsed: '', estimatedCost: 0 });
      refetch();
      refetchDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark task resolved');
    }
  };

  // Action: Post Comment
  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsPostingComment(true);
    try {
      await complaintApi.addComment(activeTaskId, { content: commentText.trim(), isInternal: false });
      setCommentText('');
      toast.success('Comment posted to requester');
      refetchDetail();
    } catch (err) {
      toast.error('Failed to post comment');
    } finally {
      setIsPostingComment(false);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 dark:text-white">
            My Maintenance Work Orders
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Accept dispatches, log spare parts delays, update status, and complete repair dossiers.
          </p>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
            {[
              { id: 'all', label: `All (${allTasks.length})` },
              {
                id: 'new',
                label: `New Tasks (${allTasks.filter((t) => t.status === 'Assigned').length})`
              },
              {
                id: 'inprogress',
                label: `In Progress (${allTasks.filter((t) => t.status === 'In Progress').length})`
              },
              {
                id: 'awaiting',
                label: `Awaiting Parts (${
                  allTasks.filter((t) => t.status === 'Awaiting Parts').length
                })`
              },
              {
                id: 'completed',
                label: `Completed (${
                  allTasks.filter((t) => ['Resolved', 'Closed'].includes(t.status)).length
                })`
              }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl transition-colors ${
                  activeTab === tab.id
                    ? 'bg-teal-700 text-white dark:bg-teal-600 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ref #, title, room..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-16 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Loading work orders...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-16 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-teal-600 mx-auto" />
            <h3 className="text-base font-bold font-serif text-slate-900 dark:text-white">
              No tasks found
            </h3>
            <p className="text-xs text-slate-500">No work orders match this tab or search query.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => setActiveTaskId(task.id)}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 shadow-sm transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2.5 py-0.5 rounded border border-teal-200 dark:border-teal-900">
                    {task.referenceNumber}
                  </span>
                  <StatusBadge status={task.status} />
                  <PriorityBadge priority={task.priority} />
                  {task.isOverdue && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                      SLA Overdue
                    </span>
                  )}
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {task.title}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                    <MapPin className="w-3.5 h-3.5 text-primary-600" />
                    {task.location?.building} • {task.location?.room}
                  </span>
                  <span>Requester: {task.createdBy?.name}</span>
                  <span>Logged: {formatDate(task.createdAt)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="shrink-0 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                {task.status === 'Assigned' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleStartWork(task.id)}
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    <Play className="w-3.5 h-3.5 mr-1" />
                    Start Work
                  </Button>
                )}

                {task.status === 'In Progress' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActiveTaskId(task.id);
                        setAwaitingPartsOpen(true);
                      }}
                      className="border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      <Package className="w-3.5 h-3.5 mr-1" />
                      Parts Delay
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setActiveTaskId(task.id);
                        setResolveModalOpen(true);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <CheckCheck className="w-3.5 h-3.5 mr-1" />
                      Resolve
                    </Button>
                  </>
                )}

                {task.status === 'Awaiting Parts' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleResumeWork(task.id)}
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    Resume Work
                  </Button>
                )}

                <Button variant="ghost" size="sm" onClick={() => setActiveTaskId(task.id)}>
                  Details
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* TASK DETAIL DRAWER / MODAL */}
      {activeTaskId && activeTask && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 h-full overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border-l border-slate-200 dark:border-slate-800 animate-slide-left">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-900">
                  {activeTask.referenceNumber}
                </span>
                <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white mt-1">
                  {activeTask.title}
                </h2>
              </div>
              <button
                onClick={() => setActiveTaskId(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Badges Bar */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <StatusBadge status={activeTask.status} />
                <PriorityBadge priority={activeTask.priority} />
              </div>
              <span className="text-xs text-slate-500">
                SLA Target: <strong>{activeTask.slaHours || 24} hours</strong>
              </span>
            </div>

            {/* Actions Toolbar */}
            <div className="p-4 rounded-xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/60 flex flex-wrap items-center gap-2">
              {activeTask.status === 'Assigned' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleStartWork(activeTask.id)}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <Play className="w-3.5 h-3.5 mr-1" />
                  Accept &amp; Start On-Site Work
                </Button>
              )}
              {activeTask.status === 'In Progress' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAwaitingPartsOpen(true)}
                    className="border-amber-300 text-amber-700 hover:bg-amber-50"
                  >
                    <Package className="w-3.5 h-3.5 mr-1" />
                    Mark Awaiting Parts
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setResolveModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <CheckCheck className="w-3.5 h-3.5 mr-1" />
                    Mark Resolved
                  </Button>
                </>
              )}
              {activeTask.status === 'Awaiting Parts' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleResumeWork(activeTask.id)}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  Parts Arrived - Resume Work
                </Button>
              )}
            </div>

            {/* Details */}
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-slate-500 font-semibold uppercase tracking-wider block mb-1">
                  Issue Description
                </span>
                <p className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 leading-relaxed text-sm">
                  {activeTask.description}
                </p>
              </div>

              {/* Location & Requester specs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 block">Location:</span>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {activeTask.location?.building}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400 block">
                    Room: {activeTask.location?.room || 'N/A'} {activeTask.location?.floor ? `(${activeTask.location.floor})` : ''}
                  </span>
                  {activeTask.location?.landmark && (
                    <span className="text-[11px] text-slate-400 block italic">
                      Spot: {activeTask.location.landmark}
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 block">Requester Contact:</span>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {activeTask.createdBy?.name}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400 block">
                    {activeTask.createdBy?.email}
                  </span>
                  {activeTask.contactPhone && (
                    <span className="text-[11px] text-teal-600 block">
                      Phone: {activeTask.contactPhone}
                    </span>
                  )}
                </div>
              </div>

              {/* Photo Evidence */}
              {activeTask.attachments?.length > 0 && (
                <div>
                  <span className="text-slate-500 font-semibold uppercase tracking-wider block mb-2">
                    Requester Photo Evidence
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {activeTask.attachments.map((att, i) => (
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

              {/* Resolution Notes If Resolved */}
              {activeTask.resolutionNotes && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1.5">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 block">
                    Recorded Resolution:
                  </span>
                  <p className="text-xs text-emerald-950 dark:text-emerald-200">
                    {activeTask.resolutionNotes}
                  </p>
                </div>
              )}

              {/* Threaded Discussion with Requester */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-slate-500 font-semibold uppercase tracking-wider block">
                  Communication with Requester ({activeComments.length})
                </span>

                <div className="space-y-2 max-h-52 overflow-y-auto">
                  {activeComments.map((comm) => (
                    <div
                      key={comm.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {comm.user?.name} ({comm.user?.role})
                        </span>
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

                <form onSubmit={handlePostComment} className="pt-2 flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a message to the student / requester..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    loading={isPostingComment}
                    disabled={!commentText.trim()}
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    <Send className="w-3.5 h-3.5 mr-1" />
                    Send
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Awaiting Parts Modal */}
      {awaitingPartsOpen && (
        <Modal
          isOpen={awaitingPartsOpen}
          onClose={() => setAwaitingPartsOpen(false)}
          title="Mark Task Awaiting Parts"
          size="md"
        >
          <form onSubmit={handleAwaitingPartsSubmit} className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-400">
              State what spare parts, valves, or components are needed from stores:
            </p>

            <div>
              <label className="block font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Required Parts / Materials *
              </label>
              <input
                type="text"
                required
                value={partsData.partName}
                onChange={(e) => setPartsData((p) => ({ ...p, partName: e.target.value }))}
                placeholder="e.g. 2-inch CPVC valve, 40W ballast"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Estimated Delivery / Arrival Date
              </label>
              <input
                type="date"
                value={partsData.expectedDate}
                onChange={(e) => setPartsData((p) => ({ ...p, expectedDate: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Additional Notes
              </label>
              <textarea
                rows={2}
                value={partsData.notes}
                onChange={(e) => setPartsData((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Requested from central warehouse"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" type="button" onClick={() => setAwaitingPartsOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">
                Submit Parts Hold
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Resolve Task Modal */}
      {resolveModalOpen && (
        <Modal
          isOpen={resolveModalOpen}
          onClose={() => setResolveModalOpen(false)}
          title="Complete & Resolve Work Order"
          size="md"
        >
          <form onSubmit={handleResolveSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Resolution Summary &amp; Work Report *
              </label>
              <textarea
                rows={3}
                required
                value={resolveData.resolutionNotes}
                onChange={(e) => setResolveData((p) => ({ ...p, resolutionNotes: e.target.value }))}
                placeholder="Explain what was fixed, serviced, or replaced..."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Time Spent (Hours)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={resolveData.timeSpentHours}
                  onChange={(e) => setResolveData((p) => ({ ...p, timeSpentHours: Number(e.target.value) }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Estimated Repair Cost (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={resolveData.estimatedCost}
                  onChange={(e) => setResolveData((p) => ({ ...p, estimatedCost: Number(e.target.value) }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Parts &amp; Materials Used
              </label>
              <input
                type="text"
                value={resolveData.partsUsed}
                onChange={(e) => setResolveData((p) => ({ ...p, partsUsed: e.target.value }))}
                placeholder="e.g. 1x Ballast, 2m wire"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" type="button" onClick={() => setResolveModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Submit Resolution
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

