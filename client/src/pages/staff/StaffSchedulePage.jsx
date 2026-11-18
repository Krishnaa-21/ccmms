import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { staffApi } from '../../api/staffApi.js';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { PriorityBadge } from '../../components/common/PriorityBadge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  List,
  LayoutGrid
} from 'lucide-react';

export default function StaffSchedulePage() {
  const [viewMode, setViewMode] = useState('week'); // 'week' | 'agenda'

  // Fetch assigned complaints
  const { data: tasksRes, isLoading } = useQuery({
    queryKey: ['staff-schedule-tasks'],
    queryFn: () => staffApi.getMyTasks({ limit: 100 })
  });
  const allTasks = tasksRes?.data?.complaints || [];

  // Active / Upcoming tasks with due dates
  const activeTasks = allTasks.filter(
    (t) => !['Resolved', 'Closed', 'Rejected'].includes(t.status) && t.dueDate
  );

  // Sort by due date
  activeTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  // Generate 7 days starting from today
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const isSameDay = (d1, d2) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 dark:text-white">
            Task Due Date Schedule &amp; Agenda
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Plan your on-site visits and prevent SLA breaches across campus buildings.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'week'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>7-Day View</span>
          </button>
          <button
            onClick={() => setViewMode('agenda')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'agenda'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <List className="w-4 h-4" />
            <span>Agenda List</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-16 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Compiling task timetable...</p>
        </div>
      ) : viewMode === 'week' ? (
        /* 7-DAY WEEK VIEW */
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDays.map((day, idx) => {
            const dayTasks = activeTasks.filter((t) => isSameDay(new Date(t.dueDate), day));
            const isToday = idx === 0;

            return (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border flex flex-col min-h-[350px] ${
                  isToday
                    ? 'bg-teal-50/50 border-teal-300 dark:bg-teal-950/20 dark:border-teal-800'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Day Header */}
                <div className="pb-2.5 mb-2 border-b border-slate-100 dark:border-slate-800 text-center">
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider block ${
                      isToday ? 'text-teal-700 dark:text-teal-400' : 'text-slate-500'
                    }`}
                  >
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <span
                    className={`text-base font-bold font-serif ${
                      isToday ? 'text-teal-950 dark:text-white' : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {day.getDate()}
                  </span>
                </div>

                {/* Day Tasks List */}
                <div className="flex-1 space-y-2 overflow-y-auto">
                  {dayTasks.length === 0 ? (
                    <span className="text-[10px] text-slate-400 block text-center pt-8 italic">
                      No tasks due
                    </span>
                  ) : (
                    dayTasks.map((t) => (
                      <Link
                        key={t.id}
                        to={`/staff/tasks?id=${t.id}`}
                        className="block p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-500 shadow-2xs transition-all space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold text-teal-700 dark:text-teal-400 truncate">
                            {t.referenceNumber}
                          </span>
                          <PriorityBadge priority={t.priority} />
                        </div>
                        <h4 className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-2">
                          {t.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {t.location?.building}
                        </span>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* AGENDA LIST VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold font-serif text-slate-900 dark:text-white">
            Sequential Due Date Agenda ({activeTasks.length} tasks scheduled)
          </h2>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {activeTasks.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No active tasks with due dates.</p>
            ) : (
              activeTasks.map((task) => {
                const isOverdue = new Date(task.dueDate) < new Date();
                return (
                  <div
                    key={task.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400">
                          {task.referenceNumber}
                        </span>
                        <StatusBadge status={task.status} />
                        <PriorityBadge priority={task.priority} />
                        {isOverdue && (
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded">
                            Breached SLA
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {task.title}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {task.location?.building} • {task.location?.room}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Due: {new Date(task.dueDate).toLocaleString()}
                      </span>
                      <Link to={`/staff/tasks?id=${task.id}`}>
                        <Button variant="ghost" size="sm" className="mt-1">
                          Open Work Order
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

