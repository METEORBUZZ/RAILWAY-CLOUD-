import React from 'react';
import {
  Train,
  User,
  Ticket,
  LogOut,
  Radio,
  Shield,
  ShieldAlert,
  ChevronDown,
  Users
} from 'lucide-react';

export type NavTabType = 'book' | 'my-bookings' | 'admin-trains' | 'admin-bookings' | 'admin-users';

interface NavbarProps {
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
  currentUser: any;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onProfileClick: () => void;
  clusterHealth?: any;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onLoginClick,
  onLogoutClick,
  onProfileClick
}) => {
  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-xl w-full">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-1 sm:gap-4">
          {/* Brand */}
          <div
            id="nav-brand"
            onClick={() => setActiveTab(isAdmin ? 'admin-trains' : 'book')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0"
          >
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform shrink-0 ${
              isAdmin
                ? 'bg-gradient-to-tr from-amber-600 via-orange-600 to-amber-700 shadow-amber-600/20'
                : 'bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 shadow-blue-500/20'
            }`}>
              {isAdmin ? <Radio className="w-4 h-4 sm:w-5 sm:h-5 text-white" /> : <Train className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  RailCloud
                </span>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                  isAdmin
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                }`}>
                  {isAdmin ? 'ADMIN CONSOLE' : 'EXPRESS'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {isAdmin ? 'Train Fleet & Timetable Operations' : 'High-Speed Railway Ticket Booking'}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2 shrink-0">
            {isAdmin ? (
              /* ADMIN NAVIGATION: Book Trains is REMOVED. Admin manages trains & views bookings. */
              <>
                <button
                  id="nav-tab-admin-trains"
                  onClick={() => setActiveTab('admin-trains')}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                    activeTab === 'admin-trains'
                      ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Train Operations</span>
                  <span className="sm:hidden">Fleet</span>
                </button>

                <button
                  id="nav-tab-admin-bookings"
                  onClick={() => setActiveTab('admin-bookings')}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                    activeTab === 'admin-bookings'
                      ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">All Reservations</span>
                  <span className="sm:hidden">Bookings</span>
                </button>
                
                <button
                  id="nav-tab-admin-users"
                  onClick={() => setActiveTab('admin-users')}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                    activeTab === 'admin-users'
                      ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">User Access</span>
                  <span className="sm:hidden">Users</span>
                </button>
              </>
            ) : (
              /* PASSENGER NAVIGATION: Book Trains and My Bookings */
              <>
                <button
                  id="nav-tab-book"
                  onClick={() => setActiveTab('book')}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === 'book'
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Train className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Book Trains</span>
                  <span className="sm:hidden">Book</span>
                </button>

                <button
                  id="nav-tab-my-bookings"
                  onClick={() => setActiveTab('my-bookings')}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === 'my-bookings'
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">My Bookings</span>
                  <span className="sm:hidden">Bookings</span>
                </button>
              </>
            )}
          </nav>

          {/* User Profile Section - Now fully interactive! */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {currentUser ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  id="btn-nav-profile"
                  onClick={onProfileClick}
                  title="Click to view & edit Profile"
                  className={`flex items-center gap-1.5 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl border transition-all cursor-pointer ${
                    isAdmin
                      ? 'bg-amber-950/40 hover:bg-amber-900/50 border-amber-500/40 text-amber-200'
                      : 'bg-slate-800/90 hover:bg-slate-700/80 border-slate-700 text-slate-200'
                  }`}
                >
                  <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-bold ${
                    isAdmin
                      ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                      : 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                  }`}>
                    {currentUser.fullName?.[0] || 'U'}
                  </div>

                  <div className="text-left hidden md:block">
                    <p className="text-xs font-semibold leading-none text-slate-100">
                      {currentUser.fullName}
                    </p>
                    <p className={`text-[10px] leading-none mt-0.5 font-mono font-bold ${
                      isAdmin ? 'text-amber-400' : 'text-blue-400'
                    }`}>
                      {currentUser.role}
                    </p>
                  </div>

                  <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block ml-0.5" />
                </button>

                <button
                  id="btn-nav-logout"
                  onClick={onLogoutClick}
                  title="Sign out"
                  className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="btn-nav-login"
                onClick={onLoginClick}
                className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
