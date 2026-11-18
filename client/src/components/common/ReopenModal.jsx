import React, { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import { complaintApi } from '../../api/complaintApi.js';
import toast from 'react-hot-toast';

export function ReopenModal({ isOpen, onClose, complaintId, referenceNumber, onSuccess }) {
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 5) {
      toast.error('Please specify the reason for reopening (at least 5 characters).');
      return;
    }

    setIsLoading(true);
    try {
      await complaintApi.reopenComplaint(complaintId, reason.trim());
      toast.success('Complaint reopened and routed back to facilities queue');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reopen complaint';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reopen Maintenance Request"
      description={`Specify why ticket ${referenceNumber || ''} requires further intervention.`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Reason for Reopening <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. The leak resumed after high water pressure resumed this evening..."
            className="w-full text-sm rounded-lg border border-surface-border bg-surface-card p-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 text-slate-900 dark:text-slate-100"
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-surface-border">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" isLoading={isLoading}>
            Confirm Reopen
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default ReopenModal;

