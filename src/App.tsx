import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Train as TrainIcon,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Sparkles,
  Ticket,
  ChevronLeft,
  Radio
} from 'lucide-react';

import { Navbar, NavTabType } from './components/Navbar';
import { SearchWidget } from './components/SearchWidget';
import { TrainCard } from './components/TrainCard';
import { CoachSeatMap } from './components/CoachSeatMap';
import { PassengerForm } from './components/PassengerForm';
import { FareBreakdown } from './components/FareBreakdown';
import { PaymentModal } from './components/PaymentModal';
import { ETicketCard } from './components/ETicketCard';
import { MyBookingsView } from './components/MyBookingsView';
import { LoginModal } from './components/LoginModal';
import { ProfileModal } from './components/ProfileModal';
import { AdminTrainManagement } from './components/AdminTrainManagement';
import { AdminBookingsView } from './components/AdminBookingsView';
import { AdminUsersManagement } from './components/AdminUsersManagement';

import { apiClient } from './services/api';
import {
  Train,
  Station,
  Coach,
  Seat,
  Booking,
  SearchFilterState,
  SelectedSeatState,
  User
} from './types';
import { INITIAL_TRAINS, INITIAL_STATIONS } from './data/initialData';

export default function App() {
  // Navigation & User State
  const [activeTab, setActiveTab] = useState<NavTabType>('book');
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'usr-1001-user',
    email: 'user@railcloud.internal',
    fullName: 'Rahul Sharma',
    role: 'USER',
    phone: '+91 98765 43210',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  const [systemUsers, setSystemUsers] = useState<User[]>([
    { id: 'usr-admin-1', fullName: 'Vikram Malhotra', email: 'admin@railcloud.internal', phone: '+91 98111 22334', role: 'ADMIN', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'usr-1001-user', fullName: 'Rahul Sharma', email: 'user@railcloud.internal', phone: '+91 98765 43210', role: 'USER', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Train Catalog & Search State
  const [stations, setStations] = useState<Station[]>(INITIAL_STATIONS);
  const [trains, setTrains] = useState<Train[]>(INITIAL_TRAINS);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<SearchFilterState>({
    fromStation: 'NDLS',
    toStation: 'BSB',
    travelDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    trainClass: 'ALL',
    quota: 'GENERAL'
  });

  // Active Booking Flow State (for Passenger role)
  const [selectedTrain, setSelectedTrain] = useState<Train | null>(null);
  const [selectedCoachClass, setSelectedCoachClass] = useState<string>('CC');
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeatState[]>([]);
  const [redisLockActive, setRedisLockActive] = useState<boolean>(false);
  const [lockToken, setLockToken] = useState<string | null>(null);
  const [lockExpiresAt, setLockExpiresAt] = useState<string | null>(null);
  const [isLocking, setIsLocking] = useState<boolean>(false);
  const [contactEmail, setContactEmail] = useState<string>('user@railcloud.internal');
  const [contactPhone, setContactPhone] = useState<string>('+91 98765 43210');

  // Payment & Confirmation State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [idempotencyKey, setIdempotencyKey] = useState<string>(`idemp_${Date.now()}`);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [isCancellingBooking, setIsCancellingBooking] = useState<boolean>(false);

  // Notifications / Alerts
  const [alertBanner, setAlertBanner] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const showAlert = (type: 'success' | 'error' | 'info', message: string) => {
    setAlertBanner({ type, message });
    setTimeout(() => setAlertBanner(null), 6000);
  };

  // Initial load
  useEffect(() => {
    const initData = async () => {
      try {
        // Load saved trains or default
        const savedTrains = localStorage.getItem('railcloud_custom_trains');
        if (savedTrains) {
          try {
            setTrains(JSON.parse(savedTrains));
          } catch {
            const data = await apiClient.getTrains();
            setTrains(data.trains || []);
          }
        } else {
          const data = await apiClient.getTrains();
          setTrains(data.trains || []);
        }

        const data = await apiClient.getTrains();
        setStations(data.stations || INITIAL_STATIONS);

        // Load saved user
        const savedUser = localStorage.getItem('railcloud_current_user');
        if (savedUser) {
          try {
            const u = JSON.parse(savedUser);
            setCurrentUser(u);
            if (u.role === 'ADMIN') {
              setActiveTab('admin-trains');
            }
          } catch {}
        }

        // Load sample bookings
        const sampleBookings: Booking[] = [
          {
            id: 'bkg-demo-1',
            pnr: '8492048192',
            userId: 'usr-1001-user',
            trainId: '22436',
            trainNumber: '22436',
            trainName: 'Vande Bharat Express',
            originStation: { code: 'NDLS', name: 'New Delhi', city: 'Delhi' },
            destinationStation: { code: 'BSB', name: 'Varanasi Junction', city: 'Varanasi' },
            departureTime: '06:00',
            arrivalTime: '14:00',
            travelDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
            bookingStatus: 'CONFIRMED',
            paymentStatus: 'SUCCESS',
            seats: [
              {
                id: 'seat-demo-1',
                coachCode: 'C1',
                coachClass: 'CC',
                seatNumber: 12,
                berthType: 'WINDOW',
                passengerName: 'Rahul Sharma',
                passengerAge: 29,
                passengerGender: 'MALE'
              }
            ],
            fare: {
              baseFare: 1750,
              reservationFee: 40,
              superfastCharge: 45,
              gstAmount: 0,
              travelInsurance: 0,
              totalAmount: 1835
            },
            createdAt: new Date().toISOString()
          },
          {
            id: 'bkg-demo-2',
            pnr: '6192840194',
            userId: 'usr-1002-traveller',
            trainId: '12952',
            trainNumber: '12952',
            trainName: 'Mumbai Rajdhani Express',
            originStation: { code: 'NDLS', name: 'New Delhi', city: 'Delhi' },
            destinationStation: { code: 'MMCT', name: 'Mumbai Central', city: 'Mumbai' },
            departureTime: '16:55',
            arrivalTime: '08:35',
            travelDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
            bookingStatus: 'CONFIRMED',
            paymentStatus: 'SUCCESS',
            seats: [
              {
                id: 'seat-demo-2',
                coachCode: 'A1',
                coachClass: '2A',
                seatNumber: 14,
                berthType: 'LOWER',
                passengerName: 'Pooja Verma',
                passengerAge: 32,
                passengerGender: 'FEMALE'
              },
              {
                id: 'seat-demo-3',
                coachCode: 'A1',
                coachClass: '2A',
                seatNumber: 15,
                berthType: 'UPPER',
                passengerName: 'Amit Verma',
                passengerAge: 34,
                passengerGender: 'MALE'
              }
            ],
            fare: {
              baseFare: 5900,
              reservationFee: 80,
              superfastCharge: 90,
              gstAmount: 295,
              travelInsurance: 0,
              totalAmount: 6365
            },
            createdAt: new Date().toISOString()
          }
        ];

        setAllBookings(sampleBookings);
        setUserBookings(sampleBookings.filter(b => b.userId === (currentUser?.id || 'usr-1001-user')));
      } catch (err) {
        console.error('Failed to load initial data:', err);
      }
    };
    initData();
  }, []);

  // Update train status or info
  const handleUpdateTrain = (updatedTrain: Train) => {
    setTrains(prev => {
      const next = prev.map(t => (t.trainNumber === updatedTrain.trainNumber || t.id === updatedTrain.id ? updatedTrain : t));
      try {
        localStorage.setItem('railcloud_custom_trains', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Add new train
  const handleAddTrain = (newTrain: Train) => {
    setTrains(prev => {
      const next = [newTrain, ...prev];
      try {
        localStorage.setItem('railcloud_custom_trains', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Delete train
  const handleDeleteTrain = (trainId: string) => {
    setTrains(prev => {
      const next = prev.filter(t => t.id !== trainId && t.trainNumber !== trainId);
      try {
        localStorage.setItem('railcloud_custom_trains', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Update user profile
  const handleUpdateUser = (updatedUser: any) => {
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('railcloud_current_user', JSON.stringify(updatedUser));
    } catch {}

    if (updatedUser.role === 'ADMIN') {
      setActiveTab('admin-trains');
      setSelectedTrain(null);
      setSelectedSeats([]);
      showAlert('success', `Switched to Railway Operations Admin (${updatedUser.fullName}). Personal booking disabled.`);
    } else {
      setActiveTab('book');
      showAlert('success', `Switched to Passenger Profile (${updatedUser.fullName}). Ticket booking enabled.`);
    }
  };

  // Search trains
  const handleSearchTrains = async () => {
    setSearchLoading(true);
    setSelectedTrain(null);
    setSelectedSeats([]);
    setRedisLockActive(false);
    setLockToken(null);
    setConfirmedBooking(null);

    try {
      const data = await apiClient.searchTrains({
        from: searchFilter.fromStation,
        to: searchFilter.toStation,
        date: searchFilter.travelDate,
        class: searchFilter.trainClass
      });
      // Filter from existing trains list so admin changes persist
      const originMatch = searchFilter.fromStation;
      const destMatch = searchFilter.toStation;

      const filtered = trains.filter(t => {
        const fromCode = (t as any).originCode || t.originStation?.code;
        const toCode = (t as any).destCode || t.destinationStation?.code;
        return fromCode === originMatch && toCode === destMatch;
      });

      if (filtered.length > 0) {
        setTrains(filtered);
      } else {
        showAlert('info', 'No direct trains found for selected station pair. Displaying all active services.');
        const savedTrains = localStorage.getItem('railcloud_custom_trains');
        if (savedTrains) {
          try {
            setTrains(JSON.parse(savedTrains));
          } catch {
            setTrains(INITIAL_TRAINS);
          }
        } else {
          setTrains(INITIAL_TRAINS);
        }
      }
    } catch (e: any) {
      showAlert('error', e.message || 'Search failed');
    } finally {
      setSearchLoading(false);
    }
  };

  // Train and Coach Selection (Passenger only)
  const handleSelectTrainAndClass = (train: Train, coachClass: string) => {
    if (currentUser?.role === 'ADMIN') {
      showAlert('error', 'Admin accounts cannot book tickets. Please switch to a Passenger account to book seats.');
      return;
    }

    if (train.status === 'CANCELLED') {
      showAlert('error', 'Cannot book seats: This train service has been cancelled by Railway Operations.');
      return;
    }

    setSelectedTrain(train);
    setSelectedCoachClass(coachClass);

    const matchCoach = train.coaches.find(c => c.coachClass === coachClass) || train.coaches[0];
    setSelectedCoach(matchCoach);
    setSelectedSeats([]);
    setRedisLockActive(false);
    setLockToken(null);
    setConfirmedBooking(null);

    // Scroll to seat selection
    setTimeout(() => {
      document.getElementById('seat-selection-view')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Toggle Seat in Coach
  const handleToggleSeat = (seat: Seat, coach: Coach) => {
    const seatId = `${coach.coachCode}-${seat.seatNumber}`;
    const exists = selectedSeats.find(s => s.seatId === seatId);

    if (exists) {
      setSelectedSeats(prev => prev.filter(s => s.seatId !== seatId));
      if (redisLockActive) {
        setRedisLockActive(false);
        setLockToken(null);
      }
    } else {
      if (selectedSeats.length >= 6) {
        showAlert('info', 'Maximum 6 passengers allowed per single booking request.');
        return;
      }
      setSelectedSeats(prev => [
        ...prev,
        {
          seatId,
          seatNumber: seat.seatNumber,
          coachCode: coach.coachCode,
          coachClass: coach.coachClass,
          berthType: seat.berthType,
          fare: coach.fare,
          passengerName: selectedSeats.length === 0 && currentUser ? currentUser.fullName : '',
          passengerAge: 28,
          passengerGender: 'MALE',
          berthPreference: seat.berthType
        }
      ]);
      setRedisLockActive(false);
      setLockToken(null);
    }
  };

  // Update passenger details
  const handleUpdatePassenger = (seatId: string, field: string, value: any) => {
    setSelectedSeats(prev =>
      prev.map(s => (s.seatId === seatId ? { ...s, [field]: value } : s))
    );
  };

  const handleRemoveSeat = (seatId: string) => {
    setSelectedSeats(prev => prev.filter(s => s.seatId !== seatId));
    if (redisLockActive) {
      setRedisLockActive(false);
      setLockToken(null);
    }
  };

  // Acquire Redis Distributed Lock
  const handleAcquireLock = async () => {
    if (!selectedTrain || selectedSeats.length === 0) return;
    setIsLocking(true);

    try {
      const resp = await apiClient.acquireSeatLock({
        trainId: selectedTrain.id,
        date: searchFilter.travelDate,
        seatIds: selectedSeats.map(s => s.seatId),
        userId: currentUser?.id || 'anonymous'
      });

      setRedisLockActive(true);
      setLockToken(resp.lockToken);
      setLockExpiresAt(resp.expiresAt);
      showAlert('success', `Seat Lock acquired for ${resp.lockedSeats.join(', ')} (TTL: 10 mins).`);
    } catch (err: any) {
      showAlert('error', err.message || 'Seat lock acquisition conflict');
    } finally {
      setIsLocking(false);
    }
  };

  // Confirm Payment & Create Booking
  const handleConfirmPayment = async (simulateFailure: boolean) => {
    if (!selectedTrain || selectedSeats.length === 0) return;
    setIsProcessingPayment(true);

    try {
      await apiClient.processPayment({
        bookingId: `bkg_draft_${Date.now()}`,
        amount: 3500,
        forceFailure: simulateFailure,
        idempotencyKey
      });

      const bookingResp = await apiClient.createBooking({
        trainId: selectedTrain.id,
        trainNumber: selectedTrain.trainNumber,
        trainName: selectedTrain.name,
        originStation: {
          code: selectedTrain.originCode || selectedTrain.originStation?.code || 'NDLS',
          name: selectedTrain.originName || selectedTrain.originStation?.name || 'New Delhi',
          city: selectedTrain.originCity || selectedTrain.originStation?.city || 'Delhi'
        },
        destinationStation: {
          code: selectedTrain.destCode || selectedTrain.destinationStation?.code || 'BSB',
          name: selectedTrain.destName || selectedTrain.destinationStation?.name || 'Varanasi',
          city: selectedTrain.destCity || selectedTrain.destinationStation?.city || 'Varanasi'
        },
        departureTime: selectedTrain.departureTime,
        arrivalTime: selectedTrain.arrivalTime,
        travelDate: searchFilter.travelDate,
        classType: selectedCoachClass,
        passengers: selectedSeats.map(s => ({
          name: s.passengerName || 'Traveller',
          age: s.passengerAge || 28,
          gender: s.passengerGender || 'MALE',
          coachCode: s.coachCode,
          seatNumber: s.seatNumber,
          berthPreference: (s.berthPreference || s.berthType || 'LOWER') as any
        })),
        contactEmail,
        contactPhone,
        userId: currentUser?.id || 'usr-1001-user',
        lockToken: lockToken || undefined,
        idempotencyKey
      });

      setConfirmedBooking(bookingResp.booking);
      setUserBookings(prev => [bookingResp.booking, ...prev]);
      setAllBookings(prev => [bookingResp.booking, ...prev]);
      setIsPaymentModalOpen(false);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      showAlert('success', `Booking confirmed! PNR: ${bookingResp.booking.pnr}. Official E-Ticket generated.`);
    } catch (err: any) {
      showAlert('error', err.message || 'Payment or Booking transaction failed');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Cancel Booking Action
  const handleCancelBooking = async (bookingId: string) => {
    setIsCancellingBooking(true);
    try {
      const resp = await apiClient.cancelBooking(bookingId);
      setUserBookings(prev =>
        prev.map(b => (b.id === bookingId ? resp.booking : b))
      );
      setAllBookings(prev =>
        prev.map(b => (b.id === bookingId ? resp.booking : b))
      );
      showAlert('success', `Booking cancelled. Refund of ₹${resp.refundAmount} issued.`);
    } catch (err: any) {
      showAlert('error', err.message || 'Failed to cancel booking');
    } finally {
      setIsCancellingBooking(false);
    }
  };

  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white w-full max-w-full overflow-x-hidden">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (isAdmin && tab === 'book') {
            showAlert('error', 'Admin accounts cannot book tickets. Ticket booking is removed on the Admin side.');
            setActiveTab('admin-trains');
            return;
          }
          setActiveTab(tab);
          if (tab === 'my-bookings' && currentUser) {
            apiClient.getUserBookings(currentUser.id).then(res => setUserBookings(res.bookings || []));
          }
        }}
        currentUser={currentUser}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onLogoutClick={() => {
          setCurrentUser(null);
          try { localStorage.removeItem('railcloud_current_user'); } catch {}
          setActiveTab('book');
          showAlert('info', 'Logged out successfully');
        }}
        onProfileClick={() => setIsProfileModalOpen(true)}
      />

      {/* Global Alert Notification Banner */}
      {alertBanner && (
        <div className="sticky top-14 sm:top-16 z-40 max-w-4xl mx-auto px-3 sm:px-4 w-full pt-2 sm:pt-3 animate-in slide-in-from-top duration-200">
          <div
            className={`p-3 sm:p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs font-medium shadow-xl border ${
              alertBanner.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
                : alertBanner.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
                : 'bg-blue-950/90 border-blue-500/50 text-blue-200'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {alertBanner.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : alertBanner.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
              )}
              <span className="truncate">{alertBanner.message}</span>
            </div>
            <button
              onClick={() => setAlertBanner(null)}
              className="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded cursor-pointer shrink-0"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 w-full min-w-0">
        {/* ADMIN VIEW 1: TRAIN FLEET OPERATIONS & ADD TRAINS */}
        {activeTab === 'admin-trains' && (
          <AdminTrainManagement
            trains={trains}
            stations={stations}
            currentUser={currentUser}
            onUpdateTrain={handleUpdateTrain}
            onAddTrain={handleAddTrain}
            onDeleteTrain={handleDeleteTrain}
            showAlert={showAlert}
          />
        )}

        {/* ADMIN VIEW 2: ALL PASSENGER RESERVATIONS MANIFEST */}
        {activeTab === 'admin-bookings' && (
          <AdminBookingsView bookings={allBookings.length > 0 ? allBookings : userBookings} />
        )}

        {/* ADMIN VIEW 3: SYSTEM USERS MANAGEMENT */}
        {activeTab === 'admin-users' && (
          <AdminUsersManagement
            systemUsers={systemUsers}
            onAddUser={(user) => setSystemUsers([...systemUsers, user])}
            onDeleteUser={(id) => setSystemUsers(systemUsers.filter(u => u.id !== id))}
            showAlert={showAlert}
          />
        )}

        {/* PASSENGER VIEW 1: BOOKING WORKFLOW (Removed for Admin) */}
        {activeTab === 'book' && (
          isAdmin ? (
            /* If admin somehow lands on book tab, show explicit policy card */
            <div className="p-8 text-center rounded-2xl bg-slate-900 border border-amber-500/30 space-y-4 max-w-xl mx-auto my-8 animate-in fade-in">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Admin Personal Ticket Booking Restriction
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                You are currently signed in as an <strong>Operations Administrator</strong>. Railway administration regulations forbid administrators from booking personal tickets. Please manage train schedules or switch to a passenger account to book seats.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setActiveTab('admin-trains')}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/30 cursor-pointer"
                >
                  Open Train Fleet Operations
                </button>
                <button
                  onClick={() => handleUpdateUser({ ...currentUser, role: 'USER', fullName: 'Rahul Sharma', email: 'user@railcloud.internal' })}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 cursor-pointer"
                >
                  Switch to Passenger Mode
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 sm:space-y-8">
              {/* Show E-Ticket if just booked */}
              {confirmedBooking ? (
                <ETicketCard
                  booking={confirmedBooking}
                  onBookAnother={() => {
                    setConfirmedBooking(null);
                    setSelectedTrain(null);
                    setSelectedSeats([]);
                    setRedisLockActive(false);
                  }}
                />
              ) : (
                <>
                  {/* Search Bar Widget */}
                  <SearchWidget
                    stations={stations}
                    filter={searchFilter}
                    setFilter={setSearchFilter}
                    onSearch={handleSearchTrains}
                    loading={searchLoading}
                  />

                  {/* Train List or Active Seat Selection */}
                  {!selectedTrain ? (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                            Available Trains ({trains.length})
                          </h2>
                          <p className="text-[11px] sm:text-xs text-slate-400">
                            {stations.find(s => s.code === searchFilter.fromStation)?.name || searchFilter.fromStation} →{' '}
                            {stations.find(s => s.code === searchFilter.toStation)?.name || searchFilter.toStation} on{' '}
                            {searchFilter.travelDate}
                          </p>
                        </div>
                        <span className="text-xs text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
                          Class: {searchFilter.trainClass}
                        </span>
                      </div>

                      <div className="space-y-4">
                        {trains.map((train) => (
                          <TrainCard
                            key={train.id || train.trainNumber}
                            train={train}
                            travelDate={searchFilter.travelDate}
                            selectedClass={selectedCoachClass}
                            onSelectTrainAndClass={handleSelectTrainAndClass}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Active Train Selected: Coach Selection, Visual Seat Map & Passenger Form */
                    <div id="seat-selection-view" className="space-y-6">
                      {/* Return to train results banner */}
                      <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 w-full">
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            onClick={() => {
                              setSelectedTrain(null);
                              setSelectedSeats([]);
                              setRedisLockActive(false);
                            }}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm sm:text-base truncate">
                                {selectedTrain.name}
                              </span>
                              <span className="font-mono text-xs text-blue-400 shrink-0">
                                #{selectedTrain.trainNumber}
                              </span>
                            </div>
                            <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                              {selectedTrain.originName} ({selectedTrain.departureTime}) →{' '}
                              {selectedTrain.destName} ({selectedTrain.arrivalTime}) • {searchFilter.travelDate}
                            </p>
                          </div>
                        </div>

                        {/* Coach Class Switcher */}
                        <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
                          {selectedTrain.coaches.map((c) => (
                            <button
                              key={c.id}
                              onClick={() => {
                                setSelectedCoachClass(c.coachClass);
                                setSelectedCoach(c);
                                setSelectedSeats([]);
                                setRedisLockActive(false);
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                                selectedCoachClass === c.coachClass
                                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              {c.coachCode} ({c.coachClass})
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Visual Coach Seat Map */}
                      {selectedCoach && (
                        <CoachSeatMap
                          coach={selectedCoach}
                          travelDate={searchFilter.travelDate}
                          selectedSeats={selectedSeats}
                          onToggleSeat={handleToggleSeat}
                          redisLockActive={redisLockActive}
                          lockExpiresAt={lockExpiresAt}
                          onAcquireLockClick={handleAcquireLock}
                          isLocking={isLocking}
                        />
                      )}

                      {/* Passenger Details Form and Itemized Fare Grid */}
                      {selectedSeats.length > 0 && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                          <div className="lg:col-span-8">
                            <PassengerForm
                              seats={selectedSeats}
                              onUpdatePassenger={handleUpdatePassenger}
                              onRemoveSeat={handleRemoveSeat}
                              contactEmail={contactEmail}
                              setContactEmail={setContactEmail}
                              contactPhone={contactPhone}
                              setContactPhone={setContactPhone}
                            />
                          </div>

                          <div className="lg:col-span-4">
                            <FareBreakdown
                              train={selectedTrain}
                              coachClass={selectedCoachClass}
                              selectedSeats={selectedSeats}
                              onProceedToPayment={() => {
                                setIdempotencyKey(`idemp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
                                setIsPaymentModalOpen(true);
                              }}
                              canProceed={selectedSeats.length > 0}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )
        )}

        {/* PASSENGER VIEW 2: MY BOOKINGS */}
        {activeTab === 'my-bookings' && (
          <MyBookingsView
            bookings={userBookings}
            onViewTicket={(b) => {
              setConfirmedBooking(b);
              setActiveTab('book');
            }}
            onCancelBooking={handleCancelBooking}
            isCancelling={isCancellingBooking}
          />
        )}
      </main>

      {/* Payment Processing Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalAmount={
          selectedSeats.length *
          ((selectedCoachClass === 'EC' ? 3300 : selectedCoachClass === '1A' ? 4850 : 1750) + 85)
        }
        onConfirmPayment={handleConfirmPayment}
        isProcessing={isProcessingPayment}
        idempotencyKey={idempotencyKey}
      />

      {/* Sign In Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={(user) => {
          handleUpdateUser(user);
        }}
      />

      {/* User Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onUpdateUser={handleUpdateUser}
        onLogout={() => {
          setCurrentUser(null);
          try { localStorage.removeItem('railcloud_current_user'); } catch {}
          setActiveTab('book');
          showAlert('info', 'Logged out successfully');
        }}
        onNavigateTab={(tab) => setActiveTab(tab)}
        totalBookingsCount={userBookings.length}
      />

      {/* Clean Customer-Facing Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-5 sm:py-6 text-xs text-slate-400 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
            <TrainIcon className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="font-semibold text-slate-200">RailCloud</span>
            <span>—</span>
            <span>{isAdmin ? 'Central Train Fleet Operations & Timetable Management' : 'High-Speed Railway Ticket Booking & Reservations'}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[10px] sm:text-[11px] text-slate-500">
            {isAdmin ? (
              <>
                <span className="text-amber-400 font-semibold">● Operations Admin Logged In</span>
                <span>•</span>
                <span>Fleet Dispatch & Status Live</span>
              </>
            ) : (
              <>
                <span>24/7 Rail Assistance</span>
                <span>•</span>
                <span>Instant PNR Confirmation</span>
                <span>•</span>
                <span>Official E-Tickets</span>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
