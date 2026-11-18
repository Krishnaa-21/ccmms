import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi.js';
import { complaintApi } from '../../api/complaintApi.js';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { PriorityBadge } from '../../components/common/PriorityBadge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Building2,
  Clock,
  ArrowRight,
  ThumbsUp,
  MapPin,
  Calendar,
  X,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReviewQueuePage() {
  // Query: New "Submitted" complaints only
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-review-queue'],
    queryFn: () =>
      complaintApi.getComplaints({
        status: 'Submitted',
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'asc'
      })
  });

  // Query: Available Staff
  const { data: usersRes } = useQuery({
    queryKey: ['admin-staff-users'],
    queryFn: () => adminApi.getUsers({ role: 'staff', limit: 50 })
  });
  const staffList = usersRes?.data?.users || [];

  const [triageStates, setTriageStates] = useState({});
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const complaints = data?.data?.complaints || [];

  // Helper to get suggested staff by category
  const getSuggestedStaff = (complaint) => {
    const catName = complaint.categoryName?.toLowerCase() || '';
    const matching = staffList.filter((s) => {
      const spec = (s.specialty || '').toLowerCase();
      return (
        (catName.includes('elect') && spec.includes('elect')) ||
        (catName.includes('plumb') && spec.includes('plumb')) ||
        (catName.includes('hvac') && (spec.includes('hvac') || spec.includes('ac'))) ||
        (catName.includes('carp') && spec.includes('carp'))
      );
    });
    if (matching.length > 0) {
      // Pick available staff with lowest active load
      matching.sort((a, b) => (a.activeCount || 0) - (b.activeCount || 0));
      return matching[0];
    }
    return staffList[0] || null;
  };

  // One-click quick approve & dispatch
  const handleQuickApprove = async (complaint) => {
    const state = triageStates[complaint.id] || {};
    const priority = state.priority || complaint.priority || 'Medium';
    const suggested = getSuggestedStaff(complaint);
    const staffId = state.staffId || suggested?.id;

    if (!staffId) {
      toast.error('No technician available for assignment');
      return;
    }

    try {
      // 1. Change priority if modified
      if (priority !== complaint.priority) {
        await adminApi.changePriority(complaint.id, {
          priority,
          reason: 'Reviewed and prioritized in Review Queue'
        });
      }

      // 2. Assign staff
      await adminApi.assignComplaint(complaint.id, {
        staffId,
        reason: 'Approved and dispatched from Review Queue'
      });

      toast.success(`Dispatched #${complaint.referenceNumber} to technician!`);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to dispatch complaint');
    }
  };

  // Rejection
  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please state rejection reason');
      return;
    }
    try {
      await adminApi.changeStatus(rejectingId, {
        status: 'Rejected',
        notes: rejectReason,
        rejectionReason: rejectReason
      });
      toast.success('Complaint rejected');
      setRejectingId(null);
      setRejectReason('');
      refetch();
    } catch (err) {
      toast.error('Failed to reject complaint');
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
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300">
            Intake Triage
          </span>
          <span className="text-xs text-slate-400">First-line review &amp; auto-suggestions</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 dark:text-white">
          Incoming Complaints Review Queue
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
          Review newly submitted campus requests, verify AI priority suggestions, and auto-dispatch technicians in one flow.
        </p>
      </div>

      {isLoading ? (
        <div className="p-16 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Checking incoming submissions...</p>
        </div>
      ) : complaints.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold font-serif text-slate-900 dark:text-white">
            Inbox Zero! No pending submissions
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            All submitted complaints have been reviewed and dispatched to maintenance teams.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => {
            const suggestedTech = getSuggestedStaff(c);
            const currentState = triageStates[c.id] || {};
            const selectedStaff = currentState.staffId || suggestedTech?.id || '';
            const selectedPriority = currentState.priority || c.priority || 'Medium';

            return (
              <div
                key={c.id}
                className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-950 px-2.5 py-0.5 rounded border border-primary-200 dark:border-primary-900">
                      {c.referenceNumber}
                    </span>
                    <StatusBadge status={c.status} />
                    <span className="text-xs text-slate-400">
                      Logged {formatDate(c.createdAt)} by {c.createdBy?.name} ({c.createdBy?.department})
                    </span>
                  </div>

                  <button
                    onClick={() => setRejectingId(c.id)}
                    className="text-xs text-rose-600 hover:text-rose-700 font-semibold self-start sm:self-auto"
                  >
                    Reject Issue
                  </button>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                    {c.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    {c.description}
                  </p>
                </div>

                {/* Meta location & photo tags */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-primary-600" />
                    <strong>{c.location?.building}</strong> • {c.location?.room}
                  </span>
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-teal-600" />
                    {c.categoryName} ({c.subcategory || 'Standard'})
                  </span>
                  {c.attachments?.length > 0 && (
                    <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      {c.attachments.length} Photos Attached
                    </span>
                  )}
                  {c.upvotesCount > 0 && (
                    <span className="flex items-center gap-1 font-semibold text-teal-600">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      {c.upvotesCount} community upvotes
                    </span>
                  )}
                </div>

                {/* Triage & Dispatch Action Bar */}
                <div className="p-4 rounded-xl bg-primary-50/50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    {/* Priority Selector */}
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                        Confirm Priority:
                      </span>
                      <select
                        value={selectedPriority}
                        onChange={(e) =>
                          setTriageStates((prev) => ({
                            ...prev,
                            [c.id]: { ...currentState, priority: e.target.value }
                          }))
                        }
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                      >
                        {['Urgent', 'High', 'Medium', 'Low'].map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Technician Selector */}
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                        Assign Technician:
                      </span>
                      <select
                        value={selectedStaff}
                        onChange={(e) =>
                          setTriageStates((prev) => ({
                            ...prev,
                            [c.id]: { ...currentState, staffId: e.target.value }
                          }))
                        }
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold max-w-[220px] truncate"
                      >
                        {staffList.map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.name} ({st.specialty}) • {st.activeCount || 0} active
                          </option>
                        ))}
                      </select>
                    </div>

                    {suggestedTech && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-teal-700 dark:text-teal-300 bg-teal-100/60 dark:bg-teal-950/60 px-2.5 py-1 rounded-md font-medium mt-3 sm:mt-0">
                        <Sparkles className="w-3 h-3 text-teal-600" />
                        Suggested: {suggestedTech.name} (Lowest load)
                      </span>
                    )}
                  </div>

                  {/* 1-Click Approve Button */}
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => handleQuickApprove(c)}
                    className="shrink-0"
                  >
                    <span>Approve &amp; Dispatch</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rejection Modal */}
      {rejectingId && (
        <Modal
          isOpen={!!rejectingId}
          onClose={() => setRejectingId(null)}
          title="Reject Intake Complaint"
          size="md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-400">
              Provide a clear reason for why this complaint cannot be serviced.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Duplicate issue, non-maintenance concern, personal property"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setRejectingId(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleRejectSubmit}>
                Confirm Rejection
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

