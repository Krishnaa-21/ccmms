import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi.js';
import { complaintApi } from '../../api/complaintApi.js';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { PriorityBadge } from '../../components/common/PriorityBadge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import {
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wrench,
  RotateCcw,
  Sparkles,
  Phone,
  Mail,
  ArrowRight,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function StaffWorkloadPage() {
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [reassigningTicket, setReassigningTicket] = useState(null);
  const [targetStaffId, setTargetStaffId] = useState('');
  const [reassignReason, setReassignReason] = useState('');

  // 1. Staff users query
  const { data: usersRes, isLoading: loadingStaff, refetch: refetchStaff } = useQuery({
    queryKey: ['admin-staff-workload'],
    queryFn: () => adminApi.getUsers({ role: 'staff', limit: 50 })
  });
  const staffList = usersRes?.data?.users || [];

  // 2. Active complaints query
  const { data: compRes, refetch: refetchComplaints } = useQuery({
    queryKey: ['admin-active-work-orders'],
    queryFn: () => complaintApi.getComplaints({ limit: 100 })
  });
  const allComplaints = compRes?.data?.complaints || [];

  // Filter staff by specialty
  const filteredStaff = staffList.filter((s) => {
    if (selectedSpecialty === 'All') return true;
    return (s.specialty || '').toLowerCase().includes(selectedSpecialty.toLowerCase());
  });

  // Calculate workloads
  const staffWorkloads = filteredStaff.map((staff) => {
    const assignedTasks = allComplaints.filter(
      (c) => c.assignedTo?.id === staff.id && !['Resolved', 'Closed', 'Rejected'].includes(c.status)
    );
    const resolvedTasks = allComplaints.filter(
      (c) => c.assignedTo?.id === staff.id && ['Resolved', 'Closed'].includes(c.status)
    );
    const overdueTasks = assignedTasks.filter((c) => c.isOverdue);

    return {
      ...staff,
      activeTasks: assignedTasks,
      activeCount: assignedTasks.length,
      resolvedCount: resolvedTasks.length,
      overdueCount: overdueTasks.length
    };
  });

  // Handle Staff Availability Toggle by Admin
  const handleToggleStaffStatus = async (staffId, currentStatus) => {
    try {
      await adminApi.updateUser(staffId, { isAvailable: !currentStatus });
      toast.success('Technician availability updated');
      refetchStaff();
    } catch (err) {
      toast.error('Failed to update technician availability');
    }
  };

  // Handle Reassignment
  const handleReassignSubmit = async () => {
    if (!targetStaffId) {
      toast.error('Select a target technician');
      return;
    }
    try {
      await adminApi.assignComplaint(reassigningTicket.id, {
        staffId: targetStaffId,
        reason: reassignReason || 'Reassigned via Workload Balancer'
      });
      toast.success('Task reassigned');
      setReassigningTicket(null);
      setTargetStaffId('');
      setReassignReason('');
      refetchComplaints();
      refetchStaff();
    } catch (err) {
      toast.error('Failed to reassign task');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 dark:text-white">
            Technician Capacity &amp; Workload Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Monitor technician task saturation, availability flags, and rebalance high-density queues.
          </p>
        </div>

        {/* Specialty Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Specialty:</span>
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold"
          >
            <option value="All">All Specialties</option>
            <option value="Electrical">Electrical</option>
            <option value="Plumbing">Plumbing</option>
            <option value="HVAC">HVAC &amp; AC</option>
            <option value="Carpentry">Carpentry</option>
          </select>
        </div>
      </div>

      {/* Staff Capacity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {staffWorkloads.map((staff) => {
          const isHighLoad = staff.activeCount >= 4;
          return (
            <div
              key={staff.id}
              className={`p-6 rounded-2xl bg-white dark:bg-slate-900 border transition-all shadow-sm space-y-5 ${
                isHighLoad
                  ? 'border-amber-300 dark:border-amber-800/80'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Staff Bio Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-2xs"
                    style={{ backgroundColor: staff.avatarColor || '#0d9488' }}
                  >
                    {staff.name?.[0]}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {staff.name}
                    </h3>
                    <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                      {staff.specialty || 'General Maintenance'}
                    </span>
                    <span className="text-[11px] text-slate-400 block">{staff.email}</span>
                  </div>
                </div>

                {/* Availability Switch */}
                <button
                  onClick={() => handleToggleStaffStatus(staff.id, staff.isAvailable !== false)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                    staff.isAvailable !== false
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800'
                      : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      staff.isAvailable !== false ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                    }`}
                  />
                  <span>{staff.isAvailable !== false ? 'Available' : 'Unavailable'}</span>
                </button>
              </div>

              {/* Workload Progress Meter */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-500 font-medium">Active Workload Capacity:</span>
                  <span
                    className={`font-bold ${
                      isHighLoad ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {staff.activeCount} / 5 tasks max
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      staff.activeCount >= 5
                        ? 'bg-rose-500'
                        : isHighLoad
                        ? 'bg-amber-500'
                        : 'bg-primary-600'
                    }`}
                    style={{ width: `${Math.min(100, (staff.activeCount / 5) * 100)}%` }}
                  />
                </div>
                {isHighLoad && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" /> High load warning: Reassignment suggested
                  </p>
                )}
              </div>

              {/* Scorecard Strip */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Active</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {staff.activeCount}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Resolved</span>
                  <span className="font-bold text-emerald-600 text-sm">{staff.resolvedCount}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Overdue</span>
                  <span className="font-bold text-rose-500 text-sm">{staff.overdueCount}</span>
                </div>
              </div>

              {/* Active Tasks Assigned to this Staff */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Current Assigned Work Orders ({staff.activeTasks.length})
                </span>

                {staff.activeTasks.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    Zero active tasks. Ready for dispatch.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {staff.activeTasks.map((t) => (
                      <div
                        key={t.id}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="font-mono font-bold text-primary-700 dark:text-primary-400">
                              {t.referenceNumber}
                            </span>
                            <PriorityBadge priority={t.priority} />
                          </div>
                          <span className="font-semibold text-slate-900 dark:text-white truncate block">
                            {t.title}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {t.location?.building} • {t.status}
                          </span>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setReassigningTicket(t);
                            setTargetStaffId('');
                          }}
                          className="shrink-0 text-xs"
                        >
                          Reassign
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reassign Modal */}
      {reassigningTicket && (
        <Modal
          isOpen={!!reassigningTicket}
          onClose={() => setReassigningTicket(null)}
          title={`Reassign Task #${reassigningTicket.referenceNumber}`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div>
              <p className="text-slate-600 dark:text-slate-400 mb-2">
                Rebalancing work order: <strong className="text-slate-900 dark:text-white">{reassigningTicket.title}</strong>
              </p>
              <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Target Technician
              </label>
              <select
                value={targetStaffId}
                onChange={(e) => setTargetStaffId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="">Select recipient technician...</option>
                {staffList.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.specialty}) • {st.activeCount || 0} active
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Reassignment Reason
              </label>
              <textarea
                rows={2}
                value={reassignReason}
                onChange={(e) => setReassignReason(e.target.value)}
                placeholder="e.g. Workload balancing, schedule conflict"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setReassigningTicket(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleReassignSubmit}>
                Confirm Reassignment
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
