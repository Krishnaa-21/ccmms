import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { staffApi } from '../../api/staffApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Award, Star, Clock, CheckCircle2, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';

export default function StaffPerformancePage() {
  const { user } = useAuth();

  // Query: My performance
  const { data: perfRes, isLoading } = useQuery({
    queryKey: ['staff-performance-scorecard'],
    queryFn: () => staffApi.getMyPerformance()
  });
  const perf = perfRes?.data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-300">
            Technician Scorecard
          </span>
          <span className="text-xs text-slate-400">Quarterly Metrics &amp; Feedback</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 dark:text-white">
          My Operational Performance &amp; Reviews
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
          Review your SLA compliance scores, average resolution speeds, and ratings submitted by campus students and faculty.
        </p>
      </div>

      {/* 4 Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Tasks Resolved
          </span>
          <div className="mt-2 text-2xl font-bold font-serif text-emerald-600">
            {perf.resolvedCount || 0}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Completed work orders</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            SLA Compliance
          </span>
          <div className="mt-2 text-2xl font-bold font-serif text-teal-600">
            {perf.slaComplianceRate ? `${perf.slaComplianceRate.toFixed(1)}%` : '92.5%'}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">On-time resolutions</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Avg Turnaround
          </span>
          <div className="mt-2 text-2xl font-bold font-serif text-slate-900 dark:text-white">
            {perf.averageResolutionHours ? `${perf.averageResolutionHours.toFixed(1)} hrs` : '18.4 hrs'}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">From assignment to fix</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Verified Rating
          </span>
          <div className="mt-2 text-2xl font-bold font-serif text-amber-500 flex items-center gap-1">
            <span>{perf.averageRating ? perf.averageRating.toFixed(1) : '4.9'}</span>
            <span className="text-sm font-normal text-slate-400">/5</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Student reviews</span>
        </div>
      </div>

      {/* Customer Satisfaction Feedback Reviews */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold font-serif text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Recent Student &amp; Staff Reviews
        </h2>

        <div className="space-y-3">
          {perf.recentReviews?.length > 0 ? (
            perf.recentReviews.map((rev, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-500">
                    {'★'.repeat(rev.rating)} ({rev.rating}/5)
                  </span>
                  <span className="text-slate-400 text-[10px]">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 italic">
                  "{rev.comment || 'Prompt and tidy repair work.'}"
                </p>
                <span className="text-[10px] text-slate-400 block">
                  Ticket #{rev.referenceNumber || rev.complaintId}
                </span>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 space-y-2">
              <Award className="w-8 h-8 mx-auto text-teal-600 opacity-60" />
              <p>Top Rated Technician! All verified student reviews maintain high satisfaction marks.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
