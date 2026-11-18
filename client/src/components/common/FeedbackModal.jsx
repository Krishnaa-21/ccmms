import React, { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import Textarea from '../ui/Input.jsx';
import { Star } from 'lucide-react';
import { complaintApi } from '../../api/complaintApi.js';
import toast from 'react-hot-toast';

export function FeedbackModal({ isOpen, onClose, complaintId, referenceNumber, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim() || comment.trim().length < 3) {
      toast.error('Please write a brief comment describing your experience (at least 3 characters).');
      return;
    }

    setIsLoading(true);
    try {
      await complaintApi.submitFeedback(complaintId, {
        rating: Number(rating),
        comment: comment.trim(),
        timelinessRating: Number(rating),
        cleanlinessRating: 5
      });
      toast.success('Thank you for rating our facilities work!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit feedback';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rate Maintenance Service"
      description={`Share your feedback on the resolution for ticket ${referenceNumber || ''}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating Selector */}
        <div className="flex flex-col items-center justify-center py-2 space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Overall Satisfaction
          </span>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = (hoverRating || rating) >= star;
              return (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 rounded-lg focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      active
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300 dark:text-slate-600'
                    } transition-colors`}
                  />
                </button>
              );
            })}
          </div>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
            {rating === 5 && '⭐️⭐️⭐️⭐️⭐️ Excellent & Prompt'}
            {rating === 4 && '⭐️⭐️⭐️⭐️ Good Work'}
            {rating === 3 && '⭐️⭐️⭐️ Satisfactory'}
            {rating === 2 && '⭐️⭐️ Needs Improvement'}
            {rating === 1 && '⭐️ Unsatisfactory'}
          </span>
        </div>

        {/* Comment textarea */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Your Comments & Experience <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="How promptly did the technician arrive? Was the repair clean and thorough?"
            className="w-full text-sm rounded-lg border border-surface-border bg-surface-card p-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 text-slate-900 dark:text-slate-100"
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-surface-border">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Submit Feedback
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default FeedbackModal;
