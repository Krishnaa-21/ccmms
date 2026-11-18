import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Wrench,
  Calendar,
  Play,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Building,
  User,
  ShieldCheck,
  Pause,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/adminApi.js';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';

export default function PreventiveMaintenancePage() {
  const queryClient = useQueryClient();
  const [newPlanModalOpen, setNewPlanModalOpen] = useState(false);
  const [runningPlanId, setRunningPlanId] = useState(null);

  const [formState, setFormState] = useState({
    title: '',
    categoryName: 'Plumbing',
    categoryId: 'cat_plumbing',
    subCategory: 'Preventive Maintenance',
    frequency: 'Monthly',
    building: 'Main Academic Block',
    floor: 'Ground Floor',
    room: 'Overhead Tanks & Risers',
    landmark: 'Central Service Core',
    priority: 'High',
    defaultAssigneeName: 'Rajesh Sharma',
    defaultAssigneeId: 'usr_staff_plumb',
    description: ''
  });

  // Fetch Preventive Plans
  const { data: plansData, isLoading } = useQuery({
    queryKey: ['preventive-plans'],
    queryFn: async () => {
      const res = await adminApi.getPreventivePlans();
      return res.data;
    }
  });

  const plans = plansData || [];

  // Metrics
  const activePlans = plans.filter((p) => p.isActive);
  const now = new Date();
  const dueSoon = plans.filter((p) => {
    if (!p.nextRunDate) return false;
    const diffHours = (new Date(p.nextRunDate) - now) / (1000 * 3600);
    return diffHours <= 48 && diffHours >= 0;
  });

  // Run Now Mutation
  const runNowMutation = useMutation({
    mutationFn: (id) => adminApi.runPreventivePlanNow(id),
    onSuccess: (res) => {
      toast.success(res.message || 'Preventive work order dispatched successfully');
      queryClient.invalidateQueries(['preventive-plans']);
      queryClient.invalidateQueries(['complaints']);
      setRunningPlanId(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to dispatch work order');
      setRunningPlanId(null);
    }
  });

  const handleRunNow = (plan) => {
    setRunningPlanId(plan.id);
    runNowMutation.mutate(plan.id);
  };

  // Toggle active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }) => adminApi.updatePreventivePlan(id, { isActive }),
    onSuccess: () => {
      toast.success('Plan status updated');
      queryClient.invalidateQueries(['preventive-plans']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update plan status');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deletePreventivePlan(id),
    onSuccess: () => {
      toast.success('Preventive plan deleted');
      queryClient.invalidateQueries(['preventive-plans']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete plan');
    }
  });

  // Create plan mutation
  const createPlanMutation = useMutation({
    mutationFn: (data) =>
      adminApi.createPreventivePlan({
        ...data,
        defaultAssignee: {
          id: data.defaultAssigneeId,
          name: data.defaultAssigneeName,
          role: 'staff'
        }
      }),
    onSuccess: () => {
      toast.success('New recurring maintenance plan scheduled');
      queryClient.invalidateQueries(['preventive-plans']);
      setNewPlanModalOpen(false);
      setFormState({
        title: '',
        categoryName: 'Plumbing',
        categoryId: 'cat_plumbing',
        subCategory: 'Preventive Maintenance',
        frequency: 'Monthly',
        building: 'Main Academic Block',
        floor: 'Ground Floor',
        room: '',
        landmark: '',
        priority: 'High',
        defaultAssigneeName: 'Rajesh Sharma',
        defaultAssigneeId: 'usr_staff_plumb',
        description: ''
      });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create plan');
    }
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300 mb-1">
            <RotateCw className="w-3.5 h-3.5" />
            Recurring Asset Reliability
          </div>
          <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">
            Preventive Maintenance Scheduler
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure automated recurring maintenance plans. The background scheduler dispatches work orders
            to technicians before critical equipment breaches reliability thresholds.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setNewPlanModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Maintenance Plan
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Active Plans</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {activePlans.length} / {plans.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Recurring schedules running</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Due Within 48 Hours</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {dueSoon.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Imminent auto-dispatches</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Execution Frequency</span>
            <RotateCw className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Every 15 min
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Automated cron daemon cycle</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Safety Audits</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-teal-600 dark:text-teal-400 mt-1">
            100%
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Compliant with statutory norms</p>
        </div>
      </div>

      {/* Plans Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Wrench className="w-4 h-4 text-blue-600" />
            Active Maintenance Plans ({plans.length})
          </h2>
          <span className="text-xs text-slate-400">Auto-dispatches work orders to staff queue</span>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-slate-400">Loading recurring plans...</div>
        ) : plans.length === 0 ? (
          <div className="py-16 text-center text-slate-400">No preventive plans configured yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Plan Details</th>
                  <th className="px-4 py-3">Target Location</th>
                  <th className="px-4 py-3">Interval</th>
                  <th className="px-4 py-3">Assigned Staff</th>
                  <th className="px-4 py-3">Next Scheduled Run</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {plans.map((plan) => {
                  const isRunning = runningPlanId === plan.id;
                  return (
                    <tr key={plan.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="font-semibold text-slate-900 dark:text-white leading-snug">
                          {plan.title}
                        </div>
                        <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {plan.description}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                            {plan.categoryName}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400">
                            Priority: {plan.priority}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-xs">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {plan.building}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400">
                          {plan.floor} • {plan.room}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          {plan.frequency}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-xs">
                        <div className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {plan.defaultAssignee?.name || 'Unassigned'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {plan.defaultAssignee?.department || 'Facilities'}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-xs">
                        <div className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          {plan.nextRunDate
                            ? new Date(plan.nextRunDate).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })
                            : 'Pending'}
                        </div>
                        {plan.lastRunDate && (
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Last run: {new Date(plan.lastRunDate).toLocaleDateString()}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <button
                          onClick={() =>
                            toggleActiveMutation.mutate({ id: plan.id, isActive: !plan.isActive })
                          }
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                            plan.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {plan.isActive ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Active
                            </>
                          ) : (
                            <>
                              <Pause className="w-3 h-3" />
                              Paused
                            </>
                          )}
                        </button>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-right space-x-2">
                        <button
                          onClick={() => handleRunNow(plan)}
                          disabled={isRunning || runNowMutation.isPending}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm disabled:opacity-50"
                          title="Trigger immediate execution and dispatch work order"
                        >
                          <Play className="w-3 h-3" />
                          {isRunning ? 'Dispatching...' : 'Run Now'}
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Delete plan "${plan.title}"?`)) {
                              deleteMutation.mutate(plan.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Delete plan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Preventive Plan Modal */}
      <Modal
        isOpen={newPlanModalOpen}
        onClose={() => setNewPlanModalOpen(false)}
        title="Schedule Preventive Maintenance Plan"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createPlanMutation.mutate(formState);
          }}
          className="space-y-4 text-sm"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Plan Title *
            </label>
            <input
              type="text"
              required
              value={formState.title}
              onChange={(e) => setFormState({ ...formState, title: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              placeholder="e.g. Monthly Lab Air Conditioning & Filter Overhaul"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={formState.categoryId}
                onChange={(e) => {
                  const catId = e.target.value;
                  const catMap = {
                    cat_plumbing: 'Plumbing',
                    cat_electrical: 'Electrical',
                    cat_carpentry: 'Carpentry',
                    cat_safety: 'Safety',
                    cat_network: 'Networking'
                  };
                  setFormState({
                    ...formState,
                    categoryId: catId,
                    categoryName: catMap[catId] || 'General'
                  });
                }}
                className="w-full px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="cat_plumbing">Plumbing</option>
                <option value="cat_electrical">Electrical</option>
                <option value="cat_carpentry">Carpentry</option>
                <option value="cat_safety">Campus Safety</option>
                <option value="cat_network">WiFi & IT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Frequency Interval *
              </label>
              <select
                value={formState.frequency}
                onChange={(e) => setFormState({ ...formState, frequency: e.target.value })}
                className="w-full px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="Weekly">Weekly (Every 7 days)</option>
                <option value="Bi-Weekly">Bi-Weekly (Every 14 days)</option>
                <option value="Monthly">Monthly (Every 30 days)</option>
                <option value="Quarterly">Quarterly (Every 90 days)</option>
                <option value="Semi-Annual">Semi-Annual (Every 6 months)</option>
                <option value="Annual">Annual (Once per year)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Campus Building *
              </label>
              <input
                type="text"
                required
                value={formState.building}
                onChange={(e) => setFormState({ ...formState, building: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Room / Asset Zone *
              </label>
              <input
                type="text"
                required
                value={formState.room}
                onChange={(e) => setFormState({ ...formState, room: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                placeholder="e.g. Substation 1 or Server Room"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assigned Technician
              </label>
              <select
                value={formState.defaultAssigneeId}
                onChange={(e) => {
                  const id = e.target.value;
                  const name =
                    id === 'usr_staff_plumb'
                      ? 'Rajesh Sharma'
                      : 'Suresh Kumar';
                  setFormState({
                    ...formState,
                    defaultAssigneeId: id,
                    defaultAssigneeName: name
                  });
                }}
                className="w-full px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="usr_staff_plumb">Rajesh Sharma (Plumbing)</option>
                <option value="usr_staff_elec">Suresh Kumar (Electrical)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Work Order Priority
              </label>
              <select
                value={formState.priority}
                onChange={(e) => setFormState({ ...formState, priority: e.target.value })}
                className="w-full px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Urgent">Urgent</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Inspection Procedure & Instructions
            </label>
            <textarea
              rows={3}
              value={formState.description}
              onChange={(e) => setFormState({ ...formState, description: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              placeholder="Step-by-step checklist for the technician during this service order..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setNewPlanModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={createPlanMutation.isPending}
            >
              {createPlanMutation.isPending ? 'Scheduling...' : 'Save Maintenance Plan'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
