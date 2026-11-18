import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  CheckCircle2,
  Clock,
  ThumbsUp,
  Filter,
  Search,
  ShieldCheck,
  Flame,
  ArrowRight,
  TrendingUp,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { complaintApi } from '../../api/complaintApi.js';
import { useAuth } from '../../hooks/useAuth.js';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import PriorityBadge from '../../components/common/PriorityBadge.jsx';
import EscalationBadge from '../../components/common/EscalationBadge.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';

export default function PublicIssuesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [selectedIssueDetail, setSelectedIssueDetail] = useState(null);

  // Fetch Public Board Data
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['public-board', selectedBuilding, selectedCategory, selectedStatus],
    queryFn: async () => {
      const res = await complaintApi.getPublicBoard({
        building: selectedBuilding,
        category: selectedCategory,
        status: selectedStatus
      });
      return res.data;
    }
  });

  const stats = data?.stats || {
    totalActive: 24,
    totalResolvedSemester: 14,
    avgResolutionDays: 2.3,
    satisfactionRate: 94.8
  };

  const buildingCounts = data?.buildingCounts || {};
  const rawComplaints = data?.complaints || [];

  // Filter complaints by local search query
  const complaints = rawComplaints.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.referenceNumber?.toLowerCase().includes(q) ||
      c.location?.building?.toLowerCase().includes(q) ||
      c.location?.room?.toLowerCase().includes(q) ||
      c.categoryName?.toLowerCase().includes(q)
    );
  });

  // Upvote mutation
  const upvoteMutation = useMutation({
    mutationFn: (id) => complaintApi.upvoteComplaint(id),
    onSuccess: (res, complaintId) => {
      toast.success(res.message || 'Thank you! Your "Me Too" endorsement was recorded.');
      queryClient.invalidateQueries(['public-board']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Could not record endorsement');
    }
  });

  const handleUpvote = (issue) => {
    if (!user) {
      setAuthPromptOpen(true);
      return;
    }
    upvoteMutation.mutate(issue.id);
  };

  const campusBuildings = [
    'Main Academic Block',
    'Hostel Block B',
    'Library',
    'Physics Lab',
    'Computer Lab 1',
    'Seminar Hall',
    'Hostel Block A',
    'Canteen'
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Top University Transparency Hero Banner */}
      <section className="bg-gradient-to-b from-blue-900 to-slate-900 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-blue-800/40">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/60 border border-blue-700 text-blue-200 text-xs font-medium mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
                Apex Institute of Technology • Facilities Transparency
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-white">
                Campus Issues & Maintenance Board
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                Live visibility into active facility repairs, infrastructure enhancements, and semester turnaround benchmarks.
                Endorse reported issues to prioritize critical fixes across campus blocks.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/report">
                <Button variant="primary" className="bg-blue-600 hover:bg-blue-500 shadow-md">
                  Report Campus Issue
                </Button>
              </Link>
            </div>
          </div>

          {/* Key Transparency Metrics Counters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between text-blue-200 text-xs font-medium">
                <span>Active Work Orders</span>
                <Clock className="w-4 h-4 text-blue-300" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold mt-2 text-white">{stats.totalActive}</div>
              <p className="text-[11px] text-slate-300 mt-1">Currently in triage or repair</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between text-emerald-200 text-xs font-medium">
                <span>Resolved This Term</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold mt-2 text-white">{stats.totalResolvedSemester}</div>
              <p className="text-[11px] text-slate-300 mt-1">Successfully certified closures</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between text-amber-200 text-xs font-medium">
                <span>Avg Turnaround</span>
                <TrendingUp className="w-4 h-4 text-amber-300" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold mt-2 text-white">{stats.avgResolutionDays} days</div>
              <p className="text-[11px] text-slate-300 mt-1">From submission to fix</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between text-teal-200 text-xs font-medium">
                <span>Resolution Quality</span>
                <ThumbsUp className="w-4 h-4 text-teal-300" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold mt-2 text-white">{stats.satisfactionRate}%</div>
              <p className="text-[11px] text-slate-300 mt-1">Student rating compliance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Campus Building Selector Grid */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              Filter by Campus Block
            </h2>
            {selectedBuilding !== 'all' && (
              <button
                onClick={() => setSelectedBuilding('all')}
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
              >
                Clear filter (Showing all)
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
            <button
              onClick={() => setSelectedBuilding('all')}
              className={`p-3 rounded-lg border text-left transition-all ${
                selectedBuilding === 'all'
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-600 text-blue-900 dark:text-blue-200 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <div className="text-xs font-semibold truncate">All Campus</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {stats.totalActive} active
              </div>
            </button>

            {campusBuildings.map((b) => {
              const count = buildingCounts[b] || 0;
              const isSelected = selectedBuilding === b;
              return (
                <button
                  key={b}
                  onClick={() => setSelectedBuilding(b)}
                  className={`p-2.5 rounded-lg border text-left transition-all relative ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-600 text-blue-900 dark:text-blue-200 shadow-sm ring-1 ring-blue-600'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-semibold truncate" title={b}>
                    {b}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center justify-between">
                    <span>{count} active</span>
                    {count > 0 && (
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Filter & Search Bar */}
        <section className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, location, room..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="cat_plumbing">Plumbing</option>
              <option value="cat_electrical">Electrical</option>
              <option value="cat_carpentry">Carpentry</option>
              <option value="cat_network">WiFi & IT</option>
              <option value="cat_safety">Safety & Security</option>
              <option value="cat_cleaning">Housekeeping</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="in progress">In Progress</option>
              <option value="assigned">Assigned</option>
              <option value="under review">Under Review</option>
              <option value="resolved">Resolved</option>
            </select>

            <div className="text-xs text-slate-400 whitespace-nowrap hidden lg:block">
              {complaints.length} tickets shown
            </div>
          </div>
        </section>

        {/* Issues Cards List */}
        <section className="space-y-3">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400">Loading campus facilities status...</div>
          ) : complaints.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-800">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-800 dark:text-white">No Active Issues Reported</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                No matching maintenance issues found for the selected building or filter. If you noticed an issue, submit a report!
              </p>
              <Link to="/report" className="inline-block mt-4">
                <Button variant="primary">Report an Issue</Button>
              </Link>
            </div>
          ) : (
            complaints.map((issue) => (
              <div
                key={issue.id}
                className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {issue.referenceNumber || issue.trackingNumber}
                    </span>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: issue.categoryColor || '#0284c7' }}
                    >
                      {issue.categoryName}
                    </span>
                    <StatusBadge status={issue.status} />
                    <PriorityBadge priority={issue.priority} />
                    {issue.escalationLevel > 0 && (
                      <EscalationBadge level={issue.escalationLevel} />
                    )}
                  </div>

                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    {issue.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      {issue.location?.building} • {issue.location?.room || 'General'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      Reported {new Date(issue.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                    <span>Department: {issue.assignedDepartment}</span>
                  </div>
                </div>

                {/* Right Side: Upvote Button & Detail Button */}
                <div className="flex items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleUpvote(issue)}
                    disabled={upvoteMutation.isPending || ['Resolved', 'Closed'].includes(issue.status)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all ${
                      ['Resolved', 'Closed'].includes(issue.status)
                        ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed dark:bg-slate-800/40 dark:border-slate-800'
                        : 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 active:scale-95'
                    }`}
                    title={
                      ['Resolved', 'Closed'].includes(issue.status)
                        ? 'Issue already resolved'
                        : 'Click to add your "Me Too" vote and elevate urgency'
                    }
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Me Too</span>
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px]">
                      {issue.upvotesCount}
                    </span>
                  </button>

                  <button
                    onClick={() => setSelectedIssueDetail(issue)}
                    className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      </div>

      {/* Guest Login Modal Prompt for Upvoting */}
      <Modal
        isOpen={authPromptOpen}
        onClose={() => setAuthPromptOpen(false)}
        title="Sign In to Endorse Issue"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Please log in with your university account to add your <strong>"Me Too"</strong> endorsement. Verified endorsements ensure campus authorities prioritize widespread infrastructure problems.
          </p>
          <div className="flex items-center justify-end gap-3 pt-3">
            <Button variant="outline" onClick={() => setAuthPromptOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setAuthPromptOpen(false);
                navigate('/login?redirect=/issues');
              }}
            >
              Sign In to Apex Portal
            </Button>
          </div>
        </div>
      </Modal>

      {/* Issue Detail Preview Modal */}
      {selectedIssueDetail && (
        <Modal
          isOpen={!!selectedIssueDetail}
          onClose={() => setSelectedIssueDetail(null)}
          title={`Work Order: ${selectedIssueDetail.referenceNumber}`}
        >
          <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
            <div>
              <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Title</div>
              <div className="text-base font-semibold text-slate-900 dark:text-white mt-0.5">
                {selectedIssueDetail.title}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Description</div>
              <p className="mt-1 text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                {selectedIssueDetail.description || 'No detailed description provided.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400">Location:</span>
                <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                  {selectedIssueDetail.location?.building} • {selectedIssueDetail.location?.room}
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400">Status:</span>
                <div className="mt-0.5">
                  <StatusBadge status={selectedIssueDetail.status} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-400">
                Community Impact: <strong>{selectedIssueDetail.upvotesCount} endorsements</strong>
              </span>
              <Button variant="primary" onClick={() => setSelectedIssueDetail(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

