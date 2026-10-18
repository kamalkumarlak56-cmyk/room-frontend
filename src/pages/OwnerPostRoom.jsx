// client/src/pages/OwnerPostRoom.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import API from '../api/axios';
import { Badge, Button, Card, Input, Label, Select, Textarea } from '../components/ui/shadcn';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  IndianRupee,
  MapPin,
  Plus,
  ShieldAlert,
  Sparkles,
  Upload,
  X,
  Zap,
} from 'lucide-react';

const FACILITY_OPTIONS = [
  'Parking',
  'Camera',
  'AC',
  'Cooler',
  'Washing Machine',
  'RO',
  'WiFi',
  'Geyser',
  'Fridge',
  'Power Backup',
  'Kitchen',
  'Lift',
];

const SUITABLE_FOR_OPTIONS = [
  'Students',
  'Job Employees',
  'Women',
  'Family',
  'Anyone',
];

const initialFormState = {
  title: '',
  description: '',
  roomType: '1RK',
  rent: '',
  securityDeposit: '',
  electricityIncluded: false,
  electricityRatePerUnit: '8',
  furnishingStatus: 'Semi-Furnished',
  bedConfiguration: '1 Bed',
  address: '',
  landmark: '',
  city: '',
  state: '',
  pincode: '',
  facilities: ['Parking', 'RO'],
  suitableFor: ['Anyone'],
  rules: {
    drinkingAllowed: false,
    smokingAllowed: false,
    lateNightAllowed: false,
    visitorsAllowed: true,
    petsAllowed: false,
    nonVegAllowed: true,
  },
};

export default function OwnerPostRoom({ isEditing = false }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState(initialFormState);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // If editing, load room data
  useEffect(() => {
    if (id) {
      const fetchRoom = async () => {
        try {
          setLoadingInitial(true);
          const { data: room } = await API.get(`/rooms/${id}`);
          setFormData({
            title: room.title || '',
            description: room.description || '',
            roomType: room.roomType || '1RK',
            rent: room.rent || '',
            securityDeposit: room.securityDeposit || '',
            electricityIncluded: Boolean(room.electricityIncluded),
            electricityRatePerUnit: room.electricityRatePerUnit ?? 8,
            furnishingStatus: room.furnishingStatus || 'Semi-Furnished',
            bedConfiguration: room.bedConfiguration || '1 Bed',
            address: room.location?.address || '',
            landmark: room.location?.landmark || '',
            city: room.location?.city || '',
            state: room.location?.state || '',
            pincode: room.location?.pincode || '',
            facilities:
              room.facilities?.length > 0 ? room.facilities : room.amenities || [],
            suitableFor:
              room.suitableFor?.length > 0 ? room.suitableFor : ['Anyone'],
            rules: {
              drinkingAllowed: Boolean(room.rules?.drinkingAllowed),
              smokingAllowed: Boolean(room.rules?.smokingAllowed),
              lateNightAllowed: Boolean(room.rules?.lateNightAllowed),
              visitorsAllowed:
                room.rules?.visitorsAllowed !== undefined
                  ? Boolean(room.rules.visitorsAllowed)
                  : true,
              petsAllowed: Boolean(room.rules?.petsAllowed),
              nonVegAllowed:
                room.rules?.nonVegAllowed !== undefined
                  ? Boolean(room.rules.nonVegAllowed)
                  : true,
            },
          });
          setExistingImages(room.images || []);
        } catch (err) {
          alert('Failed to load room details for editing');
          navigate('/owner/rooms');
        } finally {
          setLoadingInitial(false);
        }
      };
      fetchRoom();
    }
  }, [id, navigate]);

  const toggleArrayItem = (field, value) => {
    const current = formData[field] || [];
    const exists = current.includes(value);
    const updated = exists
      ? current.filter((item) => item !== value)
      : [...current, value];
    setFormData({ ...formData, [field]: updated });
  };

  const toggleRule = (ruleKey) => {
    setFormData({
      ...formData,
      rules: {
        ...formData.rules,
        [ruleKey]: !formData.rules[ruleKey],
      },
    });
  };

  const removeExistingImage = (indexToRemove) => {
    setExistingImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage('');

    try {
      let uploadedUrls = [...existingImages];

      // Upload newly selected images
      if (selectedFiles.length > 0) {
        setUploading(true);
        const uploadFormData = new FormData();
        for (let i = 0; i < selectedFiles.length; i++) {
          uploadFormData.append('images', selectedFiles[i]);
        }

        const { data: uploadRes } = await API.post('/upload', uploadFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        uploadedUrls = [...uploadedUrls, ...(uploadRes.imageUrls || [])];
        setUploading(false);
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        roomType: formData.roomType,
        rent: Number(formData.rent),
        securityDeposit: Number(formData.securityDeposit || 0),
        electricityIncluded: Boolean(formData.electricityIncluded),
        electricityRatePerUnit: formData.electricityIncluded
          ? 0
          : Number(formData.electricityRatePerUnit || 8),
        furnishingStatus: formData.furnishingStatus,
        bedConfiguration: formData.bedConfiguration,
        location: {
          address: formData.address,
          landmark: formData.landmark,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        facilities: formData.facilities,
        amenities: formData.facilities,
        suitableFor:
          formData.suitableFor.length > 0 ? formData.suitableFor : ['Anyone'],
        rules: formData.rules,
        images: uploadedUrls,
      };

      if (id) {
        await API.put(`/rooms/${id}`, payload);
        setSuccessMessage('Room updated and sent to Admin for verification!');
      } else {
        await API.post('/rooms', payload);
        setSuccessMessage('Room published successfully and submitted for Admin approval!');
      }

      setTimeout(() => {
        navigate('/owner/rooms');
      }, 1500);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save room listing');
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-[#f9f6f0] dark:bg-[#0a0b0d] flex items-center justify-center text-neutral-500 dark:text-neutral-400">
        Loading room details...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f6f0] dark:bg-[#0a0b0d] text-neutral-900 dark:text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/owner/dashboard"
            className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white font-semibold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Owner Dashboard</span>
          </Link>
          <Badge variant="success" className="px-3 py-1">
            <Sparkles className="w-3.5 h-3.5" /> 0% Broker Fee
          </Badge>
        </div>

        {/* Page Title & Summary */}
        <div className="pb-4 border-b border-[#e2dbcf] dark:border-neutral-800">
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white flex items-center gap-3">
            <Building2 className="w-7 h-7 text-neutral-900 dark:text-[#f5efe6]" />
            {id ? 'Edit Room Listing Details' : 'Post a New Room for Rent'}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1.5">
            Share complete room specifications, pricing, and house rules. Your room will be reviewed by Admin and then shown to prospective tenants.
          </p>
        </div>

        {/* Verification Info Banner */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-800 dark:text-amber-300 font-bold">
              Admin Verification Policy:
            </strong>{' '}
            To protect tenants and landlords, new room posts and major pricing edits are sent directly to the Admin Control Center (`status: pending`). Once approved by the safety team, it becomes visible to all searchers!
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 p-4 rounded-2xl text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>{successMessage} Redirecting to your rooms...</span>
          </div>
        )}

        {/* Main Post Room Form */}
        <Card className="p-6 sm:p-8 bg-white dark:bg-[#121316] border-[#e2dbcf] dark:border-neutral-800 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6 text-sm">
            {/* Section 1: Title & Room Type */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 border-b border-[#e2dbcf] dark:border-neutral-800 pb-2">
                1. Basic Property Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <Label>Room Title *</Label>
                  <Input
                    required
                    placeholder="e.g. Sunny Spacious 1BHK Near Metro Station & Market"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Room Type *</Label>
                  <Select
                    value={formData.roomType}
                    onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                  >
                    <option value="1RK">1RK</option>
                    <option value="1BHK">1BHK</option>
                    <option value="2BHK">2BHK</option>
                    <option value="3BHK">3BHK</option>
                    <option value="Single Room">Single Room</option>
                    <option value="PG/Shared">PG / Shared</option>
                  </Select>
                </div>
              </div>
            </div>

            {/* Section 2: Pricing & Electricity */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 border-b border-[#e2dbcf] dark:border-neutral-800 pb-2">
                2. Pricing & Electricity Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#f8f5ee] dark:bg-neutral-950/70 p-4 rounded-2xl border border-[#e2dbcf] dark:border-neutral-850">
                <div>
                  <Label>Monthly Rent (₹) *</Label>
                  <div className="relative">
                    <IndianRupee className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      type="number"
                      required
                      placeholder="8500"
                      value={formData.rent}
                      onChange={(e) => setFormData({ ...formData, rent: e.target.value })}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div>
                  <Label>Security Deposit (₹)</Label>
                  <div className="relative">
                    <IndianRupee className="w-4 h-4 text-neutral-400 dark:text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      type="number"
                      placeholder="5000"
                      value={formData.securityDeposit}
                      onChange={(e) =>
                        setFormData({ ...formData, securityDeposit: e.target.value })
                      }
                      className="pl-8"
                    />
                  </div>
                </div>

                <div>
                  <Label>Electricity Included in Rent?</Label>
                  <Select
                    value={formData.electricityIncluded ? 'yes' : 'no'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        electricityIncluded: e.target.value === 'yes',
                      })
                    }
                  >
                    <option value="no">No (Meter Charge per Unit)</option>
                    <option value="yes">Yes (Free with Rent)</option>
                  </Select>
                </div>

                {!formData.electricityIncluded && (
                  <div className="sm:col-span-3 max-w-xs pt-1">
                    <Label className="text-amber-700 dark:text-amber-400">Electricity Rate (INR per Unit) *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.5"
                        required
                        placeholder="8"
                        value={formData.electricityRatePerUnit}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            electricityRatePerUnit: e.target.value,
                          })
                        }
                      />
                      <span className="text-xs text-neutral-600 dark:text-neutral-400 whitespace-nowrap">₹ / unit</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: Furnishing & Bed Configuration */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400 border-b border-[#e2dbcf] dark:border-neutral-800 pb-2">
                3. Furnishing & Bed Setup
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Furnishing Status *</Label>
                  <Select
                    value={formData.furnishingStatus}
                    onChange={(e) =>
                      setFormData({ ...formData, furnishingStatus: e.target.value })
                    }
                  >
                    <option value="Furnished">Furnished</option>
                    <option value="Semi-Furnished">Semi-Furnished</option>
                    <option value="Unfurnished">Unfurnished</option>
                  </Select>
                </div>
                <div>
                  <Label>Bed Configuration *</Label>
                  <Select
                    value={formData.bedConfiguration}
                    onChange={(e) =>
                      setFormData({ ...formData, bedConfiguration: e.target.value })
                    }
                  >
                    <option value="1 Bed">1 Bed</option>
                    <option value="2 Beds">2 Beds</option>
                    <option value="3 Beds">3 Beds</option>
                    <option value="4+ Beds">4+ Beds</option>
                    <option value="No Bed">No Bed (Unfurnished)</option>
                  </Select>
                </div>
              </div>
            </div>

            {/* Section 4: Location Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 border-b border-[#e2dbcf] dark:border-neutral-800 pb-2">
                4. Location & Address
              </h3>
              <div className="bg-[#f8f5ee] dark:bg-neutral-950/70 p-4 rounded-2xl border border-[#e2dbcf] dark:border-neutral-850 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label>Street Address / House No *</Label>
                    <Input
                      required
                      placeholder="e.g. Flat 302, Green Park Apartments"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Landmark</Label>
                    <Input
                      placeholder="Near City Metro Gate 3"
                      value={formData.landmark}
                      onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label>City *</Label>
                    <Input
                      required
                      placeholder="e.g. Noida / Haridwar / Delhi"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>State *</Label>
                    <Input
                      required
                      placeholder="e.g. Uttar Pradesh"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Pincode *</Label>
                    <Input
                      required
                      placeholder="201301"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: Facilities Checklist */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 border-b border-[#e2dbcf] dark:border-neutral-800 pb-2">
                5. Facilities Available (Select all that apply)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {FACILITY_OPTIONS.map((fac) => {
                  const selected = formData.facilities.includes(fac);
                  return (
                    <button
                      key={fac}
                      type="button"
                      onClick={() => toggleArrayItem('facilities', fac)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                        selected
                          ? 'bg-sky-500/20 border-sky-500 text-sky-800 dark:text-sky-300'
                          : 'bg-[#ede5da] dark:bg-neutral-900 border-[#d8cdbf] dark:border-neutral-800 text-neutral-700 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-[#e2dbcf] dark:hover:bg-neutral-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        readOnly
                        className="rounded accent-sky-500 pointer-events-none"
                      />
                      <span>{fac}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 6: House Rules & Permissions */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 border-b border-[#e2dbcf] dark:border-neutral-800 pb-2">
                6. House Permissions & Rules
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { key: 'drinkingAllowed', label: 'Drinking Allowed' },
                  { key: 'smokingAllowed', label: 'Smoking Allowed' },
                  { key: 'lateNightAllowed', label: 'Late Night Entry Allowed' },
                  { key: 'visitorsAllowed', label: 'Visitors Allowed' },
                  { key: 'petsAllowed', label: 'Pets Allowed' },
                  { key: 'nonVegAllowed', label: 'Non-Veg Food Allowed' },
                ].map((rule) => {
                  const active = Boolean(formData.rules[rule.key]);
                  return (
                    <button
                      key={rule.key}
                      type="button"
                      onClick={() => toggleRule(rule.key)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                        active
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-800 dark:text-emerald-300 font-semibold'
                          : 'bg-[#ede5da] dark:bg-neutral-900 border-[#d8cdbf] dark:border-neutral-800 text-neutral-700 dark:text-neutral-400 hover:bg-[#e2dbcf] dark:hover:bg-neutral-800'
                      }`}
                    >
                      <span>{rule.label}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          active
                            ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-neutral-950'
                            : 'bg-[#d8cdbf] text-neutral-800 dark:bg-neutral-800 dark:text-neutral-400'
                        }`}
                      >
                        {active ? 'YES' : 'NO'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 7: Suitable For Whom */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 border-b border-[#e2dbcf] dark:border-neutral-800 pb-2">
                7. Who is this Room Suitable For? *
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {SUITABLE_FOR_OPTIONS.map((option) => {
                  const selected = formData.suitableFor.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleArrayItem('suitableFor', option)}
                      className={`px-4 py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                        selected
                          ? 'bg-indigo-500/20 border-indigo-500 text-indigo-800 dark:text-indigo-300 shadow-xs'
                          : 'bg-[#ede5da] dark:bg-neutral-900 border-[#d8cdbf] dark:border-neutral-800 text-neutral-700 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-[#e2dbcf] dark:hover:bg-neutral-800'
                      }`}
                    >
                      {selected ? '✓ ' : '+ '}
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 8: Description */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 border-b border-[#e2dbcf] dark:border-neutral-800 pb-2">
                8. Detailed Description
              </h3>
              <div>
                <Label>Room & Neighborhood Description *</Label>
                <Textarea
                  required
                  rows={4}
                  placeholder="Detail room ventilation, sunlight, nearby colleges, metro walking distance, water availability timing, security, etc."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            {/* Section 9: Cloudinary Photos Upload */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 border-b border-[#e2dbcf] dark:border-neutral-800 pb-2">
                9. Room Photos (Max 6 Images)
              </h3>

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">Current Uploaded Photos:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {existingImages.map((url, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden border border-[#e2dbcf] dark:border-neutral-700 h-28 bg-[#f8f5ee] dark:bg-neutral-900">
                        <img src={url} alt={`Room ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(idx)}
                          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-600 text-white hover:bg-rose-500 transition cursor-pointer"
                          title="Remove photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Input */}
              <div className="p-4 rounded-2xl bg-[#f8f5ee] dark:bg-neutral-950 border border-[#e2dbcf] dark:border-neutral-800 space-y-2">
                <Label>Select Images to Upload</Label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setSelectedFiles(e.target.files)}
                  className="w-full text-xs text-neutral-600 dark:text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-neutral-900 file:text-white dark:file:bg-[#f5efe6] dark:file:text-neutral-950 hover:file:opacity-90 cursor-pointer bg-white dark:bg-neutral-900 border border-[#e2dbcf] dark:border-neutral-800 rounded-xl p-2"
                />
                {uploading && (
                  <p className="text-xs text-sky-600 dark:text-sky-400 animate-pulse font-semibold">
                    Uploading images to Cloudinary...
                  </p>
                )}
                {selectedFiles.length > 0 && !uploading && (
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    {selectedFiles.length} file(s) selected for upload.
                  </p>
                )}
              </div>
            </div>

            {/* Bottom Form Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[#e2dbcf] dark:border-neutral-800">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/owner/dashboard')}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting || uploading}
                className="w-full sm:w-auto bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-[#f5efe6] dark:hover:bg-white dark:text-neutral-950 font-black shadow-lg"
              >
                {submitting
                  ? 'Saving Room Listing...'
                  : id
                  ? 'Save & Submit for Admin Approval'
                  : 'Publish Room (Send to Admin)'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
