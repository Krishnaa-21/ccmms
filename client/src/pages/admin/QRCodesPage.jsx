import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import QRCode from 'qrcode';
import {
  QrCode,
  Download,
  Printer,
  Plus,
  Search,
  Building,
  Copy,
  ExternalLink,
  MapPin,
  Check,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/adminApi.js';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';

export default function QRCodesPage() {
  const queryClient = useQueryClient();
  const [selectedCampus, setSelectedCampus] = useState('apex-campus-main');
  const [selectedBuilding, setSelectedBuilding] = useState('all');
  const [search, setSearch] = useState('');
  const [qrImages, setQrImages] = useState({});
  const [previewLocation, setPreviewLocation] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [newLocationModalOpen, setNewLocationModalOpen] = useState(false);

  // Form state for creating location
  const [formState, setFormState] = useState({
    campusId: 'apex-campus-main',
    building: 'Main Academic Block',
    floor: '1st Floor',
    room: '',
    landmark: '',
    zone: 'Academic Wing'
  });

  // Fetch locations
  const { data: locationsData, isLoading } = useQuery({
    queryKey: ['locations', selectedCampus, selectedBuilding],
    queryFn: async () => {
      const res = await adminApi.getLocations({
        campusId: selectedCampus,
        building: selectedBuilding
      });
      return res.data;
    }
  });

  const locations = locationsData || [];

  // Generate QR data URLs for each location
  useEffect(() => {
    if (!locations.length) return;

    const generateQRs = async () => {
      const map = {};
      for (const loc of locations) {
        try {
          const url = await QRCode.toDataURL(loc.qrPayload || `https://ccmms.apex.edu/report?building=${encodeURIComponent(loc.building)}&room=${encodeURIComponent(loc.room)}`, {
            width: 280,
            margin: 2,
            color: {
              dark: '#0f172a',
              light: '#ffffff'
            }
          });
          map[loc.id] = url;
        } catch (err) {
          console.error('Failed to generate QR for location', loc.id, err);
        }
      }
      setQrImages(map);
    };

    generateQRs();
  }, [locations]);

  // Download QR Code PNG
  const handleDownload = (loc) => {
    const dataUrl = qrImages[loc.id];
    if (!dataUrl) return;

    const link = document.createElement('a');
    link.download = `QR_${loc.code || loc.building + '_' + loc.room}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloaded QR code for ${loc.room}`);
  };

  // Copy URL
  const handleCopy = (loc) => {
    navigator.clipboard.writeText(loc.qrPayload);
    setCopiedId(loc.id);
    toast.success('Direct report URL copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Trigger Print Sheet
  const handlePrint = () => {
    window.print();
  };

  // Filter locations by search
  const filteredLocations = locations.filter((loc) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      loc.room?.toLowerCase().includes(q) ||
      loc.building?.toLowerCase().includes(q) ||
      loc.code?.toLowerCase().includes(q) ||
      loc.landmark?.toLowerCase().includes(q)
    );
  });

  // Create location mutation
  const createMutation = useMutation({
    mutationFn: (newLoc) => adminApi.createLocation(newLoc),
    onSuccess: () => {
      toast.success('Location registered and QR code generated');
      queryClient.invalidateQueries(['locations']);
      setNewLocationModalOpen(false);
      setFormState({
        campusId: selectedCampus,
        building: 'Main Academic Block',
        floor: '1st Floor',
        room: '',
        landmark: '',
        zone: 'Academic Wing'
      });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create location');
    }
  });

  return (
    <div className="space-y-6">
      {/* Screen Header (Hidden during print) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 mb-1">
            <QrCode className="w-3.5 h-3.5" />
            Physical Space Asset Tagging
          </div>
          <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">
            Location QR Codes & Asset Labels
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Generate and print scannable QR label stickers for campus rooms, labs, and washrooms.
            Scanning deep-links students directly to the prefilled complaint wizard.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Print Sticker Sheet
          </Button>

          <Button
            variant="primary"
            onClick={() => setNewLocationModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Location
          </Button>
        </div>
      </div>

      {/* Filter and Control Bar (Hidden during print) */}
      <div className="print:hidden bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search room, building, code..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedCampus}
            onChange={(e) => setSelectedCampus(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
          >
            <option value="apex-campus-main">Apex Main Campus (Bengaluru)</option>
            <option value="apex-campus-city">Apex City Innovation Hub</option>
          </select>

          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Buildings</option>
            <option value="Main Academic Block">Main Academic Block</option>
            <option value="Hostel Block B">Hostel Block B</option>
            <option value="Library">Library</option>
            <option value="Physics Lab">Physics Lab</option>
            <option value="Seminar Hall">Seminar Hall</option>
            <option value="Computer Lab 1">Computer Lab 1</option>
            <option value="Hostel Block A">Hostel Block A</option>
            <option value="Canteen">Canteen</option>
          </select>

          <span className="text-xs text-slate-400 whitespace-nowrap">
            {filteredLocations.length} locations
          </span>
        </div>
      </div>

      {/* QR Codes Grid (Screen View & Print Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 print:grid-cols-3 print:gap-3">
        {isLoading ? (
          <div className="col-span-full py-16 text-center text-slate-400">Loading campus locations...</div>
        ) : filteredLocations.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            No locations found matching filter criteria.
          </div>
        ) : (
          filteredLocations.map((loc) => {
            const qrSrc = qrImages[loc.id];
            return (
              <div
                key={loc.id}
                className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-blue-400 dark:hover:border-blue-600 transition-all print:border-2 print:border-slate-300 print:shadow-none print:break-inside-avoid print:p-3"
              >
                <div>
                  {/* Card Header with Campus Tag */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pb-2 border-b border-slate-100 dark:border-slate-800 print:pb-1">
                    <span className="font-semibold text-blue-700 dark:text-blue-400">{loc.code}</span>
                    <span className="text-slate-400">{loc.zone}</span>
                  </div>

                  {/* QR Image Box */}
                  <div className="my-3 flex items-center justify-center p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800 print:bg-white print:border-none print:my-1">
                    {qrSrc ? (
                      <img
                        src={qrSrc}
                        alt={`QR Code for ${loc.room}`}
                        className="w-36 h-36 object-contain"
                      />
                    ) : (
                      <div className="w-36 h-36 flex items-center justify-center text-xs text-slate-400">
                        Rendering QR...
                      </div>
                    )}
                  </div>

                  {/* Location Information */}
                  <div className="space-y-1 text-center">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                      {loc.room}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {loc.building} • {loc.floor}
                    </p>
                    {loc.landmark && (
                      <p className="text-[11px] text-slate-400 italic">Near {loc.landmark}</p>
                    )}
                  </div>

                  {/* Print-only Callout Footer */}
                  <div className="hidden print:block text-center mt-2 pt-2 border-t border-slate-200 text-[10px] text-slate-600">
                    <p className="font-bold">Apex Institute of Technology</p>
                    <p>Scan with mobile camera to report a maintenance issue</p>
                  </div>
                </div>

                {/* Action Buttons (Hidden during Print) */}
                <div className="print:hidden mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleDownload(loc)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                    title="Download high-res PNG image"
                  >
                    <Download className="w-3.5 h-3.5" />
                    PNG
                  </button>

                  <button
                    onClick={() => handleCopy(loc)}
                    className="flex items-center justify-center p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors"
                    title="Copy direct web link"
                  >
                    {copiedId === loc.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    onClick={() => setPreviewLocation(loc)}
                    className="flex items-center justify-center p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors"
                    title="Preview full sticker badge"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Large Sticker Preview Modal */}
      {previewLocation && (
        <Modal
          isOpen={!!previewLocation}
          onClose={() => setPreviewLocation(null)}
          title={`Label Badge Preview: ${previewLocation.room}`}
        >
          <div className="flex flex-col items-center space-y-4 text-center p-2">
            <div className="border-4 border-slate-900 rounded-2xl p-6 bg-white text-slate-900 w-full max-w-sm shadow-xl">
              <div className="font-serif font-bold text-sm tracking-wide text-blue-900 uppercase">
                Apex Institute of Technology
              </div>
              <div className="text-[10px] font-mono text-slate-500 tracking-wider mt-0.5">
                FACILITIES & MAINTENANCE DESK
              </div>

              <div className="my-4 flex justify-center">
                <img
                  src={qrImages[previewLocation.id]}
                  alt="QR Code"
                  className="w-48 h-48 rounded-lg border border-slate-200 p-2 shadow-inner"
                />
              </div>

              <h3 className="text-lg font-bold text-slate-900">{previewLocation.room}</h3>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">
                {previewLocation.building} • {previewLocation.floor}
              </p>
              <div className="mt-3 pt-3 border-t border-slate-200 text-[11px] text-slate-500 font-medium">
                Scan with phone camera to report an issue in this room
              </div>
              <div className="font-mono text-[9px] text-slate-400 mt-1">
                ID: {previewLocation.code}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => handleDownload(previewLocation)}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download PNG
              </Button>
              <Button variant="primary" onClick={() => setPreviewLocation(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Location Modal */}
      <Modal
        isOpen={newLocationModalOpen}
        onClose={() => setNewLocationModalOpen(false)}
        title="Register New Campus Location"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate(formState);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Building Name *
            </label>
            <input
              type="text"
              required
              value={formState.building}
              onChange={(e) => setFormState({ ...formState, building: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              placeholder="e.g. Ramanujan Science Tower"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Floor
              </label>
              <input
                type="text"
                value={formState.floor}
                onChange={(e) => setFormState({ ...formState, floor: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                placeholder="e.g. 2nd Floor"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Room / Facility Name *
              </label>
              <input
                type="text"
                required
                value={formState.room}
                onChange={(e) => setFormState({ ...formState, room: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                placeholder="e.g. Room 304 or Washroom 2B"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Landmark / Access Point
            </label>
            <input
              type="text"
              value={formState.landmark}
              onChange={(e) => setFormState({ ...formState, landmark: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              placeholder="e.g. Opposite Lift 2"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setNewLocationModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Saving...' : 'Generate Location QR'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

