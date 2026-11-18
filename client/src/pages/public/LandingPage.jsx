import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar.jsx';
import Footer from '../../components/layout/Footer.jsx';
import Button from '../../components/ui/Button.jsx';
import QuickTrackModal from '../../components/common/QuickTrackModal.jsx';
import { analyticsApi } from '../../api/analyticsApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Search,
  Sparkles,
  Zap,
  Droplets,
  Wifi,
  Wrench,
  AlertTriangle,
  ChevronDown,
  Building,
  TrendingUp,
  Award,
  Users
} from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [isTrackOpen, setIsTrackOpen] = useState(false);
  const [stats, setStats] = useState({
    resolved: 15,
    avgHours: 24,
    rating: 4.8,
    activeStaff: 4
  });
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await analyticsApi.getPublicStats();
        if (data && data.counts) {
          setStats({
            resolved: (data.counts.byStatus['Resolved'] || 0) + (data.counts.byStatus['Closed'] || 0),
            avgHours: 24,
            rating: data.counts.averageRating || 4.8,
            activeStaff: data.counts.activeStaff || 4
          });
        }
      } catch (_) {}
    }
    loadStats();
  }, []);

  const handleReportClick = () => {
    if (isAuthenticated) {
      navigate('/student/new-complaint');
    } else {
      navigate('/login?redirect=/student/new-complaint');
    }
  };

  const faqs = [
    {
      q: 'How quickly are urgent maintenance requests addressed?',
      a: 'Urgent issues involving safety hazards (short circuits, gas, severe flooding) have a strict 4-hour SLA. Our automated engine alerts the Dean and dispatches on-duty technicians within minutes.'
    },
    {
      q: 'Can I track a complaint without logging into the portal?',
      a: 'Yes! Use the "Track a Complaint" button in the top navigation bar. Enter your ticket reference number (e.g., CCM-2026-0042) to see its current status, assigned technician, and progress.'
    },
    {
      q: 'What happens if a repair is unsatisfactory?',
      a: 'After a complaint is marked "Resolved", the student has the ability to submit a 1-5 star rating or click "Reopen Complaint" with an explanation. Reopened requests are immediately re-assigned.'
    },
    {
      q: 'How does the community "Me Too" upvote feature work?',
      a: 'If another resident has already reported an issue in your building or common area (like Wi-Fi down in the Library), you can click "Me Too". Tickets with higher upvote counts automatically escalate in priority.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-surface-50 text-slate-800 dark:text-slate-100 transition-colors">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-surface-border">
        {/* Subtle decorative background gradient circles (academic slate & deep blue) */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-primary-100/40 dark:bg-primary-950/20 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/80 border border-primary-200 dark:border-primary-800 text-primary-800 dark:text-primary-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                <span>Apex Institute of Technology Official Facilities Portal</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight leading-[1.12]">
                Report it. <span className="text-primary-700 dark:text-primary-400">Track it.</span> <br />
                Get it fixed.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                A unified campus platform for students, faculty, and estate staff to submit, monitor, and resolve hostel, classroom, and lab maintenance with verified SLA accountability.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Button
                  size="lg"
                  onClick={handleReportClick}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="w-full sm:w-auto shadow-md"
                >
                  Report an Issue
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                  onClick={() => setIsTrackOpen(true)}
                  className="w-full sm:w-auto"
                >
                  Track a Complaint
                </Button>
              </div>

              {/* Key Trust Signals */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Real-time technician updates</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Automated SLA breach escalation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Verified resident feedback</span>
                </div>
              </div>
            </div>

            {/* Right Product Preview Mockup */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-2xl border border-surface-border bg-surface-card shadow-elevated p-5 space-y-4 max-w-md mx-auto">
                <div className="flex items-center justify-between pb-3 border-b border-surface-border">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                    <span className="ml-2 text-xs font-mono font-semibold text-slate-500">Live Ticket Monitor</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">ACTIVE SLA</span>
                </div>

                {/* Mock Card Preview */}
                <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-100/60 border border-surface-border space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-primary-600">CCM-2026-0042</span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Water pipe burst in washroom</h4>
                      <p className="text-xs text-slate-500">Hostel Block B &bull; 2nd Floor &bull; Room 2B</p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                      In Progress
                    </span>
                  </div>

                  {/* Horizontal mini-progress */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Technician on site</span>
                      <span className="font-semibold text-emerald-600">SLA: 2h remaining</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-primary-600 h-full w-3/4 rounded-full" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-surface-border">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary-800 text-white flex items-center justify-center text-[10px] font-bold">
                        RS
                      </div>
                      <span className="font-medium text-slate-700 dark:text-slate-300">Rajesh Sharma (Plumbing Lead)</span>
                    </div>
                    <span className="text-[11px] font-bold text-rose-600">Urgent</span>
                  </div>
                </div>

                {/* Additional mini status cards */}
                <div className="p-3 rounded-lg border border-surface-border bg-white dark:bg-surface-card flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-600">
                      <Wifi className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">Library 2nd Floor Wi-Fi</p>
                      <p className="text-[10px] text-slate-400">Assigned &bull; Ananya Verma</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-indigo-600">Assigned</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE STATS STRIP */}
      <section className="bg-surface-card border-b border-surface-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 dark:text-white">
                {stats.resolved}+
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Work Orders Resolved
              </p>
            </div>
            <div className="space-y-1 border-l border-surface-border">
              <div className="text-3xl sm:text-4xl font-extrabold font-heading text-primary-700 dark:text-primary-400">
                &lt; {stats.avgHours}h
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Avg Resolution SLA
              </p>
            </div>
            <div className="space-y-1 border-l border-surface-border">
              <div className="text-3xl sm:text-4xl font-extrabold font-heading text-amber-500">
                {stats.rating} ★
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Resident Satisfaction
              </p>
            </div>
            <div className="space-y-1 border-l border-surface-border">
              <div className="text-3xl sm:text-4xl font-extrabold font-heading text-emerald-600">
                24/7
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Emergency Facilities Desk
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS (4 STEPS) */}
      <section id="how-it-works" className="py-20 border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-bold text-primary-700 dark:text-primary-400 uppercase tracking-widest">
              Standard Operating Procedure
            </span>
            <h2 className="text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
              How Campus Maintenance Works
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              From report to resolution, transparent workflows keep everyone accountable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-surface-card rounded-2xl border border-surface-border p-6 space-y-4 hover:shadow-card-hover transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold text-lg font-heading">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                Submit with Photos
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Log into the portal, choose your building and category, attach photos, and receive an instant reference number.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-surface-card rounded-2xl border border-surface-border p-6 space-y-4 hover:shadow-card-hover transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-lg font-heading">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                Smart Auto-Dispatch
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Our algorithm matches the category with available technicians having the lowest workload, ensuring immediate assignment.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-surface-card rounded-2xl border border-surface-border p-6 space-y-4 hover:shadow-card-hover transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-lg font-heading">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                Repair & Live SLA
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Technician arrives on site, updates real-time milestones (In Progress / Awaiting Parts), and provides resolution logs.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-surface-card rounded-2xl border border-surface-border p-6 space-y-4 hover:shadow-card-hover transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-lg font-heading">
                04
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                Resident Verification
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Verify the completed work, rate service from 1 to 5 stars, or reopen the ticket with a single click if any defect remains.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMS WE SOLVE (5 PAIN POINTS) */}
      <section id="problems" className="py-20 bg-surface-100/40 border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-bold text-primary-700 dark:text-primary-400 uppercase tracking-widest">
              Institutional Transformation
            </span>
            <h2 className="text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
              Eliminating Campus Maintenance Bottlenecks
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Replacing lost paperwork and untracked WhatsApp requests with a transparent system of record.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-card p-6 rounded-2xl border border-surface-border space-y-3">
              <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 w-fit">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold font-heading text-slate-900 dark:text-white">
                1. Total Transparency
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                No more guessing. Every complaint receives a reference number, complete historical timeline, and assigned staff details visible to everyone involved.
              </p>
            </div>

            <div className="bg-surface-card p-6 rounded-2xl border border-surface-border space-y-3">
              <div className="p-2.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 w-fit">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold font-heading text-slate-900 dark:text-white">
                2. Operational Efficiency
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Eliminates manual forwarding. Automated routing connects electrical issues straight to certified electricians based on current active load.
              </p>
            </div>

            <div className="bg-surface-card p-6 rounded-2xl border border-surface-border space-y-3">
              <div className="p-2.5 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 w-fit">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold font-heading text-slate-900 dark:text-white">
                3. Ironclad Accountability
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Automated 15-minute background cron detects SLA breaches. Tickets over 25% past due escalate directly to the Dean of Infrastructure.
              </p>
            </div>

            <div className="bg-surface-card p-6 rounded-2xl border border-surface-border space-y-3">
              <div className="p-2.5 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 w-fit">
                <Building className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold font-heading text-slate-900 dark:text-white">
                4. Breaking Data Silos
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Executive analytics pinpoint recurring failure modes and building hotspots, guiding preventative capital investments.
              </p>
            </div>

            <div className="bg-surface-card p-6 rounded-2xl border border-surface-border space-y-3 md:col-span-2">
              <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 w-fit">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold font-heading text-slate-900 dark:text-white">
                5. High Resident Satisfaction
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Students and faculty verify the outcome before a ticket is closed. Transparent star ratings ensure maintenance technicians take pride in delivering top-quality service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section id="features" className="py-20 border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-bold text-primary-700 dark:text-primary-400 uppercase tracking-widest">
              Core Capabilities
            </span>
            <h2 className="text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
              Built for Modern Campus Facilities
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl border border-surface-border bg-surface-card space-y-3">
              <Droplets className="w-6 h-6 text-sky-600" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Plumbing Network</h4>
              <p className="text-xs text-slate-500">Pipeline leakage, drain blockages, water tank levels, and washroom fixtures.</p>
            </div>

            <div className="p-6 rounded-2xl border border-surface-border bg-surface-card space-y-3">
              <Zap className="w-6 h-6 text-amber-500" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Electrical & Power</h4>
              <p className="text-xs text-slate-500">Power cuts, switchboards, ceiling fans, classroom projectors, and short circuits.</p>
            </div>

            <div className="p-6 rounded-2xl border border-surface-border bg-surface-card space-y-3">
              <Wifi className="w-6 h-6 text-purple-600" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">IT & Network</h4>
              <p className="text-xs text-slate-500">Hostel Wi-Fi access points, computer lab workstations, and library printers.</p>
            </div>

            <div className="p-6 rounded-2xl border border-surface-border bg-surface-card space-y-3">
              <Wrench className="w-6 h-6 text-emerald-600" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">General & Carpentry</h4>
              <p className="text-xs text-slate-500">Benches, door locks, broken window panes, pest control, and masonry.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-20 border-b border-surface-border bg-surface-50 dark:bg-surface-50/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs font-bold text-primary-700 dark:text-primary-400 uppercase tracking-widest">
              Got Questions?
            </span>
            <h2 className="text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-surface-border bg-surface-card overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between font-semibold text-sm text-slate-900 dark:text-slate-100 hover:text-primary-700 dark:hover:text-primary-400"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                      activeFaq === idx ? 'rotate-180 text-primary-600' : ''
                    }`}
                  />
                </button>
                {activeFaq === idx && (
                  <div className="px-4 pb-5 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-surface-border/50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-16 bg-primary-900 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading tracking-tight">
            Help Keep Our Campus Clean, Functional, and Safe.
          </h2>
          <p className="text-sm text-primary-200 max-w-xl mx-auto">
            Log in with your university credentials or report a maintenance issue in under two minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              variant="accent"
              onClick={handleReportClick}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Report an Issue Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setIsTrackOpen(true)}
              className="text-white border-white/30 hover:bg-white/10"
            >
              Track an Existing Ticket
            </Button>
          </div>
        </div>
      </section>

      <Footer />

      {/* Quick Track Modal */}
      <QuickTrackModal isOpen={isTrackOpen} onClose={() => setIsTrackOpen(false)} />
    </div>
  );
}

export default LandingPage;

