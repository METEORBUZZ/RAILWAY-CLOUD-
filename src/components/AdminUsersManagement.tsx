import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  ShieldCheck,
  User,
  Shield,
  Trash2,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { User as UserType } from '../types';

interface AdminUsersManagementProps {
  systemUsers: UserType[];
  onAddUser: (user: UserType) => void;
  onDeleteUser: (userId: string) => void;
  showAlert: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const AdminUsersManagement: React.FC<AdminUsersManagementProps> = ({
  systemUsers,
  onAddUser,
  onDeleteUser,
  showAlert
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<'ADMIN' | 'USER'>('ADMIN');

  const filteredUsers = systemUsers.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim() || !formEmail.trim()) {
      showAlert('error', 'Name and Email are required.');
      return;
    }

    if (systemUsers.some(u => u.email.toLowerCase() === formEmail.trim().toLowerCase())) {
      showAlert('error', 'A user with this email already exists.');
      return;
    }

    const newUser: UserType = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      fullName: formName.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim() || '+91 00000 00000',
      role: formRole,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onAddUser(newUser);
    setIsAddModalOpen(false);
    showAlert('success', `${formRole === 'ADMIN' ? 'Administrator' : 'User'} ${newUser.fullName} added successfully.`);

    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormRole('ADMIN');
  };

  return (
    <div className="space-y-6 animate-in fade-in w-full max-w-full">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-md shrink-0">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-xl font-bold text-white tracking-tight truncate">
              User & Access Control
            </h2>
            <p className="text-xs text-slate-300">
              Manage administrators, passenger accounts, and role-based access to the platform.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold transition-all shadow-md shadow-amber-600/30 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add System User</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="relative w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search users by name, email, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
        />
      </div>

      {/* Users List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredUsers.length === 0 ? (
          <div className="md:col-span-2 p-10 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <Users className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-300">No Users Found</h4>
            <p className="text-xs text-slate-500">
              No matching accounts exist in the system directory.
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => {
            const isAdmin = user.role === 'ADMIN';

            return (
              <div
                key={user.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                    isAdmin
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                  }`}>
                    {isAdmin ? <ShieldCheck className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                  
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">{user.fullName}</h3>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        isAdmin
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                      }`}>
                        {user.role}
                      </span>
                      <span className="text-[10px] text-slate-500">{user.phone}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteUser(user.id)}
                  title="Remove Account"
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                Add System User
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-4 sm:p-5 space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. admin@railcloud.internal"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98000 00000"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Account Role *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormRole('ADMIN')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                        formRole === 'ADMIN'
                          ? 'bg-amber-600/20 border-amber-500/50 text-amber-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <Shield className="w-4 h-4" />
                      ADMINISTRATOR
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormRole('USER')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                        formRole === 'USER'
                          ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <User className="w-4 h-4" />
                      PASSENGER
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
