import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { complaintApi } from '../../api/complaintApi.js';
import { Button } from '../../components/ui/Button.jsx';
import { PriorityBadge } from '../../components/common/PriorityBadge.jsx';
import {
  Zap,
  Droplet,
  Wind,
  Hammer,
  Monitor,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Upload,
  X,
  FileText,
  MapPin,
  Clock,
  Sparkles,
  ShieldAlert,
  ThumbsUp,
  Save,
  Trash2,
  Calendar,
  Phone
} from 'lucide-react';
import toast from 'react-hot-toast';

const BUILDINGS = [
  'Main Academic Block',
  'Library',
  'Hostel Block A',
  'Hostel Block B',
  'Computer Lab 1',
  'Physics Lab',
  'Seminar Hall',
  'Canteen',
  'Sports Complex',
  'Admin Office',
  'Parking Area'
];

const FLOORS = ['Basement', 'Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor'];

export default function NewComplaintPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef(null);

  // Categories query
  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => complaintApi.getCategories()
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    categoryId: '',
    categoryName: '',
    subcategory: '',
    title: '',
    description: '',
    priority: '',
    priorityReason: '',
    suggestedPriority: '',
    building: searchParams.get('building') || 'Main Academic Block',
    floor: searchParams.get('floor') || 'Ground Floor',
    room: searchParams.get('room') || '',
    landmark: searchParams.get('landmark') || '',
    preferredContactTime: 'Anytime',
    contactPhone: ''
  });

  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [potentialDuplicates, setPotentialDuplicates] = useState([]);
  const [hasDraft, setHasDraft] = useState(false);

  // Check URL params for category pre-fill
  useEffect(() => {
    const catParam = searchParams.get('category');
    if (catParam && categories.length > 0) {
      const match = categories.find((c) => c.id === catParam || c.name.toLowerCase() === catParam.toLowerCase());
      if (match) {
        const subcats = match.subCategories || match.subcategories || [];
        setFormData((prev) => ({
          ...prev,
          categoryId: match.id,
          categoryName: match.name,
          subcategory: subcats[0] || ''
        }));
      }
    }
  }, [searchParams, categories]);

  // Check for local storage draft on mount
  useEffect(() => {
    const saved = localStorage.getItem('ccmms_complaint_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.title || parsed.description) {
          setHasDraft(true);
        }
      } catch (_) {}
    }
  }, []);

  const restoreDraft = () => {
    try {
      const saved = localStorage.getItem('ccmms_complaint_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData((p) => ({ ...p, ...parsed }));
        setHasDraft(false);
        toast.success('Draft restored successfully');
      }
    } catch (_) {}
  };

  const discardDraft = () => {
    localStorage.removeItem('ccmms_complaint_draft');
    setHasDraft(false);
    toast('Draft cleared');
  };

  // Auto-save draft on form changes
  useEffect(() => {
    if (formData.title || formData.description) {
      const { ...draftData } = formData;
      localStorage.setItem('ccmms_complaint_draft', JSON.stringify(draftData));
    }
  }, [formData]);

  // Live priority suggestion debounce
  useEffect(() => {
    if (!formData.title || formData.title.length < 5) return;

    const timer = setTimeout(async () => {
      try {
        const res = await complaintApi.suggestPriority(
          formData.title,
          formData.description,
          formData.categoryId
        );
        if (res.success && res.data) {
          setFormData((p) => ({
            ...p,
            suggestedPriority: res.data.priority,
            priorityReason: res.data.reason,
            priority: p.priority || res.data.priority
          }));
        }
      } catch (_) {}
    }, 600);

    return () => clearTimeout(timer);
  }, [formData.title, formData.description, formData.categoryId]);

  // Live duplicate detection
  useEffect(() => {
    if (!formData.title || formData.title.length < 4 || !formData.building) return;

    const timer = setTimeout(async () => {
      try {
        const res = await complaintApi.checkDuplicates({
          title: formData.title,
          building: formData.building,
          room: formData.room,
          categoryId: formData.categoryId
        });
        if (res.success && Array.isArray(res.data)) {
          setPotentialDuplicates(res.data);
        }
      } catch (_) {}
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.title, formData.building, formData.room, formData.categoryId]);

  // Handle Category Select
  const handleSelectCategory = (cat) => {
    const subcats = cat.subCategories || cat.subcategories || [];
    setFormData((prev) => ({
      ...prev,
      categoryId: cat.id,
      categoryName: cat.name,
      subcategory: subcats[0] || ''
    }));
  };

  // Handle File Uploads
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 4) {
      toast.error('You can upload a maximum of 4 images');
      return;
    }

    const validFiles = [];
    const newPreviews = [];

    for (const f of selectedFiles) {
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`File ${f.name} exceeds 5 MB limit`);
        continue;
      }
      validFiles.push(f);
      newPreviews.push(URL.createObjectURL(f));
    }

    setFiles((prev) => [...prev, ...validFiles]);
    setFilePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Upvote duplicate complaint
  const handleUpvoteDuplicate = async (dupId) => {
    try {
      await complaintApi.upvoteComplaint(dupId);
      toast.success('Your vote was added to this existing ticket! We will keep you updated.');
      navigate(`/student/complaints/${dupId}`);
    } catch (err) {
      toast.error('Failed to upvote ticket');
    }
  };

  // Validation per step
  const validateStep = () => {
    if (currentStep === 1) {
      if (!formData.categoryId) {
        toast.error('Please select an issue category');
        return false;
      }
      return true;
    }
    if (currentStep === 2) {
      if (!formData.title.trim()) {
        toast.error('Please enter a brief issue title');
        return false;
      }
      if (formData.title.length < 5) {
        toast.error('Title must be at least 5 characters');
        return false;
      }
      if (!formData.description.trim() || formData.description.length < 10) {
        toast.error('Please provide a descriptive explanation (minimum 10 characters)');
        return false;
      }
      return true;
    }
    if (currentStep === 3) {
      if (!formData.building) {
        toast.error('Please select a campus building');
        return false;
      }
      if (!formData.room.trim()) {
        toast.error('Please specify the room, lab, or specific area');
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((p) => Math.min(5, p + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep((p) => Math.max(1, p - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit Complaint
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const dataPayload = new FormData();
      dataPayload.append('categoryId', formData.categoryId);
      dataPayload.append('subcategory', formData.subcategory);
      dataPayload.append('title', formData.title.trim());
      dataPayload.append('description', formData.description.trim());
      dataPayload.append('priority', formData.priority || formData.suggestedPriority || 'Medium');
      dataPayload.append('building', formData.building);
      dataPayload.append('floor', formData.floor);
      dataPayload.append('room', formData.room.trim());
      dataPayload.append('landmark', formData.landmark.trim());
      dataPayload.append('preferredContactTime', formData.preferredContactTime);
      dataPayload.append('contactPhone', formData.contactPhone);

      files.forEach((file) => {
        dataPayload.append('images', file);
      });

      const response = await complaintApi.createComplaint(dataPayload);

      // Clear draft on successful submission
      localStorage.removeItem('ccmms_complaint_draft');
      toast.success('Complaint submitted successfully!');

      setSubmittedData(response.data?.complaint || response.data);
      setCurrentStep(6); // Success state
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit complaint';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (name = '') => {
    const n = name.toLowerCase();
    if (n.includes('elect')) return Zap;
    if (n.includes('plumb')) return Droplet;
    if (n.includes('hvac') || n.includes('ac')) return Wind;
    if (n.includes('carp')) return Hammer;
    return Monitor;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Draft Notification Alert */}
      {hasDraft && currentStep < 6 && (
        <div className="p-4 rounded-2xl bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-900 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs text-primary-900 dark:text-primary-200">
            <Save className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0" />
            <span>You have an unsubmitted draft from your previous session.</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={discardDraft}>
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Discard
            </Button>
            <Button variant="primary" size="sm" onClick={restoreDraft}>
              Restore Draft
            </Button>
          </div>
        </div>
      )}

      {/* Wizard Progress Stepper (Steps 1-5) */}
      {currentStep <= 5 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-primary-700 dark:text-primary-400 uppercase tracking-wider">
              Step {currentStep} of 5
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {currentStep === 1 && 'Select Category'}
              {currentStep === 2 && 'Issue Details'}
              {currentStep === 3 && 'Location & Campus Spot'}
              {currentStep === 4 && 'Evidence & Contact'}
              {currentStep === 5 && 'Review & Finalize'}
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>

          <div className="hidden sm:grid grid-cols-5 gap-2 mt-4 text-center">
            {['1. Category', '2. Details', '3. Location', '4. Evidence', '5. Review'].map((label, i) => (
              <span
                key={label}
                className={`text-[11px] font-semibold transition-colors ${
                  currentStep === i + 1
                    ? 'text-primary-700 dark:text-primary-400'
                    : currentStep > i + 1
                    ? 'text-teal-600 dark:text-teal-400'
                    : 'text-slate-400'
                }`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* STEP 1: CATEGORY SELECTION */}
      {currentStep === 1 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 dark:text-white">
              What kind of issue are you reporting?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Select the primary department category to route your ticket to the right maintenance technician.
            </p>
          </div>

          {loadingCategories ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading campus categories...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((cat) => {
                const Icon = getCategoryIcon(cat.name);
                const isSelected = formData.categoryId === cat.id;

                return (
                  <div
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat)}
                    className={`cursor-pointer p-5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-950/30 shadow-md ring-2 ring-primary-600/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            isSelected
                              ? 'bg-primary-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          SLA: {typeof cat.slaHours === 'object' ? (cat.slaHours?.Medium || cat.slaHours?.Standard || 24) : (cat.slaHours || 24)}h target
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{cat.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{cat.description}</p>
                    </div>

                    {isSelected && (cat.subCategories || cat.subcategories)?.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-primary-200 dark:border-primary-900/60" onClick={(e) => e.stopPropagation()}>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-900 dark:text-primary-300 mb-2">
                          Specific Component:
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {(cat.subCategories || cat.subcategories || []).map((sub) => (
                            <button
                              key={sub}
                              type="button"
                              onClick={() => setFormData((p) => ({ ...p, subcategory: sub }))}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                                formData.subcategory === sub
                                  ? 'bg-primary-600 text-white shadow-sm'
                                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              {sub}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="primary" size="lg" onClick={handleNext} disabled={!formData.categoryId}>
              <span>Continue to Details</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: ISSUE DETAILS */}
      {currentStep === 2 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 dark:text-white">
              Describe the problem
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Be specific about what is malfunctioning and any safety hazards observed.
            </p>
          </div>

          {/* Potential Duplicate Banner */}
          {potentialDuplicates.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Possible Duplicate Issue Detected in this Building</span>
              </div>
              <p>
                A similar complaint was recently logged for this facility. Upvoting it notifies staff and avoids duplicate tickets:
              </p>
              <div className="space-y-1.5 pt-1">
                {potentialDuplicates.map((dup) => (
                  <div
                    key={dup.id}
                    className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/80 flex items-center justify-between gap-3"
                  >
                    <div>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{dup.referenceNumber}: </span>
                      <span className="text-slate-900 dark:text-white font-medium">{dup.title}</span>
                      <span className="text-slate-500 text-[11px] block">{dup.location?.building} • {dup.status}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpvoteDuplicate(dup.id)}
                      className="border-amber-400 text-amber-700 dark:text-amber-400 shrink-0"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 mr-1" />
                      Me Too ({dup.upvotesCount || 0})
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Issue Title / Subject *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. AC unit in Seminar Hall making loud noise and leaking water"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Detailed Description *
              </label>
              <span className="text-[11px] text-slate-400">
                {formData.description.length} chars (min 10)
              </span>
            </div>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              placeholder="Describe what happened, when it started, and if classes/labs are affected..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
            />
          </div>

          {/* Smart Priority Suggestion Box */}
          {formData.suggestedPriority && (
            <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-900/60 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-slate-900 dark:text-white">Smart Engine Priority Recommendation:</span>
                  <PriorityBadge priority={formData.suggestedPriority} />
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  {formData.priorityReason || 'Assigned based on keyword pattern and facility impact.'}
                </p>
              </div>
            </div>
          )}

          {/* Explicit Priority Override */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Select or Confirm Priority Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { level: 'Low', label: 'Low', sub: 'Non-urgent (72h SLA)' },
                { level: 'Medium', label: 'Medium', sub: 'Standard (48h SLA)' },
                { level: 'High', label: 'High', sub: 'Disruptive (24h SLA)' },
                { level: 'Emergency', label: 'Emergency', sub: 'Hazard / Danger (4h SLA)' }
              ].map(({ level, label, sub }) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, priority: level }))}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    formData.priority === level
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-950/50 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{label}</span>
                    <PriorityBadge priority={level} />
                  </div>
                  <span className="text-[10px] text-slate-500 block">{sub}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" size="md" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button variant="primary" size="lg" onClick={handleNext}>
              <span>Continue to Location</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: LOCATION & SPOT */}
      {currentStep === 3 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 dark:text-white">
              Where is the issue located?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Accurate room and floor details allow our campus maintenance team to reach the site without delays.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Campus Building */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Campus Building / Zone *
              </label>
              <select
                value={formData.building}
                onChange={(e) => setFormData((p) => ({ ...p, building: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
              >
                {BUILDINGS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Floor */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Floor Level *
              </label>
              <select
                value={formData.floor}
                onChange={(e) => setFormData((p) => ({ ...p, floor: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
              >
                {FLOORS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Specific Room / Area */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Room Number / Hall / Lab *
              </label>
              <input
                type="text"
                value={formData.room}
                onChange={(e) => setFormData((p) => ({ ...p, room: e.target.value }))}
                placeholder="e.g. Room 304, Lab 2, Main Stage"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
              />
            </div>

            {/* Landmark / Spot */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Landmark / Specific Spot (Optional)
              </label>
              <input
                type="text"
                value={formData.landmark}
                onChange={(e) => setFormData((p) => ({ ...p, landmark: e.target.value }))}
                placeholder="e.g. Near south staircase fire exit"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" size="md" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button variant="primary" size="lg" onClick={handleNext}>
              <span>Continue to Evidence</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: EVIDENCE & CONTACT */}
      {currentStep === 4 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 dark:text-white">
              Photos & Inspection Preferences
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Photos help technicians arrive with the correct spare parts and tools.
            </p>
          </div>

          {/* Drag & Drop Dropzone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Attach Photos (Max 4 images, up to 5 MB each)
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary-500 rounded-2xl p-8 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-800/30 transition-all group"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Click to browse or drag and drop photos here
              </p>
              <p className="text-xs text-slate-500 mt-1">Supports PNG, JPG, or WEBP up to 5 MB</p>
            </div>

            {/* Photo Previews */}
            {filePreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                {filePreviews.map((src, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-video">
                    <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow-sm"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contact Preferences */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Preferred Technician Visit Window
              </label>
              <select
                value={formData.preferredContactTime}
                onChange={(e) => setFormData((p) => ({ ...p, preferredContactTime: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
              >
                <option value="Anytime">Anytime / First Available Staff</option>
                <option value="Morning">Morning (09:00 AM - 12:00 PM)</option>
                <option value="Afternoon">Afternoon (12:00 PM - 04:00 PM)</option>
                <option value="Evening">Evening (04:00 PM - 07:00 PM)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Callback Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData((p) => ({ ...p, contactPhone: e.target.value }))}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" size="md" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button variant="primary" size="lg" onClick={handleNext}>
              <span>Review Ticket</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 5: REVIEW & FINALIZE */}
      {currentStep === 5 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 dark:text-white">
              Confirm Ticket Details
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Please verify your report before it is dispatched to campus maintenance dispatch.
            </p>
          </div>

          {/* Ticket Summary Card */}
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category:</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{formData.categoryName}</span>
                {formData.subcategory && (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {formData.subcategory}
                  </span>
                )}
              </div>
              <PriorityBadge priority={formData.priority || formData.suggestedPriority || 'Medium'} />
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Title:</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{formData.title}</h3>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Description:</span>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                {formData.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 block mb-1">Location:</span>
                <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary-600" />
                  {formData.building}, {formData.floor} • {formData.room}
                </span>
                {formData.landmark && <span className="text-[11px] text-slate-400 block mt-0.5">Spot: {formData.landmark}</span>}
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 block mb-1">Attachments & Window:</span>
                <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-teal-600" />
                  {files.length} {files.length === 1 ? 'file' : 'files'} attached
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Window: {formData.preferredContactTime}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-primary-50/60 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900/50 text-xs text-slate-600 dark:text-slate-400">
            By dispatching this request, you authorize campus technicians to inspect the facility in accordance with campus safety protocols.
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" size="md" onClick={handleBack} disabled={isSubmitting}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button variant="primary" size="lg" onClick={handleSubmit} loading={isSubmitting}>
              <span>Submit & Dispatch Complaint</span>
              <CheckCircle2 className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 6: SUBMISSION CELEBRATION / CONFIRMATION */}
      {currentStep === 6 && submittedData && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center shadow-sm space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2">
              Dispatched to Maintenance Desk
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 dark:text-white">
              Ticket Logged Successfully!
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mt-2">
              Your issue has been registered into the central campus workflow engine.
            </p>
          </div>

          {/* Ticket Reference Badge */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 max-w-sm mx-auto space-y-2">
            <span className="text-xs text-slate-500 uppercase tracking-wider block">Official Reference ID</span>
            <span className="font-mono text-2xl font-bold text-primary-700 dark:text-primary-400 block tracking-tight">
              {submittedData.referenceNumber || submittedData.trackingNumber}
            </span>
            <div className="pt-2 flex items-center justify-center gap-2">
              <PriorityBadge priority={submittedData.priority} />
              <span className="text-xs text-slate-500">
                Target SLA: {typeof submittedData.slaHours === 'object' ? (submittedData.slaHours?.Medium || 24) : (submittedData.slaHours || 24)} hours
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link to={`/student/complaints/${submittedData.id}`}>
              <Button variant="primary" size="lg">
                <span>View Ticket & Track Live</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/student/dashboard">
              <Button variant="outline" size="lg">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

