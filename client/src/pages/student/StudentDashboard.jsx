import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext.jsx';
import { complaintApi } from '../../api/complaintApi.js';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { PriorityBadge } from '../../components/common/PriorityBadge.jsx';
import { FeedbackModal } from '../../components/common/FeedbackModal.jsx';
import { Button } from '../../components/ui/Button.jsx';
import {
  Plus,
  AlertCircle,
  Clock,
  CheckCircle2,
  MessageSquare,
  ArrowRight,
  Flame,
  Zap,
  Droplet,
  Wind,
  Hammer,
  Monitor,
  PhoneCall,
  MapPin,
  Calendar,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ThumbsUp
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [feedbackTicket, setFeedbackTicket] = useState(null);

  // Fetch complaints belonging to student
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['my-complaints-dashboard'],
    queryFn: () => complaintApi.getComplaints({ limit: 10, sortBy: 'createdAt', sortOrder: 'desc' })
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => complaintApi.getCategories()
  });

  const complaints = data?.data?.complaints || [];

  // Calculate statistics
  const totalCount = complaints.length;
  const activeCount = complaints.filter((c) => ['Submitted', 'Assigned', 'In Progress', 'Under Review'].includes(c.status)).length;
  const resolvedCount = complaints.filter((c) => ['Resolved', 'Closed'].includes(c.status)).length;
  const pendingFeedback = complaints.filter((c) => ['Resolved', 'Closed'].includes(c.status) && !c.feedback);

  const getCategoryIcon = (name = '') => {
    const n = name.toLowerCase();
    if (n.includes('elect')) return Zap;
    if (n.includes('plumb')) return Droplet;
    if (n.includes('hvac') || n.includes('ac')) return Wind;
    if (n.includes('carp')) return Hammer;
    return Monitor;
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSlaRemaining = (dueDate) => {
    if (!dueDate) return null;
    const diff = new Date(dueDate).getTime() - Date.now();
    if (diff <= 0) return { text: 'Overdue', isOverdue: true };
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 24) {
      return { text: `${Math.floor(hours / 24)}d ${hours % 24}h remaining`, isOverdue: false };
    }
    return { text: `${hours}h ${mins}m remaining`, isOverdue: false };
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-950 via-primary-900 to-slate-900 text-white p-6 sm:p-8 shadow-sm">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 rounded-full bg-primary-600/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-800/80 border border-primary-700/60 text-teal-300 text-xs font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              Apex Campus Care Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'Student'}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
              {user?.department ? `${user.department} • ` : ''}
              Track facility maintenance requests, log new classroom or hostel concerns, and monitor real-time SLA resolutions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/student/new-complaint">
              <Button variant="primary" size="lg" className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-950/40 border-0">
                <Plus className="w-5 h-5 mr-1.5" />
                <span>Report Campus Issue</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Actionable Alert: Needs Feedback */}
      {pendingFeedback.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 dark:border-amber-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Work Resolution Awaiting Your Confirmation
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Ticket <strong className="font-mono text-slate-800 dark:text-slate-200">{pendingFeedback[0].referenceNumber}</strong> has been resolved by our maintenance team. Please rate the service quality so we can close it.
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setFeedbackTicket(pendingFeedback[0])}
            className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white border-0 shadow-sm"
          >
            Leave Feedback & Rating
          </Button>
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Logged */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Logged
            </span>
            <div className="mt-2 text-2xl font-bold font-serif text-slate-900 dark:text-white">
              {isLoading ? '...' : totalCount}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
              All-time campus requests
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-400 flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        {/* Active Work Orders */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active / In Progress
            </span>
            <div className="mt-2 text-2xl font-bold font-serif text-primary-700 dark:text-primary-400">
              {isLoading ? '...' : activeCount}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
              Currently being addressed
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Successfully Resolved */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Resolved & Closed
            </span>
            <div className="mt-2 text-2xl font-bold font-serif text-emerald-700 dark:text-emerald-400">
              {isLoading ? '...' : resolvedCount}
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block">
              Completed repairs
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Awaiting Feedback */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Awaiting Feedback
            </span>
            <div className={`mt-2 text-2xl font-bold font-serif ${pendingFeedback.length > 0 ? 'text-amber-600' : 'text-slate-900 dark:text-white'}`}>
              {isLoading ? '...' : pendingFeedback.length}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
              {pendingFeedback.length > 0 ? 'Requires your rating' : 'All caught up'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Tickets & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Recent Tickets */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold font-serif text-slate-900 dark:text-white">
                My Maintenance Tickets
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Recent complaints submitted across campus facilities
              </p>
            </div>
            <Link
              to="/student/complaints"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 dark:text-primary-400 hover:text-primary-800"
            >
              <span>View All ({totalCount})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500">Loading your maintenance records...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold font-serif text-slate-900 dark:text-white">
                No active complaints
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-6">
                All campus facilities are running smoothly. If you spot any issue in classrooms, labs or hostels, submit a report.
              </p>
              <Link to="/student/new-complaint">
                <Button variant="primary" size="md">
                  <Plus className="w-4 h-4 mr-1.5" />
                  <span>Report a Problem</span>
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {complaints.slice(0, 5).map((complaint) => {
                const sla = getSlaRemaining(complaint.dueDate);
                return (
                  <Link
                    key={complaint.id}
                    to={`/student/complaints/${complaint.id}`}
                    className="group block p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-2 py-0.5 rounded-md border border-primary-200 dark:border-primary-900">
                            {complaint.referenceNumber || complaint.trackingNumber}
                          </span>
                          <StatusBadge status={complaint.status} />
                          <PriorityBadge priority={complaint.priority} />
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                          {complaint.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {complaint.location?.building}
                            {complaint.location?.room ? ` • ${complaint.location.room}` : ''}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {formatDate(complaint.createdAt)}
                          </span>
                          {complaint.upvotesCount > 0 && (
                            <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-medium">
                              <ThumbsUp className="w-3 h-3" />
                              {complaint.upvotesCount} upvotes
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                        {sla && (
                          <div className={`text-xs font-medium flex items-center gap-1 ${sla.isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}>
                            <Clock className="w-3 h-3" />
                            <span>{sla.text}</span>
                          </div>
                        )}
                        <span className="text-xs font-semibold text-primary-700 dark:text-primary-400 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5 mt-1">
                          Details <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (1/3): Quick Report & Campus Contacts */}
        <div className="space-y-6">
          {/* Quick Categories Launchpad */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold font-serif text-slate-900 dark:text-white mb-3">
              Quick Report by Category
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Select an area to start a pre-filled maintenance request:
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {categories.slice(0, 6).map((cat) => {
                const Icon = getCategoryIcon(cat.name);
                return (
                  <button
                    key={cat.id}
                    onClick={() => navigate(`/student/new-complaint?category=${cat.id}`)}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-950/30 text-left transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary-100/70 dark:bg-primary-950/70 text-primary-700 dark:text-primary-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate">
                      {cat.name}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {cat.subcategories?.[0] || 'Campus maintenance'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Emergency Contacts Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-primary-900 to-slate-900 text-white shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-teal-400">
              <PhoneCall className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Campus Facilities Helpdesk</span>
            </div>
            <div>
              <h4 className="text-base font-bold font-serif">Urgent Safety or Utility Emergency?</h4>
              <p className="text-xs text-slate-300 mt-1">
                For power gas leaks, active water flooding, or laboratory hazard, contact security directly.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">24/7 Control Room:</span>
                <span className="font-mono font-bold text-teal-300">+91 44 2257 8888</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Estate Office:</span>
                <span className="text-slate-200">Admin Block, Room G-04</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Shift Supervisor:</span>
                <span className="text-slate-200">ext. 4410</span>
              </div>
            </div>
          </div>
        </div>
      </div>

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

