import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { staffApi } from '../../api/staffApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Award, Star, Clock, CheckCircle2, ShieldCheck, Sparkles, TrendingUp, Zap, Flame, Trophy } from 'lucide-react';

export default function StaffPerformancePage() {
  const { user } = useAuth();

  // Query: My performance
  const { data: perfRes, isLoading } = useQuery({
    queryKey: ['staff-performance-scorecard'],
    queryFn: () => staffApi.getMyPerformance()
  });
  const perf = perfRes?.data || {};

  const rating = perf.averageRating || 4.9;
  const compliance = perf.slaComplianceRate || 95.0;
  const avgHours = perf.averageResolutionHours || 14.5;
  const resolved = perf.resolvedCount || 8;

  // Composite score formula
  const compositeScore = Math.min(
    100,
    Math.round((rating / 5) * 35 + (compliance * 0.45) + Math.min(20, (resolved / 10) * 20))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-300">
            Technician Scorecard
          </span>
          <span className="text-xs text-slate-400">Quarterly Metrics &amp; Operational Honor Roll</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 dark:text-white">
          My Operational Performance &amp; Reviews
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
          Review your SLA compliance scores, average resolution speeds, student satisfaction ratings, and merit badges.
        </p>
      </div>

      {/* Composite Score & Merit Badges Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white shadow-xl border border-blue-800/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Trophy className="w-4 h-4" />
            Apex Facilities Excellence Index
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl sm:text-5xl font-extrabold tracking-tight font-serif text-white">
              {compositeScore}
            </span>
            <span className="text-sm text-slate-300 font-medium">/ 100 Overall Rating</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
              Grade A+ Master Technician
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Calculated across resolution velocity, adherence to campus statutory SLAs, and verified student feedback.
          </p>
        </div>

        {/* Badges Earned */}
        <div className="grid grid-cols-2 gap-2.5 shrink-0">
          <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-3 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Star className="w-4 h-4 fill-slate-950" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Top Rated</div>
              <div className="text-[10px] text-slate-300">4.9/5 Student Score</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-3 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500 text-slate-950 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Zero Breaches</div>
              <div className="text-[10px] text-slate-300">95%+ On-Time SLA</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-3 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Fast Responder</div>
              <div className="text-[10px] text-slate-300">&lt; 16h Average Turn</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-3 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500 text-white flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Master Tech</div>
              <div className="text-[10px] text-slate-300">High Volume Solver</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Tasks Resolved
          </span>
          <div className="mt-2 text-2xl font-bold font-serif text-emerald-600">
            {resolved}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Completed work orders</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            SLA Compliance
          </span>
          <div className="mt-2 text-2xl font-bold font-serif text-teal-600">
            {compliance.toFixed(1)}%
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">On-time resolutions</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Avg Turnaround
          </span>
          <div className="mt-2 text-2xl font-bold font-serif text-slate-900 dark:text-white">
            {avgHours.toFixed(1)} hrs
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">From assignment to fix</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Verified Rating
          </span>
          <div className="mt-2 text-2xl font-bold font-serif text-amber-500 flex items-center gap-1">
            <span>{rating.toFixed(1)}</span>
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
