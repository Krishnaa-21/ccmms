import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi.js';
import { complaintApi } from '../../api/complaintApi.js';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { PriorityBadge } from '../../components/common/PriorityBadge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  Calendar,
  Activity,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Flame,
  ArrowUpRight,
  Filter,
  Star,
  Layers,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORY_COLORS = ['#1e3a8a', '#0d9488', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6'];
const STATUS_COLORS = {
  Submitted: '#3b82f6',
  'Under Review': '#8b5cf6',
  Assigned: '#06b6d4',
  'In Progress': '#f59e0b',
  'Awaiting Parts': '#f97316',
  Resolved: '#10b981',
  Closed: '#059669',
  Rejected: '#ef4444',
  Reopened: '#e11d48'
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('30d'); // '7d' | '30d' | '90d' | 'all'

  // 1. Overview metrics
  const { data: overviewRes, isLoading: loadingOverview, refetch: refetchOverview } = useQuery({
    queryKey: ['admin-overview', dateRange],
    queryFn: () => adminApi.getOverview({ range: dateRange })
  });
  const overview = overviewRes?.data || {};

  // 2. Attention needed list
  const { data: attentionRes, isLoading: loadingAttention } = useQuery({
    queryKey: ['admin-attention'],
    queryFn: () => adminApi.getAttentionNeeded()
  });
  const attentionList = attentionRes?.data || [];

  // 3. Category breakdown
  const { data: categoryRes } = useQuery({
    queryKey: ['admin-by-category'],
    queryFn: () => adminApi.getByCategory()
  });
  const categoryData = categoryRes?.data || [];

  // 4. Status breakdown
  const { data: statusRes } = useQuery({
    queryKey: ['admin-by-status'],
    queryFn: () => adminApi.getByStatus()
  });
  const statusData = statusRes?.data || [];

  // 5. Monthly trend
  const { data: trendRes } = useQuery({
    queryKey: ['admin-monthly-trend'],
    queryFn: () => adminApi.getMonthlyTrend()
  });
  const trendData = trendRes?.data || [];

  // 6. Staff performance
  const { data: staffRes } = useQuery({
    queryKey: ['admin-staff-performance'],
    queryFn: () => adminApi.getStaffPerformance()
  });
  const staffList = staffRes?.data || [];

  // 7. Building hotspots
  const { data: buildingRes } = useQuery({
    queryKey: ['admin-by-building'],
    queryFn: () => adminApi.getByBuilding()
  });
  const buildingList = buildingRes?.data || [];

  // 8. Audit logs
  const { data: auditRes } = useQuery({
    queryKey: ['admin-recent-audit'],
    queryFn: () => adminApi.getAuditLogs({ limit: 6 })
  });
  const auditLogs = auditRes?.data || [];

  // 9. Phase 5: Predictive Facilities Insights
  const { data: insightsRes, isLoading: loadingInsights } = useQuery({
    queryKey: ['admin-predictive-insights'],
    queryFn: () => adminApi.getPredictiveInsights()
  });
  const insightsList = insightsRes?.data || [];

  const formatHours = (hrs) => {
    if (!hrs && hrs !== 0) return 'N/A';
    if (hrs >= 24) return `${(hrs / 24).toFixed(1)}d`;
    return `${hrs.toFixed(1)}h`;
  };

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary-100 text-primary-900 dark:bg-primary-950 dark:text-primary-300">
              Campus Facilities & Estate Control
            </span>
            <span className="text-xs text-slate-400">Apex Institute of Technology</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 dark:text-white">
            Operational Executive Dashboard
          </h1>
        </div>

        {/* Date Filter & Refresh */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 text-xs font-semibold">
            {[
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: '90d', label: 'Quarter' },
              { id: 'all', label: 'All Time' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setDateRange(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  dateRange === tab.id
                    ? 'bg-primary-900 text-white dark:bg-primary-600 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => refetchOverview()}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-primary-600 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Row of 6 Key Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Inflow */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Total Logged
          </span>
          <div className="mt-2 text-2xl font-bold font-serif text-slate-900 dark:text-white">
            {loadingOverview ? '...' : overview.totalComplaints || 0}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <Activity className="w-3 h-3 text-primary-600" />
            Active monitoring
          </span>
        </div>

        {/* Active Workload */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Open / Active
          </span>
          <div className="mt-2 text-2xl font-bold font-serif text-primary-700 dark:text-primary-400">
            {loadingOverview ? '...' : overview.openComplaints || 0}
          </div>
          <span className="text-[10px] text-primary-600 dark:text-primary-400 mt-1 block">
            In triage or on-site
          </span>
        </div>

        {/* Resolved This Period */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Resolved
          </span>
          <div className="mt-2 text-2xl font-bold font-serif text-emerald-700 dark:text-emerald-400">
            {loadingOverview ? '...' : overview.resolvedComplaints || 0}
          </div>
          <span className="text-[10px] text-emerald-600 mt-1 block">
            Completed repairs
          </span>
        </div>

        {/* Avg Resolution Speed */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Avg Turnaround
          </span>
          <div className="mt-2 text-2xl font-bold font-serif text-slate-900 dark:text-white">
            {loadingOverview ? '...' : formatHours(overview.averageResolutionHours)}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Time from log to resolve
          </span>
        </div>

        {/* SLA Compliance */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            SLA Compliance
          </span>
          <div
            className={`mt-2 text-2xl font-bold font-serif ${
              (overview.slaComplianceRate || 0) >= 80 ? 'text-teal-600' : 'text-amber-600'
            }`}
          >
            {loadingOverview ? '...' : `${overview.slaComplianceRate || 0}%`}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Target: &gt;85% on-time
          </span>
        </div>

        {/* Student Rating */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            User Rating
          </span>
          <div className="mt-2 text-2xl font-bold font-serif text-amber-500 flex items-center gap-1">
            <span>{loadingOverview ? '...' : overview.averageRating || 4.8}</span>
            <span className="text-base font-normal text-slate-400">/5</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Verified campus reviews
          </span>
        </div>
      </div>

      {/* "Needs Attention" Panel: Urgent, Overdue, Escalated, Unassigned */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent border border-rose-300 dark:border-rose-900/60 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300">
            <Flame className="w-5 h-5 text-rose-600 animate-pulse" />
            <h2 className="text-base font-bold font-serif">
              Urgent &amp; Overdue Complaints Requiring Intervention ({attentionList.length})
            </h2>
          </div>
          <Link
            to="/admin/complaints?filter=attention"
            className="text-xs font-semibold text-rose-700 dark:text-rose-400 hover:underline flex items-center gap-1"
          >
            <span>View all in data table</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loadingAttention ? (
          <div className="p-6 text-center text-xs text-slate-400">Checking active queue...</div>
        ) : attentionList.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 bg-white/60 dark:bg-slate-900/60 rounded-xl">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
            <span>Zero critical bottlenecks! All active tickets are within SLA parameters.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {attentionList.slice(0, 6).map((ticket) => (
              <div
                key={ticket.id}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-rose-700 dark:text-rose-400">
                      {ticket.referenceNumber}
                    </span>
                    <PriorityBadge priority={ticket.priority} />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                    {ticket.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {ticket.location?.building} • {ticket.location?.room}
                  </p>
                  {ticket.isOverdue && (
                    <span className="inline-block mt-1 text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded">
                      Overdue SLA
                    </span>
                  )}
                  {!ticket.assignedTo && (
                    <span className="inline-block mt-1 ml-1 text-[10px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                      Unassigned
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Status: <strong className="text-slate-700 dark:text-slate-300">{ticket.status}</strong>
                  </span>
                  <button
                    onClick={() => navigate(`/admin/complaints?id=${ticket.id}`)}
                    className="text-xs font-semibold text-primary-700 dark:text-primary-400 hover:underline flex items-center gap-0.5"
                  >
                    <span>Manage</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Phase 5: Predictive Facilities Insights & Recommendations */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-200 dark:border-blue-900/60 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h2 className="text-base font-bold font-serif">
                Predictive Facilities Insights &amp; Preventive Interventions
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Rule-based algorithmic heuristics detecting recurring component wear, surge trends, and staff saturation
              </p>
            </div>
          </div>
          <Link
            to="/admin/preventive"
            className="text-xs font-semibold text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Preventive scheduler</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loadingInsights ? (
          <div className="p-6 text-center text-xs text-slate-400">Evaluating facilities telemetry...</div>
        ) : insightsList.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500 bg-white/60 dark:bg-slate-900/60 rounded-xl">
            No anomalous equipment failure patterns detected this month.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {insightsList.slice(0, 4).map((ins) => {
              const isCrit = ins.severity === 'critical';
              const isWarn = ins.severity === 'warning';
              return (
                <div
                  key={ins.id}
                  className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isCrit
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            : isWarn
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        }`}
                      >
                        {ins.severity}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{ins.metric}</span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {ins.title}
                    </h4>

                    <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-3">
                      {ins.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => {
                        if (ins.actionType === 'CREATE_PREVENTIVE') {
                          navigate('/admin/preventive');
                        } else if (ins.actionType === 'REBALANCE_STAFF') {
                          navigate('/admin/workload');
                        } else {
                          navigate('/admin/preventive');
                        }
                      }}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1"
                    >
                      <span>{ins.recommendedAction}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Charts Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: 6-Month Inflow & Resolution Trend (AreaChart) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-serif text-slate-900 dark:text-white">
              6-Month Complaint Volume &amp; Resolution
            </h3>
            <span className="text-xs text-slate-400">Monthly breakdown</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area
                  type="monotone"
                  dataKey="created"
                  name="Logged"
                  stroke="#1e3a8a"
                  fillOpacity={1}
                  fill="url(#colorCreated)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  name="Resolved"
                  stroke="#0d9488"
                  fillOpacity={1}
                  fill="url(#colorResolved)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Category Distribution (Donut PieChart) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-serif text-slate-900 dark:text-white">
              Complaints by Maintenance Category
            </h3>
            <span className="text-xs text-slate-400">Share of campus load</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {categoryData.length === 0 ? (
              <span className="text-xs text-slate-400">No category data</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="name"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: 'none',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Status Distribution & Priority Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown (Horizontal Bar) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold font-serif text-slate-900 dark:text-white">
            Status Breakdown Across Active Workflow
          </h3>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={statusData}
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <XAxis type="number" stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <YAxis dataKey="status" type="category" stroke="#94a3b8" fontSize={10} width={90} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" fill="#1e3a8a" radius={[0, 4, 4, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`status-cell-${index}`}
                      fill={STATUS_COLORS[entry.status] || '#1e3a8a'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Building Hotspots Grid */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-serif text-slate-900 dark:text-white">
              Campus Building Hotspots
            </h3>
            <span className="text-xs text-slate-400">Ranked by volume</span>
          </div>

          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {buildingList.slice(0, 6).map((b, i) => (
              <div
                key={b.building || i}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-primary-100 dark:bg-primary-950 text-primary-900 dark:text-primary-300 font-bold flex items-center justify-center text-[10px]">
                    {i + 1}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{b.building}</span>
                    <span className="text-[10px] text-slate-400">{b.openCount || 0} currently active</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {b.totalComplaints || b.count} tickets
                  </span>
                  <span className="text-[10px] text-rose-500 font-semibold">
                    {b.overdueCount > 0 ? `${b.overdueCount} overdue` : 'On track'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Staff Performance Leaderboard & Recent Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2/3): Staff Performance Scoreboard */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold font-serif text-slate-900 dark:text-white">
                Maintenance Staff Performance &amp; Capacity
              </h3>
              <p className="text-xs text-slate-500">Live operational leaderboard</p>
            </div>
            <Link
              to="/admin/workload"
              className="text-xs font-semibold text-primary-700 dark:text-primary-400 hover:underline flex items-center gap-1"
            >
              <span>Workload panel</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Technician</th>
                  <th className="py-2.5 px-3">Specialty</th>
                  <th className="py-2.5 px-3">Active Load</th>
                  <th className="py-2.5 px-3">Resolved</th>
                  <th className="py-2.5 px-3">Avg Hours</th>
                  <th className="py-2.5 px-3">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {staffList.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold text-[10px]">
                        {staff.name?.[0]}
                      </div>
                      <span>{staff.name}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{staff.specialty || 'General'}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">{staff.activeCount || 0}</span>
                        <div className="w-16 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              (staff.activeCount || 0) > 4 ? 'bg-rose-500' : 'bg-primary-600'
                            }`}
                            style={{ width: `${Math.min(100, ((staff.activeCount || 0) / 6) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-emerald-600 font-bold">{staff.resolvedCount || 0}</td>
                    <td className="py-2.5 px-3">{formatHours(staff.averageResolutionHours)}</td>
                    <td className="py-2.5 px-3 text-amber-500 font-bold">
                      ★ {staff.averageRating ? staff.averageRating.toFixed(1) : '5.0'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right (1/3): Audit Activity Feed */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-serif text-slate-900 dark:text-white">
              Recent System Audit Trail
            </h3>
            <Link
              to="/admin/settings"
              className="text-xs font-semibold text-primary-700 dark:text-primary-400 hover:underline"
            >
              Full log
            </Link>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1 text-xs">
            {auditLogs.length === 0 ? (
              <p className="text-slate-400 italic text-center py-4">No audit events</p>
            ) : (
              auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {log.action}
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                    {log.details}
                  </p>
                  <span className="text-[10px] text-slate-400 block">
                    By: {log.actor?.name || 'System'} ({log.actor?.role || 'engine'})
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

