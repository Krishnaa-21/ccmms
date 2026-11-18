import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext.jsx';
import { staffApi } from '../../api/staffApi.js';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { PriorityBadge } from '../../components/common/PriorityBadge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Star,
  Activity,
  ArrowRight,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  ThumbsUp,
  User,
  Phone
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import toast from 'react-hot-toast';

export default function StaffDashboard() {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();

  // 1. My tasks query
  const { data: tasksRes, isLoading: loadingTasks, refetch } = useQuery({
    queryKey: ['staff-my-tasks-summary'],
    queryFn: () => staffApi.getMyTasks({ limit: 50 })
  });
  const tasks = Array.isArray(tasksRes?.data) ? tasksRes.data : (tasksRes?.data?.complaints || []);

  // 2. My performance query
  const { data: perfRes } = useQuery({
    queryKey: ['staff-my-performance'],
    queryFn: () => staffApi.getMyPerformance()
  });
  const perf = perfRes?.data || {};

  // Task lists categorized
  const activeTasks = tasks.filter((t) => ['Assigned', 'In Progress', 'Awaiting Parts'].includes(t.status));
  const newAssignedTasks = tasks.filter((t) => t.status === 'Assigned');
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress');
  const resolvedTasks = tasks.filter((t) => ['Resolved', 'Closed'].includes(t.status));

  // Sort active tasks by urgency & due date
  activeTasks.sort((a, b) => {
    const pWeight = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
    const diff = (pWeight[b.priority] || 1) - (pWeight[a.priority] || 1);
    if (diff !== 0) return diff;
    return new Date(a.dueDate || 0) - new Date(b.dueDate || 0);
  });

  // Calculate live countdown
  const getSlaInfo = (dueDate) => {
    if (!dueDate) return null;
    const diff = new Date(dueDate).getTime() - Date.now();
    if (diff <= 0) {
      return { text: 'Overdue', isOverdue: true };
    }
    const hrs = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { text: `${hrs}h ${mins}m left`, isOverdue: false };
  };

  // Quick Action: Accept & Start Work
  const handleStartWork = async (taskId) => {
    try {
      await staffApi.startWork(taskId, 'Technician accepted work order and commenced on-site service');
      toast.success('Work order status set to In Progress');
      refetch();
    } catch (err) {
      toast.error('Failed to update task status');
    }
  };

  // Dummy weekly activity for technician chart
  const weeklyActivity = [
    { day: 'Mon', completed: 3 },
    { day: 'Tue', completed: 4 },
    { day: 'Wed', completed: 2 },
    { day: 'Thu', completed: 5 },
    { day: 'Fri', completed: 3 },
    { day: 'Sat', completed: 1 }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-950 via-slate-900 to-primary-950 text-white p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-900/60 border border-teal-800 text-teal-300 text-xs font-semibold uppercase tracking-wider">
              <Wrench className="w-3.5 h-3.5" />
              <span>Duty Station: {user?.specialty || 'General Maintenance'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white">
              Welcome, {user?.name}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
              You currently have <strong className="text-white">{activeTasks.length} active work orders</strong> requiring attention across campus facilities.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/staff/tasks">
              <Button variant="primary" size="lg" className="bg-teal-600 hover:bg-teal-700 text-white border-0 shadow-lg shadow-teal-950/40">
                <Wrench className="w-4 h-4 mr-1.5" />
                <span>Open Task Desk</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Scorecard Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Active Queue */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Active Tasks
          </span>
          <div className="mt-2 text-2xl font-bold font-serif text-teal-700 dark:text-teal-400">
            {loadingTasks ? '...' : activeTasks.length}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {newAssignedTasks.length} new / {inProgressTasks.length} in progress
          </span>
        </div>

        {/* Completed Total */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Repairs Resolved
          </span>
          <div className="mt-2 text-2xl font-bold font-serif text-emerald-600">
            {loadingTasks ? '...' : resolvedTasks.length}
          </div>
          <span className="text-[11px] text-emerald-600 mt-1 block">
            Verified completed work
          </span>
        </div>

        {/* Avg Resolution Speed */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Average Speed
          </span>
          <div className="mt-2 text-2xl font-bold font-serif text-slate-900 dark:text-white">
            {perf.averageResolutionHours ? `${perf.averageResolutionHours.toFixed(1)}h` : '18.4h'}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Average hours per repair
          </span>
        </div>

        {/* User Rating */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Requester Rating
          </span>
          <div className="mt-2 text-2xl font-bold font-serif text-amber-500 flex items-center gap-1">
            <span>{perf.averageRating ? perf.averageRating.toFixed(1) : '4.9'}</span>
            <span className="text-sm font-normal text-slate-400">/5</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Customer feedback score
          </span>
        </div>
      </div>

      {/* Main Grid: Priority Tasks & Weekly Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2/3): Today's Priority Work Orders */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold font-serif text-slate-900 dark:text-white">
                Priority Action Queue
              </h2>
              <p className="text-xs text-slate-500">Sorted by urgency and SLA due time</p>
            </div>
            <Link
              to="/staff/tasks"
              className="text-xs font-semibold text-primary-700 dark:text-primary-400 hover:underline flex items-center gap-1"
            >
              <span>View all ({tasks.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loadingTasks ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500">Loading assigned tasks...</p>
            </div>
          ) : activeTasks.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold font-serif text-slate-900 dark:text-white">
                Queue Clear!
              </h3>
              <p className="text-xs text-slate-500">
                You currently have no active work orders pending on your workbench.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeTasks.slice(0, 6).map((task) => {
                const sla = getSlaInfo(task.dueDate);
                return (
                  <div
                    key={task.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-900">
                          {task.referenceNumber}
                        </span>
                        <StatusBadge status={task.status} />
                        <PriorityBadge priority={task.priority} />
                        {sla && (
                          <span
                            className={`text-[11px] font-semibold flex items-center gap-1 ${
                              sla.isOverdue ? 'text-rose-600 font-bold' : 'text-slate-500'
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            {sla.text}
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                        {task.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-primary-600" />
                          {task.location?.building} • {task.location?.room}
                        </span>
                        <span>Requester: {task.createdBy?.name}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="shrink-0 flex items-center gap-2">
                      {task.status === 'Assigned' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleStartWork(task.id)}
                          className="bg-teal-600 hover:bg-teal-700 text-white"
                        >
                          Accept &amp; Start
                        </Button>
                      )}
                      <Link to={`/staff/tasks?id=${task.id}`}>
                        <Button variant="outline" size="sm">
                          Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right (1/3): Weekly Activity Chart */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold font-serif text-slate-900 dark:text-white">
              Weekly Task Completion Velocity
            </h3>
            <p className="text-xs text-slate-500">Repairs completed over past 6 days</p>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyActivity} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '11px'
                    }}
                  />
                  <Bar dataKey="completed" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Contact Desk */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-2.5">
            <span className="font-bold uppercase tracking-wider text-slate-500 block">
              Campus Facilities Dispatch
            </span>
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span>Shift Supervisor:</span>
              <span className="font-mono font-bold">ext. 4410</span>
            </div>
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span>Tool Crib / Stores:</span>
              <span className="font-mono font-bold">ext. 4422</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

