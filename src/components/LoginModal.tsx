import React, { useState } from 'react';
import { User, Lock, X, Check, ShieldAlert, Sparkles } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: any) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin
}) => {
  const [email, setEmail] = useState('user@railcloud.internal');
  const [password, setPassword] = useState('Pass@1234');
  const [role, setRole] = useState<'USER' | 'ADMIN'>('USER');

  if (!isOpen) return null;

  const handlePreFill = (type: 'USER' | 'ADMIN') => {
    setRole(type);
    if (type === 'USER') {
      setEmail('user@railcloud.internal');
      setPassword('Pass@1234');
    } else {
      setEmail('admin@railcloud.internal');
      setPassword('Admin@Secure2026');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'USER') {
      onLogin({
        id: 'usr-1001-user',
        email: 'user@railcloud.internal',
        fullName: 'Rahul Sharma',
        role: 'USER',
        phone: '+91 98765 43210'
      });
    } else {
      onLogin({
        id: 'usr-admin-01',
        email: 'admin@railcloud.internal',
        fullName: 'Vikram Malhotra',
        role: 'ADMIN',
        phone: '+91 98111 22334'
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 my-auto max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">Sign In to RailCloud</h3>
            <p className="text-[11px] sm:text-xs text-slate-400">Secure Passenger Authentication</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Fast Switch Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handlePreFill('USER')}
            className={`p-3 rounded-xl border text-left text-xs transition-all ${
              role === 'USER'
                ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}
          >
            <span className="font-bold block text-slate-200">Demo Passenger</span>
            <span className="text-[11px] opacity-75">Rahul Sharma (User)</span>
          </button>

          <button
            type="button"
            onClick={() => handlePreFill('ADMIN')}
            className={`p-3 rounded-xl border text-left text-xs transition-all ${
              role === 'ADMIN'
                ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}
          >
            <span className="font-bold block text-slate-200">System Admin</span>
            <span className="text-[11px] opacity-75">Vikram Malhotra (Admin)</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono"
            />
          </div>

          <button
            id="btn-submit-login"
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
          >
            Sign In with JWT Token
          </button>
        </form>
      </div>
    </div>
  );
};
