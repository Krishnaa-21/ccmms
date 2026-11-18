import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi.js';
import { Button } from '../../components/ui/Button.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import {
  Settings,
  Clock,
  Layers,
  Sparkles,
  Mail,
  ShieldCheck,
  RotateCcw,
  Plus,
  Trash2,
  Edit,
  Save,
  CheckCircle2,
  AlertTriangle,
  History,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('sla'); // 'sla' | 'categories' | 'automation' | 'audit' | 'reset'

  // Query: Campus Settings
  const { data: settingsRes, isLoading: loadingSettings, refetch: refetchSettings } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => adminApi.getSettings()
  });
  const settingsData = settingsRes?.data?.settings || {};
  const categories = settingsRes?.data?.categories || [];

  // Query: Audit Logs
  const { data: auditRes, refetch: refetchAudit } = useQuery({
    queryKey: ['admin-full-audit-log'],
    queryFn: () => adminApi.getAuditLogs({ limit: 50 })
  });
  const auditLogs = auditRes?.data || [];

  // SLA Thresholds Local State
  const [slaForm, setSlaForm] = useState(null);

  // Initialize SLA Form once settings are loaded
  React.useEffect(() => {
    if (settingsData.slaThresholdHours) {
      setSlaForm(settingsData.slaThresholdHours);
    }
  }, [settingsData]);

  // Category Modal State
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    slaHours: 24,
    subcategories: ''
  });

  // Reset Demo Modal State
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Save SLA Form
  const handleSaveSla = async (e) => {
    e.preventDefault();
    try {
      await adminApi.updateSettings({
        slaThresholdHours: {
          Urgent: Number(slaForm.Urgent),
          High: Number(slaForm.High),
          Medium: Number(slaForm.Medium),
          Low: Number(slaForm.Low)
        }
      });
      toast.success('Campus SLA threshold configurations saved');
      refetchSettings();
    } catch (err) {
      toast.error('Failed to update SLA settings');
    }
  };

  // Toggle Auto-assignment
  const handleToggleAutoAssignment = async () => {
    try {
      await adminApi.updateSettings({
        autoAssignment: !settingsData.autoAssignment
      });
      toast.success(`Smart Auto-assignment ${!settingsData.autoAssignment ? 'enabled' : 'disabled'}`);
      refetchSettings();
    } catch (err) {
      toast.error('Failed to toggle auto-assignment');
    }
  };

  // Create Category
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;

    try {
      const subs = categoryForm.subcategories
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await adminApi.createCategory({
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim(),
        slaHours: Number(categoryForm.slaHours) || 24,
        subcategories: subs
      });
      toast.success('New maintenance category added');
      setCategoryModalOpen(false);
      setCategoryForm({ name: '', description: '', slaHours: 24, subcategories: '' });
      refetchSettings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create category');
    }
  };

  // Delete Category
  const handleDeleteCategory = async (id, name) => {
    if (!confirm(`Are you sure you want to remove the category "${name}"?`)) return;
    try {
      await adminApi.deleteCategory(id);
      toast.success('Category removed');
      refetchSettings();
    } catch (err) {
      toast.error('Failed to delete category');
    }
  };

  // Reset Demo Data
  const handleConfirmReset = async () => {
    setIsResetting(true);
    try {
      await adminApi.resetDemoData();
      toast.success('All demo records successfully restored to initial state');
      setResetModalOpen(false);
      refetchSettings();
      refetchAudit();
    } catch (err) {
      toast.error('Failed to reset demo records');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 dark:text-white">
          Campus System Settings &amp; Governance
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
          Configure response SLAs, automated dispatch rules, maintenance categories, and system audit logs.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
        {[
          { id: 'sla', label: 'SLA Thresholds', icon: Clock },
          { id: 'categories', label: 'Categories & Trades', icon: Layers },
          { id: 'automation', label: 'Workflow Automation', icon: Sparkles },
          { id: 'audit', label: 'Audit Log Viewer', icon: History },
          { id: 'reset', label: 'Maintenance Sandbox', icon: RotateCcw }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-900 text-white dark:bg-primary-600 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SLA THRESHOLDS */}
      {activeTab === 'sla' && slaForm && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold font-serif text-slate-900 dark:text-white">
              Service Level Agreement (SLA) Targets
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Specify maximum turnaround hours for complaints based on assigned priority. Breaches trigger overdue warnings and automated supervisor notifications.
            </p>
          </div>

          <form onSubmit={handleSaveSla} className="space-y-4 max-w-xl">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-rose-700 dark:text-rose-400 mb-1.5">
                  Urgent Priority (Hours)
                </label>
                <input
                  type="number"
                  min={1}
                  max={72}
                  value={slaForm.Urgent}
                  onChange={(e) => setSlaForm((p) => ({ ...p, Urgent: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-semibold"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Default: 4 hours (Safety hazards)</span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-amber-700 dark:text-amber-400 mb-1.5">
                  High Priority (Hours)
                </label>
                <input
                  type="number"
                  min={2}
                  max={96}
                  value={slaForm.High}
                  onChange={(e) => setSlaForm((p) => ({ ...p, High: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-semibold"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Default: 12 hours (Disruptive outages)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-blue-700 dark:text-blue-400 mb-1.5">
                  Medium Priority (Hours)
                </label>
                <input
                  type="number"
                  min={4}
                  max={120}
                  value={slaForm.Medium}
                  onChange={(e) => setSlaForm((p) => ({ ...p, Medium: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-semibold"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Default: 24 hours (General wear)</span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                  Low Priority (Hours)
                </label>
                <input
                  type="number"
                  min={8}
                  max={168}
                  value={slaForm.Low}
                  onChange={(e) => setSlaForm((p) => ({ ...p, Low: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-semibold"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Default: 48 hours (Cosmetic / minor)</span>
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" size="md">
                <Save className="w-4 h-4 mr-1.5" />
                <span>Save SLA Thresholds</span>
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: CATEGORIES & SUBCATEGORIES */}
      {activeTab === 'categories' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold font-serif text-slate-900 dark:text-white">
                Maintenance Categories &amp; Trades
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Configure campus maintenance trade areas and subcategory service components.
              </p>
            </div>

            <Button variant="primary" size="sm" onClick={() => setCategoryModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Add Category</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {cat.name}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300">
                      SLA: {cat.slaHours || 24}h
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    className="text-slate-400 hover:text-rose-600 transition-colors"
                    title="Remove category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">{cat.description}</p>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Subcomponents:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.subcategories?.map((sub) => (
                      <span
                        key={sub}
                        className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: WORKFLOW AUTOMATION */}
      {activeTab === 'automation' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold font-serif text-slate-900 dark:text-white">
              Smart Auto-Assignment &amp; Notification Rules
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Configure how the workflow engine assigns complaints and dispatches status updates.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-sm text-slate-900 dark:text-white block">
                Automatic Technician Dispatch
              </span>
              <p className="text-xs text-slate-500 max-w-lg">
                Automatically assign newly submitted complaints to available technicians based on specialty trade and lowest active task workload.
              </p>
            </div>
            <button
              onClick={handleToggleAutoAssignment}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                settingsData.autoAssignment
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {settingsData.autoAssignment ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {/* Notification Templates Preview */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Multi-Channel Alert Templates Preview
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1.5">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-primary-600" /> Status Transition
                </span>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  "Your maintenance ticket #&#123;ref&#125; has been moved to &#123;status&#125; by technician &#123;staff&#125;."
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1.5">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> SLA Warning
                </span>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  "Attention: Ticket #&#123;ref&#125; is within 2 hours of SLA breach. Escalation alert sent to Dean."
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1.5">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Feedback Request
                </span>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  "Repair completed! Please rate the service quality of #&#123;ref&#125; on your student portal."
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOG VIEWER */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold font-serif text-slate-900 dark:text-white">
                Campus System Audit Log
              </h2>
              <p className="text-xs text-slate-500">
                Immutable record of administrative, assignment, and status modifications.
              </p>
            </div>
            <button
              onClick={() => refetchAudit()}
              className="text-xs text-primary-600 hover:underline font-semibold"
            >
              Refresh Log
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Actor</th>
                  <th className="py-2.5 px-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-3">
                      {log.actor?.name || 'System'} ({log.actor?.role || 'engine'})
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: RESET DEMO DATA */}
      {activeTab === 'reset' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold font-serif text-slate-900 dark:text-white">
              Demo Sandbox Environment Controls
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Reset the JSON file-store back to the initial demo snapshot (13 users, 40 complaints, seeded history &amp; feedback).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <RotateCcw className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                  Reset Demo Dataset
                </h4>
                <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                  Restores 40 complaints, resets all user passwords to <code className="bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded font-mono">Password@123</code>, and resets SLA milestones.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="md"
              onClick={() => setResetModalOpen(true)}
              className="shrink-0 border-amber-400 text-amber-800 dark:text-amber-300 hover:bg-amber-100"
            >
              Reset Demo Records
            </Button>
          </div>
        </div>
      )}

      {/* Category Creation Modal */}
      {categoryModalOpen && (
        <Modal
          isOpen={categoryModalOpen}
          onClose={() => setCategoryModalOpen(false)}
          title="Add Maintenance Category"
          size="md"
        >
          <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={categoryForm.name}
                onChange={(e) => setCategoryForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Civil Infrastructure & Roads"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={categoryForm.description}
                onChange={(e) => setCategoryForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Potholes, walkways, masonry repairs..."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Default SLA (Hours)
                </label>
                <input
                  type="number"
                  min={1}
                  value={categoryForm.slaHours}
                  onChange={(e) => setCategoryForm((p) => ({ ...p, slaHours: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Subcomponents (Comma separated)
                </label>
                <input
                  type="text"
                  value={categoryForm.subcategories}
                  onChange={(e) => setCategoryForm((p) => ({ ...p, subcategories: e.target.value }))}
                  placeholder="Pavements, Signage, Drainage"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" type="button" onClick={() => setCategoryModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Create Category
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Reset Confirmation Modal */}
      {resetModalOpen && (
        <Modal
          isOpen={resetModalOpen}
          onClose={() => setResetModalOpen(false)}
          title="Reset Demo Dataset to Baseline"
          size="md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-400">
              Are you sure you want to reset all campus demo records? This will reinitialize 40 realistic complaints, 13 users, ratings, and audit records in the JSON store.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setResetModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                loading={isResetting}
                onClick={handleConfirmReset}
              >
                Yes, Reset Dataset
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

