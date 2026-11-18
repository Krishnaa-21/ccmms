import React, { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';
import StatusBadge from './StatusBadge.jsx';
import PriorityBadge from './PriorityBadge.jsx';
import { Search, CheckCircle2, Clock, MapPin, User, AlertCircle } from 'lucide-react';
import apiClient from '../../api/client.js';

export function QuickTrackModal({ isOpen, onClose }) {
  const [refNumber, setRefNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!refNumber.trim()) return;

    setIsLoading(true);
    setError('');
    setTicket(null);

    try {
      // Find complaint matching reference number via public preview route
      const res = await apiClient.get('/demo/complaints', {
        params: { limit: 100 }
      });
      const match = res.data.data.find(
        (c) =>
          c.referenceNumber?.toLowerCase() === refNumber.trim().toLowerCase() ||
          c.trackingNumber?.toLowerCase() === refNumber.trim().toLowerCase()
      );

      if (match) {
        setTicket(match);
      } else {
        setError(`No complaint found with reference number "${refNumber.trim()}". Please check and try again.`);
      }
    } catch (err) {
      setError('Unable to fetch complaint status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setRefNumber('');
    setTicket(null);
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Track Complaint Status"
      description="Enter your campus reference number to view live progress."
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="e.g. CCM-2026-0001 or CMP-2024-001"
            value={refNumber}
            onChange={(e) => setRefNumber(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            autoFocus
          />
          <Button type="submit" isLoading={isLoading} className="shrink-0">
            Track
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {ticket && (
          <div className="mt-4 p-4 rounded-xl border border-surface-border bg-surface-50 dark:bg-surface-100 space-y-3 animate-fade-in">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xs font-mono font-semibold text-primary-600 dark:text-primary-400">
                  {ticket.referenceNumber || ticket.trackingNumber}
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {ticket.title}
                </h4>
              </div>
              <StatusBadge status={ticket.status} size="sm" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-surface-border">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{ticket.location?.building}, {ticket.location?.room}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{ticket.assignedTo ? ticket.assignedTo.name : 'Awaiting Assignment'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <PriorityBadge priority={ticket.priority} size="sm" showIcon={false} />
              </div>
            </div>

            {ticket.status === 'Resolved' && ticket.resolutionNotes && (
              <div className="mt-2 p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300">
                <span className="font-semibold block mb-0.5">Resolution Notes:</span>
                {ticket.resolutionNotes}
              </div>
            )}
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default QuickTrackModal;
