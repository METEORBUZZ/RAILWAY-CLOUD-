import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Wallet,
  Award,
  Ticket,
  Train,
  Check,
  X,
  LogOut,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onUpdateUser: (updated: any) => void;
  onLogout: () => void;
  onNavigateTab: (tab: any) => void;
  totalBookingsCount: number;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onLogout,
  onNavigateTab,
  totalBookingsCount
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(currentUser?.fullName || 'User');
  const [email, setEmail] = useState(currentUser?.email || 'user@railcloud.internal');
  const [phone, setPhone] = useState(currentUser?.phone || '+91 98765 43210');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state when currentUser changes or modal opens
  React.useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName || 'User');
      setEmail(currentUser.email || 'user@railcloud.internal');
      setPhone(currentUser.phone || '+91 98765 43210');
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  const isAdmin = currentUser.role === 'ADMIN';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...currentUser,
      fullName,
      email,
      phone
    });
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleRoleToggle = () => {
    const newRole = isAdmin ? 'USER' : 'ADMIN';
    const updatedUser = {
      ...currentUser,
      role: newRole,
      fullName: newRole === 'ADMIN' ? 'Vikram Malhotra' : 'Rahul Sharma',
      email: newRole === 'ADMIN' ? 'admin@railcloud.internal' : 'user@railcloud.internal',
      phone: newRole === 'ADMIN' ? '+91 98111 22334' : '+91 98765 43210'
    };
    onUpdateUser(updatedUser);
    // Switch to corresponding tab
    if (newRole === 'ADMIN') {
      onNavigateTab('admin-trains');
    } else {
      onNavigateTab('book');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 my-auto max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${isAdmin ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-blue-600/20 text-blue-400 border border-blue-500/30'}`}>
              {isAdmin ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {isAdmin ? 'Rail Operations Admin Profile' : 'Traveller Profile'}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400">
                {isAdmin ? 'Train Fleet & Timetable Operations Authority' : 'Personal IRCTC Account & Booking Management'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card Highlight */}
        <div className={`p-4 rounded-2xl border relative overflow-hidden ${
          isAdmin
            ? 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/30'
            : 'bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border-blue-500/30'
        }`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-md border ${
                isAdmin
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-blue-600/20 border-blue-500/40 text-blue-300'
              }`}>
                {currentUser.fullName?.[0] || 'U'}
              </div>
              <div>
                <h4 className="text-base font-bold text-white">{currentUser.fullName}</h4>
                <p className="text-xs text-slate-400 font-mono">{currentUser.email}</p>
              </div>
            </div>

            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
              isAdmin
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
            }`}>
              {isAdmin ? <ShieldAlert className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              <span>{isAdmin ? 'ADMIN' : 'PASSENGER'}</span>
            </span>
          </div>

          {/* Admin restriction note if Admin */}
          {isAdmin && (
            <div className="mt-3 pt-3 border-t border-amber-500/20 flex items-center gap-2 text-[11px] text-amber-300/90">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Administrative Policy: Admin accounts manage trains and schedules. Personal passenger bookings are disabled on Admin side.</span>
            </div>
          )}
        </div>

        {/* Quick Role Switcher Banner */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-200">Role & Access Control</span>
              <p className="text-[11px] text-slate-400">
                Switch between Railway Admin (Fleet Manager) and Passenger Mode
              </p>
            </div>
            <button
              type="button"
              id="btn-profile-toggle-role"
              onClick={handleRoleToggle}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md flex items-center gap-1.5 ${
                isAdmin
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                  : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
              }`}
            >
              <span>{isAdmin ? 'Switch to Passenger Mode' : 'Switch to Admin Mode'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Account Details / Edit Form */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Account Credentials & Contact
            </h4>
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
              >
                Edit Details
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-3 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFullName(currentUser.fullName);
                    setEmail(currentUser.email);
                    setPhone(currentUser.phone);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-md shadow-blue-600/30"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-0.5">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  <span>Email</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-200 truncate">{currentUser.email}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-0.5">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Phone</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-200 truncate">{currentUser.phone || '+91 98765 43210'}</p>
              </div>
            </div>
          )}

          {savedSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4" />
              <span>Profile details updated successfully!</span>
            </div>
          )}
        </div>

        {/* Account Balances & Quick Stats */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            {isAdmin ? 'Operational Stats' : 'Travel & Loyalty Metrics'}
          </h4>

          {isAdmin ? (
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 text-xs">
                  <Train className="w-4 h-4" />
                  <span>Fleet Authority</span>
                </div>
                <span className="text-lg font-bold text-white">Full Control</span>
                <p className="text-[10px] text-slate-400">Timetable, Platforms & Delays</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-blue-400 text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Security Clearance</span>
                </div>
                <span className="text-lg font-bold text-white">Level 3 (Super)</span>
                <p className="text-[10px] text-slate-400">Train Catalog CRUD Access</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] mb-1">
                  <Ticket className="w-3 h-3 text-blue-400" />
                  <span>Bookings</span>
                </div>
                <span className="text-base font-bold text-white">{totalBookingsCount}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] mb-1">
                  <Wallet className="w-3 h-3 text-emerald-400" />
                  <span>Rail Wallet</span>
                </div>
                <span className="text-base font-bold text-emerald-400">₹2,450</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] mb-1">
                  <Award className="w-3 h-3 text-amber-400" />
                  <span>Points</span>
                </div>
                <span className="text-base font-bold text-amber-300">340</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>

          <div className="flex items-center gap-2">
            {isAdmin ? (
              <button
                type="button"
                onClick={() => {
                  onNavigateTab('admin-trains');
                  onClose();
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/30 cursor-pointer"
              >
                <Train className="w-3.5 h-3.5" />
                <span>Go to Train Management</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onNavigateTab('my-bookings');
                  onClose();
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 cursor-pointer"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>View My Bookings</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
