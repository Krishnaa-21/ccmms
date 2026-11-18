import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { complaintApi } from '../../api/complaintApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { PriorityBadge } from '../../components/common/PriorityBadge.jsx';
import { FeedbackModal } from '../../components/common/FeedbackModal.jsx';
import { ReopenModal } from '../../components/common/ReopenModal.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import {
  ArrowLeft,
  Copy,
  Clock,
  Calendar,
  MapPin,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  MessageSquare,
  ThumbsUp,
  Send,
  Eye,
  X,
  Phone,
  Mail,
  FileText,
  Building2,
  Trash2,
  CornerDownRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const LIFECYCLE_STAGES = ['Submitted', 'Assigned', 'In Progress', 'Resolved', 'Closed'];

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Modals state
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [reopenOpen, setReopenOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [lightboxImg, setLightboxImg] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);

  // Fetch ticket details
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['complaint-detail', id],
    queryFn: () => complaintApi.getComplaintById(id),
    refetchInterval: 15000 // poll every 15s in addition to SSE
  });

  const detailData = data?.data || {};
  const complaint = detailData.complaint;
  const history = detailData.history || [];
  const comments = detailData.comments || [];
  const feedback = detailData.feedback || complaint?.feedback;

  // Real-time SLA Countdown calculation
  const [slaCountdown, setSlaCountdown] = useState(null);

  useEffect(() => {
    if (!complaint?.dueDate) return;

    const updateTimer = () => {
      const now = Date.now();
      const target = new Date(complaint.dueDate).getTime();
      const diff = target - now;

      if (['Resolved', 'Closed', 'Rejected'].includes(complaint.status)) {
        setSlaCountdown({ status: 'completed', text: 'Resolved within SLA window' });
        return;
      }

      if (diff <= 0) {
        const overdueHours = Math.abs(Math.floor(diff / (1000 * 60 * 60)));
        setSlaCountdown({
          status: 'overdue',
          text: `Overdue by ${overdueHours}h`
        });
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setSlaCountdown({
          status: 'active',
          text: `${hours}h ${mins}m ${secs}s remaining`
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [complaint?.dueDate, complaint?.status]);

  // Copy reference number
  const copyRefNumber = () => {
    const ref = complaint?.referenceNumber || complaint?.trackingNumber;
    if (ref) {
      navigator.clipboard.writeText(ref);
      toast.success(`Copied "${ref}" to clipboard`);
    }
  };

  // Upvote ticket
  const handleUpvote = async () => {
    try {
      await complaintApi.upvoteComplaint(id);
      toast.success('Your vote was counted!');
      refetch();
    } catch (err) {
      toast.error('Failed to register upvote');
    }
  };

  // Cancel ticket
  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please specify a cancellation reason');
      return;
    }
    try {
      await complaintApi.cancelComplaint(id, cancelReason);
      toast.success('Complaint request cancelled');
      setCancelModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel complaint');
    }
  };

  // Post comment
  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsPostingComment(true);
    try {
      await complaintApi.addComment(id, { content: commentText.trim(), isInternal: false });
      setCommentText('');
      toast.success('Comment posted to ticket thread');
      refetch();
    } catch (err) {
      toast.error('Failed to post comment');
    } finally {
      setIsPostingComment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-16 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500">Loading complaint record #{id}...</p>
      </div>
    );
  }

  if (isError || !complaint) {
    return (
      <div className="p-16 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-lg font-bold font-serif text-slate-900 dark:text-white">Ticket Not Found</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            This maintenance record may have been reassigned, deleted, or belongs to another user account.
          </p>
        </div>
        <Link to="/student/complaints">
          <Button variant="primary" size="md">
            Return to My Complaints
          </Button>
        </Link>
      </div>
    );
  }

  // Determine stage progress (0 to 4)
  const currentStageIndex = LIFECYCLE_STAGES.indexOf(complaint.status);
  const isRejected = complaint.status === 'Rejected';
  const canCancel = ['Submitted', 'Assigned'].includes(complaint.status);
  const canReopen = ['Resolved', 'Closed'].includes(complaint.status);
  const canFeedback = ['Resolved', 'Closed'].includes(complaint.status) && !feedback;

  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            to="/student/complaints"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 dark:text-primary-400 hover:text-primary-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Complaints</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 dark:text-white">
              {complaint.title}
            </h1>
            <button
              onClick={copyRefNumber}
              className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-2.5 py-1 rounded-lg border border-primary-200 dark:border-primary-900 hover:bg-primary-100 transition-colors"
              title="Click to copy ticket reference"
            >
              <span>{complaint.referenceNumber || complaint.trackingNumber}</span>
              <Copy className="w-3 h-3 text-primary-500" />
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Upvote button */}
          <Button variant="outline" size="sm" onClick={handleUpvote}>
            <ThumbsUp className="w-3.5 h-3.5 mr-1 text-teal-600" />
            <span>Upvote ({complaint.upvotesCount || 0})</span>
          </Button>

          {/* Cancel button */}
          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelModalOpen(true)}
              className="border-rose-200 text-rose-700 hover:bg-rose-50"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Cancel Request
            </Button>
          )}

          {/* Reopen button */}
          {canReopen && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReopenOpen(true)}
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reopen Ticket
            </Button>
          )}

          {/* Feedback button */}
          {canFeedback && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setFeedbackOpen(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white border-0 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Rate Service Quality
            </Button>
          )}
        </div>
      </div>

      {/* Status & SLA Highlight Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={complaint.status} />
          <PriorityBadge priority={complaint.priority} />
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Target SLA: <strong>{complaint.slaHours || 24} hours</strong>
          </span>
        </div>

        {slaCountdown && (
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold ${
              slaCountdown.status === 'overdue'
                ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900/60'
                : slaCountdown.status === 'completed'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900/60'
                : 'bg-primary-50 text-primary-800 border border-primary-200 dark:bg-primary-950/40 dark:border-primary-900/60'
            }`}
          >
            <Clock className="w-4 h-4 shrink-0" />
            <span>SLA Countdown: {slaCountdown.text}</span>
          </div>
        )}
      </div>

      {/* Visual Lifecycle Stepper (Horizontal) */}
      {!isRejected && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">
            Resolution Lifecycle
          </h2>

          <div className="relative">
            {/* Connecting Track */}
            <div className="absolute top-4 left-6 right-6 h-1 bg-slate-100 dark:bg-slate-800 -translate-y-1/2" />
            <div
              className="absolute top-4 left-6 h-1 bg-primary-600 -translate-y-1/2 transition-all duration-500"
              style={{
                width: `${Math.max(0, Math.min(100, (currentStageIndex / (LIFECYCLE_STAGES.length - 1)) * 100))}%`
              }}
            />

            <div className="relative z-10 grid grid-cols-5 gap-2 text-center">
              {LIFECYCLE_STAGES.map((stage, i) => {
                const isPassed = currentStageIndex >= i;
                const isCurrent = currentStageIndex === i;

                return (
                  <div key={stage} className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                        isCurrent
                          ? 'bg-primary-600 text-white ring-4 ring-primary-100 dark:ring-primary-900'
                          : isPassed
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                    </div>
                    <span
                      className={`mt-2 text-xs font-semibold ${
                        isCurrent
                          ? 'text-primary-700 dark:text-primary-400'
                          : isPassed
                          ? 'text-slate-900 dark:text-white'
                          : 'text-slate-400'
                      }`}
                    >
                      {stage}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Details (2/3) & Sidebar (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Details, Attachments, Resolution, Discussion */}
        <div className="lg:col-span-2 space-y-6">
          {/* Issue Overview & Full Description */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold font-serif text-slate-900 dark:text-white">
              Incident Description
            </h2>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
              {complaint.description}
            </div>

            {/* Location & Meta specs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                <span className="text-slate-500 block">Campus Location</span>
                <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary-600" />
                  {complaint.location?.building}, {complaint.location?.floor}
                </span>
                <span className="text-slate-600 dark:text-slate-400 block">
                  Room: {complaint.location?.room || 'N/A'}
                  {complaint.location?.landmark ? ` (${complaint.location.landmark})` : ''}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                <span className="text-slate-500 block">Category & Subcategory</span>
                <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-teal-600" />
                  {complaint.categoryName || 'General Maintenance'}
                </span>
                <span className="text-slate-600 dark:text-slate-400 block">
                  Component: {complaint.subcategory || 'Standard Service'}
                </span>
              </div>
            </div>
          </div>

          {/* Photo Attachments & Lightbox */}
          {complaint.attachments?.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold font-serif text-slate-900 dark:text-white">
                  Attached Photo Evidence ({complaint.attachments.length})
                </h2>
                <span className="text-xs text-slate-500">Click any photo to enlarge</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {complaint.attachments.map((file, i) => (
                  <div
                    key={i}
                    onClick={() => setLightboxImg(file.path || file.url || file)}
                    className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-video cursor-pointer bg-slate-100 dark:bg-slate-800"
                  >
                    <img
                      src={file.path || file.url || file}
                      alt={`Evidence ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                      <Eye className="w-5 h-5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resolution Summary (If Resolved / Closed) */}
          {(complaint.resolutionNotes || ['Resolved', 'Closed'].includes(complaint.status)) && (
            <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  Technician Resolution Report
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-emerald-950 dark:text-emerald-200 leading-relaxed">
                {complaint.resolutionNotes ||
                  'The reported malfunction was verified, serviced, and tested on-site by the maintenance staff.'}
              </p>
              {complaint.resolvedAt && (
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 block pt-1">
                  Completed on: {formatDate(complaint.resolvedAt)}
                </span>
              )}
            </div>
          )}

          {/* Student Feedback (If already submitted) */}
          {feedback && (
            <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Your Satisfaction Review</h3>
                </div>
                <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s}>{s <= feedback.rating ? '★' : '☆'}</span>
                  ))}
                  <span className="ml-1 text-xs text-amber-800 dark:text-amber-200">
                    ({feedback.rating}/5)
                  </span>
                </div>
              </div>
              {feedback.comment && (
                <p className="text-xs sm:text-sm text-amber-950 dark:text-amber-200 italic">
                  "{feedback.comment}"
                </p>
              )}
            </div>
          )}

          {/* Threaded Discussion & Activity Comments */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold font-serif text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary-600" />
                Ticket Discussion & Updates ({comments.length})
              </h2>
              <span className="text-xs text-slate-400">Communication with facilities team</span>
            </div>

            {/* Comment Thread */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-4">
                  No comments yet. Have a question or additional note? Post a message below.
                </p>
              ) : (
                comments.map((comm) => (
                  <div
                    key={comm.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">{comm.user?.name}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            comm.user?.role === 'admin'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                              : comm.user?.role === 'staff'
                              ? 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
                              : 'bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
                          }`}
                        >
                          {comm.user?.role}
                        </span>
                      </div>
                      <span className="text-slate-400 text-[11px]">{formatDate(comm.createdAt)}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {comm.content}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* New Comment Composer */}
            <form onSubmit={handlePostComment} className="pt-2 space-y-3">
              <textarea
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a message to the technician or administrative supervisor..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!commentText.trim()}
                  loading={isPostingComment}
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  <span>Send Message</span>
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column (1/3): Assigned Staff, Audit History */}
        <div className="space-y-6">
          {/* Assigned Staff Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Assigned Maintenance Technician
            </h3>

            {complaint.assignedTo ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold text-base border border-teal-200 dark:border-teal-800">
                    {complaint.assignedTo.name?.[0] || 'T'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {complaint.assignedTo.name}
                    </h4>
                    <span className="text-xs text-teal-600 dark:text-teal-400 font-semibold block">
                      {complaint.assignedTo.specialty || 'General Maintenance'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{complaint.assignedTo.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Duty Desk: ext. 4210</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 text-center">
                <Clock className="w-5 h-5 mx-auto mb-1 text-slate-400" />
                <p>Awaiting technician assignment from department supervisor.</p>
              </div>
            )}
          </div>

          {/* Audit / Status Change Log */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Status Change History
            </h3>

            <div className="relative pl-5 space-y-4 border-l-2 border-slate-200 dark:border-slate-800 text-xs">
              {history.map((h, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-primary-600 ring-4 ring-white dark:ring-slate-900" />
                  <div className="font-bold text-slate-900 dark:text-white">
                    {h.status || 'Updated'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {h.changedBy?.name ? `By ${h.changedBy.name}` : 'System Engine'} • {formatDate(h.changedAt)}
                  </div>
                  {h.notes && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 italic">
                      "{h.notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxImg} alt="Enlarged evidence" className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl" />
            <button
              onClick={() => setLightboxImg(null)}
              className="absolute -top-10 right-0 w-8 h-8 rounded-full bg-white/20 hover:bg-white text-white hover:text-black flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalOpen && (
        <Modal
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          title="Cancel Maintenance Request"
          size="md"
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <p className="text-slate-600 dark:text-slate-400">
              Are you sure you want to cancel this complaint? The maintenance team will be notified to halt work.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Cancellation Reason *
              </label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Issue resolved on its own, duplicate submission, or moved room"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setCancelModalOpen(false)}>
                Nevermind
              </Button>
              <Button variant="danger" size="sm" onClick={handleCancel}>
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reopen Modal */}
      {reopenOpen && (
        <ReopenModal
          complaintId={id}
          referenceNumber={complaint.referenceNumber || complaint.trackingNumber}
          isOpen={reopenOpen}
          onClose={() => setReopenOpen(false)}
          onSuccess={() => {
            setReopenOpen(false);
            refetch();
          }}
        />
      )}

      {/* Feedback Modal */}
      {feedbackOpen && (
        <FeedbackModal
          complaintId={id}
          referenceNumber={complaint.referenceNumber || complaint.trackingNumber}
          isOpen={feedbackOpen}
          onClose={() => setFeedbackOpen(false)}
          onSuccess={() => {
            setFeedbackOpen(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}
