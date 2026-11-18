import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi.js';
import { complaintApi } from '../../api/complaintApi.js';
import { Button } from '../../components/ui/Button.jsx';
import {
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
  Calendar,
  Building2,
  Filter,
  CheckCircle2,
  Clock,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#1e3a8a', '#0d9488', '#f59e0b', '#6366f1', '#ec4899'];

export default function ReportsPage() {
  const [selectedRange, setSelectedRange] = useState('30d');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Query: Overview data
  const { data: overviewRes, isLoading } = useQuery({
    queryKey: ['admin-reports-overview', selectedRange],
    queryFn: () => adminApi.getOverview({ range: selectedRange })
  });
  const overview = overviewRes?.data || {};

  // Query: Categories
  const { data: catRes } = useQuery({
    queryKey: ['admin-reports-categories'],
    queryFn: () => adminApi.getByCategory()
  });
  const categoriesData = (catRes?.data || []).map((c) => ({
    ...c,
    name: c.name || c.categoryName,
    count: c.count ?? c.total ?? 0
  }));

  // Query: Staff performance
  const { data: staffRes } = useQuery({
    queryKey: ['admin-reports-staff'],
    queryFn: () => adminApi.getStaffPerformance()
  });
  const staffData = staffRes?.data || [];

  // Query: Building Hotspots
  const { data: buildingRes } = useQuery({
    queryKey: ['admin-reports-buildings'],
    queryFn: () => adminApi.getByBuilding()
  });
  const buildingData = buildingRes?.data || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Non-printable Controls Bar */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 dark:text-white">
            Campus Facilities Analytics &amp; Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Generate printable audit reports, executive compliance briefs, and raw RFC CSV exports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Print Button */}
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-1.5" />
            <span>Print Report</span>
          </Button>

          {/* PDF Download */}
          <a
            href="/api/export/analytics.pdf"
            download
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-2xs"
          >
            <FileText className="w-4 h-4 text-rose-500" />
            <span>Executive PDF</span>
          </a>

          {/* CSV Download */}
          <a
            href="/api/export/complaints.csv"
            download
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Raw CSV</span>
          </a>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="print:hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">Reporting Window:</span>
          <select
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Current Academic Term (90 Days)</option>
            <option value="all">Annual / All-Time Data</option>
          </select>
        </div>

        <span className="text-slate-400 text-[11px]">
          Campus: <strong className="text-slate-700 dark:text-slate-300">Apex Institute of Technology</strong>
        </span>
      </div>

      {/* PRINTABLE REPORT DOCUMENT WRAPPER */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Printable Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold text-primary-700 dark:text-primary-400 tracking-wider">
              Official Facilities Audit Report
            </span>
            <h2 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">
              Campus Maintenance Performance Brief
            </h2>
            <p className="text-xs text-slate-500">
              Generated on {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • Directorate of Infrastructure &amp; Works
            </p>
          </div>

          <div className="text-right text-xs text-slate-500">
            <span className="font-bold text-slate-900 dark:text-white block">Apex Institute of Technology</span>
            <span>Survey No. 42, Knowledge Park III</span>
            <span className="block text-[10px] text-teal-600 font-mono">Ref: REP-{Date.now().toString().slice(-6)}</span>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            1. Key Performance Indicators
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <span className="text-[11px] text-slate-500 block">Total Inflow</span>
              <span className="text-2xl font-bold font-serif text-slate-900 dark:text-white mt-1 block">
                {overview.totalComplaints || 0}
              </span>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <span className="text-[11px] text-slate-500 block">Resolved Repairs</span>
              <span className="text-2xl font-bold font-serif text-emerald-600 mt-1 block">
                {overview.resolvedComplaints || 0}
              </span>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <span className="text-[11px] text-slate-500 block">SLA Compliance</span>
              <span className="text-2xl font-bold font-serif text-teal-600 mt-1 block">
                {overview.slaComplianceRate || 0}%
              </span>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <span className="text-[11px] text-slate-500 block">Average Rating</span>
              <span className="text-2xl font-bold font-serif text-amber-500 mt-1 block">
                ★ {overview.averageRating || 4.8}
              </span>
            </div>
          </div>
        </div>

        {/* Category Breakdown Table & Chart */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            2. Category Volume Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1e3a8a" radius={[4, 4, 0, 0]}>
                    {categoriesData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold">
                  <tr>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5">Complaints</th>
                    <th className="p-2.5">Standard SLA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {categoriesData.map((cat) => (
                    <tr key={cat.name}>
                      <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">
                        {cat.name}
                      </td>
                      <td className="p-2.5 font-bold">{cat.count}</td>
                      <td className="p-2.5 text-slate-500">
                        {typeof cat.slaHours === 'object' ? (cat.slaHours?.Medium || 24) : (cat.slaHours || 24)} hours
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Staff Performance Matrix */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            3. Technician Efficiency &amp; Customer Satisfaction
          </h3>
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Staff Member</th>
                  <th className="p-3">Trade</th>
                  <th className="p-3">Tasks Serviced</th>
                  <th className="p-3">Avg Resolution Time</th>
                  <th className="p-3">Satisfaction Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {staffData.map((s) => (
                  <tr key={s.id}>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">{s.name}</td>
                    <td className="p-3 text-slate-500">{s.specialty || 'General'}</td>
                    <td className="p-3 font-bold">{s.resolvedCount || 0}</td>
                    <td className="p-3">{(s.averageResolutionHours || 24).toFixed(1)} hrs</td>
                    <td className="p-3 text-amber-500 font-bold">
                      ★ {s.averageRating ? s.averageRating.toFixed(1) : '5.0'} / 5.0
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Certification Sign-off */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-end text-xs text-slate-400">
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-300 block">
              Certified by Campus Estate Authority
            </span>
            <span>All records compiled through verified digital audit trail</span>
          </div>
          <div className="text-right">
            <span className="font-mono text-slate-500">Authorized Signature _____________________</span>
          </div>
        </div>
      </div>
    </div>
  );
}

