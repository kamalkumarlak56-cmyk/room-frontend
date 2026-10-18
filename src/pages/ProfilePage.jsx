// client/src/pages/ProfilePage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import API from '../api/axios';
import RoomCard from '../components/RoomCard';
import RoomDetailsModal from '../components/RoomDetailsModal';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Dialog,
  Input,
  Label,
  Textarea,
} from '../components/ui/shadcn';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Pencil,
  FileText,
  CreditCard,
  Upload,
  CheckCircle2,
  AlertCircle,
  Building2,
  History,
  Eye,
  EyeOff,
  IndianRupee,
  Loader2,
  Lock,
  Plus,
  Trash2,
  ExternalLink,
  LogOut,
  Sun,
  Moon,
  Palette,
  ShieldCheck,
  RefreshCw,
  Calendar,
  MessageSquare,
  Search,
  Star,
  Landmark,
} from 'lucide-react';

export const getRoleDisplayName = (role) => {
  if (!role) return 'Tenant / User';
  const r = role.toLowerCase();
  if (r === 'admin') return 'Admin';
  if (r === 'owner' || r === 'landlord') return 'Owner';
  return 'Tenant / User';
};

export default function ProfilePage() {
  const { user, updateProfile, refreshProfile, changePassword, logout } = useAuth();
  const { setTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  // Active section in left nav:
  // 'overview' (DEFAULT on enter) | 'edit-profile' | 'document' | 'password' | 'visited' | 'older'
  const [activeSection, setActiveSection] = useState(() => {
    const s = searchParams.get('section') || searchParams.get('tab');
    if (s) return s;
    return 'overview';
  });

  useEffect(() => {
    const s = searchParams.get('section') || searchParams.get('tab');
    if (s) {
      setActiveSection(s);
    }
  }, [searchParams]);

  // 1. Edit Profile Form State (Supports admin credentials and password as well)
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    profilePic: '',
    role: 'user',
    password: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [uploadingPic, setUploadingPic] = useState(false);

  // 2. Document KYC State
  const [docForm, setDocForm] = useState({
    documentType: 'aadhar', // 'aadhar' | 'pan'
    aadharNumber: '',
    aadharDocUrl: '',
    panNumber: '',
    panDocUrl: '',
  });
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [savingDoc, setSavingDoc] = useState(false);
  const [docSuccess, setDocSuccess] = useState('');
  const [docError, setDocError] = useState('');
  const [isEditingDoc, setIsEditingDoc] = useState(false);

  // Bank Account State
  const [bankForm, setBankForm] = useState({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
  });
  const [savingBank, setSavingBank] = useState(false);
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [bankSuccess, setBankSuccess] = useState('');
  const [bankError, setBankError] = useState('');

  // 3. Change Password Form State (Verifies older password first)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // 4. Older Residences Modal & State
  const [isAddOlderOpen, setIsAddOlderOpen] = useState(false);
  const [olderForm, setOlderForm] = useState({
    title: '',
    location: '',
    rent: '',
    stayDuration: '',
    notes: '',
  });
  const [savingOlder, setSavingOlder] = useState(false);

  // 5. Rating & Review Modal State (Allowed after 1 month of living)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [simulateMonth, setSimulateMonth] = useState(false);

  // Room details modal
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [modalTab, setModalTab] = useState('details');

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/auth/profile');
      setProfile(data);

      setEditForm({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        location: data.location || '',
        profilePic: data.profilePic || '',
        role: data.role || 'user',
        password: '',
      });

      const initialDocType =
        data.documentType === 'pan'
          ? 'pan'
          : data.documentType === 'aadhar'
          ? 'aadhar'
          : data.panDetails?.number || data.panDetails?.documentUrl
          ? 'pan'
          : 'aadhar';

      setDocForm({
        documentType: initialDocType,
        aadharNumber: data.aadharDetails?.number || '',
        aadharDocUrl: data.aadharDetails?.documentUrl || '',
        panNumber: data.panDetails?.number || '',
        panDocUrl: data.panDetails?.documentUrl || '',
      });

      setBankForm({
        accountHolderName: data.accountDetails?.accountHolderName || '',
        bankName: data.accountDetails?.bankName || '',
        accountNumber: data.accountDetails?.accountNumber || '',
        ifscCode: data.accountDetails?.ifscCode || '',
        upiId: data.accountDetails?.upiId || '',
      });
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (activeSection === 'theme') {
      setActiveSection('overview');
    }
    const isOwnerOrAdmin =
      (profile?.role || user?.role) === 'owner' ||
      (profile?.role || user?.role) === 'landlord' ||
      (profile?.role || user?.role) === 'admin';
    if (isOwnerOrAdmin && ['visited', 'older'].includes(activeSection)) {
      setActiveSection('overview');
    }
  }, [profile?.role, user?.role, activeSection]);

  // Upload image to Cloudinary
  const handleCloudinaryUpload = async (file, onDone) => {
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append('images', file);
      const { data } = await API.post('/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const uploadedUrl = data.url || data.imageUrls?.[0];
      if (uploadedUrl && onDone) {
        onDone(uploadedUrl);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'File upload failed');
    }
  };

  // Upload Profile Picture
  const handleProfilePicUpload = async (file) => {
    if (!file) return;
    try {
      setUploadingPic(true);
      await handleCloudinaryUpload(file, (url) => {
        setEditForm((prev) => ({ ...prev, profilePic: url }));
      });
    } finally {
      setUploadingPic(false);
    }
  };

  // Upload KYC Document
  const handleDocumentFileUpload = async (file, targetField) => {
    if (!file) return;
    try {
      setUploadingDoc(true);
      await handleCloudinaryUpload(file, (url) => {
        setDocForm((prev) => ({ ...prev, [targetField]: url }));
      });
    } finally {
      setUploadingDoc(false);
    }
  };

  // Switch role to Owner ("Be Owner" button in header card)
  const handleBecomeOwner = async () => {
    if (
      !window.confirm(
        'Do you want to become a Property Owner? This will allow you to list rooms and manage rental properties.'
      )
    ) {
      return;
    }
    try {
      setSavingProfile(true);
      await updateProfile({ role: 'owner' });
      await loadProfile();
      if (refreshProfile) await refreshProfile();
      alert('Congratulations! Your account is now upgraded to Property Owner. You can access the Owner Panel to list properties.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update account role.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Switch role back to User ("Be User" button in header card) and redirect to homepage
  const handleBecomeUser = async () => {
    try {
      setSavingProfile(true);
      await updateProfile({ role: 'user' });
      await loadProfile();
      if (refreshProfile) await refreshProfile();
    } catch (err) {
      console.error('Failed to update account role:', err);
    } finally {
      setSavingProfile(false);
      navigate('/');
    }
  };

  // 1. Save Profile Details (Name, email, phone, location, photo, role)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess('');
    setProfileError('');

    try {
      const payload = {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim(),
        profilePic: editForm.profilePic,
        role: editForm.role || (isAdmin ? 'admin' : 'user'),
      };

      if (editForm.location) {
        payload.location = editForm.location.trim();
      }

      if (editForm.password && editForm.password.trim().length > 0) {
        payload.password = editForm.password.trim();
      }

      await updateProfile(payload);
      await loadProfile();
      if (refreshProfile) await refreshProfile();

      setProfileSuccess(isAdmin ? 'Admin credentials updated successfully!' : 'Profile details updated successfully!');
      setTimeout(() => {
        setProfileSuccess('');
        setActiveSection('overview');
      }, 1500);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile details.');
    } finally {
      setSavingProfile(false);
    }
  };

  // 2. Upload and Verify Document (Aadhaar or PAN)
  const handleSaveDocument = async (e) => {
    e.preventDefault();
    setDocError('');
    setDocSuccess('');

    if (docForm.documentType === 'aadhar') {
      const cleanAadhaar = docForm.aadharNumber.replace(/[\s-]/g, '');
      if (!cleanAadhaar || cleanAadhaar.length !== 12 || !/^\d{12}$/.test(cleanAadhaar)) {
        setDocError('Please enter a valid 12-digit Aadhaar number.');
        return;
      }
      if (!docForm.aadharDocUrl) {
        setDocError('Please upload a photo/file of your Aadhaar card.');
        return;
      }
    } else if (docForm.documentType === 'pan') {
      const cleanPan = docForm.panNumber.trim().toUpperCase();
      if (!cleanPan || cleanPan.length !== 10 || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPan)) {
        setDocError('Please enter a valid 10-character PAN number (e.g. ABCDE1234F).');
        return;
      }
      if (!docForm.panDocUrl) {
        setDocError('Please upload a photo/file of your PAN card.');
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
      await loadProfile();
      if (refreshProfile) await refreshProfile();

      setIsEditingDoc(false);
      setDocSuccess('Document verified successfully!');
      setTimeout(() => setDocSuccess(''), 5000);
    } catch (err) {
      setDocError(err.response?.data?.message || 'Failed to verify and save document.');
    } finally {
      setSavingDoc(false);
    }
  };

  // 2b. Save Bank Account Details
  const handleSaveBank = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setBankError('');
    setBankSuccess('');

    if (!bankForm.accountHolderName.trim()) {
      setBankError('Please enter Account Holder Name.');
      return;
    }
    if (!bankForm.bankName.trim()) {
      setBankError('Please enter Bank Name.');
      return;
    }
    if (!bankForm.accountNumber.trim()) {
      setBankError('Please enter Bank Account Number.');
      return;
    }
    if (!bankForm.ifscCode.trim()) {
      setBankError('Please enter a valid IFSC Code.');
      return;
    }

    try {
      setSavingBank(true);
      await updateProfile({
        accountDetails: {
          accountHolderName: bankForm.accountHolderName.trim(),
          bankName: bankForm.bankName.trim(),
          accountNumber: bankForm.accountNumber.trim(),
          ifscCode: bankForm.ifscCode.trim().toUpperCase(),
          upiId: bankForm.upiId.trim(),
        },
      });
      await loadProfile();
      if (refreshProfile) await refreshProfile();

      setIsEditingBank(false);
      setBankSuccess('Bank account details updated successfully!');
      setTimeout(() => setBankSuccess(''), 5000);
    } catch (err) {
      setBankError(err.response?.data?.message || 'Failed to update bank account details.');
    } finally {
      setSavingBank(false);
    }
  };

  // 3. Change Password (Verifies older password, enters new & confirm password)
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordForm.currentPassword) {
      setPasswordError('Please enter your current / older password.');
      return;
    }
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setPasswordError('New password must be different from your older password.');
      return;
    }

    try {
      setSavingPassword(true);
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });

      setPasswordSuccess('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => setPasswordSuccess(''), 5000);
    } catch (err) {
      setPasswordError(
        err.response?.data?.message ||
          'Failed to change password. Please verify that your older password is correct.'
      );
    } finally {
      setSavingPassword(false);
    }
  };

  // 4. Rate & Review Submission
  const openReviewModal = (booking) => {
    setReviewBooking(booking);
    setReviewRating(booking.review?.rating || 5);
    setReviewComment(booking.review?.comment || '');
    setReviewError('');
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewBooking?.room?._id) return;

    if (!reviewRating || reviewRating < 1 || reviewRating > 5) {
      setReviewError('Please select a star rating between 1 and 5.');
      return;
    }

    if (!reviewComment.trim()) {
      setReviewError('Please write your review comment.');
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewError('');
      await API.post(`/rooms/${reviewBooking.room._id}/reviews`, {
        rating: Number(reviewRating),
        comment: reviewComment.trim(),
        bookingId: reviewBooking._id,
        simulateMonth,
      });

      await loadProfile();
      setIsReviewModalOpen(false);
      alert('Thank you! Your rating and review has been submitted.');
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Add older residence
  const handleAddOlderRoom = async (e) => {
    e.preventDefault();
    if (!olderForm.title.trim()) return;

    try {
      setSavingOlder(true);
      await API.post('/auth/older', {
        title: olderForm.title.trim(),
        location: olderForm.location.trim(),
        rent: Number(olderForm.rent) || 0,
        stayDuration: olderForm.stayDuration.trim(),
        notes: olderForm.notes.trim(),
      });
      setOlderForm({
        title: '',
        location: '',
        rent: '',
        stayDuration: '',
        notes: '',
      });
      setIsAddOlderOpen(false);
      await loadProfile();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add previous residence');
    } finally {
      setSavingOlder(false);
    }
  };

  const handleRemoveOlderRoom = async (olderId) => {
    if (!window.confirm('Remove this previous residence record?')) return;
    try {
      await API.delete(`/auth/older/${olderId}`);
      await loadProfile();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove entry');
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center gap-2 ${isDark ? 'bg-[#0a0b0d] text-neutral-400' : 'bg-[#f9f6f0] text-neutral-600'}`}>
        <Loader2 className="w-6 h-6 animate-spin text-[#d8cdbf]" />
        Loading profile...
      </div>
    );
  }

  // Visited rooms list
  const visitedRoomsList = (profile?.visitedRooms || [])
    .map((item) => ({
      ...item.room,
      visitedAt: item.visitedAt,
      visitNotes: item.notes,
    }))
    .filter((r) => r && r._id);

  // Booked rooms list (paid bookings) - one user can only book one room at once!
  const bookedRoomsList = profile?.paidBookings || [];
  const activeBookedRoom = bookedRoomsList.length > 0 ? bookedRoomsList[0] : null;

  // Calculate living duration for the booked room
  let daysLived = 0;
  let hasCompletedOneMonth = false;
  let daysRemaining = 30;

  if (activeBookedRoom) {
    const livingStartDate = activeBookedRoom.moveInDate
      ? new Date(activeBookedRoom.moveInDate)
      : new Date(activeBookedRoom.createdAt);
    const msLived = Date.now() - livingStartDate.getTime();
    daysLived = Math.max(0, Math.floor(msLived / (1000 * 60 * 60 * 24)));
    hasCompletedOneMonth = daysLived >= 30;
    daysRemaining = Math.max(0, 30 - daysLived);
  }

  // Combine olderRooms and paidBookings for rental history
  const paidBookingsAsOlder = bookedRoomsList.map((b) => ({
    _id: `booking-${b._id}`,
    isBooking: true,
    title: b.room?.title || 'Booked Residence',
    location: b.room?.location
      ? `${b.room.location.address}, ${b.room.location.city}`
      : 'Confirmed Booking Address',
    rent: b.amount,
    stayDuration: b.moveInDate ? `Moved in on ${b.moveInDate}` : 'Booked Stay',
    room: b.room,
    landlord: b.landlord,
    createdAt: b.createdAt,
  }));

  const customOlderRooms = (profile?.olderRooms || []).map((item) => ({
    _id: item._id,
    isBooking: false,
    title: item.title,
    location: item.location,
    rent: item.rent,
    stayDuration: item.stayDuration,
    notes: item.notes,
    room: item.room,
    addedAt: item.addedAt,
  }));

  const allOlderRooms = [...paidBookingsAsOlder, ...customOlderRooms];

  // Check if user has uploaded a document
  const hasAadhaar = Boolean(
    profile?.documentType === 'aadhar' &&
      (profile?.aadharDetails?.documentUrl || profile?.aadharDetails?.number)
  );
  const hasPan = Boolean(
    profile?.documentType === 'pan' &&
      (profile?.panDetails?.documentUrl || profile?.panDetails?.number)
  );
  const hasDocument = hasAadhaar || hasPan;
  const activeDocType = hasPan ? 'pan' : hasAadhaar ? 'aadhar' : null;
  const activeDocNumber =
    activeDocType === 'aadhar'
      ? profile?.aadharDetails?.number
      : activeDocType === 'pan'
      ? profile?.panDetails?.number
      : '';
  const activeDocUrl =
    activeDocType === 'aadhar'
      ? profile?.aadharDetails?.documentUrl
      : activeDocType === 'pan'
      ? profile?.panDetails?.documentUrl
      : '';

  const currentRole = profile?.role || user?.role;
  const isOwner = currentRole === 'owner' || currentRole === 'landlord';
  const isAdmin = currentRole === 'admin';

  return (
    <div
      className={`min-h-screen p-3 sm:p-5 max-w-7xl mx-auto space-y-5 pb-20 pt-3 sm:pt-4 transition-colors ${
        isDark ? 'bg-[#0a0b0d] text-neutral-100' : 'bg-[#f9f6f0] text-neutral-900'
      }`}
    >
      {/* Top Header Bar */}
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b ${isDark ? 'border-neutral-800' : 'border-[#e2dbcf]'}`}>
        <div>
          <h1 className={`text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-2.5 ${isDark ? 'text-white' : 'text-neutral-950'}`}>
            <User className={`w-6 h-6 ${isDark ? 'text-[#f5efe6]' : 'text-neutral-900'}`} />
            User Account & Profile
          </h1>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
            Manage your personal profile, identity documents, security credentials, and preferences.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="cream" className="text-xs px-2.5 py-0.5 font-semibold">
            {getRoleDisplayName(profile?.role || user?.role)}
          </Badge>
          {!isAdmin && (
            hasDocument ? (
              <Badge variant="success" className="text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
              </Badge>
            ) : (
              <Badge variant="warning" className="text-xs">
                <AlertCircle className="w-3.5 h-3.5" /> KYC Pending
              </Badge>
            )
          )}
        </div>
      </div>

      {/* Main Grid: Left Navigation (Sidebar) + Right Content Pane */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* =========================================================================
            LEFT NAVIGATION SIDEBAR
            ========================================================================= */}
        <div className="md:col-span-4 lg:col-span-3 space-y-3.5">
          {/* User Profile Summary Card */}
          <Card className={`p-4 rounded-2xl relative overflow-hidden shadow-md border ${isDark ? 'bg-[#121316] border-neutral-800' : 'bg-white border-[#e2dbcf]'}`}>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar
                  src={profile?.profilePic}
                  name={profile?.name || user?.name}
                  size="lg"
                  className={`w-13 h-13 ring-2 ${isDark ? 'ring-neutral-700' : 'ring-neutral-200'}`}
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 rounded-full" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-neutral-950'}`}>
                  {profile?.name || user?.name || 'User'}
                </h2>
                <p className={`text-xs truncate ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  {profile?.email || user?.email}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Badge
                    variant="purple"
                    data-role-badge
                    className={`text-[10px] uppercase font-bold tracking-wider ${
                      isDark
                        ? '!text-white !bg-neutral-900 !border-neutral-700'
                        : '!text-neutral-950 !bg-[#f5efe6] !border-[#d8cdbf]'
                    }`}
                  >
                    {getRoleDisplayName(profile?.role || user?.role)}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Left Nav Menu Card */}
          <Card className={`p-1.5 rounded-2xl shadow-lg space-y-1 border ${isDark ? 'bg-[#121316] border-neutral-800' : 'bg-white border-[#e2dbcf]'}`}>
            {/* 1. Profile Overview (Default View) */}
            <button
              type="button"
              onClick={() => setActiveSection('overview')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                activeSection === 'overview'
                  ? 'bg-[#f5efe6] text-neutral-950 shadow-xs'
                  : isDark
                    ? 'text-neutral-300 hover:text-white hover:bg-neutral-800/80'
                    : 'text-neutral-700 hover:text-neutral-950 hover:bg-[#ede5da]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4" />
                <span>Profile Details</span>
              </div>
            </button>

            {/* 2. Edit Profile */}
            <button
              type="button"
              onClick={() => setActiveSection('edit-profile')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                activeSection === 'edit-profile'
                  ? 'bg-[#f5efe6] text-neutral-950 shadow-xs'
                  : isDark
                    ? 'text-neutral-300 hover:text-white hover:bg-neutral-800/80'
                    : 'text-neutral-700 hover:text-neutral-950 hover:bg-[#ede5da]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Pencil className="w-4 h-4" />
                <span>Edit Profile</span>
              </div>
            </button>

            {/* 3. Document - Shown for Tenant & Owner, removed for Admin */}
            {!isAdmin && (
              <button
                type="button"
                onClick={() => setActiveSection('document')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                  activeSection === 'document'
                    ? 'bg-[#f5efe6] text-neutral-950 shadow-xs'
                    : isDark
                      ? 'text-neutral-300 hover:text-white hover:bg-neutral-800/80'
                      : 'text-neutral-700 hover:text-neutral-950 hover:bg-[#ede5da]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4" />
                  <span>Document</span>
                </div>
                {hasDocument ? (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                      activeSection === 'document'
                        ? 'bg-neutral-900 text-emerald-400'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    Verified
                  </span>
                ) : (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                      activeSection === 'document'
                        ? isDark
                          ? 'bg-neutral-900 text-amber-400'
                          : 'bg-white text-amber-950 border border-neutral-300'
                        : isDark
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-amber-100 text-amber-950 border border-amber-300'
                    }`}
                  >
                    Pending
                  </span>
                )}
              </button>
            )}

            {/* 4. Change Password */}
            <button
              type="button"
              onClick={() => setActiveSection('password')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                activeSection === 'password'
                  ? 'bg-[#f5efe6] text-neutral-950 shadow-xs'
                  : isDark
                    ? 'text-neutral-300 hover:text-white hover:bg-neutral-800/80'
                    : 'text-neutral-700 hover:text-neutral-950 hover:bg-[#ede5da]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4" />
                <span>Change Password</span>
              </div>
            </button>

            {/* 5. Visited Rooms, 6. Rental History, 7. Theme - Shown ONLY for Tenants/Users, hidden for Property Owners & Admins */}
            {!isOwner && !isAdmin && (
              <>
                {/* 5. Visited Rooms */}
                <button
                  type="button"
                  onClick={() => setActiveSection('visited')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                    activeSection === 'visited'
                      ? 'bg-[#f5efe6] text-neutral-950 shadow-xs'
                      : isDark
                        ? 'text-neutral-300 hover:text-white hover:bg-neutral-800/80'
                        : 'text-neutral-700 hover:text-neutral-950 hover:bg-[#ede5da]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Visited Rooms</span>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold transition-all shadow-xs ${
                      activeSection === 'visited'
                        ? 'bg-white text-neutral-950 border border-neutral-300'
                        : isDark
                        ? 'bg-neutral-800 text-neutral-300 border border-neutral-700/60'
                        : 'bg-neutral-200 text-neutral-700 border border-neutral-300/60'
                    }`}
                  >
                    {visitedRoomsList.length}
                  </span>
                </button>

                {/* 6. Rental History / Older Rooms */}
                <button
                  type="button"
                  onClick={() => setActiveSection('older')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                    activeSection === 'older'
                      ? 'bg-[#f5efe6] text-neutral-950 shadow-xs'
                      : isDark
                        ? 'text-neutral-300 hover:text-white hover:bg-neutral-800/80'
                        : 'text-neutral-700 hover:text-neutral-950 hover:bg-[#ede5da]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <History className="w-4 h-4 text-[#d8cdbf]" />
                    <span>Rental History</span>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold transition-all shadow-xs ${
                      activeSection === 'older'
                        ? 'bg-white text-neutral-950 border border-neutral-300'
                        : isDark
                        ? 'bg-neutral-800 text-neutral-300 border border-neutral-700/60'
                        : 'bg-neutral-200 text-neutral-700 border border-neutral-300/60'
                    }`}
                  >
                    {allOlderRooms.length}
                  </span>
                </button>
              </>
            )}

            {/* Divider */}
            <div className={`pt-1.5 border-t my-1 ${isDark ? 'border-neutral-800' : 'border-[#e2dbcf]'}`} />

            {/* 8. Logout Button placed in Left Nav */}
            <Button
              variant="destructive"
              size="default"
              onClick={handleLogout}
              className="w-full justify-start gap-2.5 text-xs sm:text-sm font-semibold cursor-pointer shadow-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </Card>
        </div>

        {/* =========================================================================
            RIGHT MAIN CONTENT AREA
            ========================================================================= */}
        <div className="md:col-span-8 lg:col-span-9 space-y-5">
          {/* =========================================================================
              SECTION: PROFILE OVERVIEW (DEFAULT VIEW ON ENTER)
              Shows profile details like profilePic, name, email, phone, location, role,
              KYC status, and his booked rooms! DOES NOT show edit form directly!
              ========================================================================= */}
          {activeSection === 'overview' && (
            <div className="space-y-5">
              {/* Profile Details Card (Matching Uploaded Image Section, with "Be Owner" button) */}
              <Card className={`p-5 sm:p-6 rounded-2xl shadow-xl border ${isDark ? 'bg-[#121316] border-neutral-800' : 'bg-white border-[#e2dbcf]'}`}>
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b ${isDark ? 'border-neutral-800' : 'border-[#e2dbcf]'}`}>
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={profile?.profilePic}
                      name={profile?.name || user?.name}
                      size="xl"
                      className={`w-18 h-18 sm:w-20 sm:h-20 ring-4 ${isDark ? 'ring-neutral-700' : 'ring-neutral-200'} shadow-lg`}
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className={`text-xl sm:text-2xl font-extrabold ${isDark ? 'text-white' : 'text-neutral-950'}`}>
                          {profile?.name || user?.name || 'User'}
                        </h2>
                        <Badge
                          variant="purple"
                          data-role-badge
                          className={`text-xs uppercase font-bold tracking-wider ${
                            isDark
                              ? '!text-white !bg-neutral-900 !border-neutral-700'
                              : '!text-neutral-950 !bg-[#f5efe6] !border-[#d8cdbf]'
                          }`}
                        >
                          {getRoleDisplayName(profile?.role || user?.role)}
                        </Badge>
                      </div>
                      <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                        {profile?.email || user?.email}
                      </p>
                      {!isAdmin && (
                        <div className="mt-2">
                          {hasDocument ? (
                            <Badge variant="success" className="text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5" /> {activeDocType === 'aadhar' ? 'Aadhaar Verified' : 'PAN Verified'}
                            </Badge>
                          ) : (
                            <Badge variant="warning" className="text-xs">
                              <AlertCircle className="w-3.5 h-3.5" /> KYC Document Pending
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* "Be Owner" / "Be User" button */}
                  {(profile?.role || user?.role) === 'user' ? (
                    <Button
                      variant="default"
                      size="default"
                      onClick={handleBecomeOwner}
                      disabled={savingProfile}
                      className="gap-2 self-start sm:self-auto cursor-pointer font-bold shadow-md bg-[#f5efe6] text-neutral-950 hover:bg-[#eae2d5]"
                    >
                      <Building2 className="w-4 h-4 text-amber-600" />
                      {savingProfile ? 'Upgrading...' : 'Be Owner'}
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="default"
                      onClick={handleBecomeUser}
                      disabled={savingProfile}
                      className="gap-2 self-start sm:self-auto cursor-pointer font-bold shadow-md bg-[#f5efe6] text-neutral-950 hover:bg-[#eae2d5]"
                    >
                      <User className="w-4 h-4 text-sky-600" />
                      {savingProfile ? 'Redirecting...' : 'Be User'}
                    </Button>
                  )}
                </div>

                {/* Profile Information Key-Value Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-5">
                  <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-[#0f1013] border-neutral-800' : 'bg-[#f8f5ee] border-[#e2dbcf]'}`}>
                    <div className="flex items-center gap-2 text-xs font-medium text-neutral-400 mb-1">
                      <Mail className="w-4 h-4 text-[#d8cdbf]" />
                      <span>Email Address</span>
                    </div>
                    <p className={`text-sm font-semibold truncate ${isDark ? 'text-neutral-100' : 'text-neutral-900'}`}>
                      {profile?.email || 'Not provided'}
                    </p>
                  </div>

                  <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-[#0f1013] border-neutral-800' : 'bg-[#f8f5ee] border-[#e2dbcf]'}`}>
                    <div className="flex items-center gap-2 text-xs font-medium text-neutral-400 mb-1">
                      <Phone className="w-4 h-4 text-emerald-400" />
                      <span>Phone Number</span>
                    </div>
                    <p className={`text-sm font-semibold ${isDark ? 'text-neutral-100' : 'text-neutral-900'}`}>
                      {profile?.phone || 'Not provided'}
                    </p>
                  </div>

                  <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-[#0f1013] border-neutral-800' : 'bg-[#f8f5ee] border-[#e2dbcf]'}`}>
                    <div className="flex items-center gap-2 text-xs font-medium text-neutral-400 mb-1">
                      <MapPin className="w-4 h-4 text-rose-400" />
                      <span>Location</span>
                    </div>
                    <p className={`text-sm font-semibold ${isDark ? 'text-neutral-100' : 'text-neutral-900'}`}>
                      {profile?.location || 'Not specified'}
                    </p>
                  </div>

                  <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-[#0f1013] border-neutral-800' : 'bg-[#f8f5ee] border-[#e2dbcf]'}`}>
                    <div className="flex items-center gap-2 text-xs font-medium text-neutral-400 mb-1">
                      <FileText className="w-4 h-4 text-sky-400" />
                      <span>Identity Document (KYC)</span>
                    </div>
                    <p className={`text-sm font-semibold ${isDark ? 'text-neutral-100' : 'text-neutral-900'}`}>
                      {hasDocument
                        ? `${activeDocType === 'aadhar' ? 'Aadhaar' : 'PAN'} (${activeDocNumber || 'Verified'})`
                        : 'No document uploaded'}
                    </p>
                  </div>

                  <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-[#0f1013] border-neutral-800' : 'bg-[#f8f5ee] border-[#e2dbcf]'}`}>
                    <div className="flex items-center gap-2 text-xs font-medium text-neutral-400 mb-1">
                      <Calendar className="w-4 h-4 text-amber-400" />
                      <span>Account Role</span>
                    </div>
                    <p className={`text-sm font-semibold capitalize ${isDark ? 'text-neutral-100' : 'text-neutral-950'}`}>
                      {getRoleDisplayName(profile?.role || user?.role)}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Booked Room Section: Displayed directly below user details card for tenant users with active booking! */}
              {!isOwner && !isAdmin && activeBookedRoom && (
                <Card className={`p-5 sm:p-6 rounded-2xl shadow-xl border ${isDark ? 'bg-[#121316] border-neutral-800' : 'bg-white border-[#e2dbcf]'}`}>
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b ${isDark ? 'border-neutral-800' : 'border-[#e2dbcf]'}`}>
                  <div>
                    <h3 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-neutral-950'}`}>
                      <Building2 className="w-5 h-5 text-emerald-400" /> My Booked Room
                    </h3>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                      {activeBookedRoom ? 'Your confirmed rental residence on Room Radar.' : 'You can only book one room at a time.'}
                    </p>
                  </div>
                  {activeBookedRoom ? (
                    <Badge variant="success" className="text-xs px-2.5 py-1">
                      ✓ Active Booked Stay
                    </Badge>
                  ) : (
                    <Link to="/searchrooms">
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                        <Search className="w-3.5 h-3.5" /> Browse Rooms
                      </Button>
                    </Link>
                  )}
                </div>

                {!activeBookedRoom ? (
                  <div className={`text-center py-12 rounded-xl border space-y-3 mt-4 ${isDark ? 'bg-[#0f1013] border-neutral-800' : 'bg-[#f8f5ee] border-[#e2dbcf]'}`}>
                    <Building2 className={`w-10 h-10 mx-auto ${isDark ? 'text-neutral-600' : 'text-neutral-400'}`} />
                    <p className={`font-semibold ${isDark ? 'text-neutral-200' : 'text-neutral-800'}`}>
                      No Booked Room Yet
                    </p>
                    <p className={`text-xs max-w-sm mx-auto ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                      When you book a room, your booking receipt, residence address, landlord contact, and review eligibility will appear here. Note: One user can only book one room at once.
                    </p>
                    <Link to="/searchrooms" className="inline-block pt-1">
                      <Button variant="default" size="sm">
                        Find & Book a Room
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="pt-4 space-y-4">
                    <div
                      className={`p-4 sm:p-5 rounded-2xl border space-y-4 transition ${
                        isDark ? 'bg-[#0f1013] border-neutral-800' : 'bg-[#f8f5ee] border-[#e2dbcf] shadow-sm'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          {activeBookedRoom.room?.images?.[0] ? (
                            <img
                              src={activeBookedRoom.room.images[0]}
                              alt={activeBookedRoom.room.title}
                              className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border border-neutral-700 shadow-sm flex-shrink-0"
                            />
                          ) : (
                            <div className={`w-20 h-20 rounded-xl flex items-center justify-center border flex-shrink-0 ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-neutral-100 border-neutral-300'}`}>
                              <Building2 className="w-8 h-8 text-neutral-400" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className={`font-bold text-base sm:text-lg ${isDark ? 'text-white' : 'text-neutral-950'}`}>
                                {activeBookedRoom.room?.title || 'Confirmed Residence'}
                              </h4>
                              <Badge variant="success" className="text-[10px]">
                                ✓ Booked & Paid
                              </Badge>
                              <Badge variant="purple" className="text-[10px]">
                                {activeBookedRoom.room?.roomType || 'Room'}
                              </Badge>
                            </div>
                            {activeBookedRoom.room?.location && (
                              <p className={`text-xs flex items-center gap-1 mt-1 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                                <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                                {activeBookedRoom.room.location.address || activeBookedRoom.room.location.city || 'Verified Address'}, {activeBookedRoom.room.location.city}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs pt-2">
                              <div>
                                <span className="text-neutral-500 block text-[11px]">Monthly Rent Paid</span>
                                <span className="font-bold flex items-center text-emerald-400">
                                  <IndianRupee className="w-3 h-3" />
                                  {Number(activeBookedRoom.amount || 0).toLocaleString('en-IN')}
                                </span>
                              </div>
                              <div>
                                <span className="text-neutral-500 block text-[11px]">Move-In Date</span>
                                <span className={`font-medium ${isDark ? 'text-neutral-200' : 'text-neutral-800'}`}>
                                  {activeBookedRoom.moveInDate || 'Immediate'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {activeBookedRoom.room && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRoom(activeBookedRoom.room);
                              setModalTab('details');
                            }}
                            className="gap-1.5 text-xs flex-shrink-0"
                          >
                            <Eye className="w-3.5 h-3.5" /> View Listing Specs
                          </Button>
                        )}
                      </div>

                      {/* Landlord Contact Info */}
                      {activeBookedRoom.landlord && (
                        <div className={`p-3 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isDark ? 'bg-[#121316] border-neutral-800 text-neutral-300' : 'bg-white border-[#d8cdbf] text-neutral-800'}`}>
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Avatar
                              src={activeBookedRoom.landlord.profilePic}
                              name={activeBookedRoom.landlord.name}
                              size="sm"
                              className="w-8 h-8"
                            />
                            <div className="truncate">
                              <p className="font-bold truncate">{activeBookedRoom.landlord.name} (Landlord)</p>
                              <p className="text-[11px] text-neutral-500 truncate">
                                {activeBookedRoom.landlord.phone ? `Phone: ${activeBookedRoom.landlord.phone} • ` : ''}
                                {activeBookedRoom.landlord.email || ''}
                              </p>
                            </div>
                          </div>
                          <Link to="/chat">
                            <Button variant="default" size="sm" className="h-8 px-3 text-xs gap-1.5 font-semibold">
                              <MessageSquare className="w-3.5 h-3.5" /> Chat with Owner
                            </Button>
                          </Link>
                        </div>
                      )}

                      {/* =========================================================================
                          RATE & REVIEW SECTION (Only unlocked after 1 month of living at that room)
                          ========================================================================= */}
                      <div className={`p-4 rounded-xl border space-y-3 ${isDark ? 'bg-[#121316] border-neutral-800' : 'bg-white border-[#d8cdbf]'}`}>
                        <div className="flex items-center justify-between gap-2">
                          <h5 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-neutral-950'}`}>
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            Tenant Rating & Review
                          </h5>
                          {activeBookedRoom.review?.rating > 0 ? (
                            <Badge variant="success" className="text-[10px]">
                              ✓ Reviewed ({activeBookedRoom.review.rating}/5)
                            </Badge>
                          ) : hasCompletedOneMonth || simulateMonth ? (
                            <Badge variant="success" className="text-[10px]">
                              ✓ 1 Month Completed • Review Unlocked
                            </Badge>
                          ) : (
                            <Badge variant="warning" className="text-[10px]">
                              🔒 Unlocks after 1 month ({daysRemaining}d left)
                            </Badge>
                          )}
                        </div>

                        {/* If user already reviewed */}
                        {activeBookedRoom.review?.rating > 0 ? (
                          <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-[#0f1013] border-neutral-800' : 'bg-[#f8f5ee] border-[#e2dbcf]'}`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1.5">
                                <div className="flex text-amber-400">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-4 h-4 ${star <= activeBookedRoom.review.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-600'}`}
                                    />
                                  ))}
                                </div>
                                <span className={`text-xs font-bold ml-1 ${isDark ? 'text-neutral-200' : 'text-neutral-900'}`}>
                                  {activeBookedRoom.review.rating} / 5 Stars
                                </span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openReviewModal(activeBookedRoom)}
                                className="text-xs h-7 px-2.5"
                              >
                                Edit Review
                              </Button>
                            </div>
                            <p className={`text-xs italic ${isDark ? 'text-neutral-300' : 'text-neutral-800'}`}>
                              &ldquo;{activeBookedRoom.review.comment}&rdquo;
                            </p>
                            {activeBookedRoom.review.reviewedAt && (
                              <p className="text-[10px] text-neutral-500 mt-1.5">
                                Submitted on {new Date(activeBookedRoom.review.reviewedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        ) : hasCompletedOneMonth || simulateMonth ? (
                          /* If 1 month has passed (or simulated for test): Unlocked review form button */
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                            <div>
                              <p className={`text-xs ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                                You have completed your 1st month living in this room! Please share your honest rating and feedback.
                              </p>
                            </div>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => openReviewModal(activeBookedRoom)}
                              className="gap-1.5 text-xs font-bold flex-shrink-0 cursor-pointer bg-[#f5efe6] text-neutral-950 hover:bg-[#eae2d5]"
                            >
                              <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                              Write Rating & Review
                            </Button>
                          </div>
                        ) : (
                          /* If less than 1 month has passed: Show locked countdown */
                          <div className="space-y-2 pt-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                              <span className={isDark ? 'text-neutral-400' : 'text-neutral-600'}>
                                Living Duration: <strong className={isDark ? 'text-neutral-100' : 'text-neutral-900'}>{daysLived} day(s)</strong> / 30 days
                              </span>
                              <span className="text-amber-500 font-semibold text-[11px]">
                                {daysRemaining} day{daysRemaining === 1 ? '' : 's'} remaining until review unlocks
                              </span>
                            </div>

                            {/* Progress bar towards 30 days */}
                            <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-amber-400 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, Math.max(5, Math.round((daysLived / 30) * 100)))}%` }}
                              />
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-[11px] text-neutral-500">
                              <p>
                                To ensure genuine tenant experiences, ratings and reviews are unlocked after living for at least 1 month (30 days).
                              </p>
                              <button
                                type="button"
                                onClick={() => setSimulateMonth(true)}
                                className="text-[10px] text-sky-400 hover:underline cursor-pointer flex-shrink-0 self-start sm:self-auto"
                                title="Bypass timer for test/dev review submission"
                              >
                                ⚡ Simulate 1 Month (Test Review)
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                </Card>
              )}
            </div>
          )}

          {/* =========================================================================
              SECTION: EDIT PROFILE
              If user is Admin, render Super Admin Credentials & Profile form (matching Image 2).
              If user is Tenant or Owner, render their standard personal details form.
              ========================================================================= */}
          {activeSection === 'edit-profile' && (
            isAdmin ? (
              <Card className={`p-5 sm:p-6 rounded-2xl shadow-xl space-y-5 border ${isDark ? 'bg-[#121316] border-neutral-800' : 'bg-white border-[#e2dbcf]'}`}>
                <div className={`border-b pb-3 ${isDark ? 'border-neutral-800' : 'border-[#e2dbcf]'}`}>
                  <h2 className={`text-lg sm:text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-neutral-950'}`}>
                    <Pencil className="w-5 h-5 text-amber-500" /> Admin Profile & Credentials
                  </h2>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>
                    Update Super Admin Name, Login Email ID, Contact Phone, Profile Picture, and Password.
                  </p>
                </div>

                {profileSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {profileSuccess}
                  </div>
                )}

                {profileError && (
                  <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    {profileError}
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-4 text-sm">
                  {/* Admin Profile Picture & Upload Button */}
                  <div className="flex items-center gap-4 pb-3 border-b border-[#e2dbcf] dark:border-neutral-800">
                    <Avatar
                      src={editForm.profilePic}
                      name={editForm.name || 'Admin'}
                      size="xl"
                      className="w-18 h-18 border-2 border-amber-500/50 flex-shrink-0"
                    />
                    <div>
                      <Label className={`text-xs font-semibold ${isDark ? 'text-neutral-200' : 'text-neutral-800'}`}>
                        Admin Profile Picture
                      </Label>
                      <label className={`mt-1.5 inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer transition shadow-xs ${
                        isDark
                          ? 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-white'
                          : 'bg-[#ede5da] hover:bg-[#ded4c5] border-[#d8cdbf] text-neutral-900'
                      }`}>
                        <Upload className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <span className={isDark ? 'text-white font-bold' : 'text-neutral-900 font-bold'}>
                          {uploadingPic ? 'Uploading...' : 'Upload New Photo'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleProfilePicUpload(e.target.files?.[0])}
                        />
                      </label>
                      {editForm.profilePic && (
                        <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                          <CheckCircle2 className="w-3 h-3" /> Photo updated
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Admin Full Name * */}
                  <div>
                    <Label className={`text-xs font-semibold ${isDark ? 'text-neutral-200' : 'text-neutral-800'}`}>
                      Admin Full Name *
                    </Label>
                    <Input
                      required
                      placeholder="Super Admin"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="text-neutral-950 dark:text-white bg-[#f8f5ee] dark:bg-[#0f1013] border-[#e2dbcf] dark:border-neutral-800 font-medium"
                    />
                  </div>

                  {/* Admin Login Email (User ID) * */}
                  <div>
                    <Label className={`text-xs font-semibold ${isDark ? 'text-neutral-200' : 'text-neutral-800'}`}>
                      Admin Login Email (User ID) *
                    </Label>
                    <Input
                      type="email"
                      required
                      placeholder="admin@test.com"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="text-neutral-950 dark:text-white bg-[#f8f5ee] dark:bg-[#0f1013] border-[#e2dbcf] dark:border-neutral-800 font-medium"
                    />
                  </div>

                  {/* Admin Contact Phone */}
                  <div>
                    <Label className={`text-xs font-semibold ${isDark ? 'text-neutral-200' : 'text-neutral-800'}`}>
                      Admin Contact Phone
                    </Label>
                    <Input
                      type="tel"
                      placeholder="1234567890"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="text-neutral-950 dark:text-white bg-[#f8f5ee] dark:bg-[#0f1013] border-[#e2dbcf] dark:border-neutral-800 font-medium"
                    />
                  </div>

                  {/* New Admin Password (leave blank to keep current) */}
                  <div>
                    <Label className={`text-xs font-semibold ${isDark ? 'text-neutral-200' : 'text-neutral-800'}`}>
                      New Admin Password (leave blank to keep current)
                    </Label>
                    <Input
                      type="password"
                      minLength={6}
                      placeholder="Enter new password (min 6 characters)"
                      value={editForm.password || ''}
                      onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                      className="text-neutral-950 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-[#f8f5ee] dark:bg-[#0f1013] border-[#e2dbcf] dark:border-neutral-800 font-medium"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className={`pt-4 border-t flex items-center justify-end gap-3 ${isDark ? 'border-neutral-800' : 'border-[#e2dbcf]'}`}>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveSection('overview')}
                      className={`text-xs ${isDark ? 'border-neutral-700 text-neutral-300 hover:text-white' : 'border-[#d8cdbf] text-neutral-800'}`}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="default"
                      disabled={savingProfile || uploadingPic}
                      className={`text-xs font-bold gap-2 px-6 ${
                        isDark
                          ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 font-black'
                          : 'bg-[#f5efe6] text-neutral-950 hover:bg-[#eae2d5] font-bold border border-[#d8cdbf]'
                      }`}
                    >
                      {savingProfile ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                        </>
                      ) : (
                        'Save Admin Credentials'
                      )}
                    </Button>
                  </div>
                </form>
              </Card>
            ) : (
              <Card className={`p-5 sm:p-6 rounded-2xl shadow-xl space-y-5 border ${isDark ? 'bg-[#121316] border-neutral-800' : 'bg-white border-[#e2dbcf]'}`}>
                <div className={`border-b pb-3 ${isDark ? 'border-neutral-800' : 'border-[#e2dbcf]'}`}>
                  <h2 className={`text-lg sm:text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-neutral-950'}`}>
                    <Pencil className="w-5 h-5 text-[#f5efe6]" /> Edit Profile Details
                  </h2>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                    Update your personal information, contact number, location, and profile photo.
                  </p>
                </div>

                {profileSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {profileSuccess}
                  </div>
                )}

                {profileError && (
                  <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    {profileError}
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-5">
                  {/* Profile Photo Upload */}
                  <div>
                    <Label className={`text-xs font-semibold ${isDark ? 'text-neutral-200' : 'text-neutral-800'}`}>Profile Photo</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <Avatar
                        src={editForm.profilePic}
                        name={editForm.name || 'User'}
                        size="lg"
                        className={`w-16 h-16 ring-2 ${isDark ? 'ring-neutral-700' : 'ring-neutral-200'}`}
                      />
                      <div>
                        <label className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                          isDark ? 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200' : 'bg-[#ede5da] hover:bg-[#ded4c5] border-[#d8cdbf] text-neutral-900'
                        }`}>
                          <Upload className="w-4 h-4 text-[#d8cdbf]" />
                          {uploadingPic ? 'Uploading Photo...' : 'Upload New Photo'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleProfilePicUpload(e.target.files?.[0])}
                          />
                        </label>
                        {editForm.profilePic && (
                          <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                            <CheckCircle2 className="w-3 h-3" /> Photo updated
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Personal Information Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className={`text-xs font-semibold ${isDark ? 'text-neutral-200' : 'text-neutral-800'}`}>Full Name *</Label>
                      <Input
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="text-neutral-950 dark:text-white bg-[#f8f5ee] dark:bg-[#0f1013] border-[#e2dbcf] dark:border-neutral-800"
                      />
                    </div>

                    <div>
                      <Label className={`text-xs font-semibold ${isDark ? 'text-neutral-200' : 'text-neutral-800'}`}>Email Address *</Label>
                      <Input
                        type="email"
                        required
                        placeholder="rahul@example.com"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="text-neutral-950 dark:text-white bg-[#f8f5ee] dark:bg-[#0f1013] border-[#e2dbcf] dark:border-neutral-800"
                      />
                    </div>

                    <div>
                      <Label className={`text-xs font-semibold ${isDark ? 'text-neutral-200' : 'text-neutral-800'}`}>Phone Number</Label>
                      <Input
                        type="tel"
                        placeholder="e.g. 9876543210"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="text-neutral-950 dark:text-white bg-[#f8f5ee] dark:bg-[#0f1013] border-[#e2dbcf] dark:border-neutral-800"
                      />
                    </div>

                    <div>
                      <Label className={`text-xs font-semibold ${isDark ? 'text-neutral-200' : 'text-neutral-800'}`}>Location (City / Area)</Label>
                      <Input
                        placeholder="e.g. Vijay Nagar, Indore"
                        value={editForm.location}
                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        className="text-neutral-950 dark:text-white bg-[#f8f5ee] dark:bg-[#0f1013] border-[#e2dbcf] dark:border-neutral-800"
                      />
                    </div>
                  </div>

                  {/* Account Role Selector with High-Contrast Custom Radios */}
                  {profile?.role !== 'admin' && (
                    <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0f1013] border-neutral-800' : 'bg-[#f8f5ee] border-[#e2dbcf]'}`}>
                      <Label className={`font-semibold ${isDark ? 'text-white' : 'text-neutral-950'}`}>Account Role</Label>
                      <p className={`text-[11px] mb-3 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                        Select whether your primary role is browsing as a tenant or listing as a property owner.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
                        {/* Tenant Radio Card */}
                        <div
                          role="radio"
                          aria-checked={editForm.role === 'user'}
                          onClick={() => setEditForm({ ...editForm, role: 'user' })}
                          className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                            editForm.role === 'user'
                              ? isDark
                                ? 'bg-[#18191e] border-[#f5efe6] ring-1 ring-[#f5efe6]/40 text-white'
                                : 'bg-[#f3ede2] border-neutral-900 ring-1 ring-neutral-900/30 text-neutral-950 shadow-xs'
                              : isDark
                                ? 'bg-[#0f1013] border-neutral-800 text-neutral-300 hover:border-neutral-700'
                                : 'bg-white border-neutral-300 text-neutral-700 hover:border-neutral-400'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                              editForm.role === 'user'
                                ? isDark
                                  ? 'border-[#f5efe6] bg-[#f5efe6]'
                                  : 'border-neutral-900 bg-neutral-900'
                                : isDark
                                  ? 'border-neutral-600 bg-transparent'
                                  : 'border-neutral-400 bg-transparent'
                            }`}
                          >
                            {editForm.role === 'user' && (
                              <div className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-neutral-950' : 'bg-white'}`} />
                            )}
                          </div>
                          <span className="font-semibold text-xs sm:text-sm">Tenant / User</span>
                        </div>

                        {/* Owner Radio Card */}
                        <div
                          role="radio"
                          aria-checked={editForm.role === 'owner'}
                          onClick={() => setEditForm({ ...editForm, role: 'owner' })}
                          className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                            editForm.role === 'owner'
                              ? isDark
                                ? 'bg-[#18191e] border-[#f5efe6] ring-1 ring-[#f5efe6]/40 text-white'
                                : 'bg-[#f3ede2] border-neutral-900 ring-1 ring-neutral-900/30 text-neutral-950 shadow-xs'
                              : isDark
                                ? 'bg-[#0f1013] border-neutral-800 text-neutral-300 hover:border-neutral-700'
                                : 'bg-white border-neutral-300 text-neutral-700 hover:border-neutral-400'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                              editForm.role === 'owner'
                                ? isDark
                                  ? 'border-[#f5efe6] bg-[#f5efe6]'
                                  : 'border-neutral-900 bg-neutral-900'
                                : isDark
                                  ? 'border-neutral-600 bg-transparent'
                                  : 'border-neutral-400 bg-transparent'
                            }`}
                          >
                            {editForm.role === 'owner' && (
                              <div className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-neutral-950' : 'bg-white'}`} />
                            )}
                          </div>
                          <span className="font-semibold text-xs sm:text-sm">Property Owner</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className={`pt-3 border-t flex items-center justify-end gap-3 ${isDark ? 'border-neutral-800' : 'border-[#e2dbcf]'}`}>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveSection('overview')}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="default"
                      disabled={savingProfile || uploadingPic}
                      className="gap-2 px-6"
                    >
                      {savingProfile ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                        </>
                      ) : (
                        'Save Profile Details'
                      )}
                    </Button>
                  </div>
                </form>
              </Card>
            )
          )}

          {/* =========================================================================
              SECTION: DOCUMENT (KYC Document with Aadhaar/PAN Radio, Verification, and Preview)
              ========================================================================= */}
          {activeSection === 'document' && (
            <div className="space-y-5">
              {/* If no document uploaded, first show "No document uploaded" banner */}
              {!hasDocument && (
                <div
                  className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md ${
                    isDark
                      ? 'border-amber-500/30 bg-amber-500/10 text-amber-200'
                      : 'border-amber-300/80 bg-[#fff9ed] text-neutral-950'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl flex-shrink-0 border ${
                        isDark
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : 'bg-amber-100 text-amber-900 border-amber-300'
                      }`}
                    >
                      <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <h3
                        className={`font-bold text-sm sm:text-base ${
                          isDark ? 'text-amber-200' : 'text-neutral-950'
                        }`}
                      >
                        No Document Uploaded
                      </h3>
                      <p
                        className={`text-xs mt-0.5 leading-relaxed ${
                          isDark ? 'text-amber-300/80' : 'text-neutral-700'
                        }`}
                      >
                        You have not uploaded any government identity document yet. Please select either Aadhaar or PAN card below to upload and verify your document.
                      </p>
                    </div>
                  </div>
                  <Badge variant="warning" className="text-xs px-3 py-1 flex-shrink-0 font-bold">
                    KYC Pending
                  </Badge>
                </div>
              )}

              {/* If document IS uploaded and verified, show the status "Document Verified" and document details */}
              {hasDocument && (
                <div className="space-y-5">
                  {/* Status Banner: Document Verified */}
                  <div className="p-4 sm:p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm sm:text-base text-emerald-300">
                            Document Verified
                          </h3>
                          <Badge variant="success" className="text-xs font-semibold">
                            ✓ Verified & Active
                          </Badge>
                        </div>
                        <p className="text-xs text-emerald-300/80 mt-0.5">
                          Your {activeDocType === 'aadhar' ? 'Aadhaar Card' : 'PAN Card'} has been successfully verified on Room Radar.
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingDoc(!isEditingDoc)}
                      className="border-neutral-700 text-xs gap-1.5 flex-shrink-0"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      {isEditingDoc ? 'Close Update Form' : 'Upload New Document'}
                    </Button>
                  </div>

                  {/* Card showing the user's uploaded document */}
                  <Card className={`p-5 sm:p-6 rounded-2xl shadow-xl space-y-4 border ${isDark ? 'bg-[#121316] border-neutral-800' : 'bg-white border-[#e2dbcf]'}`}>
                    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 ${isDark ? 'border-neutral-800' : 'border-[#e2dbcf]'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-neutral-800 border-neutral-700 text-[#f5efe6]' : 'bg-[#ede5da] border-[#d8cdbf] text-neutral-900'}`}>
                          {activeDocType === 'aadhar' ? (
                            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-sky-400" />
                          ) : (
                            <CreditCard className={`w-5 h-5 sm:w-6 sm:h-6 ${isDark ? 'text-amber-400' : 'text-amber-800'}`} />
                          )}
                        </div>
                        <div>
                          <h4 className={`text-sm sm:text-base font-bold ${isDark ? 'text-white' : 'text-neutral-950'}`}>
                            {activeDocType === 'aadhar' ? 'Uploaded Aadhaar Card' : 'Uploaded PAN Card'}
                          </h4>
                          <p className={`text-xs font-mono mt-0.5 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                            Document Number:{' '}
                            <span className={`font-bold tracking-wider ${isDark ? 'text-neutral-100' : 'text-neutral-900'}`}>
                              {activeDocNumber || 'Recorded'}
                            </span>
                          </p>
                        </div>
                      </div>

                      {activeDocUrl && (
                        <a
                          href={activeDocUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                            isDark ? 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-[#f5efe6]' : 'bg-[#ede5da] hover:bg-[#ded4c5] border-[#d8cdbf] text-neutral-900'
                          }`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> View Uploaded Document
                        </a>
                      )}
                    </div>

                    {/* Uploaded Document Image / File View */}
                    {activeDocUrl ? (
                      <div className="space-y-2">
                        <p className={`text-xs font-semibold ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                          Uploaded Document Preview:
                        </p>
                        <div className={`max-w-md rounded-xl overflow-hidden border p-2 shadow-inner ${isDark ? 'border-neutral-700 bg-neutral-950' : 'border-neutral-200 bg-neutral-100'}`}>
                          <img
                            src={activeDocUrl}
                            alt="Uploaded Identity Document"
                            className="w-full max-h-72 object-contain rounded-lg"
                          />
                        </div>
                      </div>
                    ) : (
                      <p className={`text-xs italic ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                        Document number is verified and stored securely.
                      </p>
                    )}
                  </Card>
                </div>
              )}

              {/* Upload Document Form with Radio buttons of Aadhaar & PAN */}
              {(!hasDocument || isEditingDoc) && (
                <Card className={`p-5 sm:p-6 rounded-2xl shadow-xl space-y-5 border ${isDark ? 'bg-[#121316] border-neutral-800' : 'bg-white border-[#e2dbcf]'}`}>
                  <div className={`border-b pb-3 ${isDark ? 'border-neutral-800' : 'border-[#e2dbcf]'}`}>
                    <h3 className={`text-base sm:text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-neutral-950'}`}>
                      <Upload className="w-5 h-5 text-[#f5efe6]" />
                      {hasDocument ? 'Replace / Upload New Document' : 'Upload Document'}
                    </h3>
                    <p className={`text-xs mt-1 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                      Choose one document to verify (Aadhaar Card or PAN Card). You only need to verify one document.
                    </p>
                  </div>

                  {docSuccess && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      {docSuccess}
                    </div>
                  )}

                  {docError && (
                    <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                      {docError}
                    </div>
                  )}

                  <form onSubmit={handleSaveDocument} className="space-y-5">
                    {/* High-Contrast Custom Radio Buttons for Aadhaar and PAN */}
                    <div>
                      <Label className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-neutral-950'}`}>
                        Select Document Type *
                      </Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                        {/* Aadhaar Radio Option */}
                        <div
                          role="radio"
                          aria-checked={docForm.documentType === 'aadhar'}
                          onClick={() => setDocForm((prev) => ({ ...prev, documentType: 'aadhar' }))}
                          className={`flex items-center gap-3.5 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            docForm.documentType === 'aadhar'
                              ? isDark
                                ? 'bg-[#18191e] border-[#f5efe6] shadow-md ring-1 ring-[#f5efe6]/40 text-white'
                                : 'bg-[#f3ede2] border-neutral-900 shadow-xs ring-1 ring-neutral-900/30 text-neutral-950'
                              : isDark
                                ? 'bg-[#0f1013] border-neutral-800 text-neutral-300 hover:border-neutral-700'
                                : 'bg-white border-neutral-300 text-neutral-700 hover:border-neutral-400'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                              docForm.documentType === 'aadhar'
                                ? isDark
                                  ? 'border-[#f5efe6] bg-[#f5efe6]'
                                  : 'border-neutral-900 bg-neutral-900'
                                : isDark
                                  ? 'border-neutral-600 bg-transparent'
                                  : 'border-neutral-400 bg-transparent'
                            }`}
                          >
                            {docForm.documentType === 'aadhar' && (
                              <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-neutral-950' : 'bg-white'}`} />
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-sky-400 flex-shrink-0" />
                            <div>
                              <span className={`font-bold text-sm block ${isDark ? 'text-white' : 'text-neutral-950'}`}>
                                Aadhaar Card
                              </span>
                              <span className={`text-[11px] block ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                                12-Digit UIDAI Identity
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* PAN Radio Option */}
                        <div
                          role="radio"
                          aria-checked={docForm.documentType === 'pan'}
                          onClick={() => setDocForm((prev) => ({ ...prev, documentType: 'pan' }))}
                          className={`flex items-center gap-3.5 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            docForm.documentType === 'pan'
                              ? isDark
                                ? 'bg-[#18191e] border-[#f5efe6] shadow-md ring-1 ring-[#f5efe6]/40 text-white'
                                : 'bg-[#f3ede2] border-neutral-900 shadow-xs ring-1 ring-neutral-900/30 text-neutral-950'
                              : isDark
                                ? 'bg-[#0f1013] border-neutral-800 text-neutral-300 hover:border-neutral-700'
                                : 'bg-white border-neutral-300 text-neutral-700 hover:border-neutral-400'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                              docForm.documentType === 'pan'
                                ? isDark
                                  ? 'border-[#f5efe6] bg-[#f5efe6]'
                                  : 'border-neutral-900 bg-neutral-900'
                                : isDark
                                  ? 'border-neutral-600 bg-transparent'
                                  : 'border-neutral-400 bg-transparent'
                            }`}
                          >
                            {docForm.documentType === 'pan' && (
                              <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-neutral-950' : 'bg-white'}`} />
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <CreditCard className={`w-5 h-5 flex-shrink-0 ${isDark ? 'text-amber-400' : 'text-amber-800'}`} />
                            <div>
                              <span className={`font-bold text-sm block ${isDark ? 'text-white' : 'text-neutral-950'}`}>
                                PAN Card
                              </span>
                              <span className={`text-[11px] block ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                                10-Character Income Tax ID
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* If Aadhaar selected */}
                    {docForm.documentType === 'aadhar' && (
                      <div className={`p-4 rounded-xl border space-y-4 ${isDark ? 'bg-[#0f1013] border-neutral-800' : 'bg-[#f8f5ee] border-[#e2dbcf]'}`}>
                        <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
                          <FileText className="w-4 h-4" /> Aadhaar Verification Form
                        </div>
                        <div>
                          <Label>12-Digit Aadhaar Number *</Label>
                          <Input
                            required
                            maxLength={14}
                            placeholder="XXXX XXXX XXXX"
                            value={docForm.aadharNumber}
                            onChange={(e) =>
                              setDocForm((prev) => ({ ...prev, aadharNumber: e.target.value }))
                            }
                            className="font-mono tracking-wider text-sm sm:text-base"
                          />
                        </div>
                        <div>
                          <Label>Upload Aadhaar Card Photo / Document *</Label>
                          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            <label className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                              isDark ? 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200' : 'bg-[#ede5da] hover:bg-[#ded4c5] border-[#d8cdbf] text-neutral-900'
                            }`}>
                              <Upload className="w-4 h-4 text-sky-400" />
                              {uploadingDoc ? 'Uploading File...' : 'Choose Aadhaar File'}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  handleDocumentFileUpload(e.target.files?.[0], 'aadharDocUrl')
                                }
                              />
                            </label>
                            {docForm.aadharDocUrl && (
                              <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5" /> File Uploaded
                              </span>
                            )}
                          </div>
                          {docForm.aadharDocUrl && (
                            <div className="mt-3">
                              <img
                                src={docForm.aadharDocUrl}
                                alt="Aadhaar preview"
                                className="h-32 sm:h-36 w-56 sm:w-60 object-cover rounded-xl border border-neutral-700 shadow-md"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* If PAN selected */}
                    {docForm.documentType === 'pan' && (
                      <div className={`p-4 rounded-xl border space-y-4 ${isDark ? 'bg-[#0f1013] border-neutral-800' : 'bg-[#f8f5ee] border-[#e2dbcf]'}`}>
                        <div className={`flex items-center gap-2 font-bold text-xs uppercase tracking-wider ${isDark ? 'text-amber-400' : 'text-amber-900'}`}>
                          <CreditCard className="w-4 h-4" /> PAN Verification Form
                        </div>
                        <div>
                          <Label>10-Character PAN Number *</Label>
                          <Input
                            required
                            maxLength={10}
                            placeholder="ABCDE1234F"
                            value={docForm.panNumber}
                            onChange={(e) =>
                              setDocForm((prev) => ({
                                ...prev,
                                panNumber: e.target.value.toUpperCase(),
                              }))
                            }
                            className="font-mono uppercase tracking-wider text-sm sm:text-base"
                          />
                        </div>
                        <div>
                          <Label>Upload PAN Card Photo / Document *</Label>
                          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            <label className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                              isDark ? 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200' : 'bg-[#ede5da] hover:bg-[#ded4c5] border-[#d8cdbf] text-neutral-900'
                            }`}>
                              <Upload className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-800'}`} />
                              {uploadingDoc ? 'Uploading File...' : 'Choose PAN File'}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  handleDocumentFileUpload(e.target.files?.[0], 'panDocUrl')
                                }
                              />
                            </label>
                            {docForm.panDocUrl && (
                              <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5" /> File Uploaded
                              </span>
                            )}
                          </div>
                          {docForm.panDocUrl && (
                            <div className="mt-3">
                              <img
                                src={docForm.panDocUrl}
                                alt="PAN preview"
                                className="h-32 sm:h-36 w-56 sm:w-60 object-cover rounded-xl border border-neutral-700 shadow-md"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className={`pt-3 border-t flex items-center justify-end gap-3 ${isDark ? 'border-neutral-800' : 'border-[#e2dbcf]'}`}>
                      {isEditingDoc && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditingDoc(false)}
                        >
                          Cancel
                        </Button>
                      )}
                      <Button
                        type="submit"
                        variant="default"
                        disabled={savingDoc || uploadingDoc}
                        className="gap-2 px-6"
                      >
                        {savingDoc ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" /> Upload & Verify Document
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Card>
              )}

              {/* =========================================================================
                  BANK ACCOUNT DETAILS SECTION & UPDATE ACCOUNT BUTTON
                  ========================================================================= */}
              <Card className={`p-5 sm:p-6 rounded-2xl shadow-xl space-y-5 border ${isDark ? 'bg-[#121316] border-neutral-800' : 'bg-white border-[#e2dbcf]'}`}>
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 ${isDark ? 'border-neutral-800' : 'border-[#e2dbcf]'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                      <Landmark className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`text-base sm:text-lg font-bold ${isDark ? 'text-white' : 'text-neutral-950'}`}>
                          Bank Account & Payout Details
                        </h3>
                        {profile?.accountDetails?.accountNumber ? (
                          <Badge variant="success" className="text-xs font-semibold">
                            ✓ Account Linked
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="text-xs font-semibold">
                            Pending Details
                          </Badge>
                        )}
                      </div>
                      <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                        Bank account information used for receiving monthly rent payments, booking deposits, and payouts.
                      </p>
                    </div>
                  </div>

                  {profile?.accountDetails?.accountNumber && !isEditingBank && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingBank(true)}
                      className={`text-xs gap-1.5 flex-shrink-0 cursor-pointer ${
                        isDark ? 'border-neutral-700 text-[#f5efe6]' : 'border-[#d8cdbf] text-neutral-900'
                      }`}
                    >
                      <Pencil className="w-3.5 h-3.5" /> Update Account
                    </Button>
                  )}
                </div>

                {bankSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {bankSuccess}
                  </div>
                )}

                {bankError && (
                  <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    {bankError}
                  </div>
                )}

                {/* Current Account Details Display (when not editing) */}
                {profile?.accountDetails?.accountNumber && !isEditingBank ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0f1013] border-neutral-800' : 'bg-[#f8f5ee] border-[#e2dbcf]'}`}>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Account Holder Name</p>
                        <p className={`text-sm font-bold mt-1 ${isDark ? 'text-neutral-100' : 'text-neutral-950'}`}>
                          {profile.accountDetails.accountHolderName || profile.name || '—'}
                        </p>
                      </div>

                      <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0f1013] border-neutral-800' : 'bg-[#f8f5ee] border-[#e2dbcf]'}`}>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Bank Name</p>
                        <p className={`text-sm font-bold mt-1 ${isDark ? 'text-neutral-100' : 'text-neutral-950'}`}>
                          {profile.accountDetails.bankName || '—'}
                        </p>
                      </div>

                      <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0f1013] border-neutral-800' : 'bg-[#f8f5ee] border-[#e2dbcf]'}`}>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Bank Account Number</p>
                        <p className={`text-sm font-mono font-bold mt-1 ${isDark ? 'text-neutral-100' : 'text-neutral-950'}`}>
                          {profile.accountDetails.accountNumber || '—'}
                        </p>
                      </div>

                      <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0f1013] border-neutral-800' : 'bg-[#f8f5ee] border-[#e2dbcf]'}`}>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">IFSC Code</p>
                        <p className={`text-sm font-mono font-bold mt-1 ${isDark ? 'text-neutral-100' : 'text-neutral-950'}`}>
                          {profile.accountDetails.ifscCode || '—'}
                        </p>
                      </div>

                      <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0f1013] border-neutral-800' : 'bg-[#f8f5ee] border-[#e2dbcf]'}`}>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">UPI ID / VPA</p>
                        <p className={`text-sm font-bold mt-1 ${isDark ? 'text-sky-400' : 'text-sky-600'}`}>
                          {profile.accountDetails.upiId || '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Form to Add or Update Bank Details */
                  <form onSubmit={handleSaveBank} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Account Holder Name *</Label>
                        <Input
                          required
                          placeholder="e.g. Vikram Verma"
                          value={bankForm.accountHolderName}
                          onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label>Bank Name *</Label>
                        <Input
                          required
                          placeholder="e.g. State Bank of India / HDFC Bank"
                          value={bankForm.bankName}
                          onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label>Account Number *</Label>
                        <Input
                          required
                          placeholder="Enter your bank account number"
                          value={bankForm.accountNumber}
                          onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                          className="font-mono"
                        />
                      </div>

                      <div>
                        <Label>IFSC Code *</Label>
                        <Input
                          required
                          maxLength={11}
                          placeholder="e.g. SBIN0001234"
                          value={bankForm.ifscCode}
                          onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value.toUpperCase() })}
                          className="font-mono uppercase"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <Label>UPI ID / VPA (Optional for instant payouts)</Label>
                        <Input
                          placeholder="e.g. yourname@oksbi / 9876543210@paytm"
                          value={bankForm.upiId}
                          onChange={(e) => setBankForm({ ...bankForm, upiId: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className={`pt-3 border-t flex items-center justify-end gap-3 ${isDark ? 'border-neutral-800' : 'border-[#e2dbcf]'}`}>
                      {profile?.accountDetails?.accountNumber && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditingBank(false)}
                        >
                          Cancel
                        </Button>
                      )}
                      <Button
                        type="submit"
                        variant="default"
                        disabled={savingBank}
                        className="gap-2 px-6"
                      >
                        {savingBank ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Updating...
                          </>
                        ) : (
                          <>
                            <Landmark className="w-4 h-4" /> Update Account
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </Card>
            </div>
          )}

          {/* =========================================================================
              SECTION: CHANGE PASSWORD (Verifies older password first)
              ========================================================================= */}
          {activeSection === 'password' && (
            <Card className={`p-5 sm:p-6 rounded-2xl shadow-xl space-y-5 border ${isDark ? 'bg-[#121316] border-neutral-800' : 'bg-white border-[#e2dbcf]'}`}>
              <div className={`border-b pb-3 ${isDark ? 'border-neutral-800' : 'border-[#e2dbcf]'}`}>
                <h2 className={`text-lg sm:text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-neutral-950'}`}>
                  <Lock className="w-5 h-5 text-[#f5efe6]" /> Change Password
                </h2>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  You must verify your current/older password first before setting a new password.
                </p>
              </div>

              {passwordSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  {passwordSuccess}
                </div>
              )}

              {passwordError && (
                <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  {passwordError}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
                {/* 1. Older / Current Password */}
                <div>
                  <Label>Current Password (Older Password) *</Label>
                  <div className="relative mt-1">
                    <Input
                      type={showCurrentPw ? 'text' : 'password'}
                      required
                      placeholder="Enter your current older password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                      }
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 transition cursor-pointer"
                    >
                      {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className={`text-[11px] mt-1 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                    Verified against your account before changes are saved.
                  </p>
                </div>

                {/* 2. New Password */}
                <div>
                  <Label>New Password * (Min 6 characters)</Label>
                  <div className="relative mt-1">
                    <Input
                      type={showNewPw ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Enter new strong password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                      }
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 transition cursor-pointer"
                    >
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 3. Confirm New Password */}
                <div>
                  <Label>Confirm New Password *</Label>
                  <div className="relative mt-1">
                    <Input
                      type={showConfirmPw ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Re-enter new password to confirm"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                      }
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPw(!showConfirmPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 transition cursor-pointer"
                    >
                      {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Action */}
                <div className={`pt-2 border-t flex justify-end ${isDark ? 'border-neutral-800' : 'border-[#e2dbcf]'}`}>
                  <Button
                    type="submit"
                    variant="default"
                    disabled={savingPassword}
                    className="gap-2 px-6"
                  >
                    {savingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Verifying & Updating...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* =========================================================================
              SECTION: THEME (Dark or Light)
              ========================================================================= */}
          {activeSection === 'theme' && (
            <Card className={`p-5 sm:p-6 rounded-2xl shadow-xl space-y-5 border ${isDark ? 'bg-[#121316] border-neutral-800' : 'bg-white border-[#e2dbcf]'}`}>
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${isDark ? 'border-neutral-800' : 'border-[#e2dbcf]'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-neutral-800 border-neutral-700 text-[#f5efe6]' : 'bg-[#ede5da] border-[#d8cdbf] text-neutral-900'}`}>
                    <Palette className="w-5 h-5 text-[#f5efe6]" />
                  </div>
                  <div>
                    <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-neutral-950'}`}>Appearance & Theme</h2>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                      Switch between Dark and Light mode. Your theme preference is automatically remembered.
                    </p>
                  </div>
                </div>
                <Badge variant="cream" className="text-xs px-3 py-1 font-semibold self-start sm:self-auto">
                  Active: {isDark ? 'Obsidian Dark' : 'Cream Light'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Obsidian Dark Option */}
                <div
                  onClick={() => setTheme('dark')}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                    isDark
                      ? 'bg-[#18191e] border-[#f5efe6] shadow-lg ring-1 ring-[#f5efe6]/40 text-white'
                      : 'bg-[#121316]/80 border-neutral-800 hover:border-neutral-700 opacity-80 hover:opacity-100 text-white'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#0a0b0d] border border-neutral-700 flex items-center justify-center text-[#f5efe6]">
                          <Moon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">Obsidian Dark Theme</p>
                          <p className="text-[11px] text-neutral-400">Deep Black & Cream Accents</p>
                        </div>
                      </div>
                      {isDark ? (
                        <Badge variant="success" className="text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </Badge>
                      ) : (
                        <Button variant="ghost" size="sm" className="text-xs h-7 px-2 text-neutral-400">
                          Select
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      Sleek dark theme featuring obsidian black backgrounds, charcoal card surfaces, and warm cream accent highlights.
                    </p>
                  </div>
                </div>

                {/* Cream Light Option */}
                <div
                  onClick={() => setTheme('light')}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                    !isDark
                      ? 'bg-[#f3ede2] border-neutral-900 shadow-md ring-1 ring-neutral-900/30 text-neutral-950'
                      : 'bg-white/90 border-neutral-300 hover:border-neutral-400 opacity-80 hover:opacity-100 text-neutral-900'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#f5efe6] border border-[#d8cdbf] flex items-center justify-center text-neutral-950">
                          <Sun className="w-4 h-4 text-neutral-900" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-neutral-950">Cream & White Light Theme</p>
                          <p className="text-[11px] text-neutral-600">Warm Ivory & Crisp Cards</p>
                        </div>
                      </div>
                      {!isDark ? (
                        <Badge variant="success" className="text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </Badge>
                      ) : (
                        <Button variant="ghost" size="sm" className="text-xs h-7 px-2 text-neutral-600">
                          Select
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-neutral-700 leading-relaxed">
                      Crisp, modern light theme featuring architectural cream ivory tones, white surface cards, and deep contrast typography.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* =========================================================================
              SECTION: VISITED ROOMS
              ========================================================================= */}
          {activeSection === 'visited' && (
            <Card className={`p-5 sm:p-6 rounded-2xl shadow-xl space-y-5 border ${isDark ? 'bg-[#121316] border-neutral-800' : 'bg-white border-[#e2dbcf]'}`}>
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 ${isDark ? 'border-neutral-800' : 'border-[#e2dbcf]'}`}>
                <div>
                  <h3 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-neutral-950'}`}>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Visited Rooms
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold shadow-xs ${isDark ? 'bg-white text-neutral-950 border border-neutral-200' : 'bg-neutral-900 text-white'}`}>
                      {visitedRoomsList.length}
                    </span>
                  </h3>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                    Rooms and properties you marked as inspected or scheduled visits for.
                  </p>
                </div>
                <Link to="/searchrooms">
                  <Button variant="outline" size="sm">
                    Find More Rooms
                  </Button>
                </Link>
              </div>

              {visitedRoomsList.length === 0 ? (
                <div className={`text-center py-14 rounded-2xl border space-y-3 ${isDark ? 'bg-[#0f1013] border-neutral-800' : 'bg-[#f8f5ee] border-[#e2dbcf]'}`}>
                  <CheckCircle2 className={`w-10 h-10 mx-auto ${isDark ? 'text-neutral-600' : 'text-neutral-400'}`} />
                  <p className={`font-semibold ${isDark ? 'text-neutral-200' : 'text-neutral-800'}`}>No visited rooms recorded.</p>
                  <p className={`text-xs max-w-sm mx-auto ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                    Click &quot;Mark Visited&quot; inside any room listing details when you inspect a property.
                  </p>
                  <Link to="/searchrooms" className="inline-block pt-1">
                    <Button variant="default" size="sm">
                      Browse Rooms
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {visitedRoomsList.map((room) => (
                    <div key={room._id} className="relative">
                      <div className="absolute top-2 left-2 z-20">
                        <Badge variant="success" className="shadow-lg backdrop-blur-md">
                          ✓ Visited
                        </Badge>
                      </div>
                      <RoomCard
                        room={room}
                        onViewDetails={(r) => {
                          setSelectedRoom(r);
                          setModalTab('details');
                        }}
                        onChat={(r) => {
                          setSelectedRoom(r);
                          setModalTab('chat');
                        }}
                        onBook={(r) => {
                          setSelectedRoom(r);
                          setModalTab('book');
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* =========================================================================
              SECTION: RENTAL HISTORY / OLDER ROOMS
              ========================================================================= */}
          {activeSection === 'older' && (
            <Card className={`p-5 sm:p-6 rounded-2xl shadow-xl space-y-5 border ${isDark ? 'bg-[#121316] border-neutral-800' : 'bg-white border-[#e2dbcf]'}`}>
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 ${isDark ? 'border-neutral-800' : 'border-[#e2dbcf]'}`}>
                <div>
                  <h3 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-neutral-950'}`}>
                    <History className="w-4 h-4 text-[#d8cdbf]" />
                    Rental History (Where You Lived Before)
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold shadow-xs ${isDark ? 'bg-white text-neutral-950 border border-neutral-200' : 'bg-neutral-900 text-white'}`}>
                      {allOlderRooms.length}
                    </span>
                  </h3>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                    Keep a rental history of previous rooms, apartments, and PG hostels where you lived in the past.
                  </p>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setIsAddOlderOpen(true)}
                  className="gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Past Residence
                </Button>
              </div>

              {allOlderRooms.length === 0 ? (
                <div className={`text-center py-14 rounded-2xl border space-y-3 ${isDark ? 'bg-[#0f1013] border-neutral-800' : 'bg-[#f8f5ee] border-[#e2dbcf]'}`}>
                  <Building2 className={`w-10 h-10 mx-auto ${isDark ? 'text-neutral-600' : 'text-neutral-400'}`} />
                  <p className={`font-semibold ${isDark ? 'text-neutral-200' : 'text-neutral-800'}`}>
                    No previous rental history recorded.
                  </p>
                  <p className={`text-xs max-w-sm mx-auto ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                    Add places where you lived previously to maintain an organized rental history.
                  </p>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setIsAddOlderOpen(true)}
                    className="gap-1.5 mt-2"
                  >
                    <Plus className="w-4 h-4" /> Add Past Residence
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allOlderRooms.map((item) => (
                    <div
                      key={item._id}
                      className={`p-4 rounded-xl border space-y-3 transition ${
                        isDark ? 'bg-[#0f1013] border-neutral-800 hover:border-neutral-700' : 'bg-white border-[#e2dbcf] hover:border-neutral-400 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className={`font-bold text-sm sm:text-base ${isDark ? 'text-white' : 'text-neutral-950'}`}>{item.title}</h4>
                            {item.isBooking ? (
                              <Badge variant="success" className="text-[10px]">
                                Booked Stay
                              </Badge>
                            ) : (
                              <Badge variant="warning" className="text-[10px]">
                                Past Residence
                              </Badge>
                            )}
                          </div>
                          {item.location && (
                            <p className={`text-xs flex items-center gap-1.5 mt-1 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                              <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                              {item.location}
                            </p>
                          )}
                        </div>

                        {!item.isBooking && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOlderRoom(item._id)}
                            className={`p-1.5 rounded-lg transition cursor-pointer ${
                              isDark ? 'text-neutral-500 hover:text-rose-400 hover:bg-neutral-800' : 'text-neutral-400 hover:text-rose-600 hover:bg-neutral-100'
                            }`}
                            title="Remove record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className={`grid grid-cols-2 gap-2 text-xs pt-2 border-t ${isDark ? 'border-neutral-800' : 'border-[#e2dbcf]'}`}>
                        <div>
                          <span className={`block text-[11px] ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>Monthly Rent</span>
                          <span className={`font-bold flex items-center mt-0.5 ${isDark ? 'text-[#f5efe6]' : 'text-neutral-900'}`}>
                            <IndianRupee className="w-3 h-3 text-[#d8cdbf]" />
                            {Number(item.rent).toLocaleString('en-IN')}/mo
                          </span>
                        </div>
                        <div>
                          <span className={`block text-[11px] ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>Stay Duration</span>
                          <span className={`font-medium mt-0.5 block ${isDark ? 'text-neutral-300' : 'text-neutral-800'}`}>
                            {item.stayDuration || 'Not specified'}
                          </span>
                        </div>
                      </div>

                      {item.notes && (
                        <p className={`text-xs italic p-2 rounded-lg border ${
                          isDark ? 'bg-[#121316] border-neutral-800 text-neutral-400' : 'bg-[#f4eee5] border-[#d8cdbf] text-neutral-700'
                        }`}>
                          &ldquo;{item.notes}&rdquo;
                        </p>
                      )}

                      {item.room && (
                        <div className="pt-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedRoom(item.room);
                              setModalTab('details');
                            }}
                            className={`text-xs p-0 h-auto gap-1 font-semibold ${isDark ? 'text-[#f5efe6] hover:text-white' : 'text-neutral-900 hover:text-neutral-700'}`}
                          >
                            <Eye className="w-3.5 h-3.5" /> View Listing Specs
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* RATING & REVIEW MODAL */}
      {isReviewModalOpen && (
        <Dialog
          open={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          title={`Rate & Review: ${reviewBooking?.room?.title || 'Booked Residence'}`}
          subtitle="Share your rating (1 to 5 stars) and authentic feedback about your living experience in this room."
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <Label className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-neutral-950'}`}>
                Your Rating (1 to 5 Stars) *
              </Label>
              <div className="flex items-center gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    onMouseEnter={() => setReviewHover(star)}
                    onMouseLeave={() => setReviewHover(0)}
                    className="p-1 transition cursor-pointer hover:scale-115"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= (reviewHover || reviewRating)
                          ? 'fill-amber-400 text-amber-400'
                          : isDark ? 'text-neutral-600' : 'text-neutral-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm font-bold text-amber-500">
                  {reviewRating} / 5 Stars
                </span>
              </div>
            </div>

            <div>
              <Label className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-neutral-950'}`}>
                Your Review & Feedback *
              </Label>
              <Textarea
                required
                rows={4}
                placeholder="Share your living experience: room maintenance, amenities, landlord communication, water, electricity, surroundings..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="mt-1"
              />
            </div>

            {reviewError && (
              <p className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
                {reviewError}
              </p>
            )}

            <div className={`flex items-center justify-end gap-2 pt-2 border-t ${isDark ? 'border-neutral-800' : 'border-[#e2dbcf]'}`}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsReviewModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                disabled={submittingReview || !reviewComment.trim()}
                className="gap-2"
              >
                {submittingReview ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  'Submit Rating & Review'
                )}
              </Button>
            </div>
          </form>
        </Dialog>
      )}

      {/* ADD PREVIOUS RESIDENCE MODAL */}
      <Dialog
        open={isAddOlderOpen}
        onClose={() => setIsAddOlderOpen(false)}
        title="Add Previous Residence"
        subtitle="Record a previous room, flat, or PG hostel where you lived before."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddOlderRoom} className="space-y-4">
          <div>
            <Label>Room / Apartment / Hostel Name *</Label>
            <Input
              required
              placeholder="e.g. Green View 1BHK / Royal PG"
              value={olderForm.title}
              onChange={(e) => setOlderForm({ ...olderForm, title: e.target.value })}
            />
          </div>

          <div>
            <Label>Location / City / Address</Label>
            <Input
              placeholder="e.g. Vijay Nagar, Indore"
              value={olderForm.location}
              onChange={(e) => setOlderForm({ ...olderForm, location: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Monthly Rent (₹)</Label>
              <Input
                type="number"
                placeholder="e.g. 7500"
                value={olderForm.rent}
                onChange={(e) => setOlderForm({ ...olderForm, rent: e.target.value })}
              />
            </div>
            <div>
              <Label>Duration of Stay</Label>
              <Input
                placeholder="e.g. 1 Year / 6 Months"
                value={olderForm.stayDuration}
                onChange={(e) => setOlderForm({ ...olderForm, stayDuration: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Notes (Optional)</Label>
            <Input
              placeholder="e.g. Lived here during college 2nd year"
              value={olderForm.notes}
              onChange={(e) => setOlderForm({ ...olderForm, notes: e.target.value })}
            />
          </div>

          <div className={`flex items-center justify-end gap-2 pt-2 border-t ${isDark ? 'border-neutral-800' : 'border-[#e2dbcf]'}`}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddOlderOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="default" disabled={savingOlder}>
              {savingOlder ? 'Adding...' : 'Save Record'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Room Details Modal */}
      {selectedRoom && (
        <RoomDetailsModal
          room={selectedRoom}
          open={Boolean(selectedRoom)}
          initialTab={modalTab}
          onClose={() => setSelectedRoom(null)}
        />
      )}
    </div>
  );
}
