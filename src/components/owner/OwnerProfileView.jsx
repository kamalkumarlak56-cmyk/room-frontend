// client/src/components/owner/OwnerProfileView.jsx
import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Avatar, Badge, Button, Card, Input, Label } from '../ui/shadcn';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  Lock,
  Building2,
  ShieldCheck,
  CreditCard,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

export default function OwnerProfileView({ rooms = [], bookings = [] }) {
  const { user, updateProfile, refreshProfile, changePassword } = useAuth();

  // Personal Details Form
  const [personalForm, setPersonalForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    profilePic: user?.profilePic || '',
  });
  const [uploadingPic, setUploadingPic] = useState(false);
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [personalMsg, setPersonalMsg] = useState({ type: '', text: '' });

  // KYC Document Form
  const [docForm, setDocForm] = useState({
    documentType: user?.documentType || 'aadhar',
    aadharNumber: user?.aadharDetails?.number || '',
    aadharDocUrl: user?.aadharDetails?.documentUrl || '',
    panNumber: user?.panDetails?.number || '',
    panDocUrl: user?.panDetails?.documentUrl || '',
  });
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [savingDoc, setSavingDoc] = useState(false);
  const [docMsg, setDocMsg] = useState({ type: '', text: '' });

  // Password Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  // Sync state if user context updates
  useEffect(() => {
    if (user) {
      setPersonalForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        profilePic: user.profilePic || '',
      });
      setDocForm({
        documentType: user.documentType || 'aadhar',
        aadharNumber: user.aadharDetails?.number || '',
        aadharDocUrl: user.aadharDetails?.documentUrl || '',
        panNumber: user.panDetails?.number || '',
        panDocUrl: user.panDetails?.documentUrl || '',
      });
    }
  }, [user]);

  // Upload image to Cloudinary
  const handleCloudinaryUpload = async (file) => {
    const fd = new FormData();
    fd.append('images', file);
    const { data } = await API.post('/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.url || data.imageUrls?.[0];
  };

  // Upload Avatar
  const handlePicUpload = async (file) => {
    if (!file) return;
    try {
      setUploadingPic(true);
      const url = await handleCloudinaryUpload(file);
      if (url) {
        setPersonalForm((prev) => ({ ...prev, profilePic: url }));
        await updateProfile({ profilePic: url });
        setPersonalMsg({ type: 'success', text: 'Profile picture updated!' });
      }
    } catch (err) {
      setPersonalMsg({ type: 'error', text: 'Failed to upload photo.' });
    } finally {
      setUploadingPic(false);
    }
  };

  // Save Personal Details
  const handleSavePersonal = async (e) => {
    e.preventDefault();
    try {
      setSavingPersonal(true);
      setPersonalMsg({ type: '', text: '' });
      await updateProfile({
        name: personalForm.name.trim(),
        email: personalForm.email.trim(),
        phone: personalForm.phone.trim(),
        location: personalForm.location.trim(),
        profilePic: personalForm.profilePic,
      });
      await refreshProfile();
      setPersonalMsg({ type: 'success', text: 'Personal details updated successfully!' });
    } catch (err) {
      setPersonalMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update personal details.',
      });
    } finally {
      setSavingPersonal(false);
    }
  };

  // Upload KYC Document File
  const handleDocUpload = async (file) => {
    if (!file) return;
    try {
      setUploadingDoc(true);
      const url = await handleCloudinaryUpload(file);
      if (url) {
        if (docForm.documentType === 'aadhar') {
          setDocForm((prev) => ({ ...prev, aadharDocUrl: url }));
        } else {
          setDocForm((prev) => ({ ...prev, panDocUrl: url }));
        }
        setDocMsg({ type: 'success', text: 'KYC Document uploaded!' });
      }
    } catch (err) {
      setDocMsg({ type: 'error', text: 'Failed to upload KYC document.' });
    } finally {
      setUploadingDoc(false);
    }
  };

  // Save KYC Document
  const handleSaveDoc = async (e) => {
    e.preventDefault();
    setDocMsg({ type: '', text: '' });

    if (docForm.documentType === 'aadhar') {
      const clean = docForm.aadharNumber.replace(/[\s-]/g, '');
      if (!clean || clean.length !== 12 || !/^\d{12}$/.test(clean)) {
        setDocMsg({ type: 'error', text: 'Enter a valid 12-digit Aadhaar number.' });
        return;
      }
      if (!docForm.aadharDocUrl) {
        setDocMsg({ type: 'error', text: 'Please upload an image of your Aadhaar card.' });
        return;
      }
    } else {
      const clean = docForm.panNumber.trim().toUpperCase();
      if (!clean || clean.length !== 10 || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(clean)) {
        setDocMsg({ type: 'error', text: 'Enter a valid 10-character PAN number.' });
        return;
      }
      if (!docForm.panDocUrl) {
        setDocMsg({ type: 'error', text: 'Please upload an image of your PAN card.' });
        return;
      }
    }

    try {
      setSavingDoc(true);
      const payload = {
        documentType: docForm.documentType,
        documentVerified: true,
      };
      if (docForm.documentType === 'aadhar') {
        payload.aadharDetails = {
          number: docForm.aadharNumber.replace(/[\s-]/g, ''),
          documentUrl: docForm.aadharDocUrl,
        };
      } else {
        payload.panDetails = {
          number: docForm.panNumber.trim().toUpperCase(),
          documentUrl: docForm.panDocUrl,
        };
      }
      await updateProfile(payload);
      await refreshProfile();
      setDocMsg({ type: 'success', text: 'KYC verification submitted successfully!' });
    } catch (err) {
      setDocMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to submit KYC details.',
      });
    } finally {
      setSavingDoc(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (!passwordForm.currentPassword) {
      setPasswordMsg({ type: 'error', text: 'Enter your current password.' });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    try {
      setSavingPassword(true);
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordMsg({ type: 'success', text: 'Password updated successfully!' });
    } catch (err) {
      setPasswordMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to change password.',
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const hasDocVerified = Boolean(
    (user?.aadharDetails?.documentUrl && user?.aadharDetails?.number) ||
      (user?.panDetails?.documentUrl && user?.panDetails?.number)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#e2dbcf] dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <User className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Owner Profile & KYC Credentials
          </h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            Manage your personal contact info, landlord verification documents, and password settings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success" className="px-3 py-1 text-xs">
            <ShieldCheck className="w-3.5 h-3.5" /> Verified Landlord
          </Badge>
          {hasDocVerified ? (
            <Badge variant="cream" className="px-3 py-1 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> KYC Complete
            </Badge>
          ) : (
            <Badge variant="warning" className="px-3 py-1 text-xs font-bold">
              <AlertCircle className="w-3.5 h-3.5" /> KYC Pending
            </Badge>
          )}
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-white dark:bg-[#121316] border-[#e2dbcf] dark:border-neutral-800">
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Total Properties</p>
          <p className="text-2xl font-black text-neutral-900 dark:text-white mt-1 flex items-center gap-1.5">
            <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            {rooms.length}
          </p>
          <p className="text-[10px] text-neutral-500 mt-0.5">Listed rooms</p>
        </Card>

        <Card className="p-4 bg-white dark:bg-[#121316] border-[#e2dbcf] dark:border-neutral-800">
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Rent Bookings</p>
          <p className="text-2xl font-black text-neutral-900 dark:text-white mt-1 flex items-center gap-1.5">
            <CreditCard className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            {bookings.length}
          </p>
          <p className="text-[10px] text-neutral-500 mt-0.5">Paid transactions</p>
        </Card>

        <Card className="p-4 bg-white dark:bg-[#121316] border-[#e2dbcf] dark:border-neutral-800">
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Brokerage Paid</p>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
            <Sparkles className="w-5 h-5" />
            ₹0
          </p>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">100% Zero Broker</p>
        </Card>

        <Card className="p-4 bg-white dark:bg-[#121316] border-[#e2dbcf] dark:border-neutral-800">
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Account Role</p>
          <p className="text-base font-extrabold text-neutral-900 dark:text-white mt-1 capitalize">
            Property Owner
          </p>
          <p className="text-[10px] text-neutral-500 mt-0.5">Direct Rental Control</p>
        </Card>
      </div>

      {/* Main Grid: 3 Clean Form Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Personal Details */}
        <Card className="p-6 bg-white dark:bg-[#121316] border-[#e2dbcf] dark:border-neutral-800 space-y-5">
          <div className="pb-3 border-b border-[#e2dbcf] dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-neutral-900 dark:text-[#f5efe6]" />
              <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
                Personal Contact Details
              </h3>
            </div>
            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
              Landlord Identity
            </span>
          </div>

          {/* Profile Picture Uploader */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#f8f5ee] dark:bg-neutral-950/70 border border-[#e2dbcf] dark:border-neutral-800">
            <Avatar
              src={personalForm.profilePic}
              name={personalForm.name || 'Owner'}
              size="lg"
              className="border-2 border-emerald-500/50 flex-shrink-0"
            />
            <div className="space-y-1 min-w-0">
              <p className="text-xs font-bold text-neutral-900 dark:text-white">
                Profile Photo
              </p>
              <p className="text-[11px] text-neutral-500">
                Shown to prospective tenants and chat users.
              </p>
              <label className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-900 text-white dark:bg-[#f5efe6] dark:text-neutral-950 text-xs font-bold cursor-pointer hover:opacity-90 transition mt-1">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingPic ? 'Uploading...' : 'Upload New Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingPic}
                  onChange={(e) => handlePicUpload(e.target.files?.[0])}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Alerts */}
          {personalMsg.text && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                personalMsg.type === 'success'
                  ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-500/15 border border-rose-500/40 text-rose-800 dark:text-rose-300'
              }`}
            >
              {personalMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{personalMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleSavePersonal} className="space-y-4">
            <div>
              <Label>Full Name *</Label>
              <Input
                required
                value={personalForm.name}
                onChange={(e) => setPersonalForm({ ...personalForm, name: e.target.value })}
                placeholder="e.g. Vikram Verma"
              />
            </div>

            <div>
              <Label>Email Address *</Label>
              <Input
                type="email"
                required
                value={personalForm.email}
                onChange={(e) => setPersonalForm({ ...personalForm, email: e.target.value })}
                placeholder="owner@domain.com"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Phone Number *</Label>
                <Input
                  required
                  value={personalForm.phone}
                  onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <Label>City / Operating Area</Label>
                <Input
                  value={personalForm.location}
                  onChange={(e) => setPersonalForm({ ...personalForm, location: e.target.value })}
                  placeholder="e.g. Noida / Delhi"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                disabled={savingPersonal}
                className="bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-[#f5efe6] dark:hover:bg-white dark:text-neutral-950 font-bold"
              >
                {savingPersonal ? 'Saving...' : 'Save Personal Details'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Section 2: KYC Identity & Document Verification */}
        <Card className="p-6 bg-white dark:bg-[#121316] border-[#e2dbcf] dark:border-neutral-800 space-y-5">
          <div className="pb-3 border-b border-[#e2dbcf] dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
                Government KYC & Identity
              </h3>
            </div>
            {hasDocVerified ? (
              <Badge variant="success" className="text-[10px]">
                <CheckCircle2 className="w-3 h-3" /> Verified
              </Badge>
            ) : (
              <Badge variant="warning" className="text-[10px]">
                Verification Required
              </Badge>
            )}
          </div>

          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Upload your Aadhaar or PAN card. Verified owner profiles receive the trusted green badge and attract 3x more tenants.
          </p>

          {/* Alerts */}
          {docMsg.text && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                docMsg.type === 'success'
                  ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-500/15 border border-rose-500/40 text-rose-800 dark:text-rose-300'
              }`}
            >
              {docMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{docMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleSaveDoc} className="space-y-4">
            <div>
              <Label>Select Verification Document</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDocForm({ ...docForm, documentType: 'aadhar' })}
                  className={`p-3 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                    docForm.documentType === 'aadhar'
                      ? 'bg-neutral-900 text-white dark:bg-[#f5efe6] dark:text-neutral-950 shadow-xs'
                      : 'bg-[#f8f5ee] dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 border-[#e2dbcf] dark:border-neutral-800'
                  }`}
                >
                  <FileText className="w-4 h-4" /> Aadhaar Card
                </button>
                <button
                  type="button"
                  onClick={() => setDocForm({ ...docForm, documentType: 'pan' })}
                  className={`p-3 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                    docForm.documentType === 'pan'
                      ? 'bg-neutral-900 text-white dark:bg-[#f5efe6] dark:text-neutral-950 shadow-xs'
                      : 'bg-[#f8f5ee] dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 border-[#e2dbcf] dark:border-neutral-800'
                  }`}
                >
                  <FileText className="w-4 h-4" /> PAN Card
                </button>
              </div>
            </div>

            {docForm.documentType === 'aadhar' ? (
              <div>
                <Label>12-Digit Aadhaar Number *</Label>
                <Input
                  required
                  placeholder="e.g. 5432 1098 7654"
                  value={docForm.aadharNumber}
                  onChange={(e) => setDocForm({ ...docForm, aadharNumber: e.target.value })}
                />
              </div>
            ) : (
              <div>
                <Label>10-Digit PAN Number *</Label>
                <Input
                  required
                  placeholder="e.g. ABCDE1234F"
                  value={docForm.panNumber}
                  onChange={(e) => setDocForm({ ...docForm, panNumber: e.target.value })}
                />
              </div>
            )}

            {/* Document Upload Area */}
            <div className="p-4 rounded-2xl bg-[#f8f5ee] dark:bg-neutral-950/70 border border-[#e2dbcf] dark:border-neutral-800 space-y-2">
              <Label>
                Upload {docForm.documentType === 'aadhar' ? 'Aadhaar' : 'PAN'} Document Photo *
              </Label>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 text-white dark:bg-[#f5efe6] dark:text-neutral-950 text-xs font-bold cursor-pointer hover:opacity-90 transition">
                  <Upload className="w-4 h-4" />
                  <span>{uploadingDoc ? 'Uploading...' : 'Choose File'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingDoc}
                    onChange={(e) => handleDocUpload(e.target.files?.[0])}
                    className="hidden"
                  />
                </label>
                <span className="text-xs text-neutral-500">
                  {docForm.documentType === 'aadhar'
                    ? docForm.aadharDocUrl
                      ? '✓ Aadhaar image attached'
                      : 'No file selected'
                    : docForm.panDocUrl
                    ? '✓ PAN image attached'
                    : 'No file selected'}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                disabled={savingDoc || uploadingDoc}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              >
                {savingDoc ? 'Submitting...' : 'Submit & Verify KYC'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Section 3: Password & Security */}
        <Card className="p-6 bg-white dark:bg-[#121316] border-[#e2dbcf] dark:border-neutral-800 space-y-5 lg:col-span-2 max-w-xl">
          <div className="pb-3 border-b border-[#e2dbcf] dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
                Change Password & Credentials
              </h3>
            </div>
            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
              Security
            </span>
          </div>

          {/* Alerts */}
          {passwordMsg.text && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                passwordMsg.type === 'success'
                  ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-500/15 border border-rose-500/40 text-rose-800 dark:text-rose-300'
              }`}
            >
              {passwordMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{passwordMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <Label>Current Password *</Label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? 'text' : 'password'}
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  placeholder="Enter current password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>New Password *</Label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                    placeholder="Min 6 characters"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label>Confirm New Password *</Label>
                <Input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  placeholder="Re-enter new password"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                disabled={savingPassword}
                className="bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-[#f5efe6] dark:hover:bg-white dark:text-neutral-950 font-bold"
              >
                {savingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
